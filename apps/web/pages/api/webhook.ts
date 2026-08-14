// pages/api/webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { firestore } from '../../src/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const endpoint = process.env.STRIPE_WEBHOOK_SECRET!;

// Handles Stripe webhooks for subscription events
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await buffer(req), sig, endpoint);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        await updateDoc(doc(firestore, 'users', userId), {
          stripeCustomerId: session.customer,
          subscriptionStatus: 'active',
        });
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        await updateDoc(doc(firestore, 'users', userId), {
          subscriptionStatus: subscription.status,
        });
      }
      break;
    }
  }

  res.json({ received: true });
}

// Helper to read raw body from Next.js request
async function buffer(req: NextApiRequest): Promise<Buffer> {
  const chunks = [];
  const stream = req;
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}
