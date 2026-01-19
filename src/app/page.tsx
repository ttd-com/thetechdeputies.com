/**
 * @file page.tsx
 * @description Landing page for The Tech Deputies website.
 * Features hero section, services overview, and call-to-action sections.
 */

import Link from "next/link";
import { Hero } from "@/components/molecules";
import { Button, Card } from "@/components/atoms";

/**
 * Service card data
 */
const services = [
  {
    title: "Tech Support",
    description:
      "One-on-one help with computers, phones, tablets, and smart devices. We solve problems and teach you along the way.",
    icon: "🔧",
    href: "/services#support",
  },
  {
    title: "Tech Education",
    description:
      "Learn at your own pace with our courses and workshops. From basics to advanced topics, we make technology accessible.",
    icon: "📚",
    href: "/courses",
  },
  {
    title: "Subscriptions",
    description:
      "Unlimited tech support with our monthly plans. Get priority scheduling and peace of mind knowing help is just a call away.",
    icon: "⭐",
    href: "/subscriptions",
  },
  {
    title: "Gift Certificates",
    description:
      "Give the gift of tech confidence. Perfect for parents, grandparents, or anyone who could use a helping hand.",
    icon: "🎁",
    href: "/gift-certificates",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <Hero
        headline="Your Tech Deputies Are Here to Help"
        subheadline="Expert tech support and education services. We help you navigate technology with confidence, whether you need one-on-one help or want to learn new skills."
        primaryCtaText="Book Support"
        primaryCtaHref="/booking"
        secondaryCtaText="View Courses"
        secondaryCtaHref="/courses"
      />

      {/* Services Section */}
      <section
        className="py-20 bg-background"
        aria-labelledby="services-heading"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              id="services-heading"
              className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            >
              How Can We Help?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you need immediate tech support or want to build your skills
              over time, we have options to fit your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="group block"
              >
                <Card
                  variant="default"
                  padding="lg"
                  className="h-full transition-all duration-300 group-hover:border-primary group-hover:shadow-lg"
                >
                  <div
                    className="text-4xl mb-4"
                    aria-hidden="true"
                  >
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-secondary mb-2 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-primary text-white"
        aria-labelledby="cta-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              id="cta-heading"
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/90 mb-8">
              Book your first session today or browse our courses to start your
              tech education journey. No question is too basic - we&apos;re here
              to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/booking">
                <Button
                  variant="secondary"
                  size="lg"
                  aria-label="Book a tech support session"
                >
                  Book a Session
                </Button>
              </Link>
              <Link href="/courses">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-primary"
                  aria-label="Browse tech education courses"
                >
                  Browse Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section
        className="py-20 bg-muted"
        aria-labelledby="why-heading"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              id="why-heading"
              className="text-3xl md:text-4xl font-bold text-secondary mb-4"
            >
              Why Choose The Tech Deputies?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">
                Patient & Understanding
              </h3>
              <p className="text-muted-foreground">
                We take the time to explain things clearly, without rushing or
                making you feel embarrassed to ask questions.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">
                Flexible Scheduling
              </h3>
              <p className="text-muted-foreground">
                Book sessions that fit your schedule. We offer in-person and
                remote support options to meet your needs.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">
                Trustworthy & Reliable
              </h3>
              <p className="text-muted-foreground">
                Your data and privacy are safe with us. We focus on teaching you
                to be self-sufficient, not dependent.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
