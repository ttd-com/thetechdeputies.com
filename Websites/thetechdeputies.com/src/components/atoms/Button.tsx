/**
 * @file Button.tsx
 * @description Accessible button component with brand styling and ARIA support.
 * Supports primary, secondary, and accent variants with proper focus states.
 */

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "accent" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  /** Icon to display before the button text */
  leftIcon?: ReactNode;
  /** Icon to display after the button text */
  rightIcon?: ReactNode;
  /** Full width button */
  fullWidth?: boolean;
  /** Accessible label for screen readers (required if children is not text) */
  "aria-label"?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-hover focus-visible:ring-primary",
  secondary:
    "bg-secondary text-white hover:bg-secondary-hover active:bg-secondary-hover focus-visible:ring-secondary",
  accent:
    "bg-accent-terracotta text-white hover:bg-accent-terracotta-hover active:bg-accent-terracotta-hover focus-visible:ring-accent-terracotta",
  outline:
    "border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:ring-primary",
  ghost:
    "text-primary hover:bg-primary/10 focus-visible:ring-primary",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

/**
 * Accessible button component with The Tech Deputies brand styling.
 *
 * @example
 * // Primary CTA button
 * <Button variant="primary" aria-label="Book a tech support session">
 *   Book Support
 * </Button>
 *
 * @example
 * // Secondary button with icon
 * <Button variant="secondary" leftIcon={<CalendarIcon />}>
 *   Schedule Later
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`
          inline-flex items-center justify-center gap-2
          font-medium rounded-lg
          transition-colors duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `.trim()}
        {...props}
      >
        {isLoading ? (
          <span
            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        ) : (
          leftIcon && <span aria-hidden="true">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !isLoading && <span aria-hidden="true">{rightIcon}</span>}
        {isLoading && <span className="sr-only">Loading...</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
