import { describe, it, expect } from "vitest";
import {
	generateSecurePassword,
	generatePassphrase,
	generatePin,
	calculatePasswordStrength,
} from "../utils/password";
import { computeMd5, computeHash, compareChecksums } from "../utils/hashing";
import {
	encodeBase64,
	decodeBase64,
	encodeBase64Url,
	decodeBase64Url,
	encodeHex,
	decodeHex,
	encodeUrl,
	decodeUrl,
	encodeHtmlEntities,
	rot13,
	transformSecurityText,
} from "../utils/formatter";

describe("Password & Passphrase Generator", () => {
	it("generates a secure password with designated length and charsets", () => {
		const password = generateSecurePassword({
			mode: "custom",
			length: 24,
			includeUppercase: true,
			includeLowercase: true,
			includeNumbers: true,
			includeSymbols: true,
			avoidAmbiguous: false,
			wordCount: 4,
			separator: "-",
			capitalizeWords: true,
			includeNumberInPassphrase: true,
		});

		expect(password).toHaveLength(24);
		expect(/[A-Z]/.test(password)).toBe(true);
		expect(/[a-z]/.test(password)).toBe(true);
		expect(/[0-9]/.test(password)).toBe(true);
		expect(/[^a-zA-Z0-9]/.test(password)).toBe(true);
	});

	it("avoids ambiguous characters when requested", () => {
		const password = generateSecurePassword({
			mode: "custom",
			length: 50,
			includeUppercase: true,
			includeLowercase: true,
			includeNumbers: true,
			includeSymbols: true,
			avoidAmbiguous: true,
			wordCount: 4,
			separator: "-",
			capitalizeWords: true,
			includeNumberInPassphrase: false,
		});

		const ambiguousPattern = /[l1Io0O|i;:]/;
		expect(ambiguousPattern.test(password)).toBe(false);
	});

	it("generates an EFF-style memorable passphrase", () => {
		const passphrase = generatePassphrase({
			mode: "passphrase",
			length: 16,
			includeUppercase: true,
			includeLowercase: true,
			includeNumbers: true,
			includeSymbols: true,
			avoidAmbiguous: false,
			wordCount: 4,
			separator: "-",
			capitalizeWords: true,
			includeNumberInPassphrase: true,
		});

		const parts = passphrase.split("-");
		expect(parts).toHaveLength(4);
		expect(parts[0]?.charAt(0)).toBe(parts[0]?.charAt(0).toUpperCase());
		// Last part should contain appended number
		expect(/[0-9]+$/.test(parts[3] || "")).toBe(true);
	});

	it("generates a numeric PIN of exact length", () => {
		const pin = generatePin(8);
		expect(pin).toHaveLength(8);
		expect(/^\d+$/.test(pin)).toBe(true);
	});

	it("calculates entropy bits and strength ratings accurately", () => {
		const weak = calculatePasswordStrength("12345");
		expect(weak.level).toBe("very-weak");
		expect(weak.entropyBits).toBeLessThan(30);

		const strong = calculatePasswordStrength("X9#kL2@mQ!vP");
		expect(strong.entropyBits).toBeGreaterThanOrEqual(75);
		expect(strong.level).toBe("strong");

		const military = calculatePasswordStrength(
			"Tr0ub4dor&3#CorrectHorseBatteryStaple99!*",
		);
		expect(military.entropyBits).toBeGreaterThanOrEqual(100);
		expect(military.level).toBe("very-strong");
	});
});

