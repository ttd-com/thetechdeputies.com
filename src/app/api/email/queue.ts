import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';
import { getAllEmailJobs, getQueueMetrics } from '@/lib/email/email-service';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || (session.user as { role?: string })?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get real metrics and jobs from database
    const [jobs, metrics] = await Promise.all([
      getAllEmailJobs(),
      getQueueMetrics()
    ]);

    return NextResponse.json({
      queue: jobs,
      metrics,
      total: metrics.total
    });
  } catch (error) {
    console.error('Failed to get email queue:', error);
    return NextResponse.json({ error: 'Failed to fetch email queue' }, { status: 500 });
  }
}