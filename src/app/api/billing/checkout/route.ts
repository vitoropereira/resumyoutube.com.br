import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  createCheckoutSession, 
  createExtraPackCheckoutSession,
  createCustomer,
  SUBSCRIPTION_PLANS,
  EXTRA_SUMMARY_PACKS
} from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Checkout API called');
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('❌ User authentication failed:', userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.id);

    const { plan, pack, type, trial_days, onboarding_data, success_url, cancel_url } = await request.json();
    console.log('📋 Request data:', { plan, pack, type, trial_days, onboarding_data });

    // Validate request
    if (type === 'subscription' && !plan) {
      return NextResponse.json({ error: "Plan is required for subscriptions" }, { status: 400 });
    }

    if (type === 'extra_pack' && !pack) {
      return NextResponse.json({ error: "Pack is required for extra purchases" }, { status: 400 });
    }

    if (type === 'subscription' && !(plan in SUBSCRIPTION_PLANS)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (type === 'extra_pack' && !(pack in EXTRA_SUMMARY_PACKS)) {
      return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
    }

    // Handle onboarding data if provided
    if (onboarding_data) {
      console.log('💾 Updating user profile with onboarding data');
      const { phone_number, business_type, content_interest, summary_frequency } = onboarding_data;
      
      // Update user profile with onboarding data
      const { error: updateError } = await supabase
        .from("users")
        .update({
          phone_number,
          business_type,
          content_interest,
          summary_frequency,
          whatsapp_validated: true, // Assume validated during onboarding
          trial_end_date: trial_days ? new Date(Date.now() + (trial_days * 24 * 60 * 60 * 1000)).toISOString() : null
        })
        .eq("id", user.id);

      if (updateError) {
        console.log('❌ Error updating user profile:', updateError);
        return NextResponse.json({ error: "Failed to update user profile" }, { status: 500 });
      }
      
      console.log('✅ User profile updated successfully');
    }

    // Get user profile
    console.log('🔍 Fetching user profile');
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.log('❌ User profile not found:', profileError);
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    console.log('✅ User profile found:', profile.id);

    // Create Stripe customer if needed
    let customerId = profile.subscription_id; // This should be stripe_customer_id but we'll use subscription_id for now
    console.log('🔑 Current customer ID:', customerId);

    if (!customerId) {
      console.log('💳 Creating new Stripe customer');
      console.log('📧 User email:', user.email);
      console.log('👥 Profile name:', profile.name);
      console.log('📱 Profile phone:', profile.phone_number);
      
      if (!user.email) {
        console.log('❌ User email is required for Stripe customer');
        return NextResponse.json({ error: "User email is required" }, { status: 400 });
      }
      
      try {
        const customer = await createCustomer(
          user.email,
          profile.name || undefined,
          profile.phone_number || undefined
        );
        customerId = customer.id;
        console.log('✅ Stripe customer created:', customerId);

        // Update user with customer ID
        const { error: customerUpdateError } = await supabase
          .from("users")
          .update({ subscription_id: customerId })
          .eq("id", user.id);

        if (customerUpdateError) {
          console.log('❌ Error updating customer ID:', customerUpdateError);
          return NextResponse.json({ error: "Failed to update customer ID" }, { status: 500 });
        }
      } catch (stripeError) {
        console.log('❌ Stripe customer creation failed:', stripeError);
        return NextResponse.json({ error: "Failed to create Stripe customer" }, { status: 500 });
      }
    }

    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
    
    const finalSuccessUrl = success_url || defaultSuccessUrl;
    const finalCancelUrl = cancel_url || defaultCancelUrl;

    // Create checkout session based on type
    let session;
    console.log('🛒 Creating checkout session for type:', type);

    try {
      if (type === 'subscription') {
        console.log('📋 Creating subscription checkout:', plan);
        session = await createCheckoutSession(
          customerId,
          finalSuccessUrl,
          finalCancelUrl,
          user.id,
          plan as keyof typeof SUBSCRIPTION_PLANS,
          trial_days
        );
      } else if (type === 'extra_pack') {
        console.log('📦 Creating extra pack checkout:', pack);
        session = await createExtraPackCheckoutSession(
          customerId,
          finalSuccessUrl,
          finalCancelUrl,
          user.id,
          pack as keyof typeof EXTRA_SUMMARY_PACKS
        );
      } else {
        console.log('❌ Invalid checkout type:', type);
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
      }

      console.log('✅ Checkout session created:', session.id);
      return NextResponse.json({ 
        checkout_url: session.url,
        session_id: session.id 
      });
    } catch (sessionError) {
      console.error("❌ Error creating checkout session:", sessionError);
      return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ General error in checkout API:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}