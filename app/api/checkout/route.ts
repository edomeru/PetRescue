import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, priceInCents, title, description } = body;

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Check if Stripe key is configured
    if (!stripeKey || stripeKey.includes('your_personal_stripe_secret_key')) {
      return NextResponse.json(
        {
          mode: 'sandbox',
          message: 'Stripe keys not configured. Falling back to Instant Sandbox Payment Simulator.',
          itemId,
        },
        { status: 200 }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20',
    });

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title || 'Pet Rescue Pack',
              description: description || 'In-Game Item Purchase',
            },
            unit_amount: priceInCents || 199,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?purchase=success&itemId=${itemId}`,
      cancel_url: `${origin}/?purchase=canceled`,
      metadata: {
        itemId,
      },
    });

    return NextResponse.json({ mode: 'stripe', url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
