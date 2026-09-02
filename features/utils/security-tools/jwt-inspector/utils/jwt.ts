import type {
	DecodedJWT,
	JWTHeader,
	JWTPayload,
	SignatureVerificationResult,
	StandardClaimInfo,
	TimeTelemetry,
	TokenStatus,
} from "../types";

/**
 * Decodes a base64url encoded string into a UTF-8 string
 */
export function base64UrlDecode(str: string): string {
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4 !== 0) {
		base64 += "=";
	}

	try {
		// Use native atob and percent-encoding for UTF-8 safety
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			bytes[i] = binary.charCodeAt(i);
		}
		return new TextDecoder().decode(bytes);
	} catch {
		throw new Error("Invalid base64url encoding");
	}
}

/**
 * Converts a string to Uint8Array for Web Crypto API
 */
function stringToUint8Array(str: string): Uint8Array {
	return new TextEncoder().encode(str);
}

/**
 * Converts Base64URL string to ArrayBuffer for Web Crypto signature check
 */
function base64UrlToArrayBuffer(base64Url: string): ArrayBuffer {
	let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4 !== 0) {
		base64 += "=";
	}
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer;
}

/**
 * Standard RFC 7519 claims glossary
 */
const CLAIMS_DICTIONARY: Record<string, { name: string; description: string }> =
	{
		iss: {
			name: "Issuer",
			description:
				"Identifies the principal that issued the JWT (e.g. auth server, Supabase, Auth0).",
		},
		sub: {
			name: "Subject",
			description:
				"Identifies the principal that is the subject of the JWT (e.g. user uuid or client id).",
		},
		aud: {
			name: "Audience",
			description: "Identifies the recipients that the JWT is intended for.",
		},
		exp: {
			name: "Expiration Time",
			description:
				"Identifies the expiration time on or after which the JWT MUST NOT be accepted.",
		},
		nbf: {
			name: "Not Before",
			description:
				"Identifies the time before which the JWT MUST NOT be accepted for processing.",
		},
		iat: {
			name: "Issued At",
			description: "Identifies the time at which the JWT was issued.",
		},
		jti: {
			name: "JWT ID",
			description:
				"Provides a unique identifier for the JWT to prevent replay attacks.",
		},
		role: {
			name: "Role",
			description:
				"Authorization role assigned to the token subject (e.g. authenticated, admin).",
		},
		roles: {
			name: "Roles",
			description: "List of authorization roles assigned to the subject.",
		},
		scope: {
			name: "Scopes",
			description:
				"Space-separated list of OAuth2 / OpenID authorization scopes granted.",
		},
		scopes: {
			name: "Scopes",
			description: "Array of authorization scopes granted to this token.",
		},
		email: {
			name: "Email",
			description: "Verified email address of the authenticated user.",
		},
		name: {
			name: "Full Name",
			description: "Display name of the authenticated subject.",
		},
	};

/**
 * Formats a duration in seconds into a human-friendly string
 */
export function formatDuration(seconds: number): string {
	const absSec = Math.abs(seconds);
	const days = Math.floor(absSec / 86400);
	const hours = Math.floor((absSec % 86400) / 3600);
	const mins = Math.floor((absSec % 3600) / 60);
	const secs = Math.floor(absSec % 60);

	const parts: string[] = [];
	if (days > 0) parts.push(`${days}d`);
	if (hours > 0 || days > 0) parts.push(`${hours}h`);
	if (mins > 0 || hours > 0 || days > 0) parts.push(`${mins}m`);
	parts.push(`${secs}s`);

	return parts.join(" ");
}

/**
 * Formats a Unix timestamp into a readable localized date string
 */
export function formatUnixTimestamp(timestamp: number): string {
	try {
		const date = new Date(timestamp * 1000);
		return new Intl.DateTimeFormat("en-US", {
			dateStyle: "medium",
			timeStyle: "medium",
			hour12: false,
		}).format(date);
	} catch {
		return "Invalid Date";
	}
}

/**
 * Calculates real-time expiration telemetry
 */
