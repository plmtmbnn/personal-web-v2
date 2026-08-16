export type SpeedTestPhase =
	| "idle"
	| "ping"
	| "download"
	| "upload"
	| "completed"
	| "error";

export interface SpeedTestMetrics {
	phase: SpeedTestPhase;
	pingMs: number;
	jitterMs: number;
	downloadMbps: number;
	uploadMbps: number;
	progressPercent: number;
	error?: string;
}

export interface NetworkInfo {
	online: boolean;
	effectiveType: string;
	downlinkMbps: number;
	rttMs: number;
	saveData: boolean;
	publicIp?: string;
	city?: string;
	country?: string;
	org?: string;
}

export interface HardwareInfo {
	cpuCores: number;
	ramGb?: number;
	gpuVendor: string;
	gpuRenderer: string;
	maxTextureSize: number;
	webgl2Supported: boolean;
	batteryLevel?: number; // 0 to 100
	isCharging?: boolean;
}

export interface DisplayInfo {
	screenWidth: number;
	screenHeight: number;
	viewportWidth: number;
	viewportHeight: number;
	dpr: number;
	colorDepth: number;
	isHdr: boolean;
	colorGamut: string;
	estimatedHz: number;
	touchPoints: number;
	orientation: string;
}

export interface CodecItem {
	name: string;
	type: "video" | "audio";
	mimeType: string;
	isSupported: boolean;
}

export interface WebApiItem {
	name: string;
	category: string;
	isSupported: boolean;
	desc: string;
}

export interface DeviceDiagnosticReport {
	timestamp: string;
	userAgent: string;
	network: NetworkInfo;
	speedTest: SpeedTestMetrics;
	hardware: HardwareInfo;
	display: DisplayInfo;
	codecs: CodecItem[];
	webApis: WebApiItem[];
}
