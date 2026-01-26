/**
 * @file SkipLink.tsx
 * @description Accessibility skip link for keyboard navigation.
 * Allows users to skip directly to main content.
 */

import { type AnchorHTMLAttributes } from "react";

export interface SkipLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** The ID of the main content element to skip to */
  targetId?: string;
}

/**
 * Accessible skip link for keyboard navigation.
 * Hidden by default, becomes visible on focus.
 *
 * @example
 * // In layout.tsx
 * <SkipLink targetId="main-content" />
 * <Navigation />
 * <main id="main-content">...</main>
 */
export function SkipLink({
  targetId = "main-content",
  children = "Skip to main content",
  className = "",
  ...props
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className={`
        skip-link
        sr-only focus:not-sr-only
        fixed top-0 left-0 z-50
        bg-primary text-white
        px-4 py-2 rounded-br-lg
        font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </a>
  );
}
