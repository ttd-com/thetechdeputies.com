/**
 * @file CourseCard.tsx
 * @description Course card component for grid display (Template A).
 * Shows course thumbnail, title, description, and key details.
 */

import Link from "next/link";
import {
  type Course,
  categoryLabels,
  levelLabels,
  formatPrice,
  formatDuration,
} from "@/lib/courses";

export interface CourseCardProps {
  course: Course;
}

/**
 * Course card for grid layout display.
 *
 * @example
 * <CourseCard course={courseData} />
 */
export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block h-full"
      aria-label={`View course: ${course.title}`}
    >
      <article className="h-full bg-background border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-primary hover:shadow-lg flex flex-col">
        {/* Course Image Placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent-tan/30 flex items-center justify-center">
          <span className="text-5xl" aria-hidden="true">
            {getCategoryEmoji(course.category)}
          </span>
          {/* Featured Badge */}
          {course.featured && (
            <span className="absolute top-3 right-3 bg-accent-terracotta text-white text-xs font-medium px-2 py-1 rounded-full">
              Featured
            </span>
          )}
          {/* Level Badge */}
          <span
            className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${getLevelStyles(course.level)}`}
          >
            {levelLabels[course.level]}
          </span>
        </div>

        {/* Course Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Category */}
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {categoryLabels[course.category]}
          </span>

          {/* Title */}
          <h3 className="mt-1 text-lg font-semibold text-secondary group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
            {course.shortDescription}
          </p>

          {/* Meta Info */}
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              {/* Topics count */}
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
            </div>

            {/* Price */}
            <span className="font-semibold text-secondary">
              {formatPrice(course.priceInCents)}
            </span>
          </div>
        </div>
      </article>
    </Link>
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
