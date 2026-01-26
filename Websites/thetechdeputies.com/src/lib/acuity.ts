/**
 * @file acuity.ts
 * @description Acuity Scheduling configuration and embed URL builders.
 * Configure your Acuity owner ID and embed settings here.
 *
 * In production, the ACUITY_OWNER_ID should be stored in the database
 * and managed through the admin interface.
 */

/**
 * Acuity embed types supported
 */
export type AcuityEmbedType =
  | "scheduler"      // Main appointment scheduler
  | "subscriptions"  // Subscription/package purchasing
  | "gift-certificates"; // Gift certificate purchasing

/**
 * Acuity embed configuration
 */
export interface AcuityConfig {
  /** Acuity owner/user ID - configure in admin or env */
  ownerId: string;
  /** Base URL for Acuity embeds */
  baseUrl: string;
}

/**
 * Default Acuity configuration
 * In production, ownerId would come from database/admin settings
 */
export const acuityConfig: AcuityConfig = {
  // TODO: Replace with actual Acuity owner ID from admin settings
  ownerId: process.env.NEXT_PUBLIC_ACUITY_OWNER_ID || "ACUITY_OWNER_ID",
  baseUrl: "https://acuityscheduling.com",
};

/**
 * Build Acuity embed URL for different embed types
 */
export function getAcuityEmbedUrl(
  type: AcuityEmbedType,
  options?: {
    /** Specific appointment type ID to pre-select */
    appointmentType?: string;
    /** Calendar ID to show */
    calendarId?: string;
  }
): string {
  const { ownerId, baseUrl } = acuityConfig;

  switch (type) {
    case "scheduler":
      let schedulerUrl = `${baseUrl}/schedule.php?owner=${ownerId}`;
      if (options?.appointmentType) {
        schedulerUrl += `&appointmentType=${options.appointmentType}`;
      }
      if (options?.calendarId) {
        schedulerUrl += `&calendarID=${options.calendarId}`;
      }
      return schedulerUrl;

    case "subscriptions":
      return `${baseUrl}/subscriptions.php?owner=${ownerId}`;

    case "gift-certificates":
      return `${baseUrl}/gift-certificates.php?owner=${ownerId}`;

    default:
      return `${baseUrl}/schedule.php?owner=${ownerId}`;
  }
}

/**
 * Get the Acuity embed script URL
 */
export function getAcuityScriptUrl(): string {
  return "https://embed.acuityscheduling.com/js/embed.js";
}

/**
 * Acuity embed iframe attributes for accessibility
 */
export const acuityIframeConfig = {
  /** Title for screen readers */
  getTitle: (type: AcuityEmbedType): string => {
    const titles: Record<AcuityEmbedType, string> = {
      scheduler: "Book a Tech Support Session",
      subscriptions: "Purchase a Subscription Plan",
      "gift-certificates": "Purchase a Gift Certificate",
    };
    return titles[type];
  },
  /** Sandbox permissions for iframe */
  sandbox: "allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation",
  /** Loading state */
  loading: "lazy" as const,
};

/**
 * Check if Acuity is configured
 */
export function isAcuityConfigured(): boolean {
  return acuityConfig.ownerId !== "ACUITY_OWNER_ID" && acuityConfig.ownerId.length > 0;
}
