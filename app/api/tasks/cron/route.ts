import { NextResponse } from 'next/server';
import { runTaskReminders } from '@/services/notifications/cron';

/**
 * API Route for triggering task reminders.
 * Secured via CRON_SECRET header if provided.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || authHeader?.replace('Bearer ', '');

  const CRON_SECRET = process.env.CRON_SECRET;

  // Basic security check: Require secret if configured
  if (CRON_SECRET && secret !== CRON_SECRET) {
    console.warn('[API Cron] Unauthorized attempt blocked.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await runTaskReminders();
    return NextResponse.json({ success: true, message: 'Reminders dispatched.' });
  } catch (error: any) {
    console.error('[API Cron] Failure:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
