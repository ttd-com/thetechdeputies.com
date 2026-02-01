import { describe, it, expect } from 'vitest';
import {
  getAllPlans,
  getPlanFeatures,
  formatPrice,
  hasExceededSessionLimit,
  getSessionLimit,
  DEFAULT_PLANS,
  getPlanByTier,
  planIncludesAllCourses,
  planIncludesPartialCourses,
} from '@/lib/plans';

describe('Plans Library', () => {
  describe('getAllPlans', () => {
    it('should return all plans in order', () => {
      const plans = getAllPlans();
      expect(plans).toHaveLength(3);
      expect(plans[0].name).toBe('basic');
      expect(plans[1].name).toBe('standard');
      expect(plans[2].name).toBe('premium');
    });

    it('should return plans with correct pricing', () => {
      const plans = getAllPlans();
      expect(plans[0].priceInCents).toBe(4900); // $49.00
      expect(plans[1].priceInCents).toBe(9900); // $99.00
      expect(plans[2].priceInCents).toBe(19900); // $199.00
    });

    it('should return plans with tier information', () => {
      const plans = getAllPlans();
      expect(plans[0].tier).toBe('BASIC');
      expect(plans[1].tier).toBe('STANDARD');
      expect(plans[2].tier).toBe('PREMIUM');
    });
  });

  describe('getPlanFeatures', () => {
    it('should return features for basic plan', () => {
      const features = getPlanFeatures('BASIC');
      expect(features).toContain('2 sessions per month');
      expect(features).toContain('Email support');
    });

    it('should return features for standard plan', () => {
      const features = getPlanFeatures('STANDARD');
      expect(features).toContain('5 sessions per month');
      expect(features).toContain('Priority support');
    });

    it('should return features for premium plan', () => {
      const features = getPlanFeatures('PREMIUM');
      expect(features).toContain('Unlimited sessions');
      expect(features).toContain('24/7 premium support');
    });
  });

  describe('formatPrice', () => {
    it('should format price in cents to dollar string', () => {
      expect(formatPrice(4900)).toBe('$49.00');
      expect(formatPrice(9900)).toBe('$99.00');
      expect(formatPrice(19900)).toBe('$199.00');
    });

    it('should handle single digit cents', () => {
      expect(formatPrice(1005)).toBe('$10.05');
      expect(formatPrice(5)).toBe('$0.05');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should format large amounts without commas', () => {
      expect(formatPrice(999999)).toBe('$9999.99');
    });
  });

  describe('getSessionLimit', () => {
    it('should return session limit for basic plan', () => {
      expect(getSessionLimit('BASIC')).toBe(2);
    });

    it('should return session limit for standard plan', () => {
      expect(getSessionLimit('STANDARD')).toBe(5);
    });

    it('should return null for premium plan (unlimited)', () => {
      expect(getSessionLimit('PREMIUM')).toBe(null);
    });
  });

  describe('hasExceededSessionLimit', () => {
    it('should return false when sessions booked are under limit', () => {
      expect(hasExceededSessionLimit('BASIC', 1)).toBe(false);
    });

    it('should return true when sessions booked meet or exceed limit', () => {
      expect(hasExceededSessionLimit('BASIC', 2)).toBe(true);
      expect(hasExceededSessionLimit('BASIC', 3)).toBe(true);
    });

    it('should handle standard plan limits', () => {
      expect(hasExceededSessionLimit('STANDARD', 4)).toBe(false);
      expect(hasExceededSessionLimit('STANDARD', 5)).toBe(true);
    });

    it('should never exceed premium plan (unlimited)', () => {
      expect(hasExceededSessionLimit('PREMIUM', 100)).toBe(false);
      expect(hasExceededSessionLimit('PREMIUM', 1000)).toBe(false);
    });
  });

  describe('planIncludesAllCourses', () => {
    it('should return true only for premium tier', () => {
      expect(planIncludesAllCourses('PREMIUM')).toBe(true);
      expect(planIncludesAllCourses('STANDARD')).toBe(false);
      expect(planIncludesAllCourses('BASIC')).toBe(false);
    });
  });

  describe('planIncludesPartialCourses', () => {
    it('should return true only for standard tier', () => {
      expect(planIncludesPartialCourses('STANDARD')).toBe(true);
      expect(planIncludesPartialCourses('BASIC')).toBe(false);
      expect(planIncludesPartialCourses('PREMIUM')).toBe(false);
    });
  });

  describe('getPlanByTier', () => {
    it('should return plan by tier', () => {
      const basicPlan = getPlanByTier('BASIC');
      expect(basicPlan?.name).toBe('basic');
      expect(basicPlan?.tier).toBe('BASIC');
    });

    it('should return undefined for invalid tier', () => {
      const invalidPlan = getPlanByTier('INVALID' as any);
      expect(invalidPlan).toBeUndefined();
    });
  });

  describe('DEFAULT_PLANS', () => {
    it('should have all three plans defined', () => {
      expect(DEFAULT_PLANS).toHaveLength(3);
    });

    it('should have required fields for each plan', () => {
      DEFAULT_PLANS.forEach((plan) => {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('displayName');
        expect(plan).toHaveProperty('priceInCents');
        expect(plan).toHaveProperty('tier');
        expect(plan).toHaveProperty('sessionLimit');
        expect(plan).toHaveProperty('courseInclusion');
        expect(plan).toHaveProperty('supportTier');
      });
    });

    it('should have correct session limits', () => {
      const basicPlan = DEFAULT_PLANS.find((p) => p.tier === 'BASIC');
      const standardPlan = DEFAULT_PLANS.find((p) => p.tier === 'STANDARD');
      const premiumPlan = DEFAULT_PLANS.find((p) => p.tier === 'PREMIUM');

      expect(basicPlan?.sessionLimit).toBe(2);
      expect(standardPlan?.sessionLimit).toBe(5);
      expect(premiumPlan?.sessionLimit).toBe(0); // 0 = unlimited
    });
  });
});
