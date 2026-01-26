/**
 * @file page.tsx
 * @description Course catalog page displaying all available courses.
 * Supports grid/list view toggle and category filtering.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CourseCatalog } from "@/components/organisms";
import { Button } from "@/components/atoms";
import { getAllCourses, getFeaturedCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Tech Education Courses",
  description:
    "Browse our tech education courses designed for all skill levels. Learn at your own pace with patient, jargon-free instruction.",
};

export default function CoursesPage() {
  const allCourses = getAllCourses();
  const featuredCourses = getFeaturedCourses();

  return (
    <>
      {/* Page Header */}
      <section
        className="bg-gradient-to-br from-accent-tan/20 via-background to-primary/5 py-16"
        aria-labelledby="courses-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1
              id="courses-heading"
              className="text-4xl md:text-5xl font-bold text-secondary mb-4"
            >
              Tech Education Courses
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Learn technology at your own pace with our friendly, jargon-free courses.
              Whether you&apos;re just getting started or want to level up your skills,
              we have something for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/booking">
                <Button variant="primary" aria-label="Book a one-on-one session">
                  Prefer 1-on-1 Help?
                </Button>
              </Link>
              <Link href="/subscriptions">
                <Button variant="outline" aria-label="View subscription plans">
                  View Subscription Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section
          className="py-12 bg-muted/50"
          aria-labelledby="featured-heading"
        >
          <div className="container mx-auto px-4">
            <h2
              id="featured-heading"
              className="text-2xl font-bold text-secondary mb-6"
            >
              Featured Courses
            </h2>
            <CourseCatalog
              courses={featuredCourses}
              initialView="grid"
              showFilter={false}
              showViewToggle={false}
            />
          </div>
        </section>
      )}

      {/* All Courses */}
      <section
        className="py-12 bg-background"
        aria-labelledby="all-courses-heading"
      >
        <div className="container mx-auto px-4">
          <h2
            id="all-courses-heading"
            className="text-2xl font-bold text-secondary mb-6"
          >
            All Courses
          </h2>
          <CourseCatalog
            courses={allCourses}
            initialView="grid"
            showFilter={true}
            showViewToggle={true}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 bg-primary text-white"
        aria-labelledby="courses-cta-heading"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2
              id="courses-cta-heading"
              className="text-3xl font-bold mb-4"
            >
              Not Sure Where to Start?
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Book a free consultation and we&apos;ll help you find the perfect
              course for your goals and skill level.
            </p>
            <Link href="/booking">
              <Button
                variant="secondary"
                size="lg"
                aria-label="Book a free consultation"
              >
                Book Free Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
