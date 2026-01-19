/**
 * @file CourseCatalog.tsx
 * @description Course catalog component with grid/list view toggle and filtering.
 * Allows users to switch between Template A (Grid) and Template B (List).
 */

"use client";

import { useState, useMemo } from "react";
import { CourseCard, CourseListItem } from "../molecules";
import { Button } from "../atoms";
import {
  type Course,
  type CourseCategory,
  categoryLabels,
  getAllCategories,
} from "@/lib/courses";

export type ViewMode = "grid" | "list";

export interface CourseCatalogProps {
  /** Courses to display */
  courses: Course[];
  /** Initial view mode */
  initialView?: ViewMode;
  /** Whether to show category filter */
  showFilter?: boolean;
  /** Whether to show view toggle */
  showViewToggle?: boolean;
}

/**
 * Course catalog with view toggle and filtering.
 *
 * @example
 * <CourseCatalog
 *   courses={allCourses}
 *   initialView="grid"
 *   showFilter
 *   showViewToggle
 * />
 */
export function CourseCatalog({
  courses,
  initialView = "grid",
  showFilter = true,
  showViewToggle = true,
}: CourseCatalogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | "all">("all");

  const categories = useMemo(() => getAllCategories(), []);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") return courses;
    return courses.filter((course) => course.category === selectedCategory);
  }, [courses, selectedCategory]);

  return (
    <div>
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Category Filter */}
        {showFilter && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            <Button
              variant={selectedCategory === "all" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              aria-pressed={selectedCategory === "all"}
            >
              All Courses
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "primary" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
              >
                {categoryLabels[category]}
              </Button>
            ))}
          </div>
        )}

        {/* View Toggle */}
        {showViewToggle && (
          <div
            className="flex items-center gap-1 bg-muted rounded-lg p-1"
            role="group"
            aria-label="View mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={viewMode === "grid"}
              aria-label="Grid view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-pressed={viewMode === "list"}
              aria-label="List view"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
        Showing {filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"}
        {selectedCategory !== "all" && ` in ${categoryLabels[selectedCategory]}`}
      </p>

      {/* Course Grid/List */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No courses found in this category. Try selecting a different filter.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <CourseListItem key={course.slug} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
