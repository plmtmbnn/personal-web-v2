import { createClient } from "@supabase/supabase-js";
import { ENV_GLOBAL } from "@/lib/env";

const supabaseUrl: string = String(ENV_GLOBAL?.NEXT_PUBLIC_SUPABASE_URL || '-');
const supabaseKey: string = String(ENV_GLOBAL?.NEXT_PUBLIC_SUPABASE_ANON_KEY || '-');

export const SupabaseConn = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });