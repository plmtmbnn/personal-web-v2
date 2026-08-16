import {
	type ConversionItem,
	FORMAT_OPTIONS,
	type SupportedFormat,
} from "../types";

/**
 * Replaces or appends the file extension to match the target format.
 */
export function getConvertedFilename(
	originalName: string,
	targetFormat: SupportedFormat,
): string {
	const details = FORMAT_OPTIONS[targetFormat];
	const extension = details ? details.extension : `.${targetFormat}`;

	const lastDot = originalName.lastIndexOf(".");
	if (lastDot <= 0) {
		return `${originalName}${extension}`;
	}

	return `${originalName.substring(0, lastDot)}${extension}`;
}

/**
 * Formats byte size into human-readable string (e.g. 1.25 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
	if (!bytes || bytes <= 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const unit = sizes[i] || "B";
	return `${parseFloat((bytes / k ** i).toFixed(decimals))} ${unit}`;
}

/**
 * Calculates compression percentage change between original and converted size.
 */
export function calculateSavings(
	originalBytes: number,
	convertedBytes: number,
): { percent: number; isReduced: boolean; text: string } {
	if (!originalBytes || !convertedBytes) {
		return { percent: 0, isReduced: true, text: "0%" };
	}

	const diff = originalBytes - convertedBytes;
	const percent = Math.round(Math.abs(diff / originalBytes) * 100);

	if (diff > 0) {
		return { percent, isReduced: true, text: `-${percent}%` };
	}
	if (diff < 0) {
		return { percent, isReduced: false, text: `+${percent}%` };
	}
	return { percent: 0, isReduced: true, text: "0%" };
}

/**
 * Generates an uncompressed standard Windows 24-bit / 32-bit BMP blob.
 */
export function createBmpBlob(
	canvas: HTMLCanvasElement,
	withAlpha = false,
): Blob {
	const width = canvas.width;
	const height = canvas.height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		throw new Error("Unable to obtain 2D canvas context for BMP export.");
	}

	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;

	const bpp = withAlpha ? 32 : 24;
	const rowSize = Math.floor((bpp * width + 31) / 32) * 4;
	const pixelArraySize = rowSize * height;
	const fileSize = 54 + pixelArraySize;

	const buffer = new ArrayBuffer(fileSize);
	const view = new DataView(buffer);

	// Bitmap File Header (14 bytes)
	view.setUint8(0, 0x42); // 'B'
	view.setUint8(1, 0x4d); // 'M'
	view.setUint32(2, fileSize, true);
	view.setUint16(6, 0, true); // Reserved
	view.setUint16(8, 0, true); // Reserved
	view.setUint32(10, 54, true); // Offset to pixel array

	// DIB Header - BITMAPINFOHEADER (40 bytes)
	view.setUint32(14, 40, true); // Header size
	view.setInt32(18, width, true);
	view.setInt32(22, height, true); // Positive height = bottom-up
	view.setUint16(26, 1, true); // Color planes
	view.setUint16(28, bpp, true); // Bits per pixel
	view.setUint32(30, 0, true); // BI_RGB (no compression)
	view.setUint32(34, pixelArraySize, true);
	view.setInt32(38, 2835, true); // ~72 DPI horizontal (pixels/meter)
	view.setInt32(42, 2835, true); // ~72 DPI vertical
	view.setUint32(46, 0, true); // Number of colors in palette
	view.setUint32(50, 0, true); // Important colors

	// Write pixels (BMP stores rows bottom-to-top, in BGR / BGRA order)
	let offset = 54;
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			const r = data[index] ?? 0;
			const g = data[index + 1] ?? 0;
			const b = data[index + 2] ?? 0;
			const a = data[index + 3] ?? 255;

			view.setUint8(offset++, b);
			view.setUint8(offset++, g);
			view.setUint8(offset++, r);
			if (withAlpha) {
				view.setUint8(offset++, a);
			}
		}

		// Row padding to multiple of 4 bytes (for 24-bit)
		if (!withAlpha) {
			const padding = rowSize - width * 3;
			for (let p = 0; p < padding; p++) {
				view.setUint8(offset++, 0);
			}
		}
	}

	return new Blob([buffer], { type: "image/bmp" });
}

/**
 * Generates a valid Windows Icon (.ico) file wrapping a PNG payload.
 */
