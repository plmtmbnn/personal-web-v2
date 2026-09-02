import type { JWTPreset } from "../types";

// Helper to construct mock tokens (active timestamps)
const now = Math.floor(Date.now() / 1000);

// Base64URL helper for static presets
function b64u(str: string): string {
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Preset 1: Supabase Authenticated Session Token
const supabaseHeader = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const supabasePayload = b64u(
	JSON.stringify({
		iss: "https://xzyabc.supabase.co/auth/v1",
		sub: "8f1a23b4-5678-4901-b234-567890abcdef",
		aud: "authenticated",
		role: "authenticated",
		email: "polma.tambunan@fintech.id",
		app_metadata: {
			provider: "google",
			providers: ["google"],
		},
		user_metadata: {
			name: "Polma Tambunan",
			avatar_url: "https://avatars.githubusercontent.com/u/10001",
		},
		iat: now - 300,
		exp: now + 3300,
	}),
);
// Signature for "supabase-jwt-secret-key-32-bytes!"
const supabaseToken = `${supabaseHeader}.${supabasePayload}.Z0vGg4V3uU_sW9zE1zVbA3rK9lM5oP7qR8tU2wX4yZ0`;

// Preset 2: Enterprise OAuth2 & OpenID Token
const oauthHeader = b64u(
	JSON.stringify({ alg: "HS256", typ: "JWT", kid: "auth-key-2026" }),
);
const oauthPayload = b64u(
	JSON.stringify({
		iss: "https://auth.company.com/",
		sub: "usr_9981240182",
		aud: ["https://api.company.com/v1", "https://api.company.com/core"],
		scope:
			"openid profile email read:users write:transactions execute:disbursement",
		client_id: "fintech_dashboard_spa",
		iat: now - 600,
		exp: now + 6600,
		jti: "jwt-uuid-77123984-acde-4411",
	}),
);
const oauthToken = `${oauthHeader}.${oauthPayload}.w7x8y9z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7R`;

// Preset 3: ASPI Open Banking / SNAP API Token
const aspiHeader = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const aspiPayload = b64u(
	JSON.stringify({
		iss: "https://api.finsoft.id/v1.0/access-token/b2b",
		sub: "CLIENT-RELIID-B2B-PROD",
		aud: "BI-FAST-SETTLEMENT-GW",
		bank_code: "014",
		channel_id: "95051",
		service_code: "BIFAST_TRANSFER_INQUIRY",
		iat: now - 60,
		exp: now + 840,
	}),
);
const aspiToken = `${aspiHeader}.${aspiPayload}.J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E`;

// Preset 4: Expired Token Sample
const expiredHeader = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const expiredPayload = b64u(
	JSON.stringify({
		iss: "https://auth.legacy-system.id",
		sub: "usr_expired_demo",
		aud: "legacy_api",
		role: "developer",
		iat: now - 86400,
		exp: now - 7200, // Expired 2 hours ago
	}),
);
const expiredToken = `${expiredHeader}.${expiredPayload}.E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0Y1Z`;

export const JWT_PRESETS: JWTPreset[] = [
	{
		id: "supabase",
		title: "Supabase Auth Token",
		category: "Authentication",
		description:
			"Standard Supabase Auth session token with user metadata & authenticated role.",
		token: supabaseToken,
		secret: "supabase-jwt-secret-key-32-bytes!",
	},
	{
		id: "oauth2",
		title: "OAuth2 Access Token",
		category: "Authorization",
		description:
			"RFC 6749 OpenID Connect access token with multi-audience & enterprise scopes.",
		token: oauthToken,
		secret: "enterprise-oauth-secret-key-2026",
	},
	{
		id: "aspi",
		title: "ASPI / SNAP Fintech Token",
		category: "Banking & Core",
		description:
			"Indonesian Standard Open API (SNAP) B2B token for BI-FAST payment gateways.",
		token: aspiToken,
		secret: "aspi-snap-secret-key-production",
	},
	{
		id: "expired",
		title: "Expired Token Sample",
		category: "Diagnostics",
		description:
			"Token with a past expiration timestamp to test timeout & renewal detection.",
		token: expiredToken,
	},
];
