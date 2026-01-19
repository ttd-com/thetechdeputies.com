import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSetting } from '@/lib/db';

// Acuity webhook event types
interface AcuityWebhookPayload {
    action: string;
    id: number;
    calendarID?: number;
    appointmentTypeID?: number;
    // Additional fields depending on event type
}

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('X-Acuity-Signature');

        // Get the API key for signature verification
        const acuityApiKey = getSetting('acuity_api_key');

        // Verify webhook signature (if API key is configured)
        if (acuityApiKey && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', acuityApiKey)
                .update(body)
                .digest('base64');

            if (signature !== expectedSignature) {
                console.warn('Acuity webhook: Invalid signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload: AcuityWebhookPayload = JSON.parse(body);
        const { action, id } = payload;

        console.log(`Acuity webhook received: ${action} for ID ${id}`);

        // Handle different event types
        switch (action) {
            case 'appointment.scheduled':
                await handleAppointmentScheduled(payload);
                break;

            case 'appointment.rescheduled':
                await handleAppointmentRescheduled(payload);
                break;

            case 'appointment.canceled':
                await handleAppointmentCanceled(payload);
                break;

            case 'appointment.changed':
                await handleAppointmentChanged(payload);
                break;

            case 'order.completed':
                await handleOrderCompleted(payload);
                break;

            default:
                console.log(`Unhandled Acuity webhook action: ${action}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Acuity webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Event handlers
async function handleAppointmentScheduled(payload: AcuityWebhookPayload) {
    console.log('New appointment scheduled:', payload.id);
    // In production, you would:
    // 1. Fetch full appointment details from Acuity API
    // 2. Create/update user record if needed
    // 3. Send confirmation email
    // 4. Update local database
}

async function handleAppointmentRescheduled(payload: AcuityWebhookPayload) {
    console.log('Appointment rescheduled:', payload.id);
    // In production, you would:
    // 1. Update local records
    // 2. Send notification email
}

async function handleAppointmentCanceled(payload: AcuityWebhookPayload) {
    console.log('Appointment canceled:', payload.id);
    // In production, you would:
    // 1. Update local records
    // 2. Handle refunds if applicable
    // 3. Send confirmation email
}

async function handleAppointmentChanged(payload: AcuityWebhookPayload) {
    console.log('Appointment changed:', payload.id);
    // In production, sync changes to local database
}

async function handleOrderCompleted(payload: AcuityWebhookPayload) {
    console.log('Order completed:', payload.id);
    // In production, you would:
    // 1. Validate the purchase
    // 2. Update subscription status if applicable
    // 3. Grant course access if applicable
    // 4. Send confirmation email
}

// GET method for webhook verification
export async function GET() {
    return NextResponse.json({
        status: 'Acuity webhook endpoint active',
        supported_events: [
            'appointment.scheduled',
            'appointment.rescheduled',
            'appointment.canceled',
            'appointment.changed',
            'order.completed',
        ]
    });
}
