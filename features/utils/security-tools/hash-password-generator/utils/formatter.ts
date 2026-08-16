import type { EncodingFormat } from "../types";

/**
 * UTF-8 safe Base64 encoding.
 */
export function encodeBase64(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i] ?? 0);
	}
	return btoa(binary);
}

/**
 * UTF-8 safe Base64 decoding.
 */
export function decodeBase64(input: string): string {
	const clean = input.trim();
	const binary = atob(clean);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder().decode(bytes);
}

/**
 * URL-safe Base64 encoding (RFC 4648).
 */
export function encodeBase64Url(input: string): string {
	return encodeBase64(input)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

/**
 * URL-safe Base64 decoding.
 */
export function decodeBase64Url(input: string): string {
	let base64 = input.trim().replace(/-/g, "+").replace(/_/g, "/");
	while (base64.length % 4 !== 0) {
		base64 += "=";
	}
	return decodeBase64(base64);
}

/**
 * Converts text into hex representation with optional spacing.
 */
export function encodeHex(
	input: string,
	style: "plain" | "spaced" | "prefix" = "spaced",
): string {
	const bytes = new TextEncoder().encode(input);
	const hexArray = Array.from(bytes).map((b) =>
		b.toString(16).padStart(2, "0"),
	);

	if (style === "spaced") return hexArray.join(" ");
	if (style === "prefix") return hexArray.map((h) => `0x${h}`).join(", ");
	return hexArray.join("");
}

/**
 * Converts a hex string back to UTF-8 text.
 */
export function decodeHex(input: string): string {
	const clean = input.replace(/0x|\\x|\s+|,|;/gi, "");
	if (clean.length % 2 !== 0) {
		throw new Error(
			"Invalid hex string length (must contain pairs of hexadecimal characters).",
		);
	}
	const bytes = new Uint8Array(clean.length / 2);
	for (let i = 0; i < clean.length; i += 2) {
		const byte = parseInt(clean.substring(i, i + 2), 16);
		if (Number.isNaN(byte)) {
			throw new Error(
				`Invalid hexadecimal character encountered at index ${i}.`,
			);
		}
		bytes[i / 2] = byte;
	}
	return new TextDecoder().decode(bytes);
}

/**
 * URL component encoding.
 */
export function encodeUrl(input: string): string {
	return encodeURIComponent(input);
}

/**
 * URL component decoding.
 */
export function decodeUrl(input: string): string {
	return decodeURIComponent(input);
}

/**
 * Escapes characters to HTML entities.
 */
export function encodeHtmlEntities(input: string): string {
	const entities: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
		"/": "&#x2F;",
		"`": "&#x60;",
		"=": "&#x3D;",
	};
	return input.replace(/[&<>"'`=/]/g, (char) => entities[char] || char);
}

/**
 * Decodes HTML entities back to characters.
 */
export function decodeHtmlEntities(input: string): string {
	const doc = new DOMParser().parseFromString(input, "text/html");
	return doc.documentElement.textContent || "";
}

/**
 * Classical ROT13 Caesar cipher (symmetric encode/decode).
 */
export function rot13(input: string): string {
	return input.replace(/[a-zA-Z]/g, (c) => {
		const base = c <= "Z" ? 65 : 97;
		return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
	});
}

/**
 * Unified transformer handling all encoding/decoding formats.
 */
export function transformSecurityText(
	input: string,
	format: EncodingFormat,
	action: "encode" | "decode",
): string {
	if (!input) return "";

	if (action === "encode") {
		switch (format) {
			case "base64":
				return encodeBase64(input);
			case "base64url":
				return encodeBase64Url(input);
			case "hex":
				return encodeHex(input, "spaced");
			case "url":
				return encodeUrl(input);
			case "html":
				return encodeHtmlEntities(input);
			case "rot13":
				return rot13(input);
		}
	} else {
		switch (format) {
			case "base64":
				return decodeBase64(input);
			case "base64url":
				return decodeBase64Url(input);
			case "hex":
				return decodeHex(input);
			case "url":
				return decodeUrl(input);
			case "html":
				return decodeHtmlEntities(input);
			case "rot13":
				return rot13(input);
		}
	}
}
