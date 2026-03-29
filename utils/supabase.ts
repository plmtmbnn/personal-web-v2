import { createClient } from "@supabase/supabase-js";
import { ENV_GLOBAL } from "@/lib/env";

const supabaseUrl: string = ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey: string = ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SupabaseConn = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });