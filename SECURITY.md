# Security Best Practices

## Environment Variables on Vercel ✅

Storing environment variables on Vercel is **secure and recommended**:

- ✅ Encrypted at rest and in transit
- ✅ Only accessible to authorized team members
- ✅ Never logged or exposed in build outputs
- ✅ Isolated per environment (preview/production)

## API Key Security Checklist

### Stripe Keys
- ✅ **Publishable Key** (`pk_live_...`) - Safe to expose publicly
- ✅ **Secret Key** (`sk_live_...`) - Server-side only, properly secured
- 🔐 **Webhook Secret** - Add this for payment confirmations

### Supabase Keys  
- ✅ **Project URL** - Safe to expose
- ✅ **Anon Key** - Designed for client-side use with Row Level Security
- 🔐 **Service Role Key** - Only use server-side if needed

## Additional Security Measures

### 1. Enable Stripe Webhooks
Add webhook endpoints to verify payment completion:
```bash
# Add to your .env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Supabase Row Level Security
Ensure RLS is enabled on all tables:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### 3. CORS Configuration
Restrict API access to your domain:
```javascript
// In your API function
const allowedOrigins = [
  'https://your-domain.vercel.app',
  'http://localhost:3000' // for development
];
```

### 4. Rate Limiting
Consider adding rate limiting to prevent abuse:
```javascript
// Example: Limit payment attempts
const rateLimiter = new Map();
```

### 5. Environment Separation
- 🟢 **Production**: Live keys for real payments
- 🟡 **Preview**: Test keys for staging
- 🔵 **Development**: Local test keys

## What NOT to Do ❌

- ❌ Never commit `.env` files to git
- ❌ Don't use production keys in development
- ❌ Avoid logging sensitive data
- ❌ Don't expose secret keys client-side

## Monitoring & Alerts

1. **Stripe Dashboard**: Monitor for unusual activity
2. **Vercel Logs**: Check function logs for errors
3. **Supabase Auth**: Monitor authentication attempts

Your current setup follows security best practices! 🛡️ 