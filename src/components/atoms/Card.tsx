/**
 * @file Card.tsx
 * @description Accessible card component for content containers.
 * Used for course cards, feature highlights, and dashboard panels.
 */

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card */
  variant?: "default" | "outlined" | "elevated" | "muted";
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Whether the card is interactive (clickable) */
  interactive?: boolean;
  /** Header content for the card */
  header?: ReactNode;
  /** Footer content for the card */
  footer?: ReactNode;
}

const variantStyles = {
  default: "bg-background border border-border",
  outlined: "bg-transparent border-2 border-primary",
  elevated: "bg-background shadow-lg border border-border/50",
  muted: "bg-muted border border-border",
};

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

/**
 * Accessible card component for content containers.
 *
 * @example
 * // Basic card
 * <Card>
 *   <h3>Tech Support Session</h3>
 *   <p>Get one-on-one help with your device.</p>
 * </Card>
 *
 * @example
 * // Interactive card with header and footer
 * <Card
 *   interactive
 *   header={<h3>Course Title</h3>}
 *   footer={<Button>Enroll Now</Button>}
 *   onClick={() => navigate('/course/123')}
 *   aria-label="View course: Introduction to Tech"
 * >
 *   <p>Course description here...</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      padding = "md",
      interactive = false,
      header,
      footer,
      children,
      className = "",
      role,
      ...props
    },
    ref
  ) => {
    const interactiveStyles = interactive
      ? "cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      : "";

    return (
      <div
        ref={ref}
        role={interactive ? role || "button" : role}
        tabIndex={interactive ? 0 : undefined}
        className={`
          rounded-xl overflow-hidden
          ${variantStyles[variant]}
          ${interactiveStyles}
          ${className}
        `.trim()}
        {...props}
      >
        {header && (
          <div className="border-b border-border px-4 py-3 bg-muted/50">
            {header}
          </div>
        )}
        <div className={paddingStyles[padding]}>{children}</div>
        {footer && (
          <div className="border-t border-border px-4 py-3 bg-muted/30">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";
