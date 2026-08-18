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
	throughputHistory?: number[];
	error?: string;
}

export interface NetworkInfo {
	online: boolean;
	effectiveType: string;
	downlinkMbps: number;
	rttMs: number;
	saveData: boolean;
	publicIp?: string;
	isp?: string;
	asn?: string;
	city?: string;
	region?: string;
	country?: string;
	countryCode?: string;
	org?: string;
}

export interface SuitabilityMetric {
	title: string;
	verdict: string;
	status: "optimal" | "good" | "moderate" | "poor";
	details: string;
	iconName: "tv" | "gamepad" | "video" | "cloud-upload";
}

export interface ConnectionSuitability {
	grade: "A+" | "A" | "B" | "C" | "D" | "F";
	gradeLabel: string;
	metrics: SuitabilityMetric[];
}

export type SpeakerChannel = "left" | "right" | "both" | "sweep";

export interface MicTelemetry {
	active: boolean;
	peakLevel: number; // 0 to 100%
	volumeDb: number; // dBFS (-60 to 0)
	sampleRate: number;
	channelCount: number;
	deviceLabel: string;
}

export interface CameraDeviceInfo {
	deviceId: string;
	label: string;
	supportedResolutions: string[];
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
	suitability?: ConnectionSuitability;
	hardware: HardwareInfo;
	display: DisplayInfo;
	codecs: CodecItem[];
	webApis: WebApiItem[];
}
