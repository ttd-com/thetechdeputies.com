# Stripe Webhook Configuration Guide

## Overview
This document explains how to configure Stripe webhooks for payment processing on The Tech Deputies website. The webhooks handle subscription lifecycle events (creation, updates, cancellations) and payment confirmations.

## Prerequisites
- Stripe account with test and live keys configured
- Webhook endpoint already implemented at `/api/stripe/webhook`
- Environment variables configured with `STRIPE_WEBHOOK_SECRET`

## Webhook Endpoint
**URL:** `https://thetechdeputies.com/api/stripe/webhook`  
**Method:** POST  
**Auth:** Stripe signature verification

## Stripe Dashboard Configuration

### Step 1: Navigate to Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Log in with your Stripe account
3. Click **Developers** > **Webhooks** in the left sidebar

### Step 2: Add Endpoint (Test Mode)
1. Click **Add endpoint** button
2. Enter endpoint URL: `https://localhost:3000/api/stripe/webhook` (for local testing)
3. Under "Select events to send", choose these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Reveal and copy the **Signing Secret** (starts with `whsec_`)

### Step 3: Add Endpoint (Production)
1. Click **Add endpoint** button (create a new one for production)
2. Enter endpoint URL: `https://thetechdeputies.com/api/stripe/webhook`
3. Select same events as above
4. Click **Add endpoint**
5. Copy the **Signing Secret** for production

### Step 4: Configure Environment Variables
Update `.env.local` (development) and production environment:

```bash
# Local Development (.env.local)
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxxx

# Production (Vercel/hosting environment)
STRIPE_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxx
```

## Testing Webhooks Locally

### Using Stripe CLI
1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Authenticate: `stripe login`
3. Forward webhooks to local endpoint:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. This will output a signing secret - update `.env.local` with this value
5. When you trigger events in Stripe Dashboard, they'll be forwarded to your local server

### Testing Webhook Events Manually
```bash
# List webhook endpoints
stripe webhooks list

# Send test event
stripe trigger payment_intent.succeeded
```

## Webhook Events Handled

| Event | Handler | Action |
|-------|---------|--------|
| `checkout.session.completed` | `handleCheckoutSessionCompleted()` | Logs checkout completion, awaits subscription event |
| `customer.subscription.created` | `handleSubscriptionCreated()` | Creates user subscription record in database |
| `customer.subscription.updated` | `handleSubscriptionUpdated()` | Updates subscription status/dates |
| `customer.subscription.deleted` | `handleSubscriptionDeleted()` | Marks subscription as cancelled |
| `invoice.payment_succeeded` | `handlePaymentSucceeded()` | Sends confirmation email |
| `invoice.payment_failed` | `handlePaymentFailed()` | Sends payment failure notification |

## Database Records

When webhooks are processed, they create/update these database models:
- **User** - Updates `stripeCustomerId`
- **UserSubscription** - Creates/updates subscription with:
  - `stripeSubscriptionId`
  - `status` (ACTIVE/CANCELLED/EXPIRED)
  - `currentPeriodStart` and `currentPeriodEnd`
  - `sessionBookedThisMonth` (tracks usage)

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook logs in Stripe Dashboard
2. Verify endpoint URL is correct and accessible
3. Ensure signing secret is correctly configured
4. Check application logs for webhook processing errors

### Signature Verification Failed
```
Error: No signatures found matching the expected signature for payload
```
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Ensure webhook signing secret hasn't been regenerated
- Check that endpoint is receiving full request body (not truncated)

### Subscription Not Creating in Database
1. Check webhook logs - is event being received?
2. Verify metadata is passed in checkout session (userId, planId)
3. Check database permissions for `user_subscriptions` table
4. Review application error logs

### Email Notifications Not Sending
1. Verify Mailgun API key is configured
2. Check email job queue in database
3. Review email delivery events table
4. Check Mailgun dashboard for bounce/complaint reasons

## Webhook Implementation Details

### Signature Verification
The webhook endpoint verifies Stripe signatures to ensure requests are legitimate:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

This prevents unauthorized requests from triggering payment processing.

### Metadata Passing
When creating checkout sessions, metadata is passed to link payments to user accounts:

```typescript
// In checkout-session/route.ts
const session = await stripe.checkout.sessions.create({
  metadata: {
    userId: userId.toString(),
    planId: planId.toString(),
  },
  // ... other configuration
});
```

### Session Tracking
After subscription creation, session limits are enforced:
- **Basic:** 2 sessions/month
- **Standard:** 5 sessions/month  
- **Premium:** Unlimited sessions

The `sessionBookedThisMonth` field tracks usage and resets at `currentPeriodStart`.

## Monitoring & Alerts

### Recommended Monitoring
1. **Webhook Delivery Rates** - Monitor success rate in Stripe Dashboard
2. **Failed Payments** - Set up email alerts for failed invoices
3. **Error Logs** - Monitor `/api/stripe/webhook` error logs daily
4. **Email Delivery** - Check Mailgun dashboard for bounces/complaints

### Alert Thresholds
- Webhook failure rate > 5% over 1 hour
- Payment failure rate > 10% over 24 hours
- Email bounce rate > 2% over 7 days

## Security Considerations

1. **Secret Management** - Never commit webhook secrets to version control
2. **Request Validation** - Always verify stripe-signature header
3. **HTTPS Only** - Webhook endpoint must be HTTPS in production
4. **Request Timeout** - Process and respond within 60 seconds
5. **Idempotency** - Handle duplicate webhook events gracefully (same event ID)

## Related Documentation
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Guide](https://stripe.com/docs/stripe-cli)
- [Webhook Security Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Last Updated:** February 3, 2026  
**Status:** Production Ready
