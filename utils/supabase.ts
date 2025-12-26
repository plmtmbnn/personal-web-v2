
import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = String(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey: string = String(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const SupabaseConn = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });