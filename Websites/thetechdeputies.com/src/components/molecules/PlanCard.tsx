/**
 * @file PlanCard.tsx
 * @description Subscription plan card component with interactive button.
 * Client component to handle scroll-to-section functionality.
 */

"use client";

import { Button, Card } from "../atoms";

export interface PlanCardProps {
  /** Plan name */
  name: string;
  /** Price display (e.g., "$49") */
  price: string;
  /** Period display (e.g., "/month") */
  period: string;
  /** Short description */
  description: string;
  /** List of features included */
  features: string[];
  /** Whether this is the most popular plan */
  popular?: boolean;
  /** Callback when "Choose" button is clicked */
  onChoose?: () => void;
  /** ID of the element to scroll to when clicking the button (deprecated in favor of onChoose) */
  scrollTargetId?: string;
}

/**
 * Subscription plan card with interactive CTA button.
 *
 * @example
 * <PlanCard
 *   name="Standard"
 *   price="$99"
 *   period="/month"
 *   description="Our most popular plan"
 *   features={["Feature 1", "Feature 2"]}
 *   popular
 *   scrollTargetId="purchase-section"
 * />
 */
export function PlanCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  onChoose,
  scrollTargetId = "purchase-section",
}: PlanCardProps) {
  const handleClick = () => {
    if (onChoose) {
      onChoose();
    } else {
      // Fallback to scroll behavior if no callback provided
      const element = document.getElementById(scrollTargetId);
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Card
      variant={popular ? "elevated" : "default"}
      padding="none"
      className={`relative ${popular ? "border-2 border-primary" : ""}`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-secondary mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-4xl font-bold text-secondary">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3 mb-6" role="list">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <svg
                className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
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
              <span className="text-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant={popular ? "primary" : "outline"}
          fullWidth
          aria-label={`Subscribe to ${name} plan`}
          onClick={handleClick}
        >
          Choose {name}
        </Button>
      </div>
    </Card>
  );
}
