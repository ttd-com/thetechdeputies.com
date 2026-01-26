/**
 * @file CourseListItem.tsx
 * @description Course list item component for list display (Template B).
 * Horizontal layout with more details visible, mobile-responsive with accordion.
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "../atoms";
import {
  type Course,
  categoryLabels,
  levelLabels,
  formatPrice,
  formatDuration,
} from "@/lib/courses";

export interface CourseListItemProps {
  course: Course;
}

/**
 * Course list item for list layout display.
 * Features expandable description on mobile.
 *
 * @example
 * <CourseListItem course={courseData} />
 */
export function CourseListItem({ course }: CourseListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="bg-background border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-md">
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Course Icon/Image */}
          <div className="flex-shrink-0">
            <div className="w-full md:w-24 h-20 md:h-24 bg-gradient-to-br from-primary/20 to-accent-tan/30 rounded-lg flex items-center justify-center">
              <span className="text-4xl" aria-hidden="true">
                {getCategoryEmoji(course.category)}
              </span>
            </div>
          </div>

          {/* Course Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {categoryLabels[course.category]}
                  </span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelStyles(course.level)}`}
                  >
                    {levelLabels[course.level]}
                  </span>
                  {course.featured && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-terracotta text-white">
                      Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-secondary">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="hover:text-primary transition-colors"
                    aria-label={`View course: ${course.title}`}
                  >
                    {course.title}
                  </Link>
                </h3>
              </div>

              {/* Price - Desktop */}
              <div className="hidden md:block text-right">
                <span className="text-2xl font-bold text-secondary">
                  {formatPrice(course.priceInCents)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="mt-2 text-muted-foreground">
              <span className={`${isExpanded ? "" : "line-clamp-2 md:line-clamp-none"}`}>
                {course.shortDescription}
              </span>
            </p>

            {/* Mobile: Read More Toggle */}
            <button
              type="button"
              className="md:hidden mt-1 text-sm text-primary font-medium"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>

            {/* Meta Row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {/* Duration */}
                <span className="flex items-center gap-1">
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{formatDuration(course.durationMinutes)}</span>
                </span>

                {/* Topics */}
                <span className="flex items-center gap-1">
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
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <span>{course.topics.length} topics</span>
                </span>

                {/* Instructor */}
                {course.instructor && (
                  <span className="flex items-center gap-1">
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
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>{course.instructor}</span>
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                {/* Mobile Price */}
                <span className="md:hidden text-xl font-bold text-secondary">
                  {formatPrice(course.priceInCents)}
                </span>

                <Link href={`/courses/${course.slug}`} className="flex-1 md:flex-none">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    aria-label={`View details for ${course.title}`}
                  >
                    View Course
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * Get emoji for course category
 */
function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    basics: "💻",
    devices: "📱",
    internet: "🌐",
    security: "🔒",
    productivity: "📊",
    advanced: "🚀",
  };
  return emojis[category] || "📚";
}

/**
 * Get level badge styles
 */
function getLevelStyles(level: string): string {
  const styles: Record<string, string> = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800",
    advanced: "bg-red-100 text-red-800",
  };
  return styles[level] || "bg-gray-100 text-gray-800";
}
