/**
 * @file page.tsx
 * @description Gift certificates page for purchasing tech support gift cards.
 * Allows users to buy digital gift certificates via Acuity.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AcuityEmbed } from "@/components/organisms";
import { Card } from "@/components/atoms";

export const metadata: Metadata = {
  title: "Gift Certificates",
  description:
    "Give the gift of tech confidence. Our gift certificates make a thoughtful present for anyone who could use a helping hand with technology.",
};

/**
 * Gift certificate use cases
 */
const giftIdeas = [
  {
    icon: "👴👵",
    title: "Parents & Grandparents",
    description:
      "Help them stay connected with video calls, email, and their devices.",
  },
  {
    icon: "🎓",
    title: "Recent Graduates",
    description:
      "Set them up for success with productivity tools and online safety.",
  },
  {
    icon: "🏠",
    title: "New Homeowners",
    description:
      "Help them set up smart home devices, Wi-Fi, and home office tech.",
  },
  {
    icon: "👔",
    title: "Career Changers",
    description:
      "Support their transition with new software skills and digital literacy.",
  },
];

/**
 * How gift certificates work
 */
const howItWorks = [
  {
    step: 1,
    title: "Purchase",
    description: "Choose an amount and complete your purchase online.",
  },
  {
    step: 2,
    title: "Deliver",
    description: "We'll email a beautiful digital certificate to you or directly to the recipient.",
  },
  {
    step: 3,
    title: "Redeem",
    description: "The recipient books sessions using their unique gift code.",
  },
];

export default function GiftCertificatesPage() {
  return (
    <>
      {/* Page Header */}
      <section
        className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-12"
        aria-labelledby="gift-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-4" aria-hidden="true">
              🎁
            </div>
            <h1
              id="gift-heading"
              className="text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              Gift Certificates
            </h1>
            <p className="text-lg text-muted-foreground">
              Give the gift of tech confidence. Perfect for birthdays, holidays,
              or just because. Help someone you care about feel more comfortable
              with technology.
            </p>
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section
        className="py-12 bg-background"
        aria-labelledby="purchase-heading"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Purchase Area */}
            <div className="lg:col-span-2">
              <h2
                id="purchase-heading"
                className="text-2xl font-bold text-secondary mb-4"
              >
                Purchase a Gift Certificate
              </h2>
              <p className="text-muted-foreground mb-6">
                Choose any amount and we&apos;ll send a beautiful digital certificate.
                Gift certificates never expire and can be used for any of our
                services.
              </p>
              <AcuityEmbed type="gift-certificates" minHeight="500px" />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Features */}
              <Card variant="default" padding="lg">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  Gift Certificate Features
                </h3>
                <ul className="space-y-3" role="list">
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-foreground">
                      <strong>Never expires</strong> - Use anytime
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-foreground">
                      <strong>Any amount</strong> - You choose the value
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-foreground">
                      <strong>Instant delivery</strong> - Email within minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-foreground">
                      <strong>All services</strong> - Support, courses, or both
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-foreground">
                      <strong>Personalized</strong> - Add a custom message
                    </span>
                  </li>
                </ul>
              </Card>

              {/* Suggested Amounts */}
              <Card variant="muted" padding="md">
                <h3 className="font-semibold text-secondary mb-3">
                  Suggested Amounts
                </h3>
                <ul className="space-y-2 text-sm" role="list">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Single session
                    </span>
                    <span className="font-medium">$75</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Two sessions
                    </span>
                    <span className="font-medium">$140</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Course + session
                    </span>
                    <span className="font-medium">$125</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">
                      Month of support
                    </span>
                    <span className="font-medium">$200</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        className="py-12 bg-muted/50"
        aria-labelledby="how-it-works-heading"
      >
        <div className="container mx-auto px-4">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-bold text-secondary text-center mb-8"
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold"
                  aria-hidden="true"
                >
                  {item.step}
                </div>
                <h3 className="font-semibold text-secondary mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Ideas */}
      <section
        className="py-12 bg-background"
        aria-labelledby="gift-ideas-heading"
      >
        <div className="container mx-auto px-4">
          <h2
            id="gift-ideas-heading"
            className="text-2xl font-bold text-secondary text-center mb-8"
          >
            Great Gift Ideas For...
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {giftIdeas.map((idea) => (
              <Card key={idea.title} variant="default" padding="md">
                <div className="text-center">
                  <div className="text-4xl mb-3" aria-hidden="true">
                    {idea.icon}
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {idea.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Redeem Info */}
      <section className="py-12 bg-accent-tan/20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              Have a Gift Certificate?
            </h2>
            <p className="text-muted-foreground mb-6">
              Ready to redeem your gift? Simply book a session or course and
              enter your gift code at checkout. The value will be applied
              automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-hover transition-colors"
              >
                Book a Session
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-background" aria-labelledby="faq-heading">
        <div className="container mx-auto px-4">
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-secondary text-center mb-8"
          >
            Gift Certificate FAQ
          </h2>
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Do gift certificates expire?
              </h3>
              <p className="text-muted-foreground">
                No! Our gift certificates never expire. Recipients can use them
                whenever they&apos;re ready.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Can I send it directly to the recipient?
              </h3>
              <p className="text-muted-foreground">
                Yes! During purchase, you can choose to send the certificate
                directly to the recipient&apos;s email, or receive it yourself to
                deliver in person.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                What can gift certificates be used for?
              </h3>
              <p className="text-muted-foreground">
                Gift certificates can be used for any of our services: one-on-one
                support sessions, courses, or subscription plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-secondary mb-2">
                Can I get a refund on a gift certificate?
              </h3>
              <p className="text-muted-foreground">
                Unused gift certificates can be refunded within 30 days of
                purchase. Once partially redeemed, the remaining balance is
                non-refundable.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
