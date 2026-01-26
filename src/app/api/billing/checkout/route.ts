import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    if (!plan || !['monthly', 'yearly_card', 'yearly_pix'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get user from auth
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let sessionConfig: Stripe.Checkout.SessionCreateParams

    if (plan === 'monthly') {
      sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_MONTHLY,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?canceled=true`,
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          plan: 'monthly',
        },
      }
    } else if (plan === 'yearly_card') {
      sessionConfig = {
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_YEARLY_CARD,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?canceled=true`,
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          plan: 'yearly_card',
        },
      }
    } else if (plan === 'yearly_pix') {
      sessionConfig = {
        payment_method_types: ['card'], // Pix is handled by Stripe
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID_YEARLY_PIX,
            quantity: 1,
          },
        ],
        mode: 'payment', // One-time payment
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/subscribe?canceled=true`,
        client_reference_id: user.id,
        metadata: {
          user_id: user.id,
          plan: 'yearly_pix',
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig!)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}