export type PasswordMode = "custom" | "passphrase" | "pin";

export interface PasswordOptions {
	mode: PasswordMode;
	length: number;
	includeUppercase: boolean;
	includeLowercase: boolean;
	includeNumbers: boolean;
	includeSymbols: boolean;
	avoidAmbiguous: boolean; // exclude l, 1, I, o, 0, O, etc.
	// Passphrase specific
	wordCount: number;
	separator: string; // "-", "_", ".", " ", etc.
	capitalizeWords: boolean;
	includeNumberInPassphrase: boolean;
}

export type StrengthLevel =
	| "very-weak"
	| "weak"
	| "fair"
	| "strong"
	| "very-strong";

export interface PasswordStrengthResult {
	score: number; // 0 to 100
	level: StrengthLevel;
	label: string;
	entropyBits: number;
	crackTimeOnline: string; // 10k/sec
	crackTimeOffline: string; // 10B/sec fast GPU
	color: string;
	bgColor: string;
	feedback?: string;
}

export type HashAlgorithm = "SHA-256" | "SHA-512" | "SHA-384" | "SHA-1" | "MD5";

export type HashOutputFormat = "hex-lower" | "hex-upper" | "base64";

export interface HashResult {
	algorithm: HashAlgorithm;
	hash: string;
	inputBytes: number;
	executionTimeMs: number;
	isHmac: boolean;
	matchesExpected?: boolean;
}

export type EncodingFormat =
	| "base64"
	| "base64url"
	| "hex"
	| "url"
	| "html"
	| "rot13";

export type EncodingAction = "encode" | "decode";
