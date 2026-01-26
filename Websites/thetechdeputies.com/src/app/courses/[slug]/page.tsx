/**
 * @file page.tsx
 * @description Individual course detail page with dynamic routing.
 * Displays full course information, topics, and enrollment CTA.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, Card } from "@/components/atoms";
import { CourseEnrollButton } from "@/components/molecules";
import {
  getAllCourses,
  getCourseBySlug,
  categoryLabels,
  levelLabels,
  formatPrice,
  formatDuration,
} from "@/lib/courses";

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate static params for all courses
 */
export async function generateStaticParams() {
  const courses = getAllCourses();
  return courses.map((course) => ({
    slug: course.slug,
  }));
}

/**
 * Generate metadata for the course page
 */
export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: course.title,
    description: course.shortDescription,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav
        className="bg-muted/50 border-b border-border"
        aria-label="Breadcrumb"
      >
        <div className="container mx-auto px-4 py-3">
          <ol className="flex items-center gap-2 text-sm" role="list">
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              /
            </li>
            <li>
              <Link
                href="/courses"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Courses
              </Link>
            </li>
            <li aria-hidden="true" className="text-muted-foreground">
              /
            </li>
            <li>
              <span className="text-foreground font-medium" aria-current="page">
                {course.title}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Course Header */}
      <section
        className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-12"
        aria-labelledby="course-title"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-primary uppercase tracking-wide">
                {categoryLabels[course.category]}
              </span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${getLevelStyles(course.level)}`}
              >
                {levelLabels[course.level]}
              </span>
              {course.featured && (
                <span className="text-sm font-medium px-3 py-1 rounded-full bg-accent-terracotta text-white">
                  Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              id="course-title"
              className="text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              {course.title}
            </h1>

            {/* Short Description */}
            <p className="text-xl text-muted-foreground mb-6">
              {course.shortDescription}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              <span className="flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{formatDuration(course.durationMinutes)}</span>
              </span>
              <span className="flex items-center gap-2">
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <span>{course.topics.length} topics</span>
              </span>
              {course.instructor && (
                <span className="flex items-center gap-2">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Taught by {course.instructor}</span>
                </span>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-3xl font-bold text-secondary">
                {formatPrice(course.priceInCents)}
              </span>
              <CourseEnrollButton
                courseSlug={course.slug}
                courseTitle={course.title}
                priceInCents={course.priceInCents}
                size="lg"
              />
              <Link href="/booking">
                <Button
                  variant="outline"
                  size="lg"
                  aria-label="Ask a question about this course"
                >
                  Ask a Question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About This Course */}
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-4">
                  About This Course
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {course.fullDescription}
                </p>
              </div>

              {/* What You'll Learn */}
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-4">
                  What You&apos;ll Learn
                </h2>
                <ul className="space-y-3" role="list">
                  {course.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-primary flex-shrink-0 mt-0.5"
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
                      <span className="text-muted-foreground">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Course Topics */}
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-4">
                  Course Topics
                </h2>
                <ol className="space-y-3" role="list">
                  {course.topics.map((topic, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-foreground">{topic}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-secondary mb-4">
                    Prerequisites
                  </h2>
                  <ul className="space-y-2" role="list">
                    {course.prerequisites.map((prereq, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-muted-foreground"
                      >
                        <span aria-hidden="true">•</span>
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Enrollment Card */}
                <Card variant="elevated" padding="lg">
                  <h3 className="text-xl font-semibold text-secondary mb-4">
                    Ready to Get Started?
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-2xl font-bold text-secondary">
                        {formatPrice(course.priceInCents)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">
                        {formatDuration(course.durationMinutes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium">
                        {levelLabels[course.level]}
                      </span>
                    </div>
                    <hr className="border-border" />
                    <CourseEnrollButton
                      courseSlug={course.slug}
                      courseTitle={course.title}
                      priceInCents={course.priceInCents}
                      fullWidth
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      Questions? Contact us before enrolling.
                    </p>
                  </div>
                </Card>

                {/* Need Help Card */}
                <Card variant="muted" padding="md">
                  <h3 className="font-semibold text-secondary mb-2">
                    Need Help Deciding?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Book a free consultation and we&apos;ll help you find the
                    right course for your needs.
                  </p>
                  <Link href="/booking">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      aria-label="Book a free consultation"
                    >
                      Book Free Consultation
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Courses */}
      <section className="py-8 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-medium"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Courses
          </Link>
        </div>
      </section>
    </>
  );
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
