/**
 * @file Header.tsx
 * @description Main navigation header with responsive mobile menu.
 * Includes brand logo, navigation links, and primary CTA.
 */

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../atoms";

export interface NavItem {
  label: string;
  href: string;
  /** Accessible description for screen readers */
  ariaLabel?: string;
}

export interface HeaderProps {
  /** Navigation items to display */
  navItems?: NavItem[];
  /** Callback when CTA button is clicked */
  onCtaClick?: () => void;
}

const defaultNavItems: NavItem[] = [
  { label: "Services", href: "/services", ariaLabel: "View our tech support services" },
  { label: "Courses", href: "/courses", ariaLabel: "Browse tech education courses" },
  { label: "Gift Cards", href: "/gift-certificates", ariaLabel: "Purchase gift certificates" },
  { label: "About", href: "/about", ariaLabel: "Learn about The Tech Deputies" },
];

/**
 * Main navigation header component.
 *
 * @example
 * <Header
 *   navItems={[
 *     { label: "Services", href: "/services" },
 *     { label: "Courses", href: "/courses" },
 *   ]}
 *   onCtaClick={() => router.push('/booking')}
 * />
 */
export function Header({
  navItems = defaultNavItems,
  onCtaClick,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();

  // Prevent hydration mismatch by only showing session-dependent content after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isLoggedIn = isMounted && status === 'authenticated' && !!session?.user;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="container mx-auto flex h-16 items-center justify-between px-4"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl text-primary hover:text-primary-hover transition-colors"
          aria-label="The Tech Deputies - Home"
        >
          <span className="text-2xl" aria-hidden="true">🤠</span>
          <span className="hidden sm:inline">The Tech Deputies</span>
          <span className="sm:hidden">TTD</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-6" role="list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
                aria-label={item.ariaLabel}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="primary" aria-label="Go to your dashboard">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" aria-label="Sign in to your account">
                  Sign In
                </Button>
              </Link>
              <Link href="/booking">
                <Button
                  variant="primary"
                  onClick={onCtaClick}
                  aria-label="Book a tech support session"
                >
                  Book Support
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t border-border bg-background"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <ul className="container mx-auto px-4 py-4 space-y-2" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
                  aria-label={item.ariaLabel}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 border-t border-border space-y-2">
              {isLoggedIn ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="primary"
                    fullWidth
                    aria-label="Go to your dashboard"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      fullWidth
                      aria-label="Sign in to your account"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={onCtaClick}
                      aria-label="Book a tech support session"
                    >
                      Book Support
                    </Button>
                  </Link>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
