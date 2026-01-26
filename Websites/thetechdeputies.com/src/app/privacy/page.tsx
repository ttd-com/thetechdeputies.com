import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "The Tech Deputies privacy policy - how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
    return (
        <div className="py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto prose prose-lg">
                    <h1 className="text-4xl font-bold text-[var(--color-secondary)] mb-8">
                        Privacy Policy
                    </h1>

                    <p className="text-gray-600 mb-8">
                        <strong>Last updated:</strong> January 2026
                    </p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Introduction
                        </h2>
                        <p className="text-gray-600">
                            The Tech Deputies (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to
                            protecting your personal information. This Privacy Policy explains how we collect, use,
                            and safeguard your information when you visit our website or use our services.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Information We Collect
                        </h2>
                        <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                            Information You Provide
                        </h3>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Name and email address when you create an account</li>
                            <li>Payment information when you purchase services</li>
                            <li>Messages you send us through contact forms</li>
                            <li>Information shared during support sessions</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2 mt-4">
                            Information Collected Automatically
                        </h3>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Device and browser information</li>
                            <li>IP address and general location</li>
                            <li>Pages visited and time spent on site</li>
                            <li>Cookies and similar technologies</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            How We Use Your Information
                        </h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>To provide and improve our services</li>
                            <li>To process payments and send receipts</li>
                            <li>To send appointment reminders and confirmations</li>
                            <li>To respond to your questions and support requests</li>
                            <li>To send occasional updates about our services (with your consent)</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Information Sharing
                        </h2>
                        <p className="text-gray-600">
                            We do not sell your personal information. We may share your information with:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Service providers who help us operate our business (payment processors, scheduling software)</li>
                            <li>When required by law or to protect our rights</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Your Rights
                        </h2>
                        <p className="text-gray-600">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Delete your account and data</li>
                            <li>Opt out of marketing communications</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-4">
                            Contact Us
                        </h2>
                        <p className="text-gray-600">
                            If you have questions about this Privacy Policy, please contact us at{" "}
                            <a href="mailto:privacy@thetechdeputies.com" className="text-[var(--color-primary)] hover:underline">
                                privacy@thetechdeputies.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
