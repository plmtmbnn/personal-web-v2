import { z } from "zod";

/**
 * =============================================================================
 *  ENVIRONMENT VALIDATION CONFIGURATION
 *  Strict type-safe environment validation for Next.js application
 * =============================================================================
 */

// ── Client-Side Environment Variables ────────────────────────────────────────
/**
 * Must start with `NEXT_PUBLIC_` to be accessible in the browser.
 * These are bundled into the client bundle - NEVER store sensitive data here.
 */
const clientSchema = z.object({
	/** Supabase URL – required for authentication & database operations */
	NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

	/** Supabase anonymous key – required for auth */
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z
		.string()
		.min(1, "Supabase anon key is required"),

	/** Base URL for your site (used for redirects, emails, API calls) */
	NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

	/** Enable/disable Google OAuth login (true/false string) */
	NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: z
		.string()
		.default("true")
		.transform((v) => v === "true"),

	/** Enable/disable Pinguard protection (true/false string) */
	NEXT_PUBLIC_ENABLE_PINGUARD: z
		.string()
		.default("true")
		.transform((v) => v === "true"),

	/** ── Firebase Client Config (optional) ───────────────────────────────────── */
	NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1).optional(),
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1).optional(),
	NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1).optional(),
	NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
	NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1).optional(),
	NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1).optional(),

	/** ── Analytics & Monitoring ──────────────────────────────────────────────── */
	NEXT_PUBLIC_GA_ID: z.string().optional(),
	NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
	NEXT_PUBLIC_PLAUSIBLE_SITE_ID: z.string().optional(),
	NEXT_PUBLIC_HUGGINGFACE_ENDPOINT: z.string().url().optional(),
	NEXT_PUBLIC_DEBUG_MODE: z
		.string()
		.default("false")
		.transform((v) => v === "true"),
});

// ── Server-Side Environment Variables ─────────────────────────────────────────
/**
 * Only accessible in Node.js/Edge runtime. NOT exposed to the browser.
 * Store sensitive secrets here.
 */
const serverSchema = z.object({
	UPSTASH_REDIS_REST_URL: z.string().url(),
	UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "Redis token is required"),
	TOTP_SECRET: z.string().min(1, "TOTP secret is required"),
	SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
	CRON_SECRET: z.string().min(1).optional(),
	TELEGRAM_BOT_TOKEN: z.string().optional(),
	TELEGRAM_CHAT_ID: z.string().optional(),
	STRAVA_CLIENT_ID: z.string().optional(),
	STRAVA_CLIENT_SECRET: z.string().optional(),
	STRAVA_REFRESH_TOKEN: z.string().optional(),
	OPENAI_API_KEY: z.string().optional(),
	STRIPE_PUBLISHABLE_KEY: z.string().optional(),
	STRIPE_SECRET_KEY: z.string().optional(),
	EMAIL_API_KEY: z.string().optional(),
	EMAIL_DEFAULT_FROM: z.string().email().optional(),
	WEBHOOK_SECRET: z.string().optional(),
	MAX_UPLOAD_SIZE: z.number().default(10485760).optional(),
	DEFAULT_LIMIT: z.number().default(50).optional(),
});

// ── Combined Type Definition ──────────────────────────────────────────────────
export type Environment = z.infer<typeof clientSchema> &
	Partial<z.infer<typeof serverSchema>>;

/**
 * Runtime validation of all environment variables.
 * Throws if required client-side variables are missing.
 * Logs a warning but does not throw if required server-side variables are missing.
 */
const validateEnv = () => {
	const isServer = typeof window === "undefined";

	const clientResult = clientSchema.safeParse({
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_ENABLE_GOOGLE_AUTH: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
		NEXT_PUBLIC_ENABLE_PINGUARD: process.env.NEXT_PUBLIC_ENABLE_PINGUARD,
		NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
			process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		NEXT_PUBLIC_FIREBASE_PROJECT_ID:
			process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
			process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
		NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
			process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
		NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
		NEXT_PUBLIC_PLAUSIBLE_SITE_ID: process.env.NEXT_PUBLIC_PLAUSIBLE_SITE_ID,
		NEXT_PUBLIC_HUGGINGFACE_ENDPOINT:
			process.env.NEXT_PUBLIC_HUGGINGFACE_ENDPOINT,
		NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
	});

	if (!clientResult.success) {
		console.error(
			"❌ Invalid client environment variables:",
			clientResult.error.format(),
		);
		throw new Error("Invalid client environment variables");
	}

	if (isServer) {
		const serverResult = serverSchema.safeParse({
			UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
			UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
			TOTP_SECRET: process.env.TOTP_SECRET,
			SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
			CRON_SECRET: process.env.CRON_SECRET,
			TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
			TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
			STRAVA_CLIENT_ID: process.env.STRAVA_CLIENT_ID,
			STRAVA_CLIENT_SECRET: process.env.STRAVA_CLIENT_SECRET,
			STRAVA_REFRESH_TOKEN: process.env.STRAVA_REFRESH_TOKEN,
			OPENAI_API_KEY: process.env.OPENAI_API_KEY,
			STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
			STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
			EMAIL_API_KEY: process.env.EMAIL_API_KEY,
			EMAIL_DEFAULT_FROM: process.env.EMAIL_DEFAULT_FROM,
			WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
			MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE
				? Number(process.env.MAX_UPLOAD_SIZE)
				: undefined,
			DEFAULT_LIMIT: process.env.DEFAULT_LIMIT
				? Number(process.env.DEFAULT_LIMIT)
				: undefined,
		});

		if (!serverResult.success) {
			console.warn(
				"⚠️ Warning: Some server-side environment variables are missing or invalid:",
				serverResult.error.format(),
			);
		}

		return {
			...clientResult.data,
			...(serverResult.success ? serverResult.data : {}),
		};
	}

	return { ...clientResult.data };
};

// ── Export Single Instance ────────────────────────────────────────────────────
export const ENV = validateEnv() as ReturnType<typeof validateEnv>;

// Backward compatibility: ENV_GLOBAL for old imports
export const ENV_GLOBAL = ENV;

// ── Helper Functions ──────────────────────────────────────────────────────────

export function isFeatureEnabled(flagName: string): boolean {
	try {
		const value = process.env[flagName];
		if (!value) return false;
		return ["true", "1", "yes"].some(
			(v) => v.toLowerCase() === value.toLowerCase(),
		);
	} catch (error) {
		console.warn(`Could not read environment variable: ${flagName}`, error);
		return false;
	}
}

export function getEnv<T>(key: string, defaultValue: T): T {
	const value = process.env[key];
	return value !== undefined && value !== ""
		? (value as unknown as T)
		: defaultValue;
}

export function logEnvironmentInfo() {
	if (!ENV.NEXT_PUBLIC_DEBUG_MODE) return;

	console.log("[ENV] Environment info (sensitive values omitted):", {
		siteUrl: ENV.NEXT_PUBLIC_SITE_URL,
		mode: typeof window === "undefined" ? "server" : "client",
		googleAuth: ENV.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH,
		pinguardEnabled: ENV.NEXT_PUBLIC_ENABLE_PINGUARD,
		gaId: !!ENV.NEXT_PUBLIC_GA_ID,
		hasFirebase: !!(
			ENV.NEXT_PUBLIC_FIREBASE_API_KEY && ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
		),
	});
}

logEnvironmentInfo();
