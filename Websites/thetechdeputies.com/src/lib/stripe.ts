/**
 * @file stripe.ts
 * @description Stripe integration for payment processing and subscription management
 */

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

// Initialize Stripe only when needed, not at module load time
export function getStripe(): Stripe {
    if (!stripeClient) {
        if (!process.env.STRIPE_SECRET) {
            throw new Error('STRIPE_SECRET is not defined in environment variables');
        }
        stripeClient = new Stripe(process.env.STRIPE_SECRET, {
            apiVersion: '2026-01-28.clover',
            typescript: true,
        });
    }
    return stripeClient;
}

/**
 * Get all active subscriptions from Stripe
 */
export async function getActiveSubscriptions() {
    try {
        const subscriptions = await getStripe().subscriptions.list({
            status: 'active',
            limit: 100,
        });
        return subscriptions.data;
    } catch (error) {
        console.error('Failed to fetch active subscriptions:', error);
        return [];
    }
}

/**
 * Get monthly recurring revenue from active subscriptions
 */
export async function getMonthlyRevenue() {
    try {
        const subscriptions = await getActiveSubscriptions();
        
        // Calculate MRR (Monthly Recurring Revenue)
        const mrr = subscriptions.reduce((total: number, sub: Stripe.Subscription) => {
            if (sub.items.data.length > 0) {
                const item = sub.items.data[0];
                if (item.price.recurring?.interval === 'month') {
                    return total + (item.price.unit_amount || 0);
                } else if (item.price.recurring?.interval === 'year') {
                    // Convert yearly to monthly
                    return total + (item.price.unit_amount || 0) / 12;
                }
            }
            return total;
        }, 0);

        // Convert from cents to dollars
        return mrr / 100;
    } catch (error) {
        console.error('Failed to calculate monthly revenue:', error);
        return 0;
    }
}

/**
 * Get subscription details with customer info
 */
export async function getSubscriptionDetails() {
    try {
        const subscriptions = await getActiveSubscriptions();
        
        const details = await Promise.all(
            subscriptions.map(async (sub: Stripe.Subscription) => {
                const customer = await getStripe().customers.retrieve(sub.customer as string);
                const price = sub.items.data[0]?.price;
                
                return {
                    id: sub.id,
                    customerId: sub.customer,
                    customerName: (customer as Stripe.Customer).name || 'Unknown',
                    customerEmail: (customer as Stripe.Customer).email || '',
                    status: sub.status,
                    amount: price?.unit_amount ? price.unit_amount / 100 : 0,
                    currency: price?.currency || 'usd',
                    interval: price?.recurring?.interval || 'month',
                    currentPeriodStart: (sub as any).current_period_start ? new Date((sub as any).current_period_start * 1000) : new Date(),
                    currentPeriodEnd: (sub as any).current_period_end ? new Date((sub as any).current_period_end * 1000) : new Date(),
                    createdAt: new Date(sub.created * 1000),
                };
            })
        );

        return details;
    } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        return [];
    }
}

/**
 * Get total revenue for current month
 */
export async function getCurrentMonthRevenue() {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const charges = await getStripe().charges.list({
            created: {
                gte: Math.floor(startOfMonth.getTime() / 1000),
                lte: Math.floor(endOfMonth.getTime() / 1000),
            },
            limit: 100,
        });

        const totalRevenue = charges.data
            .filter((charge: Stripe.Charge) => charge.status === 'succeeded')
            .reduce((total: number, charge: Stripe.Charge) => total + charge.amount, 0);

        return totalRevenue / 100; // Convert cents to dollars
    } catch (error) {
        console.error('Failed to fetch current month revenue:', error);
        return 0;
    }
}

/**
 * Get payment intent for checkout
 */
export async function createPaymentIntent(amount: number, currency = 'usd') {
    try {
        const paymentIntent = await getStripe().paymentIntents.create({
            amount: Math.round(amount * 100), // Convert dollars to cents
            currency,
        });
        return paymentIntent;
    } catch (error) {
        console.error('Failed to create payment intent:', error);
        throw error;
    }
}
