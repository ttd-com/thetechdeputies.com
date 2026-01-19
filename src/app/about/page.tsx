import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/atoms";

export const metadata: Metadata = {
    title: "About Us",
    description: "Learn about The Tech Deputies - your trusted partners for patient, jargon-free tech education and support.",
};

export default function AboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="text-6xl mb-4">🤠</div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            About The Tech Deputies
                        </h1>
                        <p className="text-lg text-white/90">
                            Your trusted partners for patient, jargon-free technology help.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section className="py-16 bg-background">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-[var(--color-secondary)] mb-6">
                            Our Mission
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            We believe everyone deserves to feel confident with technology. Too often, tech support feels intimidating,
                            rushed, or full of confusing jargon. We&apos;re here to change that.
                        </p>
                        <p className="text-lg text-gray-600 mb-6">
                            At The Tech Deputies, we take a different approach. We meet you where you are, explain things in plain English,
                            and never make you feel silly for asking questions. Because there are no silly questions when it comes to learning.
                        </p>
                        <p className="text-lg text-gray-600">
                            Whether you&apos;re trying to video chat with grandkids, protect yourself from online scams, or just figure out
                            why your printer won&apos;t work, we&apos;re in your corner.
                        </p>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-[var(--color-secondary)] text-center mb-12">
                        Our Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="text-5xl mb-4">🐢</div>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-3">Patience First</h3>
                            <p className="text-gray-600">
                                We never rush. Everyone learns at their own pace, and we&apos;re happy to explain things as many times as needed.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="text-5xl mb-4">💬</div>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-3">Plain Language</h3>
                            <p className="text-gray-600">
                                No jargon, no acronyms, no tech-speak. We explain everything in words that actually make sense.
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                            <div className="text-5xl mb-4">🤝</div>
                            <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-3">Respect & Dignity</h3>
                            <p className="text-gray-600">
                                We treat every client with respect. Your questions are valid, and we&apos;re honored you trust us to help.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-[var(--color-primary)] text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Meet Your Tech Deputies?
                    </h2>
                    <p className="text-white/90 mb-8 max-w-2xl mx-auto">
                        Schedule a free consultation and let&apos;s talk about how we can help you feel more confident with technology.
                    </p>
                    <Link href="/booking">
                        <Button variant="secondary" size="lg">
                            Book Free Consultation
                        </Button>
                    </Link>
                </div>
            </section>
        </>
    );
}
