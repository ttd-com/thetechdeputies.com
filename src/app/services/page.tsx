import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/atoms";

export const metadata: Metadata = {
    title: "Services",
    description: "Professional tech support and education services for all skill levels. One-on-one sessions, courses, and subscription plans.",
};

const services = [
    {
        icon: "🎯",
        title: "One-on-One Support",
        description: "Personalized tech help tailored to your specific needs. We'll work through your questions together at your pace.",
        features: ["Screen sharing sessions", "Step-by-step guidance", "Follow-up notes", "Recording available"],
        price: "$75/hour",
        cta: "Book Session",
        href: "/booking",
    },
    {
        icon: "📚",
        title: "Educational Courses",
        description: "Self-paced courses covering everything from computer basics to online safety. Learn on your schedule.",
        features: ["Video lessons", "Practice exercises", "Lifetime access", "Certificate of completion"],
        price: "From $49",
        cta: "Browse Courses",
        href: "/courses",
    },
    {
        icon: "⭐",
        title: "Monthly Subscription",
        description: "Unlimited support for ongoing tech needs. Perfect for those who want peace of mind.",
        features: ["Unlimited sessions", "Priority scheduling", "Email support", "10% course discount"],
        price: "$199/month",
        cta: "View Plans",
        href: "/subscriptions",
    },
];

const commonTopics = [
    { icon: "💻", title: "Computer Basics", desc: "Windows, Mac, file management" },
    { icon: "📱", title: "Smartphones & Tablets", desc: "iPhone, iPad, Android devices" },
    { icon: "📧", title: "Email & Communication", desc: "Gmail, Outlook, video calls" },
    { icon: "🔒", title: "Online Safety", desc: "Passwords, scam protection, privacy" },
    { icon: "🌐", title: "Internet & Browser", desc: "Web browsing, bookmarks, downloads" },
    { icon: "📷", title: "Photos & Media", desc: "Organization, sharing, backup" },
];

export default function ServicesPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Tech Support Services
                        </h1>
                        <p className="text-lg text-white/90 mb-8">
                            Patient, jargon-free technology help for all skill levels.
                            Whether you need a quick fix or want to learn something new, we&apos;re here to help.
                        </p>
                        <Link href="/booking">
                            <Button variant="secondary" size="lg">
                                Book Your First Session
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service.title} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col">
                                <div className="text-5xl mb-4">{service.icon}</div>
                                <h2 className="text-2xl font-bold text-[var(--color-secondary)] mb-2">
                                    {service.title}
                                </h2>
                                <p className="text-gray-600 mb-4 flex-grow">
                                    {service.description}
                                </p>
                                <ul className="space-y-2 mb-6">
                                    {service.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                                            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto">
                                    <p className="text-2xl font-bold text-[var(--color-primary)] mb-4">{service.price}</p>
                                    <Link href={service.href}>
                                        <Button variant="primary" fullWidth>
                                            {service.cta}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Common Topics */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[var(--color-secondary)] text-center mb-12">
                        What We Can Help With
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {commonTopics.map((topic) => (
                            <div key={topic.title} className="bg-white rounded-xl p-6 text-center shadow-sm">
                                <div className="text-4xl mb-3">{topic.icon}</div>
                                <h3 className="font-semibold text-[var(--color-secondary)] mb-1">{topic.title}</h3>
                                <p className="text-xs text-gray-500">{topic.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[var(--color-accent-tan)]/20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold text-[var(--color-secondary)] mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                        Book a free 15-minute consultation to discuss your tech needs. No pressure, no jargon.
                    </p>
                    <Link href="/booking">
                        <Button variant="primary" size="lg">
                            Book Free Consultation
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
