import Stripe from 'stripe'

// Initialize Stripe only if we have the secret key (server-side only)
let stripe: Stripe | null = null;

// Function to get or initialize Stripe instance
export function getStripe(): Stripe {
  if (!stripe) {
    // Verify Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
      console.error('❌ Invalid STRIPE_SECRET_KEY format');
      throw new Error('STRIPE_SECRET_KEY must start with sk_');
    }

    console.log('✅ Stripe configured with key:', process.env.STRIPE_SECRET_KEY.substring(0, 10) + '...');

    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-06-20',
    });
  }
  
  return stripe;
}

// Subscription pricing structure (3 public plans)
export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    price: 2990, // R$ 29,90
    price_id: process.env.STRIPE_STARTER_PRICE_ID || '',
    price_display: 'R$ 29,90',
    monthly_summary_limit: 50,
    trial_days: 7,
    popular: false,
    features: [
      '50 resumos por mês',
      'Canais ilimitados',
      'Resumos via WhatsApp',
      'Suporte por email'
    ]
  },
  pro: {
    name: 'Pro',
    price: 4990, // R$ 49,90
    price_id: process.env.STRIPE_PRO_PRICE_ID || '',
    price_display: 'R$ 49,90',
    monthly_summary_limit: 150,
    trial_days: 7,
    popular: true,
    features: [
      '150 resumos por mês',
      'Canais ilimitados',
      'Resumos via WhatsApp',
      'Suporte prioritário',
      'Relatórios de uso'
    ]
  },
  premium: {
    name: 'Premium',
    price: 9990, // R$ 99,90
    price_id: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    price_display: 'R$ 99,90',
    monthly_summary_limit: 500,
    trial_days: 7,
    popular: false,
    features: [
      '500 resumos por mês',
      'Canais ilimitados',
      'Resumos via WhatsApp',
      'Suporte prioritário',
      'Relatórios avançados',
      'API personalizada'
    ]
  },
} as const

// Enterprise plan info (for display only - negotiated privately)
export const ENTERPRISE_PLAN_INFO = {
  name: 'Enterprise',
  description: 'Plano personalizado para grandes volumes',
  features: [
    'Resumos ilimitados',
    'Canais ilimitados',
    'Suporte 24/7 dedicado',
    'Integração personalizada',
    'SLA garantido',
    'Treinamento da equipe'
  ],
  contact_message: 'Entre em contato para negociar um plano personalizado'
}

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

