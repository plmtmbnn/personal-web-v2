import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase-server';
import { createSession } from '@/utils/redis';
import { cookies } from 'next/headers';
import { ENV_GLOBAL } from '@/lib/env';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/tasks';

  // Feature Toggle: If Google Auth is disabled, reject callback
  if (ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false") {
    return NextResponse.redirect(`${origin}/login?message=error`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const userId = data.user.id;

      // Check if user is verified in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', userId)
        .single();

      if (profileError || !profile?.is_verified) {
        // Not verified or profile missing: Force sign out and reject
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/unauthorized?message=pending`);
      }

      // User is verified: Create custom Redis session
      const sessionId = await createSession(userId);

      // Set custom session cookie
      const cookieStore = await cookies();
      cookieStore.set('app_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 604800, // 1 week
        path: '/',
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/unauthorized?message=error`);
}
