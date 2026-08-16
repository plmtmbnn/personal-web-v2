import { describe, it, expect } from "vitest";
import { detectImageFormatFromBuffer } from "../utils/validation";
import {
	getConvertedFilename,
	formatBytes,
	calculateSavings,
} from "../utils/converter";
import { FORMAT_OPTIONS } from "../types";

describe("detectImageFormatFromBuffer (Magic Number Validation)", () => {
	it("detects PNG format from valid 8-byte header", () => {
		const buffer = new Uint8Array([
			0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
		]).buffer;
		expect(detectImageFormatFromBuffer(buffer)).toBe("png");
	});

	it("detects JPEG format from SOI marker", () => {
		const buffer = new Uint8Array([
			0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
		]).buffer;
		expect(detectImageFormatFromBuffer(buffer)).toBe("jpeg");
	});

	it("detects GIF format (GIF87a and GIF89a)", () => {
		const gif87 = new TextEncoder().encode("GIF87a...some data").buffer;
		const gif89 = new TextEncoder().encode("GIF89a...some data").buffer;
		expect(detectImageFormatFromBuffer(gif87)).toBe("gif");
		expect(detectImageFormatFromBuffer(gif89)).toBe("gif");
	});

	it("detects WEBP format from RIFF + WEBP header", () => {
		const bytes = new Uint8Array(16);
		// 'RIFF' at 0..3
		bytes.set([0x52, 0x49, 0x46, 0x46], 0);
		// 'WEBP' at 8..11
		bytes.set([0x57, 0x45, 0x42, 0x50], 8);
		expect(detectImageFormatFromBuffer(bytes.buffer)).toBe("webp");
	});

	it("detects BMP format from 'BM' signature", () => {
		const buffer = new Uint8Array([0x42, 0x4d, 0x00, 0x10, 0x00, 0x00]).buffer;
		expect(detectImageFormatFromBuffer(buffer)).toBe("bmp");
	});

	it("detects ICO format from icon directory signature", () => {
		const buffer = new Uint8Array([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]).buffer;
		expect(detectImageFormatFromBuffer(buffer)).toBe("ico");
	});

	it("detects TIFF format (Little-Endian and Big-Endian)", () => {
		const le = new Uint8Array([0x49, 0x49, 0x2a, 0x00]).buffer;
		const be = new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]).buffer;
		expect(detectImageFormatFromBuffer(le)).toBe("tiff");
		expect(detectImageFormatFromBuffer(be)).toBe("tiff");
	});

	it("detects AVIF format from ISO BMFF ftyp box", () => {
		const bytes = new Uint8Array(16);
		// length at 0..3
		bytes.set([0x00, 0x00, 0x00, 0x1c], 0);
		// 'ftyp' at 4..7
		bytes.set([0x66, 0x74, 0x79, 0x70], 4);
		// 'avif' at 8..11
		bytes.set([0x61, 0x76, 0x69, 0x66], 8);
		expect(detectImageFormatFromBuffer(bytes.buffer)).toBe("avif");
	});

	it("detects SVG XML format", () => {
		const svgText =
			'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"></svg>';
		const buffer = new TextEncoder().encode(svgText).buffer;
		expect(detectImageFormatFromBuffer(buffer)).toBe("svg");
	});

	it("rejects non-image fake files (e.g. text/exe)", () => {
		const textBuffer = new TextEncoder().encode(
			"Hello this is a plain text file pretending to be jpg",
		).buffer;
		expect(detectImageFormatFromBuffer(textBuffer)).toBe("unknown");

		const exeBuffer = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00])
			.buffer;
		expect(detectImageFormatFromBuffer(exeBuffer)).toBe("unknown");

		const emptyBuffer = new Uint8Array([]).buffer;
		expect(detectImageFormatFromBuffer(emptyBuffer)).toBe("unknown");
	});
});

describe("getConvertedFilename", () => {
	it("replaces extension with target format extension", () => {
		expect(getConvertedFilename("photo.png", "webp")).toBe("photo.webp");
		expect(getConvertedFilename("picture.jpeg", "png")).toBe("picture.png");
		expect(getConvertedFilename("banner.jpg", "ico")).toBe("banner.ico");
		expect(getConvertedFilename("graphic.bmp", "jpeg")).toBe("graphic.jpg");
		expect(getConvertedFilename("image.webp", "avif")).toBe("image.avif");
		expect(getConvertedFilename("vector.svg", "bmp")).toBe("vector.bmp");
	});

	it("handles filenames with multiple dots correctly", () => {
		expect(getConvertedFilename("my.trip.2026.photo.png", "webp")).toBe(
			"my.trip.2026.photo.webp",
		);
	});

	it("appends extension if filename has no extension", () => {
		expect(getConvertedFilename("avatar", "webp")).toBe("avatar.webp");
	});
});

describe("formatBytes", () => {
	it("formats various byte sizes correctly", () => {
		expect(formatBytes(0)).toBe("0 B");
		expect(formatBytes(512)).toBe("512 B");
		expect(formatBytes(1024)).toBe("1 KB");
		expect(formatBytes(1048576)).toBe("1 MB");
		expect(formatBytes(2500000)).toBe("2.4 MB");
	});
});

describe("calculateSavings", () => {
	it("calculates reduction percentage correctly", () => {
		const result = calculateSavings(1000, 400);
		expect(result.percent).toBe(60);
		expect(result.isReduced).toBe(true);
		expect(result.text).toBe("-60%");
	});

	it("calculates increase percentage correctly", () => {
		const result = calculateSavings(500, 750);
		expect(result.percent).toBe(50);
		expect(result.isReduced).toBe(false);
		expect(result.text).toBe("+50%");
	});

	it("handles zero difference or zero size", () => {
		expect(calculateSavings(1000, 1000).text).toBe("0%");
		expect(calculateSavings(0, 0).text).toBe("0%");
	});
});

describe("FORMAT_OPTIONS", () => {
	it("contains required target format definitions", () => {
		const formats = Object.keys(FORMAT_OPTIONS);
		expect(formats).toContain("webp");
		expect(formats).toContain("png");
		expect(formats).toContain("jpeg");
		expect(formats).toContain("avif");
		expect(formats).toContain("ico");
		expect(formats).toContain("bmp");

		expect(FORMAT_OPTIONS.webp.mimeType).toBe("image/webp");
		expect(FORMAT_OPTIONS.png.mimeType).toBe("image/png");
		expect(FORMAT_OPTIONS.jpeg.mimeType).toBe("image/jpeg");
		expect(FORMAT_OPTIONS.avif.mimeType).toBe("image/avif");
		expect(FORMAT_OPTIONS.ico.mimeType).toBe("image/x-icon");
		expect(FORMAT_OPTIONS.bmp.mimeType).toBe("image/bmp");
	});
});
