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
  // Firebase Client Config
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),
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
  CRON_SECRET: z.string().min(1).optional(),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),
});

const validateEnv = () => {
  const isServer = typeof window === "undefined";

  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
    NEXT_PUBLIC_ENABLE_PINGUARD: process.env.NEXT_PUBLIC_ENABLE_PINGUARD,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
      CRON_SECRET: process.env.CRON_SECRET,
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    });

    if (!serverResult.success) {
      console.error("❌ Invalid server environment variables:", serverResult.error.format());
    }

    return { ...clientResult.data, ...(serverResult.success ? serverResult.data : {}) };
  }

  return { ...clientResult.data };
};

export const ENV_GLOBAL = validateEnv() as z.infer<typeof clientSchema> & Partial<z.infer<typeof serverSchema>>;
