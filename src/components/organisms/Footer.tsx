/**
 * @file Footer.tsx
 * @description Site footer with navigation links, contact info, and legal links.
 * Uses navy (#2F435A) background as per brand guidelines.
 */

import Link from "next/link";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  /** Custom footer sections */
  sections?: FooterSection[];
  /** Contact email */
  email?: string;
  /** Contact phone */
  phone?: string;
}

const defaultSections: FooterSection[] = [
  {
    title: "Services",
    links: [
      { label: "Tech Support", href: "/services#support" },
      { label: "Education", href: "/courses" },
      { label: "Subscriptions", href: "/subscriptions" },
      { label: "Gift Cards", href: "/gift-certificates" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Book Now", href: "/booking" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
];

/**
 * Site footer component with navigation and contact information.
 *
 * @example
 * <Footer
 *   email="support@thetechdeputies.com"
 *   phone="(555) 123-4567"
 * />
 */
export function Footer({
  sections = defaultSections,
  email = "support@thetechdeputies.com",
  phone,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-secondary text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold text-white hover:text-accent-tan transition-colors"
              aria-label="The Tech Deputies - Home"
            >
              <span className="text-2xl" aria-hidden="true">🤠</span>
              <span>The Tech Deputies</span>
            </Link>
            <p className="mt-4 text-white/80 text-sm leading-relaxed">
              Your trusted partners for tech education and support.
              We help you navigate technology with confidence.
            </p>
            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-white/80 hover:text-accent-tan transition-colors text-sm"
                  aria-label={`Email us at ${email}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {email}
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 text-white/80 hover:text-accent-tan transition-colors text-sm"
                  aria-label={`Call us at ${phone}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {phone}
                </a>
              )}
            </div>
          </div>

          {/* Navigation Sections */}
          {sections.map((section) => (
            <nav key={section.title} aria-label={`${section.title} links`}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2" role="list">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-white/80 hover:text-white transition-colors text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                        <span className="sr-only"> (opens in new tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/80 hover:text-white transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              &copy; {currentYear} The Tech Deputies. All rights reserved.
            </p>
            <p className="text-white/60 text-sm">
              Built with accessibility in mind.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
