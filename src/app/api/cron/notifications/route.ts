import { NextResponse } from 'next/server';
import { isCronAuthorised } from '@/server/security/cron';
import { runNotificationsJob } from '@/server/services/notification.service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  if (!isCronAuthorised(request)) return new NextResponse('Unauthorized', { status: 401 });
  try {
    return NextResponse.json(await runNotificationsJob());
  } catch (error) {
    console.error('Notifications job failed:', error instanceof Error ? error.name : 'unknown error');
    return NextResponse.json({ error: 'job_failed' }, { status: 500 });
  }
}