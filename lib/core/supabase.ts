import { createBrowserClient } from "@supabase/ssr";
import { ENV_GLOBAL } from "@/lib/core/env";

/**
 * Supabase Client for Client-Side Components.
 * Uses @supabase/ssr for better integration with PKCE and cookies.
 */
export const SupabaseConn = createBrowserClient(
  ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL!,
  ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
