import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret || webhookSecret.includes('your_stripe_webhook_secret')) {
    return NextResponse.json({ received: true, note: 'Stripe webhook secret not configured' });
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
      const userId = session.metadata?.userId;
      const coinAmount = Number(session.metadata?.coinAmount || 0);

      console.log(`[Stripe Webhook] Verified Payment: User=${userId}, Item=${itemId}, Coins=${coinAmount}`);

      // If Firebase project credentials exist, we can log and persist the order record
      if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID && userId) {
        try {
          const { initializeApp, getApps } = await import('firebase/app');
          const { getFirestore, doc, setDoc, updateDoc, increment } = await import('firebase/firestore');

          const firebaseConfig = {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          };

          const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
          const db = getFirestore(app);

          // Update user's coin balance directly in Firestore
          if (coinAmount > 0) {
            await setDoc(
              doc(db, 'users', userId),
              {
                coins: increment(coinAmount),
                lastPurchase: {
                  itemId,
                  coins: coinAmount,
                  timestamp: new Date().toISOString(),
                },
              },
              { merge: true }
            );
          }

          // Record order under payments collection
          await setDoc(doc(db, 'payments', session.id), {
            userId,
            itemId,
            coinAmount,
            amountTotal: session.amount_total,
            currency: session.currency,
            customerEmail: session.customer_details?.email || null,
            status: session.payment_status,
            createdAt: new Date().toISOString(),
          });
        } catch (dbErr) {
          console.warn('[Stripe Webhook] Firebase update note:', dbErr);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook error:', errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }
}
