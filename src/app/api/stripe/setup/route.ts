import { NextResponse } from "next/server";
import { createOrUpdateStripeProducts, createOrUpdateExtraPacks } from "@/lib/stripe";

export async function GET() {
  try {
    console.log('🚀 Starting Stripe products setup');

    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        error: "STRIPE_SECRET_KEY not configured" 
      }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      return NextResponse.json({ 
        error: "Invalid STRIPE_SECRET_KEY format (must start with sk_)" 
      }, { status: 400 });
    }

    console.log('✅ Stripe configuration verified');

    // Create/update subscription plans
    console.log('📋 Setting up subscription plans...');
    const planResults = await createOrUpdateStripeProducts();
    
    // Create/update extra packs
    console.log('📦 Setting up extra packs...');
    const packResults = await createOrUpdateExtraPacks();

    // Generate environment variables
    const envVars = [];
    
    // Add plan price IDs
    for (const result of planResults) {
      if (result.status === 'success') {
        const envVar = `STRIPE_${result.plan.toUpperCase()}_PRICE_ID=${result.price_id}`;
        envVars.push(envVar);
      }
    }
    
    // Add pack price IDs
    for (const result of packResults) {
      if (result.status === 'success') {
        const envVar = `STRIPE_${result.pack.toUpperCase()}_PRICE_ID=${result.price_id}`;
        envVars.push(envVar);
      }
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      plans: {
        total: planResults.length,
        success: planResults.filter(r => r.status === 'success').length,
        errors: planResults.filter(r => r.status === 'error').length,
        results: planResults
      },
      packs: {
        total: packResults.length,
        success: packResults.filter(r => r.status === 'success').length,
        errors: packResults.filter(r => r.status === 'error').length,
        results: packResults
      },
      environment_variables: envVars,
      next_steps: [
        "Copy the environment variables below to your .env.local file",
        "Restart your development server",
        "Test the checkout flow",
        "Verify webhooks are working correctly"
      ]
    };

    console.log('✅ Stripe setup completed');
    console.log('📋 Summary:', summary);

    return NextResponse.json(summary);

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}