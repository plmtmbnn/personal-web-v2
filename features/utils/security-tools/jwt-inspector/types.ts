export interface JWTHeader {
	alg?: string;
	typ?: string;
	kid?: string;
	cty?: string;
	crit?: string[];
	[key: string]: unknown;
}

export interface JWTPayload {
	iss?: string;
	sub?: string;
	aud?: string | string[];
	exp?: number;
	nbf?: number;
	iat?: number;
	jti?: string;
	role?: string;
	roles?: string[];
	scope?: string;
	scopes?: string[];
	email?: string;
	name?: string;
	[key: string]: unknown;
}

export type TokenStatus =
	| "active"
	| "expiring_soon"
	| "expired"
	| "not_yet_valid"
	| "no_exp";

export interface TimeTelemetry {
	status: TokenStatus;
	statusLabel: string;
	statusBadgeClass: string;
	expiresAtDate: string | null;
	expiresInSeconds: number | null;
	expiresInFormatted: string | null;
	issuedAtDate: string | null;
	issuedDurationAgo: string | null;
	notBeforeDate: string | null;
	isNotBeforeValid: boolean;
	totalLifespanSeconds: number | null;
	remainingPercent: number | null;
}

export interface StandardClaimInfo {
	claim: string;
	name: string;
	description: string;
	value: string;
	rawValue: unknown;
	isTimestamp?: boolean;
}

export interface DecodedJWT {
	raw: string;
	headerRaw: string;
	payloadRaw: string;
	signatureRaw: string;
	header: JWTHeader | null;
	payload: JWTPayload | null;
	headerFormatted: string;
	payloadFormatted: string;
	isValidStructure: boolean;
	errorMessage: string | null;
	timeTelemetry: TimeTelemetry | null;
	claimsList: StandardClaimInfo[];
	customClaimsCount: number;
}

export type SignatureAlgorithm =
	| "HS256"
	| "HS384"
	| "HS512"
	| "RS256"
	| "ES256"
	| "none"
	| "other";

export interface SignatureVerificationResult {
	status: "idle" | "verifying" | "valid" | "invalid" | "unsupported";
	message: string;
	algorithm: string;
}

export interface JWTPreset {
	id: string;
	title: string;
	category: string;
	description: string;
	token: string;
	secret?: string;
}