describe("Cryptographic Hasher & Checksum", () => {
	it("computes standard MD5 test vectors", () => {
		const encoder = new TextEncoder();
		expect(computeMd5(encoder.encode("hello world"))).toBe(
			"5eb63bbbe01eeed093cb22bb8f5acdc3",
		);
		expect(computeMd5(encoder.encode(""))).toBe(
			"d41d8cd98f00b204e9800998ecf8427e",
		);
		expect(
			computeMd5(encoder.encode("The quick brown fox jumps over the lazy dog")),
		).toBe("9e107d9d372bb6826bd81d3542a419d6");
	});

	it("computes SHA-256 and SHA-1 hashes", async () => {
		const sha256 = await computeHash("hello world", "SHA-256");
		expect(sha256.hash).toBe(
			"b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
		);

		const sha1 = await computeHash("hello world", "SHA-1");
		expect(sha1.hash).toBe("2aae6c35c94fcfb415dbe95f408b9ce91ee846ed");

		const sha256Upper = await computeHash(
			"hello world",
			"SHA-256",
			"",
			"hex-upper",
		);
		expect(sha256Upper.hash).toBe(
			"B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9",
		);
	});

	it("computes HMAC-SHA256 with a secret key", async () => {
		const hmacResult = await computeHash(
			"hello world",
			"SHA-256",
			"secret-key",
		);
		expect(hmacResult.isHmac).toBe(true);
		expect(hmacResult.hash).toBeDefined();
		expect(hmacResult.hash.length).toBe(64);
	});

	it("compares checksums with case-insensitivity and whitespace trimming", () => {
		expect(
			compareChecksums(
				"b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
				"  B94D27B9934D3E08A52E52D7DA7DABFAC484EFE37A5380EE9088F7ACE2EFCDE9  ",
			),
		).toBe(true);

		expect(
			compareChecksums("5eb63bbbe01eeed093cb22bb8f5acdc3", "wrong-hash"),
		).toBe(false);
	});
});

describe("Security Formatter & Encoding Transformers", () => {
	it("encodes and decodes Base64 correctly with UTF-8", () => {
		const sample = "Antigravity Secure Token 🚀 2026";
		const encoded = encodeBase64(sample);
		const decoded = decodeBase64(encoded);
		expect(decoded).toBe(sample);
	});

	it("encodes and decodes Base64URL without illegal URL chars or padding", () => {
		const sample = "Subjects? query=value&token=123+456/789==";
		const encoded = encodeBase64Url(sample);
		expect(encoded).not.toContain("+");
		expect(encoded).not.toContain("/");
		expect(encoded).not.toContain("=");
		const decoded = decodeBase64Url(encoded);
		expect(decoded).toBe(sample);
	});

	it("encodes and decodes Hex byte streams", () => {
		const sample = "Hello";
		const hex = encodeHex(sample, "spaced");
		expect(hex).toBe("48 65 6c 6c 6f");
		const decoded = decodeHex(hex);
		expect(decoded).toBe(sample);
	});

	it("encodes and decodes URL components", () => {
		const sample = "hello world / & ? # = +";
		const encoded = encodeUrl(sample);
		expect(encoded).toBe("hello%20world%20%2F%20%26%20%3F%20%23%20%3D%20%2B");
		expect(decodeUrl(encoded)).toBe(sample);
	});

	it("escapes HTML entities safely", () => {
		const sample = '<script>alert("xss & fun");</script>';
		const encoded = encodeHtmlEntities(sample);
		expect(encoded).toContain("&lt;script&gt;");
		expect(encoded).toContain("&amp;");
		expect(encoded).toContain("&quot;");
	});

	it("applies ROT13 shift cipher symmetrically", () => {
		const sample = "Hello World 2026!";
		const encoded = rot13(sample);
		expect(encoded).toBe("Uryyb Jbeyq 2026!");
		expect(rot13(encoded)).toBe(sample);
	});

	it("handles unified transformSecurityText helper", () => {
		expect(transformSecurityText("Hello", "hex", "encode")).toBe(
			"48 65 6c 6c 6f",
		);
		expect(transformSecurityText("48 65 6c 6c 6f", "hex", "decode")).toBe(
			"Hello",
		);
		expect(transformSecurityText("", "base64", "encode")).toBe("");
	});
});
