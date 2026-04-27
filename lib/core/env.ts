import { z } from "zod";

/**
 * Client-side environment variables
 * Accessible in the browser (must start with NEXT_PUBLIC_)
 */
const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: z.string().default("true"),
  NEXT_PUBLIC_ENABLE_PINGUARD: z.string().default("true"),
});

/**
 * Server-side environment variables
 * Only accessible in Node.js/Edge runtime
 */
const serverSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  NEXT_PUBLIC_PAGE_PIN: z.string().length(6),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

const validateEnv = () => {
  const isServer = typeof window === "undefined";

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
    NEXT_PUBLIC_ENABLE_PINGUARD: process.env.NEXT_PUBLIC_ENABLE_PINGUARD,
  });

  if (!clientResult.success) {
    console.error("❌ Invalid client environment variables:", clientResult.error.format());
    throw new Error("Invalid client environment variables");
  }

  // Only validate server variables if we are on the server
  if (isServer) {
    const serverResult = serverSchema.safeParse({
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
      NEXT_PUBLIC_PAGE_PIN: process.env.NEXT_PUBLIC_PAGE_PIN,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });

    if (!serverResult.success) {
      console.error("❌ Invalid server environment variables:", serverResult.error.format());
    }

    return { ...clientResult.data, ...(serverResult.success ? serverResult.data : {}) };
  }

  return { ...clientResult.data };
};

export const ENV_GLOBAL = validateEnv() as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
