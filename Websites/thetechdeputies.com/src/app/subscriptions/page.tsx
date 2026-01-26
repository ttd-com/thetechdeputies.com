/**
 * @file page.tsx
 * @description Subscriptions page for purchasing recurring tech support plans.
 * Features subscription tiers and embedded Acuity subscription purchasing.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AcuityEmbed } from "@/components/organisms";
import { Button } from "@/components/atoms";
import { PlanCard } from "@/components/molecules";

export const metadata: Metadata = {
  title: "Subscription Plans",
  description:
    "Get unlimited tech support with our subscription plans. Choose the plan that fits your needs and enjoy peace of mind.",
};

/**
 * Subscription plan highlights (displayed above the Acuity embed)
 */
const planHighlights = [
  {
    name: "Basic",
    price: "$49",
    period: "/month",
    description: "Perfect for occasional tech questions",
    features: [
      "2 support sessions per month",
      "Email support",
      "10% off additional sessions",
      "Resource library access",
    ],
    popular: false,
  },
  {
    name: "Standard",
    price: "$99",
    period: "/month",
    description: "Our most popular plan for regular support",
    features: [
      "5 support sessions per month",
      "Priority email & phone support",
      "20% off additional sessions",
      "Resource library access",
      "15% off courses",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "$199",
    period: "/month",
    description: "Comprehensive support for power users",
    features: [
      "Unlimited support sessions",
      "Priority scheduling",
      "24/7 email support",
      "Free access to all courses",
      "Family member coverage (2)",
    ],
    popular: false,
  },
];

/**
 * Benefits of subscribing
 */
const benefits = [
  {
    icon: "💰",
    title: "Save Money",
    description: "Subscriptions cost less than booking sessions individually.",
  },
  {
    icon: "⚡",
    title: "Priority Access",
    description: "Subscribers get priority scheduling and faster response times.",
  },
  {
    icon: "🔄",
    title: "Flexible Plans",
    description: "Upgrade, downgrade, or cancel anytime. No long-term contracts.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family Coverage",
    description: "Premium plans include coverage for family members.",
  },
];

export default function SubscriptionsPage() {
  return (
    <>
      {/* Page Header */}
      <section
        className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-12"
        aria-labelledby="subscriptions-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              id="subscriptions-heading"
              className="text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              Subscription Plans
            </h1>
            <p className="text-lg text-muted-foreground">
              Get the tech support you need, when you need it. Our subscription
              plans give you peace of mind and priority access to help.
            </p>
          </div>
        </div>
      </section>

      {/* Plan Comparison */}
      <section
        className="py-12 bg-background"
        aria-labelledby="plans-heading"
      >
        <div className="container mx-auto px-4">
          <h2 id="plans-heading" className="sr-only">
            Available Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {planHighlights.map((plan) => (
              <PlanCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                period={plan.period}
                description={plan.description}
                features={plan.features}
                popular={plan.popular}
                scrollTargetId="purchase-section"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="py-12 bg-muted/50"
        aria-labelledby="benefits-heading"
      >
        <div className="container mx-auto px-4">
          <h2
            id="benefits-heading"
            className="text-2xl font-bold text-secondary text-center mb-8"
          >
            Why Subscribe?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="text-4xl mb-3" aria-hidden="true">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section
        id="purchase-section"
        className="py-12 bg-background"
        aria-labelledby="purchase-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2
              id="purchase-heading"
              className="text-2xl font-bold text-secondary text-center mb-2"
            >
              Purchase a Subscription
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Select your plan below to get started. You can manage your
              subscription at any time from your account dashboard.
            </p>
            <AcuityEmbed type="subscriptions" minHeight="600px" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-muted/50" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4">
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-secondary text-center mb-8"
          >
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Can I cancel my subscription?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can cancel anytime. Your subscription will remain
                active until the end of your current billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                What happens to unused sessions?
              </h3>
              <p className="text-muted-foreground">
                Unused sessions don&apos;t roll over to the next month. We encourage
                you to use all your sessions - even if it&apos;s just a quick
                question!
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-muted-foreground">
                Absolutely! You can change your plan at any time. Changes take
                effect at the start of your next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Is there a contract or commitment?
              </h3>
              <p className="text-muted-foreground">
                No contracts! All subscriptions are month-to-month. You&apos;re free
                to cancel whenever you like.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Not Sure Which Plan Is Right?
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Book a free consultation and we&apos;ll help you choose the best plan
            for your needs.
          </p>
          <Link href="/booking">
            <Button
              variant="secondary"
              size="lg"
              aria-label="Book a free consultation"
            >
              Book Free Consultation
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
