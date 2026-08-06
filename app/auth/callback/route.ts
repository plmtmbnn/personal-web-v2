import { createClient } from '@/lib/core/supabase-server';
import { createSession } from '@/lib/core/redis';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ENV_GLOBAL } from '@/lib/core/env';

/**
 * Auth Callback Route
 * Handles PKCE exchange, profile verification, and custom Redis session management.
 * Supports flexible redirect to any admin page after successful authentication.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin';
  const siteUrl = ENV_GLOBAL?.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  console.log('[Auth Callback] Request received with code:', code ? 'Exists' : 'Missing');
  console.log('[Auth Callback] Intended redirect destination:', next);

  if (!code) {
    console.error('[Auth Callback] No code provided in URL');
    return NextResponse.redirect(new URL('/unauthorized?message=no_code', siteUrl));
  }

  // Feature Toggle Check
  if (!ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH) {
    console.warn('[Auth Callback] Google Auth is disabled via feature toggle');
    return NextResponse.redirect(new URL('/login?message=disabled', siteUrl));
  }

  const supabase = await createClient();

  // 1. Exchange PKCE Code for Session
  console.log('[Auth Callback] Attempting code exchange...');
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error || !data?.user) {
    console.error('[Auth Callback] Code exchange failed:', error?.message || 'No user data');
    return NextResponse.redirect(new URL('/unauthorized?message=exchange_failed', siteUrl));
  }

  console.log('[Auth Callback] Session exchanged successfully for user:', data.user.id);
  const userId = data.user.id;

  // 2. Fetch Verification Status from Profiles
  console.log('[Auth Callback] Fetching profile for user:', userId);
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_verified')
    .eq('id', userId)
    .single();
    
  // Robust Logic: If profile is missing or error occurs, assume not verified
  const isVerified = profile?.is_verified ?? false;

  if (profileError) {
    console.warn('[Auth Callback] Profile fetch warning:', profileError.message);
  }

  if (!isVerified) {
    console.warn('[Auth Callback] User is not verified. Rejecting access.');
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL('/unauthorized?message=pending', siteUrl));
  }

  // 3. User is verified: Create custom Redis session
  console.log('[Auth Callback] User verified. Creating Redis session...');
  
  let sessionId: string;
  try {
    sessionId = await createSession(userId);
    console.log('[Auth Callback] Redis session created successfully');
  } catch (redisError) {
    console.error('[Auth Callback] Redis session creation failed:', redisError);
    // If Redis fails, we can't establish our custom session layer
    return NextResponse.redirect(new URL('/unauthorized?message=session_error', siteUrl));
  }

  // 4. Set custom session cookie
  console.log('[Auth Callback] Setting app_session cookie...');
  const cookieStore = await cookies();
  cookieStore.set('app_session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800 * 30, // 30 weeks
    path: '/',
  });

  // 5. Sanitize and validate redirect target
  const safeNext = sanitizeRedirectPath(next);
  
  console.log('[Auth Callback] Authentication complete. Redirecting to:', safeNext);
  return NextResponse.redirect(new URL(safeNext, siteUrl));
}

/**
 * Sanitize redirect path to prevent open redirect vulnerabilities
 * Allows only internal paths starting with / but not //
 * Validates against known admin routes for additional security
 */
function sanitizeRedirectPath(path: string): string {
  // Default fallback
  const defaultPath = '/admin';
  
  // Must start with / but not //
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    console.warn('[Auth Callback] Invalid redirect path, using default:', path);
    return defaultPath;
  }

  // Additional validation: check if path looks like a valid internal route
  // This prevents malicious redirects like /%2F%2Fevil.com
  try {
    const url = new URL(path, 'http://localhost');
    if (url.hostname !== 'localhost') {
      console.warn('[Auth Callback] Redirect path contains external host, using default:', path);
      return defaultPath;
    }
  } catch {
    // Invalid URL format, use the path as-is if it passes basic checks
  }

  // Whitelist known admin route patterns for extra security
  const adminRoutePatterns = [
    /^\/admin(\/.*)?$/,           // /admin, /admin/blog, etc.
    /^\/tasks(\/.*)?$/,            // /tasks, /tasks/123, etc.
    /^\/adventures\/running$/,     // Running admin features
    /^\/utils\/.*\/admin$/,        // Utility admin pages
  ];

  const isValidAdminRoute = adminRoutePatterns.some(pattern => pattern.test(path));
  
  if (!isValidAdminRoute) {
    console.warn('[Auth Callback] Path not in admin whitelist, using default:', path);
    return defaultPath;
  }

  return path;
}
