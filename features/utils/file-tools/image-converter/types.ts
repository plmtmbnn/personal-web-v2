export type SupportedFormat = "png" | "jpeg" | "webp" | "avif" | "bmp" | "ico";

export type DetectedFormat =
	| SupportedFormat
	| "gif"
	| "svg"
	| "tiff"
	| "heic"
	| "unknown";

export interface ImageValidationResult {
	isValid: boolean;
	detectedFormat: DetectedFormat;
	mimeType?: string;
	dimensions?: {
		width: number;
		height: number;
	};
	error?: string;
}

export type ConversionStatus =
	| "validating"
	| "ready"
	| "converting"
	| "converted"
	| "error";

export interface ConversionItem {
	id: string;
	file: File;
	originalName: string;
	originalSize: number;
	previewUrl: string;
	validation: ImageValidationResult;
	status: ConversionStatus;
	targetFormat: SupportedFormat;
	quality: number; // 1 to 100
	scale: number; // 0.25, 0.5, 0.75, 1
	backgroundColor: string; // for filling transparent backgrounds when converting to JPEG/BMP
	convertedBlob?: Blob;
	convertedUrl?: string;
	convertedSize?: number;
	error?: string;
}

export interface FormatDetails {
	format: SupportedFormat;
	label: string;
	extension: string;
	mimeType: string;
	isLossy: boolean;
	supportsAlpha: boolean;
	description: string;
	badgeBg: string;
	badgeText: string;
}

export const FORMAT_OPTIONS: Record<SupportedFormat, FormatDetails> = {
	webp: {
		format: "webp",
		label: "WebP",
		extension: ".webp",
		mimeType: "image/webp",
		isLossy: true,
		supportsAlpha: true,
		description: "Next-gen web format with high compression & alpha",
		badgeBg: "bg-emerald-500/10",
		badgeText: "text-emerald-600",
	},
	png: {
		format: "png",
		label: "PNG",
		extension: ".png",
		mimeType: "image/png",
		isLossy: false,
		supportsAlpha: true,
		description: "Lossless compression with crisp edges & transparency",
		badgeBg: "bg-blue-500/10",
		badgeText: "text-blue-600",
	},
	jpeg: {
		format: "jpeg",
		label: "JPEG / JPG",
		extension: ".jpg",
		mimeType: "image/jpeg",
		isLossy: true,
		supportsAlpha: false,
		description: "Universal photo format with high compression ratio",
		badgeBg: "bg-amber-500/10",
		badgeText: "text-amber-600",
	},
	avif: {
		format: "avif",
		label: "AVIF",
		extension: ".avif",
		mimeType: "image/avif",
		isLossy: true,
		supportsAlpha: true,
		description: "Ultra-high compression efficiency for modern browsers",
		badgeBg: "bg-purple-500/10",
		badgeText: "text-purple-600",
	},
	ico: {
		format: "ico",
		label: "ICO (Favicon)",
		extension: ".ico",
		mimeType: "image/x-icon",
		isLossy: false,
		supportsAlpha: true,
		description: "Standard website favicon and Windows application icon",
		badgeBg: "bg-indigo-500/10",
		badgeText: "text-indigo-600",
	},
	bmp: {
		format: "bmp",
		label: "BMP",
		extension: ".bmp",
		mimeType: "image/bmp",
		isLossy: false,
		supportsAlpha: false,
		description: "Uncompressed Windows Bitmap image",
		badgeBg: "bg-slate-500/10",
		badgeText: "text-slate-600",
	},
};
