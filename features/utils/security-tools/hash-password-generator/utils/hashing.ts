import type { HashAlgorithm, HashOutputFormat, HashResult } from "../types";

/**
 * Standard RFC 1321 MD5 message-digest algorithm in pure TypeScript.
 */
export function computeMd5(bytes: Uint8Array): string {
	function safeAdd(x: number, y: number): number {
		const lsw = (x & 0xffff) + (y & 0xffff);
		const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xffff);
	}

	function bitRotateLeft(num: number, cnt: number): number {
		return (num << cnt) | (num >>> (32 - cnt));
	}

	function md5cmn(
		q: number,
		a: number,
		b: number,
		x: number,
		s: number,
		t: number,
	): number {
		return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
	}

	function md5ff(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number,
	): number {
		return md5cmn((b & c) | (~b & d), a, b, x, s, t);
	}

	function md5gg(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number,
	): number {
		return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
	}

	function md5hh(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number,
	): number {
		return md5cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function md5ii(
		a: number,
		b: number,
		c: number,
		d: number,
		x: number,
		s: number,
		t: number,
	): number {
		return md5cmn(c ^ (b | ~d), a, b, x, s, t);
	}

	const nblk = ((bytes.length + 8) >> 6) + 1;
	const blks = new Array(nblk * 16).fill(0);
	for (let i = 0; i < bytes.length; i++) {
		blks[i >> 2] |= (bytes[i] ?? 0) << ((i % 4) * 8);
	}
	blks[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
	blks[nblk * 16 - 2] = bytes.length * 8;

	let a = 1732584193;
	let b = -271733879;
	let c = -1732584194;
	let d = 271733878;

	for (let i = 0; i < blks.length; i += 16) {
		const olda = a;
		const oldb = b;
		const oldc = c;
		const oldd = d;

		const x0 = blks[i] ?? 0;
		const x1 = blks[i + 1] ?? 0;
		const x2 = blks[i + 2] ?? 0;
		const x3 = blks[i + 3] ?? 0;
		const x4 = blks[i + 4] ?? 0;
		const x5 = blks[i + 5] ?? 0;
		const x6 = blks[i + 6] ?? 0;
		const x7 = blks[i + 7] ?? 0;
		const x8 = blks[i + 8] ?? 0;
		const x9 = blks[i + 9] ?? 0;
		const x10 = blks[i + 10] ?? 0;
		const x11 = blks[i + 11] ?? 0;
		const x12 = blks[i + 12] ?? 0;
		const x13 = blks[i + 13] ?? 0;
		const x14 = blks[i + 14] ?? 0;
		const x15 = blks[i + 15] ?? 0;

		a = md5ff(a, b, c, d, x0, 7, -680876936);
		d = md5ff(d, a, b, c, x1, 12, -389564586);
		c = md5ff(c, d, a, b, x2, 17, 606105819);
		b = md5ff(b, c, d, a, x3, 22, -1044525330);
		a = md5ff(a, b, c, d, x4, 7, -176418897);
		d = md5ff(d, a, b, c, x5, 12, 1200080426);
		c = md5ff(c, d, a, b, x6, 17, -1473231341);
		b = md5ff(b, c, d, a, x7, 22, -45705983);
		a = md5ff(a, b, c, d, x8, 7, 1770035416);
		d = md5ff(d, a, b, c, x9, 12, -1958414417);
		c = md5ff(c, d, a, b, x10, 17, -42063);
		b = md5ff(b, c, d, a, x11, 22, -1990404162);
		a = md5ff(a, b, c, d, x12, 7, 1804603682);
		d = md5ff(d, a, b, c, x13, 12, -40341101);
		c = md5ff(c, d, a, b, x14, 17, -1502002290);
		b = md5ff(b, c, d, a, x15, 22, 1236535329);

		a = md5gg(a, b, c, d, x1, 5, -165796510);
		d = md5gg(d, a, b, c, x6, 9, -1069501632);
		c = md5gg(c, d, a, b, x11, 14, 643717713);
		b = md5gg(b, c, d, a, x0, 20, -373897302);
		a = md5gg(a, b, c, d, x5, 5, -701558691);
		d = md5gg(d, a, b, c, x10, 9, 38016083);
		c = md5gg(c, d, a, b, x15, 14, -660478335);
		b = md5gg(b, c, d, a, x4, 20, -405537848);
		a = md5gg(a, b, c, d, x9, 5, 568446438);
		d = md5gg(d, a, b, c, x14, 9, -1019803690);
		c = md5gg(c, d, a, b, x3, 14, -187363961);
		b = md5gg(b, c, d, a, x8, 20, 1163531501);
		a = md5gg(a, b, c, d, x13, 5, -1444681467);
		d = md5gg(d, a, b, c, x2, 9, -51403784);
		c = md5gg(c, d, a, b, x7, 14, 1735328473);
		b = md5gg(b, c, d, a, x12, 20, -1926607734);

		a = md5hh(a, b, c, d, x5, 4, -378558);
		d = md5hh(d, a, b, c, x8, 11, -2022574463);
		c = md5hh(c, d, a, b, x11, 16, 1839030562);
		b = md5hh(b, c, d, a, x14, 23, -35309556);
		a = md5hh(a, b, c, d, x1, 4, -1530992060);
		d = md5hh(d, a, b, c, x4, 11, 1272893353);
		c = md5hh(c, d, a, b, x7, 16, -155497632);
		b = md5hh(b, c, d, a, x10, 23, -1094730640);
		a = md5hh(a, b, c, d, x13, 4, 681279174);
		d = md5hh(d, a, b, c, x0, 11, -358537222);
		c = md5hh(c, d, a, b, x3, 16, -722521979);
		b = md5hh(b, c, d, a, x6, 23, 76029189);
		a = md5hh(a, b, c, d, x9, 4, -640364487);
		d = md5hh(d, a, b, c, x12, 11, -421815835);
		c = md5hh(c, d, a, b, x15, 16, 530742520);
		b = md5hh(b, c, d, a, x2, 23, -995338651);

		a = md5ii(a, b, c, d, x0, 6, -198630844);
		d = md5ii(d, a, b, c, x7, 10, 1126891415);
		c = md5ii(c, d, a, b, x14, 15, -1416354905);
		b = md5ii(b, c, d, a, x5, 21, -57434055);
		a = md5ii(a, b, c, d, x12, 6, 1700485571);
		d = md5ii(d, a, b, c, x3, 10, -1894986606);
		c = md5ii(c, d, a, b, x10, 15, -1051523);
		b = md5ii(b, c, d, a, x1, 21, -2054922799);
		a = md5ii(a, b, c, d, x8, 6, 1873313359);
		d = md5ii(d, a, b, c, x15, 10, -30611744);
		c = md5ii(c, d, a, b, x6, 15, -1560198380);
		b = md5ii(b, c, d, a, x13, 21, 1309151649);
		a = md5ii(a, b, c, d, x4, 6, -145523070);
		d = md5ii(d, a, b, c, x11, 10, -1120210379);
		c = md5ii(c, d, a, b, x2, 15, 718787259);
		b = md5ii(b, c, d, a, x9, 21, -343485551);

		a = safeAdd(a, olda);
		b = safeAdd(b, oldb);
		c = safeAdd(c, oldc);
		d = safeAdd(d, oldd);
	}

	const hexChars = "0123456789abcdef";
	let hex = "";
	const values = [a, b, c, d];
	for (let i = 0; i < 4; i++) {
		const val = values[i] ?? 0;
		for (let j = 0; j < 4; j++) {
			const byte = (val >> (j * 8)) & 0xff;
			hex += hexChars[(byte >> 4) & 0x0f] + hexChars[byte & 0x0f];
		}
	}
	return hex;
}

/**
 * Converts a byte buffer to formatted string output (hex or base64).
 */
export function formatHashOutput(
	buffer: ArrayBuffer,
	format: HashOutputFormat = "hex-lower",
): string {
	const bytes = new Uint8Array(buffer);
	if (format === "base64") {
		let binary = "";
		for (let i = 0; i < bytes.length; i++) {
			binary += String.fromCharCode(bytes[i] ?? 0);
		}
		return btoa(binary);
	}

	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return format === "hex-upper" ? hex.toUpperCase() : hex.toLowerCase();
}

/**
 * Computes cryptographic hash or HMAC for text or ArrayBuffer using Web Crypto API.
 */
export async function computeHash(
	input: string | ArrayBuffer,
	algorithm: HashAlgorithm = "SHA-256",
	secretKey = "",
	outputFormat: HashOutputFormat = "hex-lower",
	expectedChecksum = "",
): Promise<HashResult> {
	const startTime = performance.now();

	const buffer =
		typeof input === "string" ? new TextEncoder().encode(input).buffer : input;
	const bytes = new Uint8Array(buffer);
	const inputBytes = bytes.length;

	let hashOutput = "";

	// Handle MD5 (Pure TS implementation)
	if (algorithm === "MD5") {
		let rawHex = computeMd5(bytes);
		if (outputFormat === "hex-upper") {
			rawHex = rawHex.toUpperCase();
		} else if (outputFormat === "base64") {
			// Convert hex string to base64
			const match = rawHex.match(/.{1,2}/g) || [];
			const bin = match
				.map((b) => String.fromCharCode(parseInt(b, 16)))
				.join("");
			rawHex = btoa(bin);
		}
		hashOutput = rawHex;
	} else if (secretKey.trim() !== "") {
		// HMAC with Web Crypto API
		const keyBuffer = new TextEncoder().encode(secretKey);
		const cryptoKey = await crypto.subtle.importKey(
			"raw",
			keyBuffer,
			{
				name: "HMAC",
				hash: { name: algorithm },
			},
			false,
			["sign"],
		);

		const signature = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
		hashOutput = formatHashOutput(signature, outputFormat);
	} else {
		// Standard Hash Digest
		const digest = await crypto.subtle.digest(algorithm, buffer);
		hashOutput = formatHashOutput(digest, outputFormat);
	}

	const executionTimeMs =
		Math.round((performance.now() - startTime) * 100) / 100;

	let matchesExpected: boolean | undefined;
	if (expectedChecksum.trim()) {
		matchesExpected = compareChecksums(hashOutput, expectedChecksum);
	}

	return {
		algorithm,
		hash: hashOutput,
		inputBytes,
		executionTimeMs,
		isHmac: Boolean(secretKey.trim()),
		matchesExpected,
	};
}

/**
 * Normalizes and compares two hash checksums (case-insensitive and trimmed).
 */
export function compareChecksums(
	computedHash: string,
	expectedHash: string,
): boolean {
	const cleanComputed = computedHash.trim().toLowerCase();
	const cleanExpected = expectedHash.trim().toLowerCase();
	if (!cleanComputed || !cleanExpected) return false;
	return cleanComputed === cleanExpected;
}
