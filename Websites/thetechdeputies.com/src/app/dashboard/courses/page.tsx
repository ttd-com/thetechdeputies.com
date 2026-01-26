'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PurchasedCourse {
    purchase: {
        id: number;
        purchasedAt: string;
        amountPaid: number;
    };
    course: {
        slug: string;
        title: string;
        shortDescription: string;
        category: string;
        level: string;
        durationMinutes: number;
        topics: string[];
    };
}

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<PurchasedCourse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCourses() {
            try {
                const response = await fetch('/api/courses/my-courses');
                if (response.ok) {
                    const data = await response.json();
                    setCourses(data.courses);
                }
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchCourses();
    }, []);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (remainingMinutes === 0) return `${hours} hr`;
        return `${hours} hr ${remainingMinutes} min`;
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-800';
            case 'intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'advanced': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                    My Courses
                </h1>
                <p className="text-gray-600 mt-2">
                    Access your purchased courses and continue learning.
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-2">
                        No Courses Yet
                    </h2>
                    <p className="text-gray-600 mb-6">
                        You haven&apos;t enrolled in any courses yet. Browse our catalog to find the perfect course for you!
                    </p>
                    <Link
                        href="/courses"
                        className="inline-block bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(({ purchase, course }) => (
                        <div key={purchase.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Course Header */}
                            <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] p-6 text-white">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getLevelColor(course.level)}`}>
                                    {course.level}
                                </span>
                                <h3 className="text-xl font-bold mt-3">{course.title}</h3>
                            </div>

                            {/* Course Content */}
                            <div className="p-6">
                                <p className="text-gray-600 text-sm mb-4">
                                    {course.shortDescription}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatDuration(course.durationMinutes)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        {course.topics.length} topics
                                    </span>
                                </div>

                                {/* Topics Preview */}
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Topics:</p>
                                    <ul className="space-y-1">
                                        {course.topics.slice(0, 3).map((topic, idx) => (
                                            <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="w-5 h-5 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center text-xs text-[var(--color-primary)] font-medium">
                                                    {idx + 1}
                                                </span>
                                                {topic}
                                            </li>
                                        ))}
                                        {course.topics.length > 3 && (
                                            <li className="text-sm text-gray-400">
                                                + {course.topics.length - 3} more topics
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <Link
                                    href={`/courses/${course.slug}`}
                                    className="block w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
                                >
                                    Continue Learning
                                </Link>

                                <p className="text-xs text-gray-400 text-center mt-3">
                                    Purchased {new Date(purchase.purchasedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Browse More */}
            {courses.length > 0 && (
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">Looking for more courses?</p>
                    <Link
                        href="/courses"
                        className="inline-block border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Browse All Courses
                    </Link>
                </div>
            )}
        </div>
    );
}
