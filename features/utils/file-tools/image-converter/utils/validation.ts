import type { DetectedFormat, ImageValidationResult } from "../types";

/**
 * Checks if a byte slice matches an expected byte sequence.
 */
function matchBytes(
	bytes: Uint8Array,
	expected: number[],
	offset = 0,
): boolean {
	if (bytes.length < offset + expected.length) return false;
	for (let i = 0; i < expected.length; i++) {
		if (bytes[offset + i] !== expected[i]) return false;
	}
	return true;
}

/**
 * Checks if an ASCII string matches bytes at a given offset.
 */
function matchString(bytes: Uint8Array, str: string, offset = 0): boolean {
	if (bytes.length < offset + str.length) return false;
	for (let i = 0; i < str.length; i++) {
		if (bytes[offset + i] !== str.charCodeAt(i)) return false;
	}
	return true;
}

/**
 * Inspects the binary header (magic numbers) of a file buffer to detect the real image format.
 */
export function detectImageFormatFromBuffer(
	buffer: ArrayBuffer,
): DetectedFormat {
	const bytes = new Uint8Array(buffer);
	if (bytes.length < 4) return "unknown";

	// PNG: 89 50 4E 47 0D 0A 1A 0A
	if (matchBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
		return "png";
	}

	// JPEG: FF D8 FF
	if (matchBytes(bytes, [0xff, 0xd8, 0xff])) {
		return "jpeg";
	}

	// GIF: GIF87a or GIF89a
	if (matchString(bytes, "GIF87a", 0) || matchString(bytes, "GIF89a", 0)) {
		return "gif";
	}

	// WEBP: RIFF + .... + WEBP
	if (matchString(bytes, "RIFF", 0) && matchString(bytes, "WEBP", 8)) {
		return "webp";
	}

	// BMP: 'BM'
	if (matchString(bytes, "BM", 0)) {
		return "bmp";
	}

	// ICO: 00 00 01 00
	if (matchBytes(bytes, [0x00, 0x00, 0x01, 0x00])) {
		return "ico";
	}

	// TIFF: II*. or MM.*
	if (
		matchBytes(bytes, [0x49, 0x49, 0x2a, 0x00]) ||
		matchBytes(bytes, [0x4d, 0x4d, 0x00, 0x2a])
	) {
		return "tiff";
	}

	// AVIF / HEIC container (ISO Base Media File Format: ftyp box at offset 4)
	if (matchString(bytes, "ftyp", 4)) {
		const brand = String.fromCharCode(
			bytes[8] || 0,
			bytes[9] || 0,
			bytes[10] || 0,
			bytes[11] || 0,
		);
		if (
			brand === "avif" ||
			brand === "avis" ||
			brand === "mif1" ||
			brand === "miaf"
		) {
			return "avif";
		}
		if (brand === "heic" || brand === "heix" || brand === "hevc") {
			return "heic";
		}
	}

	// SVG text check (checks first 512 bytes for <svg)
	try {
		const headerText = new TextDecoder("utf-8")
			.decode(bytes.slice(0, Math.min(bytes.length, 512)))
			.trim()
			.toLowerCase();

		if (
			headerText.includes("<svg") ||
			(headerText.startsWith("<?xml") && headerText.includes("<svg"))
		) {
			return "svg";
		}
	} catch {
		// Non-text binary
	}

	return "unknown";
}

/**
 * Validates whether a given File object is a genuine, non-corrupted image.
 * Uses both binary magic-number inspection and canvas/bitmap decoding.
 */
export async function validateRealImage(
	file: File,
): Promise<ImageValidationResult> {
	if (!file || file.size === 0) {
		return {
			isValid: false,
			detectedFormat: "unknown",
			error: "File is empty (0 bytes).",
		};
	}

	// Limit to max 50MB for in-browser client safety
	if (file.size > 50 * 1024 * 1024) {
		return {
			isValid: false,
			detectedFormat: "unknown",
			error: "File exceeds 50 MB maximum size limit.",
		};
	}

	try {
		// 1. Read first 512 bytes for header analysis
		const headerSlice = file.slice(0, 512);
		const headerBuffer = await headerSlice.arrayBuffer();
		const detectedFormat = detectImageFormatFromBuffer(headerBuffer);

		if (detectedFormat === "unknown") {
			return {
				isValid: false,
				detectedFormat: "unknown",
				error:
					"File signature mismatch. This is not a genuine image file (e.g. text/exe renamed to image).",
			};
		}

		// 2. Perform decoding validation to ensure payload integrity & obtain dimensions
		const dimensions = await decodeImageDimensions(file);

		if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
			return {
				isValid: false,
				detectedFormat,
				error: "Corrupted image data: unable to decode pixels.",
			};
		}

		return {
			isValid: true,
			detectedFormat,
			mimeType: file.type || `image/${detectedFormat}`,
			dimensions,
		};
	} catch (err) {
		return {
			isValid: false,
			detectedFormat: "unknown",
			error:
				err instanceof Error
					? err.message
					: "Failed to validate image structure.",
		};
	}
}

/**
 * Helper to decode image and read dimensions in browser environment.
 */
function decodeImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		if (typeof window === "undefined") {
			return resolve({ width: 100, height: 100 });
		}

		const objectUrl = URL.createObjectURL(file);
		const img = new Image();

		img.onload = () => {
			const width = img.naturalWidth;
			const height = img.naturalHeight;
			URL.revokeObjectURL(objectUrl);
			resolve({ width, height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Image payload is corrupted and cannot be rendered."));
		};

		img.src = objectUrl;
	});
}
