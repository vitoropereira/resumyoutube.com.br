import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, SUBSCRIPTION_PLANS, EXTRA_SUMMARY_PACKS } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const sessionType = session.metadata?.type || 'subscription'

        if (!userId) {
          console.error('No user_id in session metadata')
          break
        }

        if (sessionType === 'extra_pack') {
          // Handle extra summary pack purchase
          const packKey = session.metadata?.pack
          const extraSummaries = parseInt(session.metadata?.extra_summaries || '0')

          if (packKey && extraSummaries > 0) {
            console.log(`Processing extra pack purchase: ${packKey} (${extraSummaries} summaries) for user ${userId}`)

            // Add extra summaries to user account
            const { error } = await adminSupabase
              .from('users')
              .update({
                extra_summaries: adminSupabase.rpc('COALESCE', ['extra_summaries', 0]) + extraSummaries
              })
              .eq('id', userId)

            if (error) {
              console.error('Error adding extra summaries:', error)
            } else {
              console.log(`✅ Added ${extraSummaries} extra summaries to user ${userId}`)
            }
          }
        } else {
          // Handle subscription
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const planKey = session.metadata?.plan || 'starter'
          const summaryLimit = parseInt(session.metadata?.summary_limit || '50')

          // Update subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_customer_id: subscription.customer as string,
              status: subscription.status,
              plan_name: planKey,
              amount_cents: subscription.items.data[0].price.unit_amount || 2990,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            })

          if (error) {
            console.error('Error updating subscription:', error)
          } else {
            // Calculate next reset date (first day of next month)
            const now = new Date()
            const nextReset = new Date(now.getFullYear(), now.getMonth() + 1, 1)
            
            // Update user with new plan details
            await adminSupabase
              .from('users')
              .update({ 
                subscription_status: subscription.status,
                monthly_summary_limit: summaryLimit,
                monthly_summary_used: 0, // Reset usage for new subscription
                summary_reset_date: nextReset.toISOString(),
                trial_end_date: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
              })
              .eq('id', userId)

            console.log(`✅ Updated user ${userId} with plan ${planKey} (${summaryLimit} summaries/month)`)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSubscription) {
          // Update subscription
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_customer_id', customerId)

          // Update user status
          await supabase
            .from('users')
            .update({ 
              subscription_status: subscription.status === 'active' ? 'active' : 'inactive' 
            })
            .eq('id', existingSubscription.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by customer ID
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSubscription) {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('stripe_customer_id', customerId)

          // Update user status
          await supabase
            .from('users')
            .update({ subscription_status: 'inactive' })
            .eq('id', existingSubscription.user_id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment succeeded for invoice:', invoice.id)
        // You could log this payment or send a confirmation email
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Payment failed for invoice:', invoice.id)
        // You could send a payment failure notification
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}