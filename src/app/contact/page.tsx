import type { Metadata } from "next";
import { Button } from "@/components/atoms";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with The Tech Deputies. We're here to help with your technology questions.",
};

export default function ContactPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Contact Us
                        </h1>
                        <p className="text-lg text-white/90">
                            Have a question? We&apos;d love to hear from you.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Form & Info */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Contact Form */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                                Send Us a Message
                            </h2>
                            <form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                    >
                                        <option value="">Select a topic...</option>
                                        <option value="support">Tech Support Question</option>
                                        <option value="courses">Course Information</option>
                                        <option value="billing">Billing Question</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                                        placeholder="How can we help you?"
                                    />
                                </div>
                                <Button type="submit" variant="primary" fullWidth>
                                    Send Message
                                </Button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-6">
                                    Other Ways to Reach Us
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--color-secondary)]">Email</h3>
                                            <a href="mailto:support@thetechdeputies.com" className="text-[var(--color-primary)] hover:underline">
                                                support@thetechdeputies.com
                                            </a>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center text-[var(--color-primary)]">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-[var(--color-secondary)]">Response Time</h3>
                                            <p className="text-gray-600">We typically respond within 24 hours</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--color-accent-tan)]/20 rounded-xl p-6">
                                <h3 className="font-bold text-[var(--color-secondary)] mb-3">
                                    Need Immediate Help?
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Book a session and get personalized tech support today.
                                </p>
                                <a href="/booking" className="inline-flex items-center text-[var(--color-primary)] font-semibold hover:underline">
                                    Book a Session →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
