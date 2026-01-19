/**
 * @file Hero.tsx
 * @description Hero section component for the landing page.
 * Features prominent CTA buttons and brand messaging.
 */

import Link from "next/link";
import { Button } from "../atoms";

export interface HeroProps {
  /** Main headline text */
  headline?: string;
  /** Supporting subheadline text */
  subheadline?: string;
  /** Primary CTA button text */
  primaryCtaText?: string;
  /** Primary CTA link */
  primaryCtaHref?: string;
  /** Secondary CTA button text */
  secondaryCtaText?: string;
  /** Secondary CTA link */
  secondaryCtaHref?: string;
}

/**
 * Hero section component with prominent CTAs.
 *
 * @example
 * <Hero
 *   headline="Tech Support That Comes to You"
 *   subheadline="Expert help with computers, devices, and technology."
 *   primaryCtaText="Book Support"
 *   primaryCtaHref="/booking"
 * />
 */
export function Hero({
  headline = "Your Tech Deputies Are Here to Help",
  subheadline = "Expert tech support and education services. We help you navigate technology with confidence, whether you need one-on-one help or want to learn new skills.",
  primaryCtaText = "Book Support",
  primaryCtaHref = "/booking",
  secondaryCtaText = "View Courses",
  secondaryCtaHref = "/courses",
}: HeroProps) {
  return (
    <section
      className="relative bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-20 md:py-32"
      aria-labelledby="hero-headline"
    >
      {/* Decorative background element */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/4 -left-1/4 w-80 h-80 bg-accent-tan/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge/Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            <span className="text-lg" aria-hidden="true">🤠</span>
            <span>Tech Help You Can Trust</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight mb-6"
          >
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={primaryCtaHref}>
              <Button
                variant="primary"
                size="lg"
                aria-label={`${primaryCtaText} - Book a tech support session`}
              >
                {primaryCtaText}
              </Button>
            </Link>
            <Link href={secondaryCtaHref}>
              <Button
                variant="outline"
                size="lg"
                aria-label={`${secondaryCtaText} - Browse our tech education courses`}
              >
                {secondaryCtaText}
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
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
              <span>Patient & Friendly</span>
            </div>
            <div className="flex items-center gap-2">
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
              <span>No Jargon</span>
            </div>
            <div className="flex items-center gap-2">
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
              <span>Flexible Scheduling</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
