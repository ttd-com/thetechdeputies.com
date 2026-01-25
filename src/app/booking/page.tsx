/**
 * @file page.tsx
 * @description Booking page with embedded Acuity Scheduling widget.
 * Allows users to book tech support sessions directly on the site.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { AcuityEmbed } from "@/components/organisms";
import { Card } from "@/components/atoms";

export const metadata: Metadata = {
  title: "Book a Session",
  description:
    "Schedule your tech support session with The Tech Deputies. Choose a time that works for you and get the help you need.",
};

/**
 * Service highlights to display alongside the booking widget
 */
const serviceHighlights = [
  {
    icon: "💻",
    title: "Computer Help",
    description: "Troubleshooting, setup, and optimization for PCs and Macs",
  },
  {
    icon: "📱",
    title: "Mobile Devices",
    description: "iPhone, Android, tablets - we help with all devices",
  },
  {
    icon: "🌐",
    title: "Internet & Email",
    description: "Wi-Fi setup, email configuration, and online safety",
  },
  {
    icon: "🔒",
    title: "Security Check",
    description: "Protect yourself from scams and keep your data safe",
  },
];

export default function BookingPage() {
  return (
    <>
      {/* Page Header */}
      <section
        className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-12"
        aria-labelledby="booking-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1
              id="booking-heading"
              className="text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              Book a Session
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Ready to get help with your tech questions? Choose a time that
              works for you and we&apos;ll take it from there. All sessions
              include patient, jargon-free support.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
                In-person or remote options
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
                Flexible scheduling
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-primary"
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
                Satisfaction guaranteed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="py-12 bg-background" aria-labelledby="scheduler-heading">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Scheduler */}
            <div className="lg:col-span-2">
              <h2 id="scheduler-heading" className="sr-only">
                Appointment Scheduler
              </h2>
              <AcuityEmbed type="scheduler" minHeight="700px" />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* What We Help With */}
              <Card variant="default" padding="lg">
                <h3 className="text-lg font-semibold text-secondary mb-4">
                  What We Help With
                </h3>
                <ul className="space-y-4" role="list">
                  {serviceHighlights.map((service) => (
                    <li key={service.title} className="flex items-start gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {service.icon}
                      </span>
                      <div>
                        <h4 className="font-medium text-foreground">
                          {service.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {service.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Subscription Upsell */}
              <Card variant="muted" padding="md">
                <h3 className="font-semibold text-secondary mb-2">
                  Need Ongoing Support?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our subscription plans give you unlimited tech support at a
                  flat monthly rate. Perfect for peace of mind.
                </p>
                <Link
                  href="/subscriptions"
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                >
                  View Subscription Plans →
                </Link>
              </Card>

              {/* Gift Certificate */}
              <Card variant="muted" padding="md">
                <h3 className="font-semibold text-secondary mb-2">
                  Give the Gift of Tech Help
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Know someone who could use a helping hand? Our gift
                  certificates make a thoughtful present.
                </p>
                <Link
                  href="/gift-certificates"
                  className="text-primary hover:text-primary-hover font-medium text-sm"
                >
                  Buy a Gift Certificate →
                </Link>
              </Card>

              {/* Contact Info */}
              <Card variant="default" padding="md">
                <h3 className="font-semibold text-secondary mb-2">
                  Questions Before Booking?
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Not sure what service you need? We&apos;re happy to chat first.
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a
                      href="mailto:hello@thetechdeputies.com"
                      className="text-primary hover:text-primary-hover"
                    >
                      hello@thetechdeputies.com
                    </a>
                  </p>
                  <p>
                    <strong>Call or Text:</strong>{" "}
                    <a href="tel:+19169999576" className="text-primary hover:text-primary-hover">
                      (916) 999-9576
                    </a>
                  </p>
                </div>
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
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold"
                aria-hidden="true"
              >
                1
              </div>
              <h3 className="font-semibold text-secondary mb-2">Book Online</h3>
              <p className="text-sm text-muted-foreground">
                Choose a service and pick a time that works for your schedule.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold"
                aria-hidden="true"
              >
                2
              </div>
              <h3 className="font-semibold text-secondary mb-2">
                We Connect
              </h3>
              <p className="text-sm text-muted-foreground">
                Meet in person or connect remotely - whatever&apos;s easier for you.
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 mx-auto mb-4 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold"
                aria-hidden="true"
              >
                3
              </div>
              <h3 className="font-semibold text-secondary mb-2">
                Problem Solved
              </h3>
              <p className="text-sm text-muted-foreground">
                We fix the issue and teach you along the way. No jargon, just help.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
