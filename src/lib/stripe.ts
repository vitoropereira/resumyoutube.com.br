import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// New subscription pricing structure
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 2990, // R$ 29,90
    price_id: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    monthly_summary_limit: 50,
    trial_days: 7,
  },
  pro: {
    name: 'Pro',
    price: 4990, // R$ 49,90
    price_id: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    monthly_summary_limit: 150,
    trial_days: 7,
  },
  premium: {
    name: 'Premium',
    price: 9990, // R$ 99,90
    price_id: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium',
    monthly_summary_limit: 500,
    trial_days: 7,
  },
  enterprise: {
    name: 'Enterprise',
    price: 19990, // R$ 199,90
    price_id: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    monthly_summary_limit: 9999, // "Unlimited"
    trial_days: 7,
  },
} as const

// Extra summary packs (one-time purchases)
export const EXTRA_SUMMARY_PACKS = {
  pack_50: {
    name: 'Pack 50 resumos',
    summaries: 50,
    price: 1990, // R$ 19,90
    price_id: process.env.STRIPE_PACK_50_PRICE_ID || 'price_pack_50',
  },
  pack_100: {
    name: 'Pack 100 resumos',
    summaries: 100,
    price: 3490, // R$ 34,90
    price_id: process.env.STRIPE_PACK_100_PRICE_ID || 'price_pack_100',
  },
  pack_250: {
    name: 'Pack 250 resumos',
    summaries: 250,
    price: 7990, // R$ 79,90
    price_id: process.env.STRIPE_PACK_250_PRICE_ID || 'price_pack_250',
  },
} as const

// Legacy support
export const SUBSCRIPTION_PRICE = 2990 // Default to starter price
export const SUBSCRIPTION_PRICE_ID = SUBSCRIPTION_PLANS.starter.price_id

export async function createCustomer(email: string, name?: string, phone?: string) {
  return await stripe.customers.create({
    email,
    name,
    phone,
    metadata: {
      phone_number: phone || '',
    }
  })
}

export async function createCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  userId: string,
  planKey: keyof typeof SUBSCRIPTION_PLANS = 'starter',
  trialDays?: number
) {
  const plan = SUBSCRIPTION_PLANS[planKey]
  const finalTrialDays = trialDays !== undefined ? trialDays : plan.trial_days
  
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.price_id,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      plan: planKey,
      summary_limit: plan.monthly_summary_limit.toString(),
    },
    subscription_data: {
      trial_period_days: finalTrialDays,
      metadata: {
        user_id: userId,
        plan: planKey,
        summary_limit: plan.monthly_summary_limit.toString(),
      },
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  })
}

export async function createExtraPackCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  userId: string,
  packKey: keyof typeof EXTRA_SUMMARY_PACKS
) {
  const pack = EXTRA_SUMMARY_PACKS[packKey]
  
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: pack.price_id,
        quantity: 1,
      },
    ],
    mode: 'payment', // One-time payment for extra packs
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      pack: packKey,
      extra_summaries: pack.summaries.toString(),
      type: 'extra_pack',
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_update: {
      address: 'auto',
      name: 'auto',
    },
  })
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function reactivateSubscription(subscriptionId: string) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount / 100)
}