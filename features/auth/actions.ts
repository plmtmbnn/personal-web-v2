'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { deleteSession } from '@/lib/core/redis';
import { createClient } from '@/lib/core/supabase-server';

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