export function calculateTimeTelemetry(
	payload: JWTPayload,
	nowSec = Math.floor(Date.now() / 1000),
): TimeTelemetry {
	const exp = typeof payload.exp === "number" ? payload.exp : null;
	const iat = typeof payload.iat === "number" ? payload.iat : null;
	const nbf = typeof payload.nbf === "number" ? payload.nbf : null;

	let status: TokenStatus = "no_exp";
	let statusLabel = "No Expiry";
	let statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";
	let expiresInSeconds: number | null = null;
	let expiresInFormatted: string | null = null;
	let issuedDurationAgo: string | null = null;
	let totalLifespanSeconds: number | null = null;
	let remainingPercent: number | null = null;

	const isNotBeforeValid = nbf ? nowSec >= nbf : true;

	if (iat) {
		const diffIssued = nowSec - iat;
		issuedDurationAgo =
			diffIssued >= 0
				? `${formatDuration(diffIssued)} ago`
				: `in ${formatDuration(diffIssued)}`;
	}

	if (!isNotBeforeValid) {
		status = "not_yet_valid";
		statusLabel = "Not Yet Valid";
		statusBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";
	} else if (exp !== null) {
		expiresInSeconds = exp - nowSec;

		if (expiresInSeconds <= 0) {
			status = "expired";
			statusLabel = "Expired";
			statusBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
			expiresInFormatted = `Expired ${formatDuration(expiresInSeconds)} ago`;
		} else if (expiresInSeconds < 300) {
			// Less than 5 minutes
			status = "expiring_soon";
			statusLabel = "Expiring Soon";
			statusBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";
			expiresInFormatted = `Expires in ${formatDuration(expiresInSeconds)}`;
		} else {
			status = "active";
			statusLabel = "Active";
			statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
			expiresInFormatted = `Expires in ${formatDuration(expiresInSeconds)}`;
		}

		if (iat && exp > iat) {
			totalLifespanSeconds = exp - iat;
			const remaining = Math.max(
				0,
				Math.min(totalLifespanSeconds, exp - nowSec),
			);
			remainingPercent = Math.max(
				0,
				Math.min(100, Math.round((remaining / totalLifespanSeconds) * 100)),
			);
		}
	}

	return {
		status,
		statusLabel,
		statusBadgeClass,
		expiresAtDate: exp ? formatUnixTimestamp(exp) : null,
		expiresInSeconds,
		expiresInFormatted,
		issuedAtDate: iat ? formatUnixTimestamp(iat) : null,
		issuedDurationAgo,
		notBeforeDate: nbf ? formatUnixTimestamp(nbf) : null,
		isNotBeforeValid,
		totalLifespanSeconds,
		remainingPercent,
	};
}

/**
 * Parses and extracts claim items with metadata
 */
export function extractClaimsList(payload: JWTPayload): {
	claims: StandardClaimInfo[];
	customCount: number;
} {
	const claims: StandardClaimInfo[] = [];
	let customCount = 0;

	for (const [key, value] of Object.entries(payload)) {
		const dictEntry = CLAIMS_DICTIONARY[key];
		const isTimestamp = key === "exp" || key === "iat" || key === "nbf";
		let formattedValue = "";

		if (isTimestamp && typeof value === "number") {
			formattedValue = `${value} (${formatUnixTimestamp(value)})`;
		} else if (typeof value === "object" && value !== null) {
			formattedValue = JSON.stringify(value);
		} else {
			formattedValue = String(value ?? "");
		}

		if (dictEntry) {
			claims.push({
				claim: key,
				name: dictEntry.name,
				description: dictEntry.description,
				value: formattedValue,
				rawValue: value,
				isTimestamp,
			});
		} else {
			customCount++;
			claims.push({
				claim: key,
				name: "Custom Claim",
				description: "Application-specific custom payload claim.",
				value: formattedValue,
				rawValue: value,
				isTimestamp,
			});
		}
	}

	return { claims, customCount };
}

/**
 * Main JWT Decoder Function
 */
