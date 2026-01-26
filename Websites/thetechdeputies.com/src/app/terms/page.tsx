import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "The Tech Deputies terms of service - the rules and guidelines for using our services.",
};

export default function TermsPage() {
    return (
        <div className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto prose prose-lg">
                    <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-8">
                        Terms of Service
                    </h1>

                    <p className="text-gray-600 mb-8">
                        <strong>Last updated:</strong> January 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Agreement to Terms
                        </h2>
                        <p className="text-gray-600">
                            By accessing or using The Tech Deputies website and services, you agree to be bound
                            by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Services Description
                        </h2>
                        <p className="text-gray-600">
                            The Tech Deputies provides technology education and support services, including:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>One-on-one tech support sessions (in-person and remote)</li>
                            <li>Online courses and educational materials</li>
                            <li>Subscription-based support plans</li>
                            <li>Gift certificates for our services</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Booking and Payment
                        </h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Sessions must be booked through our online scheduling system</li>
                            <li>Payment is required at the time of booking unless otherwise arranged</li>
                            <li>We accept major credit cards and gift certificates</li>
                            <li>Prices are subject to change with notice</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Cancellation Policy
                        </h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Cancellations made 24+ hours before the session: Full refund or reschedule</li>
                            <li>Cancellations made less than 24 hours before: 50% fee may apply</li>
                            <li>No-shows: Full session fee applies</li>
                            <li>We reserve the right to reschedule sessions with notice</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Limitations
                        </h2>
                        <p className="text-gray-600">
                            Our services are educational in nature. We do not:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Provide data recovery or hardware repair services</li>
                            <li>Guarantee specific outcomes or results</li>
                            <li>Take responsibility for data loss or device damage</li>
                            <li>Provide legal, financial, or medical advice</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            User Responsibilities
                        </h2>
                        <p className="text-gray-600">
                            By using our services, you agree to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Provide accurate information when booking</li>
                            <li>Back up your data before any support session</li>
                            <li>Treat our staff with respect</li>
                            <li>Not share login credentials or account access</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Intellectual Property
                        </h2>
                        <p className="text-gray-600">
                            All course content, materials, and website content are owned by The Tech Deputies
                            and protected by copyright. Purchased courses are for personal use only and may not
                            be shared, redistributed, or resold.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Contact Us
                        </h2>
                        <p className="text-gray-600">
                            If you have questions about these Terms of Service, please contact us at{" "}
                            <a href="mailto:legal@thetechdeputies.com" className="text-[var(--color-primary)] hover:underline">
                                legal@thetechdeputies.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
