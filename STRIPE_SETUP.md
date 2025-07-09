# Stripe Payment Setup Guide

## Overview
This guide will help you set up Stripe payments for the Premier Football app's £14.99 monthly membership system. After users sign up, they'll be redirected to a payment page to complete their membership subscription.

## Prerequisites
1. A Stripe account (sign up at https://stripe.com)
2. Basic understanding of environment variables
3. A deployment platform for the API endpoints (Vercel, Netlify, etc.)

## Step 1: Get Your Stripe Keys

### 1.1 Create a Stripe Account
- Go to https://stripe.com and create an account
- Complete the verification process

### 1.2 Get API Keys
1. Log into your Stripe Dashboard
2. Navigate to Developers > API keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)

### 1.3 Update Environment Variables
Replace the placeholder values in your `.env` file:

```env
# Replace with your actual Stripe keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

## Step 2: Deploy the API Endpoint

The payment system requires a backend API endpoint to create payment intents. You have several deployment options:

### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts to deploy
4. Your API endpoint will be available at: `https://your-app.vercel.app/api/create-payment-intent`

### Option B: Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Create a `netlify.toml` file in your project root:
```toml
[build]
  functions = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```
3. Deploy with `netlify deploy --prod`

### Option C: Local Development
For testing locally, you can use a tool like `ngrok` to expose your local API:
1. Install ngrok: https://ngrok.com/
2. Run your API locally (using Express, Fastify, etc.)
3. Expose with ngrok: `ngrok http 3001`
4. Update the API URL in your frontend code

## Step 3: Configure Stripe Products (Optional)

For recurring subscriptions, you should set up a product in Stripe:

1. Go to Stripe Dashboard > Products
2. Create a new product:
   - Name: "Premier Football Monthly Membership"
   - Price: £14.99 GBP
   - Billing period: Monthly
3. Note the Price ID for future use

## Step 4: Test the Payment Flow

### 4.1 Test Cards
Use these test card numbers in development:
- **Successful payment**: 4242 4242 4242 4242
- **Declined payment**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0000 0000 3220

### 4.2 Test the Flow
1. Create a new account on your app
2. You should be redirected to the payment page
3. Enter test card details
4. Verify the payment completes successfully

## Step 5: Go Live

### 5.1 Switch to Live Mode
1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Get your live API keys
3. Update your environment variables with live keys
4. Deploy your changes

### 5.2 Important Security Notes
- Never expose your secret key in frontend code
- Always validate payments on your backend
- Use HTTPS in production
- Consider implementing webhook endpoints for payment confirmations

## Current Implementation Details

### Payment Flow
1. User signs up successfully
2. Redirected to `/payment` page
3. Payment form loads with Stripe Elements
4. User enters card details
5. Payment processed for £14.99 GBP
6. On success, user redirected to home page

### Files Modified
- `src/pages/Payment.tsx` - Main payment page
- `src/components/payments/CheckoutForm.tsx` - Stripe payment form
- `src/pages/Auth.tsx` - Modified redirect after signup
- `api/create-payment-intent.js` - Backend API endpoint

### Future Enhancements
Consider implementing:
- Subscription management
- Payment history
- Failed payment handling
- Email confirmations
- Webhook endpoints for payment events

## Troubleshooting

### Common Issues
1. **"Stripe key not found"** - Check your environment variables
2. **API endpoint 404** - Ensure your backend is deployed correctly
3. **Payment fails** - Check Stripe logs in the dashboard
4. **CORS errors** - Configure your API to allow requests from your frontend domain

### Support
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: Available in your dashboard
- Test your integration: https://stripe.com/docs/testing

## Cost Considerations
- Stripe charges 2.9% + 30p per successful card payment in the UK
- For a £14.99 payment, the fee would be approximately £0.73
- Consider this in your pricing strategy 