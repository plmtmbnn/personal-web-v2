import { NextRequest, NextResponse } from 'next/server';
import { syncSessionRefresh } from '@/lib/core/auth-utils';

/**
 * API Route: Refresh Redis Session TTL
 * Called by middleware and client-side code to extend session lifetime
 */
export async function POST(_request: NextRequest) {
  try {
    const refreshed = await syncSessionRefresh();

    if (refreshed) {
      return NextResponse.json(
        { success: true, message: 'Session refreshed successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to refresh session' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[API] Session refresh error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
