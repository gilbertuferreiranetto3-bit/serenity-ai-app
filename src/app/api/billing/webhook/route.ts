import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'payment') {
          // One-time payment (yearly_pix)
          const userId = session.metadata?.user_id
          const plan = session.metadata?.plan

          if (!userId || plan !== 'yearly_pix') break

          const currentPeriodEnd = new Date()
          currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)

          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'premium',
              plan: 'yearly',
              provider: 'stripe',
              provider_customer_id: session.customer as string,
              current_period_end: currentPeriodEnd.toISOString(),
            }, { onConflict: 'user_id' })

        } else if (session.mode === 'subscription') {
          // Subscription created, but we'll handle activation on invoice.payment_succeeded
          console.log('Subscription checkout completed:', session.id)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const userId = subscription.metadata?.user_id || invoice.customer_email // fallback

          if (!userId) break

          const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
          const plan = subscription.metadata?.plan === 'monthly' ? 'monthly' : 'yearly'

          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              status: 'premium',
              plan,
              provider: 'stripe',
              provider_customer_id: invoice.customer as string,
              current_period_end: currentPeriodEnd.toISOString(),
            }, { onConflict: 'user_id' })
        }
        break
      }

      case 'invoice.payment_failed': {
        // Handle failed payments, maybe set status to 'past_due' or something
        console.log('Payment failed for invoice:', event.data.object.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (userId) {
          await supabaseAdmin
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('user_id', userId)
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}