import { describe, it, expect } from "vitest";
import {
	getCodecSupportMatrix,
	getWebApiAudit,
	getDisplayDiagnostics,
	getHardwareDiagnostics,
	generateDiagnosticReport,
} from "../utils/diagnostics";
import type {
	DisplayInfo,
	HardwareInfo,
	NetworkInfo,
	SpeedTestMetrics,
} from "../types";

describe("getCodecSupportMatrix", () => {
	it("returns audio and video codec definitions", () => {
		const codecs = getCodecSupportMatrix();
		expect(Array.isArray(codecs)).toBe(true);

		if (codecs.length > 0) {
			const av1 = codecs.find((c) => c.name.includes("AV1"));
			const aac = codecs.find((c) => c.name.includes("AAC"));
			expect(av1).toBeDefined();
			expect(aac).toBeDefined();
			expect(typeof av1?.isSupported).toBe("boolean");
		}
	});
});

describe("getWebApiAudit", () => {
	it("audits modern Web Platform APIs", () => {
		const apis = getWebApiAudit();
		expect(Array.isArray(apis)).toBe(true);

		if (apis.length > 0) {
			const wasm = apis.find((a) => a.name.includes("WebAssembly"));
			expect(wasm).toBeDefined();
			expect(typeof wasm?.isSupported).toBe("boolean");
		}
	});
});

describe("getDisplayDiagnostics & getHardwareDiagnostics", () => {
	it("returns safe display diagnostics with fallback values in test environment", () => {
		const disp = getDisplayDiagnostics(144);
		expect(disp.estimatedHz).toBe(144);
		expect(disp.screenWidth).toBeGreaterThan(0);
		expect(disp.screenHeight).toBeGreaterThan(0);
		expect(disp.dpr).toBeGreaterThanOrEqual(1);
		expect(typeof disp.isHdr).toBe("boolean");
	});

	it("returns hardware diagnostics safely without throwing", async () => {
		const hw = await getHardwareDiagnostics();
		expect(hw.cpuCores).toBeGreaterThanOrEqual(1);
		expect(typeof hw.gpuRenderer).toBe("string");
		expect(typeof hw.webgl2Supported).toBe("boolean");
	});
});

describe("generateDiagnosticReport", () => {
	it("bundles all diagnostics into a valid structured report", () => {
		const network: NetworkInfo = {
			online: true,
			effectiveType: "5g",
			downlinkMbps: 100,
			rttMs: 12,
			saveData: false,
			publicIp: "1.1.1.1",
		};

		const speedTest: SpeedTestMetrics = {
			phase: "completed",
			pingMs: 15,
			jitterMs: 1.2,
			downloadMbps: 120.5,
			uploadMbps: 45.2,
			progressPercent: 100,
		};

		const hardware: HardwareInfo = {
			cpuCores: 16,
			ramGb: 32,
			gpuVendor: "NVIDIA Corporation",
			gpuRenderer: "NVIDIA GeForce RTX 4090",
			maxTextureSize: 16384,
			webgl2Supported: true,
		};

		const display: DisplayInfo = {
			screenWidth: 3840,
			screenHeight: 2160,
			viewportWidth: 1920,
			viewportHeight: 1080,
			dpr: 2,
			colorDepth: 30,
			isHdr: true,
			colorGamut: "DCI-P3 (Wide)",
			estimatedHz: 144,
			touchPoints: 0,
			orientation: "landscape-primary",
		};

		const report = generateDiagnosticReport(
			network,
			speedTest,
			hardware,
			display,
			[],
			[],
		);

		expect(report.timestamp).toBeDefined();
		expect(report.network.publicIp).toBe("1.1.1.1");
		expect(report.speedTest.downloadMbps).toBe(120.5);
		expect(report.hardware.gpuRenderer).toContain("RTX 4090");
		expect(report.display.estimatedHz).toBe(144);
	});
});
