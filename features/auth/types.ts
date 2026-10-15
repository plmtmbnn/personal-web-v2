import { ENV_GLOBAL } from "@/lib/core/env";

/**
 * Centralized Authentication & Authorization Domain Types
 */

export type AuthMode = "login_only" | "pin_only" | "serial" | "disabled";

export type AuthStatus =
	| "authorized"
	| "unauthenticated"
	| "needs_pin"
	| "forbidden"
	| "disabled";

export interface AuthSession {
	sessionId: string;
	userId?: string;
	email?: string;
	name?: string;
	avatarUrl?: string;
	isAdmin: boolean;
	googleAuthenticated: boolean;
	pinAuthenticated: boolean;
	mode: AuthMode;
	createdAt: number;
	lastRefreshedAt: number;
	expiresAt: number;
}

export interface AuthUser {
	id: string;
	email?: string;
	name?: string;
	avatarUrl?: string;
	isAdmin: boolean;
}

export interface AuthResult {
	authorized: boolean;
	status: AuthStatus;
	session: AuthSession | null;
	user: AuthUser | null;
	redirectUrl?: string;
}

/**
 * Resolves the default authentication mode from environment toggles.
 * - Both enabled: "serial" (2FA: Google OAuth + Authenticator PIN)
 * - Google enabled only: "login_only"
 * - PIN enabled only: "pin_only"
 * - Neither enabled: "disabled"
 */
export function getAuthMode(): AuthMode {
	const hasGoogle = Boolean(ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH);
	const hasPin = Boolean(ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD);

	if (hasGoogle && hasPin) return "serial";
	if (hasGoogle && !hasPin) return "login_only";
	if (!hasGoogle && hasPin) return "pin_only";
	return "disabled";
}
