// This is a serverless function that can be deployed on Vercel, Netlify, or similar platforms
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency } = req.body;

    // Create a PaymentIntent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in pence (1499 = £14.99)
      currency: currency, // 'gbp'
      automatic_payment_methods: {
        enabled: true,
      },
      // For subscription billing, you might want to set up a recurring payment
      // This example creates a one-time payment intent
      description: 'Premier Football Monthly Membership',
      metadata: {
        type: 'monthly_membership',
        amount_gbp: (amount / 100).toFixed(2)
      }
    });

    res.status(200).json({
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Failed to create payment intent',
      message: error.message 
    });
  }
} 