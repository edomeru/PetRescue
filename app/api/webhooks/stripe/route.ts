import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ received: true, note: 'Stripe keys not configured' });
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2024-06-20',
  });

  const signature = req.headers.get('stripe-signature') || '';

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const itemId = session.metadata?.itemId;

      console.log(`[Stripe Webhook] Payment verified for itemId: ${itemId}`);
      // Unlocks or database updates can be executed here
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }
}
