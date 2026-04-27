import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { ENV_GLOBAL } from "@/lib/core/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL!,
    ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch (error) {
            console.log(error);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Admin Client with Service Role Key to bypass RLS.
 * Use only in server actions after proper authorization checks.
 */
export async function createAdminClient() {
  // If we have a service role key, use it to bypass RLS
  if (ENV_GLOBAL.SUPABASE_SERVICE_ROLE_KEY) {
    return createSupabaseClient(
      ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL!,
      ENV_GLOBAL.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // Fallback to regular client if no service role key (RLS will apply)
  return createClient();
}