export function decodeJWT(
	tokenString: string,
	nowSec = Math.floor(Date.now() / 1000),
): DecodedJWT {
	const trimmed = tokenString.trim();

	if (!trimmed) {
		return {
			raw: "",
			headerRaw: "",
			payloadRaw: "",
			signatureRaw: "",
			header: null,
			payload: null,
			headerFormatted: "",
			payloadFormatted: "",
			isValidStructure: false,
			errorMessage: "Please enter a JWT token above.",
			timeTelemetry: null,
			claimsList: [],
			customClaimsCount: 0,
		};
	}

	const parts = trimmed.split(".");

	if (parts.length !== 3) {
		return {
			raw: trimmed,
			headerRaw: parts[0] || "",
			payloadRaw: parts[1] || "",
			signatureRaw: parts[2] || "",
			header: null,
			payload: null,
			headerFormatted: "",
			payloadFormatted: "",
			isValidStructure: false,
			errorMessage: `Invalid JWT format. Expected 3 dot-separated parts (Header.Payload.Signature), but got ${parts.length}.`,
			timeTelemetry: null,
			claimsList: [],
			customClaimsCount: 0,
		};
	}

	const [headerB64, payloadB64, signatureB64] = parts;

	let header: JWTHeader | null = null;
	let payload: JWTPayload | null = null;
	let headerFormatted = "";
	let payloadFormatted = "";

	try {
		const headerJson = base64UrlDecode(headerB64);
		header = JSON.parse(headerJson);
		headerFormatted = JSON.stringify(header, null, 2);
	} catch (e: unknown) {
		return {
			raw: trimmed,
			headerRaw: headerB64,
			payloadRaw: payloadB64,
			signatureRaw: signatureB64,
			header: null,
			payload: null,
			headerFormatted: "",
			payloadFormatted: "",
			isValidStructure: false,
			errorMessage: `Failed to decode JWT Header: ${e instanceof Error ? e.message : "Malformed Base64Url JSON"}`,
			timeTelemetry: null,
			claimsList: [],
			customClaimsCount: 0,
		};
	}

	try {
		const payloadJson = base64UrlDecode(payloadB64);
		payload = JSON.parse(payloadJson);
		payloadFormatted = JSON.stringify(payload, null, 2);
	} catch (e: unknown) {
		return {
			raw: trimmed,
			headerRaw: headerB64,
			payloadRaw: payloadB64,
			signatureRaw: signatureB64,
			header,
			payload: null,
			headerFormatted,
			payloadFormatted: "",
			isValidStructure: false,
			errorMessage: `Failed to decode JWT Payload: ${e instanceof Error ? e.message : "Malformed Base64Url JSON"}`,
			timeTelemetry: null,
			claimsList: [],
			customClaimsCount: 0,
		};
	}

	const timeTelemetry = payload
		? calculateTimeTelemetry(payload, nowSec)
		: null;
	const { claims: claimsList, customCount: customClaimsCount } = payload
		? extractClaimsList(payload)
		: { claims: [], customCount: 0 };

	return {
		raw: trimmed,
		headerRaw: headerB64,
		payloadRaw: payloadB64,
		signatureRaw: signatureB64,
		header,
		payload,
		headerFormatted,
		payloadFormatted,
		isValidStructure: true,
		errorMessage: null,
		timeTelemetry,
		claimsList,
		customClaimsCount,
	};
}

/**
 * Client-Side HMAC Signature Verifier using native Web Crypto API
 */
export async function verifyHmacSignature(
	tokenString: string,
	secret: string,
	algorithm: "HS256" | "HS384" | "HS512" = "HS256",
): Promise<SignatureVerificationResult> {
	const trimmed = tokenString.trim();
	const parts = trimmed.split(".");

	if (parts.length !== 3) {
		return {
			status: "invalid",
			message: "Invalid JWT structure for signature verification.",
			algorithm,
		};
	}

	if (!secret) {
		return {
			status: "idle",
			message: "Enter the HMAC secret key to verify signature.",
			algorithm,
		};
	}

	const [headerB64, payloadB64, signatureB64] = parts;
	const dataToSign = `${headerB64}.${payloadB64}`;

	let hashAlgo = "SHA-256";
	if (algorithm === "HS384") hashAlgo = "SHA-384";
	if (algorithm === "HS512") hashAlgo = "SHA-512";

	try {
		if (
			typeof window === "undefined" ||
			!window.crypto ||
			!window.crypto.subtle
		) {
			return {
				status: "unsupported",
				message: "Web Crypto API is not supported in this environment.",
				algorithm,
			};
		}

		const keyData = stringToUint8Array(secret);
		const cryptoKey = await window.crypto.subtle.importKey(
			"raw",
			keyData as BufferSource,
			{ name: "HMAC", hash: { name: hashAlgo } },
			false,
			["verify", "sign"],
		);

		const signatureBuffer = base64UrlToArrayBuffer(signatureB64);
		const dataBuffer = stringToUint8Array(dataToSign);

		const isValid = await window.crypto.subtle.verify(
			"HMAC",
			cryptoKey,
			signatureBuffer,
			dataBuffer as BufferSource,
		);

		if (isValid) {
			return {
				status: "valid",
				message: `Signature Verified! Matched with ${algorithm} algorithm.`,
				algorithm,
			};
		}

		return {
			status: "invalid",
			message: `Signature mismatch. Secret key does not match this token's ${algorithm} signature.`,
			algorithm,
		};
	} catch (err) {
		return {
			status: "invalid",
			message: `Verification error: ${err instanceof Error ? err.message : "Unable to verify signature"}`,
			algorithm,
		};
	}
}
