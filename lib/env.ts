import { z } from "zod";

const envSchema = z.object({
  // Client-side
  NEXT_PUBLIC_SUPABASE_URL: z.string().nonoptional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).nonoptional(),
  
  // Server-side
  UPSTASH_REDIS_REST_URL: z.string(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXT_PUBLIC_PAGE_PIN: z.string().length(6),
});

const validateEnv = () => {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_PAGE_PIN: process.env.NEXT_PUBLIC_PAGE_PIN,
  });

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    // On the client, server-side variables will be missing. 
    // We only throw if client variables are missing to prevent build breaks.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
       throw new Error("Invalid client environment variables");
    }
  }

  return result.data;
};

export const ENV_GLOBAL = validateEnv();