export async function createIcoBlob(
	canvas: HTMLCanvasElement,
	targetSize?: number,
): Promise<Blob> {
	let sourceCanvas = canvas;

	// If a specific ICO size is requested (e.g. 16, 32, 48, 64, 128, 256)
	if (
		targetSize &&
		(canvas.width !== targetSize || canvas.height !== targetSize)
	) {
		const resizedCanvas = document.createElement("canvas");
		resizedCanvas.width = targetSize;
		resizedCanvas.height = targetSize;
		const ctx = resizedCanvas.getContext("2d");
		if (ctx) {
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "high";
			ctx.drawImage(canvas, 0, 0, targetSize, targetSize);
			sourceCanvas = resizedCanvas;
		}
	}

	// Modern Windows ICO files use embedded PNG payloads for crisp 32-bit RGBA
	const pngBlob = await new Promise<Blob>((resolve, reject) => {
		sourceCanvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("Failed to encode PNG for ICO payload."));
		}, "image/png");
	});

	const pngBuffer = await pngBlob.arrayBuffer();
	const pngBytes = new Uint8Array(pngBuffer);

	// ICO Header (6 bytes) + 1 Directory Entry (16 bytes) + PNG Data
	const icoSize = 6 + 16 + pngBytes.length;
	const buffer = new ArrayBuffer(icoSize);
	const view = new DataView(buffer);

	// ICO Header
	view.setUint16(0, 0, true); // Reserved (always 0)
	view.setUint16(2, 1, true); // Type (1 = icon)
	view.setUint16(4, 1, true); // Image count (1)

	// Directory Entry 0
	const widthByte = sourceCanvas.width >= 256 ? 0 : sourceCanvas.width;
	const heightByte = sourceCanvas.height >= 256 ? 0 : sourceCanvas.height;

	view.setUint8(6, widthByte); // Width (0 means 256)
	view.setUint8(7, heightByte); // Height (0 means 256)
	view.setUint8(8, 0); // Palette color count (0 if >= 8bpp)
	view.setUint8(9, 0); // Reserved (0)
	view.setUint16(10, 1, true); // Color planes
	view.setUint16(12, 32, true); // Bits per pixel
	view.setUint32(14, pngBytes.length, true); // Size of PNG payload
	view.setUint32(18, 22, true); // Offset of payload (6 + 16 = 22)

	// Append PNG payload
	const targetBytes = new Uint8Array(buffer, 22);
	targetBytes.set(pngBytes);

	return new Blob([buffer], { type: "image/x-icon" });
}

/**
 * Converts an image file to the designated target format with scale & quality settings.
 */
export async function convertImage(
	item: ConversionItem,
): Promise<{ blob: Blob; url: string; size: number }> {
	if (typeof window === "undefined") {
		throw new Error("Conversion is only supported in browser environment.");
	}

	return new Promise((resolve, reject) => {
		const img = new Image();
		const objectUrl = URL.createObjectURL(item.file);

		img.onload = async () => {
			try {
				URL.revokeObjectURL(objectUrl);

				const scale = Math.max(0.1, Math.min(1.0, item.scale || 1.0));
				const targetWidth = Math.max(1, Math.round(img.naturalWidth * scale));
				const targetHeight = Math.max(1, Math.round(img.naturalHeight * scale));

				const canvas = document.createElement("canvas");
				canvas.width = targetWidth;
				canvas.height = targetHeight;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					throw new Error("Unable to create canvas context.");
				}

				ctx.imageSmoothingEnabled = true;
				ctx.imageSmoothingQuality = "high";

				// Fill background if format does not support transparency (JPEG / BMP)
				const formatConfig = FORMAT_OPTIONS[item.targetFormat];
				if (
					formatConfig &&
					!formatConfig.supportsAlpha &&
					item.backgroundColor
				) {
					ctx.fillStyle = item.backgroundColor || "#ffffff";
					ctx.fillRect(0, 0, targetWidth, targetHeight);
				}

				// Draw image
				ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

				let convertedBlob: Blob;

				if (item.targetFormat === "bmp") {
					convertedBlob = createBmpBlob(canvas, false);
				} else if (item.targetFormat === "ico") {
					// For ICO, standardize to max 256x256 or current size
					const icoSize = Math.min(
						256,
						Math.max(16, Math.max(targetWidth, targetHeight)),
					);
					convertedBlob = await createIcoBlob(canvas, icoSize);
				} else {
					const mimeType = formatConfig?.mimeType || "image/png";
					const qualityRatio = Math.max(
						0.01,
						Math.min(1.0, (item.quality || 90) / 100),
					);

					convertedBlob = await new Promise<Blob>((resBlob, rejBlob) => {
						canvas.toBlob(
							(blob) => {
								if (blob) {
									resBlob(blob);
								} else {
									rejBlob(
										new Error(`Encoding to ${item.targetFormat} failed.`),
									);
								}
							},
							mimeType,
							formatConfig?.isLossy ? qualityRatio : undefined,
						);
					});
				}

				const convertedUrl = URL.createObjectURL(convertedBlob);
				resolve({
					blob: convertedBlob,
					url: convertedUrl,
					size: convertedBlob.size,
				});
			} catch (err) {
				reject(err);
			}
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("Failed to load image into memory for conversion."));
		};

		img.src = objectUrl;
	});
}
