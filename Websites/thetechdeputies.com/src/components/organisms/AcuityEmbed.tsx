/**
 * @file AcuityEmbed.tsx
 * @description Accessible Acuity Scheduling embed wrapper component.
 * Handles iframe loading, accessibility labeling, and brand styling.
 */

"use client";

import { useState, useEffect } from "react";
import {
  type AcuityEmbedType,
  getAcuityEmbedUrl,
  acuityIframeConfig,
  isAcuityConfigured,
} from "@/lib/acuity";

export interface AcuityEmbedProps {
  /** Type of Acuity embed to display */
  type: AcuityEmbedType;
  /** Optional appointment type ID to pre-select */
  appointmentType?: string;
  /** Optional calendar ID */
  calendarId?: string;
  /** Minimum height of the embed */
  minHeight?: string;
  /** Custom class name for the container */
  className?: string;
}

/**
 * Accessible Acuity Scheduling embed wrapper.
 * Provides loading states, error handling, and ARIA labeling.
 *
 * @example
 * // Basic scheduler embed
 * <AcuityEmbed type="scheduler" />
 *
 * @example
 * // Subscriptions embed with custom height
 * <AcuityEmbed type="subscriptions" minHeight="800px" />
 */
export function AcuityEmbed({
  type,
  appointmentType,
  calendarId,
  minHeight = "600px",
  className = "",
}: AcuityEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = getAcuityEmbedUrl(type, { appointmentType, calendarId });
  const iframeTitle = acuityIframeConfig.getTitle(type);
  const isConfigured = isAcuityConfigured();

  useEffect(() => {
    // Reset loading state when type changes
    setIsLoading(true);
    setHasError(false);
  }, [type]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Show configuration message if Acuity is not set up
  if (!isConfigured) {
    return (
      <div
        className={`
          border-2 border-dashed border-border rounded-xl
          bg-muted/50 p-8 text-center
          ${className}
        `}
        style={{ minHeight }}
        role="region"
        aria-label={iframeTitle}
      >
        <div className="max-w-md mx-auto">
          <div className="text-5xl mb-4" aria-hidden="true">
            📅
          </div>
          <h3 className="text-xl font-semibold text-secondary mb-2">
            Scheduling Coming Soon
          </h3>
          <p className="text-muted-foreground mb-4">
            Our online booking system is being configured. In the meantime,
            please contact us directly to schedule your appointment.
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
              <a
                href="tel:+19169999576"
                className="text-primary hover:text-primary-hover"
              >
                (916) 999-9576
              </a>
            </p>
            <p className="text-muted-foreground">
              We&apos;ll get back to you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      role="region"
      aria-label={iframeTitle}
      aria-busy={isLoading}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-xl"
          aria-hidden="true"
        >
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Loading scheduler...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-background z-10 rounded-xl"
          role="alert"
        >
          <div className="text-center max-w-md p-8">
            <div className="text-5xl mb-4" aria-hidden="true">
              ⚠️
            </div>
            <h3 className="text-xl font-semibold text-secondary mb-2">
              Unable to Load Scheduler
            </h3>
            <p className="text-muted-foreground mb-4">
              We&apos;re having trouble loading the booking system. This might be
              due to your browser settings or a temporary issue.
            </p>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="text-primary hover:text-primary-hover font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Acuity Iframe */}
      <div
        className="relative overflow-hidden rounded-xl border-2 border-primary/20 bg-background"
        style={{ minHeight }}
      >
        <iframe
          src={embedUrl}
          title={iframeTitle}
          width="100%"
          height="100%"
          style={{ minHeight, border: "none" }}
          sandbox={acuityIframeConfig.sandbox}
          loading={acuityIframeConfig.loading}
          onLoad={handleLoad}
          onError={handleError}
          aria-describedby="acuity-embed-description"
        />
        <p id="acuity-embed-description" className="sr-only">
          This is an embedded scheduling interface from Acuity Scheduling.
          Use this form to select a service, choose a date and time, and
          complete your booking.
        </p>
      </div>

      {/* Accessibility Note */}
      <p className="mt-2 text-xs text-muted-foreground text-center">
        Having trouble with the scheduler? Reach us at{' '}
        <a href="mailto:hello@thetechdeputies.com" className="text-primary hover:text-primary-hover">
          hello@thetechdeputies.com
        </a>{' '}
        or
        {' '}
        <a href="tel:+19169999576" className="text-primary hover:text-primary-hover">
          Call or Text: (916) 999-9576
        </a>
        .
      </p>
    </div>
  );
}
