import Stripe from 'stripe'

// Inicializar Stripe (server-side)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

// Preços (IDs do Stripe - você precisa criar no dashboard)
export const PRICES = {
  BR: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BR_MONTHLY || 'price_br_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_BR_YEARLY || 'price_br_yearly',
  },
  GLOBAL: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GLOBAL_MONTHLY || 'price_global_monthly',
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_GLOBAL_YEARLY || 'price_global_yearly',
  }
}

// Valores para exibição
export const PRICE_DISPLAY = {
  BR: {
    monthly: 'R$ 49,90',
    yearly: 'R$ 399,00',
  },
  GLOBAL: {
    monthly: '$9.99',
    yearly: '$79.00',
  }
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      client_reference_id: userId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          user_id: userId,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return { sessionId: session.id, url: session.url }
  } catch (error: any) {
    console.error('Erro ao criar sessão Stripe:', error)
    return { error: error.message }
  }
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return { url: session.url }
  } catch (error: any) {
    console.error('Erro ao criar portal Stripe:', error)
    return { error: error.message }
  }
}
