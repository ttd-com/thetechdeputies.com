'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms';
import { CoursePurchaseModal } from '@/components/organisms';

interface CourseEnrollButtonProps {
    courseSlug: string;
    courseTitle: string;
    priceInCents: number;
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export function CourseEnrollButton({
    courseSlug,
    courseTitle,
    priceInCents,
    size = 'lg',
    fullWidth = false,
}: CourseEnrollButtonProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkAccess() {
            if (status === 'loading') return;

            if (!session) {
                setChecking(false);
                return;
            }

            try {
                const response = await fetch('/api/courses/access', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseSlug }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasAccess(data.hasAccess);
                }
            } catch (error) {
                console.error('Failed to check access:', error);
            } finally {
                setChecking(false);
            }
        }

        checkAccess();
    }, [session, status, courseSlug]);

    const handleSuccess = () => {
        setShowModal(false);
        setHasAccess(true);
        router.push('/dashboard/courses');
    };

    if (checking) {
        return (
            <Button
                variant="primary"
                size={size}
                fullWidth={fullWidth}
                disabled
            >
                Loading...
            </Button>
        );
    }

    if (hasAccess) {
        return (
            <Button
                variant="primary"
                size={size}
                fullWidth={fullWidth}
                onClick={() => router.push('/dashboard/courses')}
            >
                Start Learning →
            </Button>
        );
    }

    return (
        <>
            <Button
                variant="primary"
                size={size}
                fullWidth={fullWidth}
                onClick={() => setShowModal(true)}
            >
                Enroll Now
            </Button>

            <CoursePurchaseModal
                courseSlug={courseSlug}
                courseTitle={courseTitle}
                priceInCents={priceInCents}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={handleSuccess}
            />
        </>
    );
}
