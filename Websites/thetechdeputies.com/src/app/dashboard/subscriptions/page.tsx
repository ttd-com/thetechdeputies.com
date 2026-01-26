'use client';

export default function SubscriptionsPage() {
    // Mock data - in production would fetch from Acuity
    const hasSubscription = false;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--color-secondary)]">
                    My Subscriptions
                </h1>
                <p className="text-gray-600 mt-2">
                    Manage your recurring tech support plans.
                </p>
            </div>

            {hasSubscription ? (
                <div className="space-y-6">
                    {/* Active subscription card would go here */}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-secondary)] mb-2">
                        No Active Subscriptions
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Subscribe to one of our tech support plans for ongoing assistance and exclusive benefits.
                    </p>
                    <a
                        href="/subscriptions"
                        className="inline-flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        View Subscription Plans
                    </a>
                </div>
            )}

            {/* Subscription plans preview */}
            <div className="mt-12">
                <h2 className="text-xl font-semibold text-[var(--color-secondary)] mb-6">
                    Available Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PlanCard
                        name="Basic"
                        price="$49"
                        period="/month"
                        features={[
                            '2 support sessions per month',
                            'Email support',
                            'Basic tech guidance',
                        ]}
                        highlighted={false}
                    />
                    <PlanCard
                        name="Pro"
                        price="$99"
                        period="/month"
                        features={[
                            '5 support sessions per month',
                            'Priority email & phone support',
                            'Advanced tech tutoring',
                            'Custom learning path',
                        ]}
                        highlighted={true}
                    />
                    <PlanCard
                        name="Premium"
                        price="$199"
                        period="/month"
                        features={[
                            'Unlimited support sessions',
                            '24/7 priority support',
                            'Personal tech consultant',
                            'Custom training materials',
                            'Family account (up to 4)',
                        ]}
                        highlighted={false}
                    />
                </div>
            </div>
        </div>
    );
}

function PlanCard({
    name,
    price,
    period,
    features,
    highlighted,
}: {
    name: string;
    price: string;
    period: string;
    features: string[];
    highlighted: boolean;
}) {
    return (
        <div
            className={`
        rounded-xl p-6 transition-all duration-300
        ${highlighted
                    ? 'bg-[var(--color-primary)] text-white shadow-xl scale-105'
                    : 'bg-white shadow-lg hover:shadow-xl'
                }
      `}
        >
            {highlighted && (
                <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                    Most Popular
                </span>
            )}
            <h3 className={`text-xl font-bold mt-4 ${highlighted ? 'text-white' : 'text-[var(--color-secondary)]'}`}>
                {name}
            </h3>
            <div className="mt-4">
                <span className="text-3xl font-bold">{price}</span>
                <span className={`text-sm ${highlighted ? 'text-white/80' : 'text-gray-500'}`}>{period}</span>
            </div>
            <ul className="mt-6 space-y-3">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <svg
                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${highlighted ? 'text-white' : 'text-[var(--color-primary)]'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={`text-sm ${highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>
            <button
                className={`
          w-full mt-6 py-3 px-4 rounded-lg font-semibold transition-colors
          ${highlighted
                        ? 'bg-white text-[var(--color-primary)] hover:bg-gray-100'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
                    }
        `}
            >
                Get Started
            </button>
        </div>
    );
}
