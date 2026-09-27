import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, priceInCents, title, description, userId, coinAmount, returnTab, returnLevel, petId } = body;

    const targetTab = returnTab || 'map';
    const targetLevel = returnLevel ? String(returnLevel) : '1';

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Check if Stripe key is configured
    if (!stripeKey || stripeKey.includes('your_personal_stripe_secret_key')) {
      return NextResponse.json(
        {
          mode: 'sandbox',
          message: 'Stripe keys not configured. Falling back to Instant Sandbox Payment Simulator.',
          itemId,
          petId,
          coinAmount,
          returnTab: targetTab,
          returnLevel: targetLevel,
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
              name: title || 'Pawtora Item',
              description: description || 'Pawtora In-Game Purchase',
            },
            unit_amount: priceInCents || 199,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?purchase=success&itemId=${encodeURIComponent(itemId || '')}&petId=${encodeURIComponent(petId || '')}&coins=${coinAmount || 0}&tab=${encodeURIComponent(targetTab)}&level=${encodeURIComponent(targetLevel)}`,
      cancel_url: `${origin}/?purchase=canceled&tab=${encodeURIComponent(targetTab)}&level=${encodeURIComponent(targetLevel)}`,
      metadata: {
        itemId: itemId || '',
        petId: petId || '',
        userId: userId || '',
        coinAmount: String(coinAmount || 0),
        returnTab: targetTab,
        returnLevel: targetLevel,
      },
    });

    return NextResponse.json({ mode: 'stripe', url: session.url });
  } catch (error) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
