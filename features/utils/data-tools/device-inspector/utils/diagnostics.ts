import type {
	CodecItem,
	DeviceDiagnosticReport,
	DisplayInfo,
	HardwareInfo,
	NetworkInfo,
	SpeedTestMetrics,
	WebApiItem,
} from "../types";

/**
 * Extracts hardware telemetry (CPU, RAM, GPU WebGL renderer, battery).
 */
export async function getHardwareDiagnostics(): Promise<HardwareInfo> {
	if (typeof window === "undefined") {
		return {
			cpuCores: 8,
			ramGb: 16,
			gpuVendor: "Unknown",
			gpuRenderer: "Server-Side Environment",
			maxTextureSize: 4096,
			webgl2Supported: true,
		};
	}

	let gpuVendor = "Standard Integrated / Generic";
	let gpuRenderer = "WebGL Software Accelerator";
	let maxTextureSize = 4096;
	let webgl2Supported = false;

	try {
		const canvas = document.createElement("canvas");
		webgl2Supported = Boolean(canvas.getContext("webgl2"));

		const gl =
			canvas.getContext("webgl") ||
			(canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

		if (gl) {
			maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) || 4096;
			const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
			if (debugInfo) {
				gpuVendor =
					gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
				gpuRenderer =
					gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
			}
		}
	} catch {
		// Fallback
	}

	const nav = navigator as unknown as {
		hardwareConcurrency?: number;
		deviceMemory?: number;
		getBattery?: () => Promise<{
			level: number;
			charging: boolean;
		}>;
	};

	let batteryLevel: number | undefined;
	let isCharging: boolean | undefined;

	if (typeof nav.getBattery === "function") {
		try {
			const battery = await nav.getBattery();
			batteryLevel = Math.round(battery.level * 100);
			isCharging = battery.charging;
		} catch {
			// Battery API not supported or permissions restricted
		}
	}

	return {
		cpuCores: nav.hardwareConcurrency || 4,
		ramGb: nav.deviceMemory || 8,
		gpuVendor,
		gpuRenderer,
		maxTextureSize,
		webgl2Supported,
		batteryLevel,
		isCharging,
	};
}

/**
 * Extracts display and screen capabilities.
 */
export function getDisplayDiagnostics(estimatedHz = 60): DisplayInfo {
	if (typeof window === "undefined") {
		return {
			screenWidth: 1920,
			screenHeight: 1080,
			viewportWidth: 1920,
			viewportHeight: 1080,
			dpr: 1,
			colorDepth: 24,
			isHdr: false,
			colorGamut: "sRGB",
			estimatedHz: 60,
			touchPoints: 0,
			orientation: "landscape-primary",
		};
	}

	const hasMatchMedia = typeof window.matchMedia === "function";
	const isHdr = hasMatchMedia
		? Boolean(window.matchMedia("(dynamic-range: high)").matches)
		: false;
	const isP3 = hasMatchMedia
		? Boolean(window.matchMedia("(color-gamut: p3)").matches)
		: false;
	const isRec2020 = hasMatchMedia
		? Boolean(window.matchMedia("(color-gamut: rec2020)").matches)
		: false;
	const colorGamut = isRec2020
		? "Rec. 2020"
		: isP3
			? "DCI-P3 (Wide)"
			: "sRGB (Standard)";

	const orientation =
		window.screen.orientation?.type ||
		(window.innerWidth > window.innerHeight ? "landscape" : "portrait");

	return {
		screenWidth: window.screen?.width || 1920,
		screenHeight: window.screen?.height || 1080,
		viewportWidth: window.innerWidth || 1920,
		viewportHeight: window.innerHeight || 1080,
		dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
		colorDepth: window.screen?.colorDepth || 24,
		isHdr,
		colorGamut,
		estimatedHz,
		touchPoints: navigator.maxTouchPoints || 0,
		orientation,
	};
}

/**
 * Estimates monitor refresh rate (Hz) using requestAnimationFrame timing.
 */
export function estimateRefreshRate(): Promise<number> {
	return new Promise((resolve) => {
		if (typeof window === "undefined" || !window.requestAnimationFrame) {
			return resolve(60);
		}

		let frameCount = 0;
		let startTime = performance.now();
		const sampleFrames = 45;

		function onFrame() {
			frameCount++;
			if (frameCount === 1) {
				startTime = performance.now();
			}

			if (frameCount >= sampleFrames) {
				const elapsedSec = (performance.now() - startTime) / 1000;
				const calculatedHz = Math.round((sampleFrames - 1) / elapsedSec);

				// Snap to standard monitor refresh rates
				const standardRates = [60, 75, 90, 120, 144, 165, 240, 360];
				let closest = 60;
				let minDiff = Infinity;
				for (const rate of standardRates) {
					const diff = Math.abs(calculatedHz - rate);
					if (diff < minDiff && diff <= 12) {
						minDiff = diff;
						closest = rate;
					}
				}
				resolve(closest || calculatedHz);
			} else {
				requestAnimationFrame(onFrame);
			}
		}

		requestAnimationFrame(onFrame);
	});
}

/**
 * Evaluates audio & video codec decoding support matrix.
 */
