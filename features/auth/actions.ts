'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/core/redis';
import { createClient } from '@/lib/core/supabase-server';
import { ENV_GLOBAL } from '@/lib/core/env';

/**
 * Authorization Helper: Checks if the current user is an admin.
 * Bypasses check if Google Auth or PIN Guard is disabled.
 */
export async function checkAdmin() {
  // If either feature flag is disabled, bypass the auth check (marked as logined/admin)
  if (ENV_GLOBAL.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false" || ENV_GLOBAL.NEXT_PUBLIC_ENABLE_PINGUARD === "false") {
    return true;
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return !!profile.is_admin;
}

/**
 * Logout Action
 * Clears Redis session, Supabase session, and the custom cookie.
 */
export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('app_session')?.value;

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  cookieStore.delete('app_session');
  redirect('/login');
}
