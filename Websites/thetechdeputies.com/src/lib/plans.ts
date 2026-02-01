export type PlanTier = 'BASIC' | 'STANDARD' | 'PREMIUM';
export type CourseInclusion = 'NONE' | 'PARTIAL' | 'FULL';
export type SupportTier = 'EMAIL' | 'PRIORITY' | 'PREMIUM';

export interface PlanDefinition {
  name: string;
  displayName: string;
  description: string;
  priceInCents: number;
  tier: PlanTier;
  sessionLimit: number;
  courseInclusion: CourseInclusion;
  familySize: number;
  supportTier: SupportTier;
  featured?: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

/**
 * Default subscription plans offered by The Tech Deputies
 * These are the baseline plans that will be seeded into the database
 */
export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    name: 'basic',
    displayName: 'Basic',
    description: 'Perfect for getting started with essential tech support',
    priceInCents: 4900, // $49.00
    tier: 'BASIC',
    sessionLimit: 2,
    courseInclusion: 'NONE',
    familySize: 1,
    supportTier: 'EMAIL',
    featured: false,
  },
  {
    name: 'standard',
    displayName: 'Standard',
    description: 'Great for ongoing learning and regular support needs',
    priceInCents: 9900, // $99.00
    tier: 'STANDARD',
    sessionLimit: 5,
    courseInclusion: 'PARTIAL',
    familySize: 1,
    supportTier: 'PRIORITY',
    featured: true,
  },
  {
    name: 'premium',
    displayName: 'Premium',
    description: 'Full access with unlimited sessions and family coverage',
    priceInCents: 19900, // $199.00
    tier: 'PREMIUM',
    sessionLimit: 0, // 0 = unlimited
    courseInclusion: 'FULL',
    familySize: 2,
    supportTier: 'PREMIUM',
    featured: false,
  },
];

/**
 * Get plan features for display
 */
export function getPlanFeatures(tier: PlanTier): string[] {
  const baseFeatures = ['Email support'];
  const features: Record<PlanTier, string[]> = {
    BASIC: [
      '2 sessions per month',
      'Email support',
      '10% off courses',
    ],
    STANDARD: [
      '5 sessions per month',
      'Priority support',
      '20% off courses',
      '15% off gift certificates',
    ],
    PREMIUM: [
      'Unlimited sessions',
      '24/7 premium support',
      'All courses included',
      'Family coverage (2 people)',
    ],
  };
  return features[tier];
}

/**
 * Format price in cents to USD string
 */
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

/**
 * Get plan by tier
 */
export function getPlanByTier(tier: PlanTier): PlanDefinition | undefined {
  return DEFAULT_PLANS.find((p) => p.tier === tier);
}

/**
 * Get all plans sorted by tier
 */
export function getAllPlans(): PlanDefinition[] {
  return DEFAULT_PLANS;
}

/**
 * Check if plan includes all courses
 */
export function planIncludesAllCourses(tier: PlanTier): boolean {
  return tier === 'PREMIUM';
}

/**
 * Check if plan includes partial courses
 */
export function planIncludesPartialCourses(tier: PlanTier): boolean {
  return tier === 'STANDARD';
}

/**
 * Get session limit for plan
 */
export function getSessionLimit(tier: PlanTier): number | null {
  const plan = getPlanByTier(tier);
  return plan ? (plan.sessionLimit === 0 ? null : plan.sessionLimit) : null;
}

/**
 * Check if user has exceeded session limit for current month
 */
export function hasExceededSessionLimit(
  tier: PlanTier,
  sessionCountThisMonth: number,
): boolean {
  const limit = getSessionLimit(tier);
  if (limit === null) return false; // unlimited
  return sessionCountThisMonth >= limit;
}
