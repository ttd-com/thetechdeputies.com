import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Accessibility Statement",
    description: "The Tech Deputies accessibility commitment - making technology education accessible to everyone.",
};

export default function AccessibilityPage() {
    return (
        <div className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto prose prose-lg">
                    <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-8">
                        Accessibility Statement
                    </h1>

                    <p className="text-gray-600 mb-8">
                        <strong>Last updated:</strong> January 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Our Commitment
                        </h2>
                        <p className="text-gray-600">
                            The Tech Deputies is committed to ensuring digital accessibility for people with disabilities.
                            We are continually improving the user experience for everyone and applying the relevant
                            accessibility standards.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Conformance Status
                        </h2>
                        <p className="text-gray-600">
                            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.
                            These guidelines explain how to make web content more accessible for people with disabilities.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Accessibility Features
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Our website includes the following accessibility features:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li><strong>Keyboard Navigation:</strong> All functionality is accessible via keyboard</li>
                            <li><strong>Screen Reader Support:</strong> Proper ARIA labels and semantic HTML</li>
                            <li><strong>Color Contrast:</strong> Text meets WCAG AA contrast requirements</li>
                            <li><strong>Focus Indicators:</strong> Visible focus states for interactive elements</li>
                            <li><strong>Alt Text:</strong> Images include descriptive alternative text</li>
                            <li><strong>Resizable Text:</strong> Text can be resized up to 200% without loss of content</li>
                            <li><strong>Skip Links:</strong> Skip to main content links for keyboard users</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Accessible Services
                        </h2>
                        <p className="text-gray-600 mb-4">
                            Beyond our website, we strive to make our services accessible:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Remote sessions available for those who cannot travel</li>
                            <li>Flexible scheduling including evening hours</li>
                            <li>Written follow-up notes after sessions</li>
                            <li>Patience-first approach for all learners</li>
                            <li>Alternative formats for course materials upon request</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Known Limitations
                        </h2>
                        <p className="text-gray-600">
                            We are aware that some third-party content (such as our scheduling widget) may have
                            limitations. We are working with our vendors to improve accessibility and can provide
                            alternative booking methods upon request.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Feedback
                        </h2>
                        <p className="text-gray-600">
                            We welcome your feedback on the accessibility of our website and services. Please let us know
                            if you encounter accessibility barriers:
                        </p>
                        <ul className="list-none pl-0 text-gray-600 space-y-2 mt-4">
                            <li><strong>Email:</strong>{" "}
                                <a href="mailto:accessibility@thetechdeputies.com" className="text-[var(--color-primary)] hover:underline">
                                    accessibility@thetechdeputies.com
                                </a>
                            </li>
                            <li><strong>Response time:</strong> We aim to respond within 2 business days</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Enforcement
                        </h2>
                        <p className="text-gray-600">
                            If you are not satisfied with our response, you may escalate your complaint to the
                            relevant regulatory authority in your jurisdiction.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
