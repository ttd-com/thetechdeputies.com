'use client';

import { useEffect, useState } from 'react';

interface Settings {
    mailgun_api_key: string;
    mailgun_domain: string;
    acuity_user_id: string;
    acuity_api_key: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        mailgun_api_key: '',
        mailgun_domain: '',
        acuity_user_id: '',
        acuity_api_key: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

    useEffect(() => {
        async function loadSettings() {
            try {
                const response = await fetch('/api/admin/settings');
                if (response.ok) {
                    const data = await response.json();
                    setSettings({
                        mailgun_api_key: data.mailgun_api_key || '',
                        mailgun_domain: data.mailgun_domain || '',
                        acuity_user_id: data.acuity_user_id || '',
                        acuity_api_key: data.acuity_api_key || '',
                    });
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    const toggleSecret = (key: string) => {
        setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <svg className="animate-spin h-8 w-8 text-[var(--color-primary)]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-secondary)]">
                    Settings
                </h1>
                <p className="text-gray-600">
                    Configure API keys and integrations.
                </p>
            </div>

            {message && (
                <div
                    className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* Mailgun Settings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-secondary)]">
                                Mailgun Integration
                            </h2>
                            <p className="text-sm text-gray-500">
                                Configure email sending for password resets and notifications.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="mailgun_domain" className="block text-sm font-medium text-gray-700 mb-2">
                                Mailgun Domain
                            </label>
                            <input
                                id="mailgun_domain"
                                type="text"
                                value={settings.mailgun_domain}
                                onChange={(e) => setSettings(prev => ({ ...prev, mailgun_domain: e.target.value }))}
                                placeholder="mg.yourdomain.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="mailgun_api_key" className="block text-sm font-medium text-gray-700 mb-2">
                                Mailgun API Key
                            </label>
                            <div className="relative">
                                <input
                                    id="mailgun_api_key"
                                    type={showSecrets['mailgun_api_key'] ? 'text' : 'password'}
                                    value={settings.mailgun_api_key}
                                    onChange={(e) => setSettings(prev => ({ ...prev, mailgun_api_key: e.target.value }))}
                                    placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('mailgun_api_key')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets['mailgun_api_key'] ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acuity Settings */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[var(--color-secondary)]">
                                Acuity Scheduling
                            </h2>
                            <p className="text-sm text-gray-500">
                                Connect your Acuity account for booking integration.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="acuity_user_id" className="block text-sm font-medium text-gray-700 mb-2">
                                Acuity User ID
                            </label>
                            <input
                                id="acuity_user_id"
                                type="text"
                                value={settings.acuity_user_id}
                                onChange={(e) => setSettings(prev => ({ ...prev, acuity_user_id: e.target.value }))}
                                placeholder="Your Acuity User ID"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="acuity_api_key" className="block text-sm font-medium text-gray-700 mb-2">
                                Acuity API Key
                            </label>
                            <div className="relative">
                                <input
                                    id="acuity_api_key"
                                    type={showSecrets['acuity_api_key'] ? 'text' : 'password'}
                                    value={settings.acuity_api_key}
                                    onChange={(e) => setSettings(prev => ({ ...prev, acuity_api_key: e.target.value }))}
                                    placeholder="Your Acuity API Key"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleSecret('acuity_api_key')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showSecrets['acuity_api_key'] ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white font-semibold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            'Save Settings'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function EyeIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function EyeOffIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}
