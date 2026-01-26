/**
 * @file Input.tsx
 * @description Accessible input component with brand styling and ARIA support.
 * Includes label, error messaging, and proper focus states.
 */

import { forwardRef, type InputHTMLAttributes, useId } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Label text for the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text to display below the input */
  helperText?: string;
  /** Size variant of the input */
  size?: "sm" | "md" | "lg";
  /** Whether the input should take full width */
  fullWidth?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
}

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

/**
 * Accessible input component with The Tech Deputies brand styling.
 *
 * @example
 * // Basic input with label
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 * />
 *
 * @example
 * // Input with error state
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = "md",
      fullWidth = false,
      startIcon,
      endIcon,
      className = "",
      id: providedId,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const helperId = `${id}-helper`;

    const hasError = Boolean(error);
    const hasHelper = Boolean(helperText);

    // Build aria-describedby from error, helper, and any custom value
    const describedByIds = [
      hasError ? errorId : null,
      hasHelper && !hasError ? helperId : null,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-secondary mb-1.5"
          >
            {label}
            {props.required && (
              <span className="text-accent-terracotta ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={hasError}
            aria-describedby={describedByIds || undefined}
            className={`
              block rounded-lg border
              bg-background text-foreground
              placeholder:text-muted-foreground
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted
              ${hasError ? "border-accent-terracotta focus:ring-accent-terracotta" : "border-border"}
              ${startIcon ? "pl-10" : ""}
              ${endIcon ? "pr-10" : ""}
              ${sizeStyles[size]}
              ${fullWidth ? "w-full" : ""}
              ${className}
            `.trim()}
            {...props}
          />
          {endIcon && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            >
              {endIcon}
            </span>
          )}
        </div>
        {hasError && (
          <p
            id={errorId}
            className="mt-1.5 text-sm text-accent-terracotta"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
        {hasHelper && !hasError && (
          <p id={helperId} className="mt-1.5 text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