// Stripe product management functions
export async function createOrUpdateStripeProducts() {
  console.log('🏪 Creating/updating Stripe products and prices');
  const stripe = getStripe();
  const results = [];

  for (const [planKey, plan] of Object.entries(SUBSCRIPTION_PLANS)) {
    try {
      console.log(`📦 Processing plan: ${planKey}`);
      
      // Create or get product
      const productName = `Resume YouTube - ${plan.name}`;
      const productDescription = `Plano ${plan.name} - ${plan.monthly_summary_limit} resumos por mês`;
      
      let product;
      
      // Try to find existing product
      const existingProducts = await stripe.products.list({
        limit: 100,
      });
      
      const existingProduct = existingProducts.data.find(
        p => p.name === productName || p.metadata.plan_key === planKey
      );
      
      if (existingProduct) {
        console.log(`✅ Found existing product: ${existingProduct.id}`);
        // Update existing product
        product = await stripe.products.update(existingProduct.id, {
          name: productName,
          description: productDescription,
          metadata: {
            plan_key: planKey,
            summary_limit: plan.monthly_summary_limit.toString(),
            trial_days: plan.trial_days.toString(),
          }
        });
      } else {
        console.log(`🆕 Creating new product for plan: ${planKey}`);
        // Create new product
        product = await stripe.products.create({
          name: productName,
          description: productDescription,
          metadata: {
            plan_key: planKey,
            summary_limit: plan.monthly_summary_limit.toString(),
            trial_days: plan.trial_days.toString(),
          }
        });
      }
      
      // Create or update price
      let price;
      
      // Try to find existing price
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      
      const existingPrice = existingPrices.data.find(
        p => p.unit_amount === plan.price && p.recurring?.interval === 'month'
      );
      
      if (existingPrice && existingPrice.unit_amount === plan.price) {
        console.log(`✅ Price already exists and is correct: ${existingPrice.id}`);
        price = existingPrice;
      } else {
        console.log(`💰 Creating new price for plan: ${planKey}`);
        // Deactivate old prices
        for (const oldPrice of existingPrices.data) {
          await stripe.prices.update(oldPrice.id, { active: false });
        }
        
        // Create new price
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price,
          currency: 'brl',
          recurring: {
            interval: 'month',
          },
          metadata: {
            plan_key: planKey,
            summary_limit: plan.monthly_summary_limit.toString(),
          }
        });
      }
      
      results.push({
        plan: planKey,
        product_id: product.id,
        price_id: price.id,
        amount: plan.price,
        status: 'success'
      });
      
      console.log(`✅ Plan ${planKey} configured: ${price.id}`);
      
    } catch (error) {
      console.error(`❌ Error processing plan ${planKey}:`, error);
      results.push({
        plan: planKey,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

export async function createOrUpdateExtraPacks() {
  console.log('📦 Creating/updating extra summary packs');
  const stripe = getStripe();
  const results = [];

  for (const [packKey, pack] of Object.entries(EXTRA_SUMMARY_PACKS)) {
    try {
      console.log(`📦 Processing pack: ${packKey}`);
      
      // Create or get product
      const productName = `Resume YouTube - ${pack.name}`;
      const productDescription = `Pacote extra de ${pack.summaries} resumos - compra única`;
      
      let product;
      
      // Try to find existing product
      const existingProducts = await stripe.products.list({
        limit: 100,
      });
      
      const existingProduct = existingProducts.data.find(
        p => p.name === productName || p.metadata.pack_key === packKey
      );
      
      if (existingProduct) {
        console.log(`✅ Found existing pack product: ${existingProduct.id}`);
        product = await stripe.products.update(existingProduct.id, {
          name: productName,
          description: productDescription,
          metadata: {
            pack_key: packKey,
            summaries: pack.summaries.toString(),
            type: 'extra_pack',
          }
        });
      } else {
        console.log(`🆕 Creating new pack product: ${packKey}`);
        product = await stripe.products.create({
          name: productName,
          description: productDescription,
          metadata: {
            pack_key: packKey,
            summaries: pack.summaries.toString(),
            type: 'extra_pack',
          }
        });
      }
      
      // Create or update price
      let price;
      
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
      });
      
      const existingPrice = existingPrices.data.find(
        p => p.unit_amount === pack.price && !p.recurring
      );
      
      if (existingPrice && existingPrice.unit_amount === pack.price) {
        console.log(`✅ Pack price already exists: ${existingPrice.id}`);
        price = existingPrice;
      } else {
        console.log(`💰 Creating new pack price: ${packKey}`);
        // Deactivate old prices
        for (const oldPrice of existingPrices.data) {
          await stripe.prices.update(oldPrice.id, { active: false });
        }
        
        price = await stripe.prices.create({
          product: product.id,
          unit_amount: pack.price,
          currency: 'brl',
          metadata: {
            pack_key: packKey,
            summaries: pack.summaries.toString(),
            type: 'extra_pack',
          }
        });
      }
      
      results.push({
        pack: packKey,
        product_id: product.id,
        price_id: price.id,
        amount: pack.price,
        summaries: pack.summaries,
        status: 'success'
      });
      
      console.log(`✅ Pack ${packKey} configured: ${price.id}`);
      
    } catch (error) {
      console.error(`❌ Error processing pack ${packKey}:`, error);
      results.push({
        pack: packKey,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  return results;
}

export async function createCustomer(email: string, name?: string, phone?: string) {
  console.log('👤 Creating Stripe customer');
  console.log('📧 Email:', email);
  console.log('👥 Name:', name);
  console.log('📱 Phone:', phone);
  
  if (!email) {
    throw new Error('Email is required to create Stripe customer');
  }
  
  try {
    const stripe = getStripe();
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        phone_number: phone || '',
      }
    });
    
    console.log('✅ Stripe customer created successfully:', customer.id);
    return customer;
  } catch (stripeError) {
    console.error('❌ Stripe customer creation failed:', stripeError);
    throw stripeError;
  }
}

export async function createCheckoutSession(
  customerId: string,
  successUrl: string,
  cancelUrl: string,
  userId: string,
  planKey: keyof typeof SUBSCRIPTION_PLANS = 'starter',
  trialDays?: number
) {
  console.log('💳 Creating Stripe checkout session');
  console.log('📋 Plan:', planKey);
  console.log('👤 Customer ID:', customerId);
  console.log('🔄 Trial days:', trialDays);
  
  const plan = SUBSCRIPTION_PLANS[planKey]
  const finalTrialDays = trialDays !== undefined ? trialDays : plan.trial_days
  
  console.log('💰 Plan details:', plan);
  console.log('🆔 Price ID:', plan.price_id);
  
  if (!plan.price_id || plan.price_id === '' || plan.price_id === `price_${planKey}`) {
    throw new Error(`Invalid Stripe price ID for plan ${planKey}: ${plan.price_id}. Please run /api/stripe/setup to configure prices.`);
  }
  
  const stripe = getStripe();
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
  const stripe = getStripe();
  
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
  const stripe = getStripe();
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string) {
  const stripe = getStripe();
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

export async function reactivateSubscription(subscriptionId: string) {
  const stripe = getStripe();
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