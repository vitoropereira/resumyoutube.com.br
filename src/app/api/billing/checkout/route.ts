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
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, pack, type, trial_days, onboarding_data, success_url, cancel_url } = await request.json();

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
      const { phone_number, business_type, content_interest, summary_frequency } = onboarding_data;
      
      // Update user profile with onboarding data
      await supabase
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
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Create Stripe customer if needed
    let customerId = profile.subscription_id; // This should be stripe_customer_id but we'll use subscription_id for now

    if (!customerId) {
      const customer = await createCustomer(
        user.email!,
        profile.name || undefined,
        profile.phone_number || undefined
      );
      customerId = customer.id;

      // Update user with customer ID
      await supabase
        .from("users")
        .update({ subscription_id: customerId })
        .eq("id", user.id);
    }

    const defaultSuccessUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const defaultCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`;
    
    const finalSuccessUrl = success_url || defaultSuccessUrl;
    const finalCancelUrl = cancel_url || defaultCancelUrl;

    // Create checkout session based on type
    let session;

    if (type === 'subscription') {
      session = await createCheckoutSession(
        customerId,
        finalSuccessUrl,
        finalCancelUrl,
        user.id,
        plan as keyof typeof SUBSCRIPTION_PLANS,
        trial_days
      );
    } else if (type === 'extra_pack') {
      session = await createExtraPackCheckoutSession(
        customerId,
        finalSuccessUrl,
        finalCancelUrl,
        user.id,
        pack as keyof typeof EXTRA_SUMMARY_PACKS
      );
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ 
      checkout_url: session.url,
      session_id: session.id 
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}