export function getCodecSupportMatrix(): CodecItem[] {
	if (typeof document === "undefined") {
		return [];
	}

	const video = document.createElement("video");
	const audio = document.createElement("audio");

	const codecs: Array<{
		name: string;
		type: "video" | "audio";
		mimeType: string;
	}> = [
		// Video
		{
			name: "AV1 (Next-Gen)",
			type: "video",
			mimeType: 'video/mp4; codecs="av01.0.05M.08"',
		},
		{
			name: "H.264 / AVC (Universal)",
			type: "video",
			mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
		},
		{
			name: "HEVC / H.265 (4K/8K)",
			type: "video",
			mimeType: 'video/mp4; codecs="hvc1.1.6.L93.B0"',
		},
		{
			name: "VP9 (YouTube)",
			type: "video",
			mimeType: 'video/webm; codecs="vp9"',
		},
		{
			name: "VP8 / WebM",
			type: "video",
			mimeType: 'video/webm; codecs="vp8, vorbis"',
		},
		// Audio
		{
			name: "AAC (Standard)",
			type: "audio",
			mimeType: 'audio/mp4; codecs="mp4a.40.2"',
		},
		{
			name: "MP3 (MPEG Audio)",
			type: "audio",
			mimeType: "audio/mpeg",
		},
		{
			name: "Opus (Low Latency)",
			type: "audio",
			mimeType: 'audio/ogg; codecs="opus"',
		},
		{
			name: "FLAC (Lossless)",
			type: "audio",
			mimeType: "audio/flac",
		},
		{
			name: "Vorbis",
			type: "audio",
			mimeType: 'audio/ogg; codecs="vorbis"',
		},
		{
			name: "WAV (Uncompressed)",
			type: "audio",
			mimeType: "audio/wav",
		},
	];

	return codecs.map((c) => {
		const targetEl = c.type === "video" ? video : audio;
		const canPlay = targetEl.canPlayType(c.mimeType);
		const isSupported = canPlay === "probably" || canPlay === "maybe";
		return {
			...c,
			isSupported,
		};
	});
}

/**
 * Audits modern Web Platform API capabilities.
 */
export function getWebApiAudit(): WebApiItem[] {
	if (typeof window === "undefined") return [];

	const apis: Array<{
		name: string;
		category: string;
		isSupported: boolean;
		desc: string;
	}> = [
		{
			name: "WebAssembly (WASM)",
			category: "Compute",
			isSupported: typeof WebAssembly === "object",
			desc: "Near-native binary execution in the browser.",
		},
		{
			name: "WebGPU",
			category: "Compute",
			isSupported: "gpu" in navigator,
			desc: "Next-gen low-level GPU acceleration & AI compute.",
		},
		{
			name: "Web Audio API",
			category: "Multimedia",
			isSupported: "AudioContext" in window || "webkitAudioContext" in window,
			desc: "Advanced multi-channel audio synthesis and processing.",
		},
		{
			name: "Web Workers",
			category: "Concurrency",
			isSupported: typeof Worker !== "undefined",
			desc: "Multi-threaded background task processing without UI blocking.",
		},
		{
			name: "Service Workers",
			category: "Offline",
			isSupported: "serviceWorker" in navigator,
			desc: "Offline caching, background sync, and PWA capabilities.",
		},
		{
			name: "WebRTC",
			category: "Network",
			isSupported:
				"RTCPeerConnection" in window &&
				"getUserMedia" in (navigator.mediaDevices || {}),
			desc: "Real-time peer-to-peer audio, video, and data streaming.",
		},
		{
			name: "Wake Lock API",
			category: "Hardware",
			isSupported: "wakeLock" in navigator,
			desc: "Prevents screen from dimming during training or active tools.",
		},
		{
			name: "IndexedDB",
			category: "Storage",
			isSupported: "indexedDB" in window,
			desc: "High-capacity client-side transactional object database.",
		},
		{
			name: "Clipboard API",
			category: "Productivity",
			isSupported: "clipboard" in navigator,
			desc: "Asynchronous programmatic clipboard read and write.",
		},
		{
			name: "Geolocation API",
			category: "Sensors",
			isSupported: "geolocation" in navigator,
			desc: "Hardware GPS and network location positioning.",
		},
		{
			name: "Web Cryptography (Subtle)",
			category: "Security",
			isSupported: "crypto" in window && "subtle" in window.crypto,
			desc: "Hardware-accelerated cryptographic primitives and digests.",
		},
		{
			name: "Fullscreen API",
			category: "Display",
			isSupported: "fullscreenEnabled" in document,
			desc: "Immersive fullscreen presentation mode.",
		},
	];

	return apis;
}

/**
 * Bundles all telemetry into a structured diagnostic report.
 */
export function generateDiagnosticReport(
	network: NetworkInfo,
	speedTest: SpeedTestMetrics,
	hardware: HardwareInfo,
	display: DisplayInfo,
	codecs: CodecItem[],
	webApis: WebApiItem[],
): DeviceDiagnosticReport {
	return {
		timestamp: new Date().toISOString(),
		userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
		network,
		speedTest,
		hardware,
		display,
		codecs,
		webApis,
	};
}
