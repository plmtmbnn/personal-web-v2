import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ENV_GLOBAL } from '@/lib/core/env';

/**
 * Proxy for automatic Supabase session refresh
 * Runs on every request to admin/protected routes
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL!,
    ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // IMPORTANT: This will refresh expired Auth tokens and store updated tokens in cookies
  // Must be called before any auth-related operations
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Log refresh status for debugging
  if (user) {
    console.log('[Middleware] Session active for user:', user.id);
    
    // Extend Redis session TTL when user is active
    // This keeps the custom session in sync with Supabase tokens
    const appSessionId = request.cookies.get('app_session')?.value;
    if (appSessionId) {
      // Fire and forget - don't block the response
      fetch(`${request.nextUrl.origin}/api/auth/refresh-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `app_session=${appSessionId}`,
        },
      }).catch((err) => {
        console.error('[Middleware] Failed to refresh Redis session:', err);
      });
    }
  } else if (error) {
    console.warn('[Middleware] Auth error:', error.message);
  }

  return supabaseResponse;
}

/**
 * Configure which routes should trigger the middleware
 * Apply to all admin and protected routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
};
