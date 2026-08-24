import { describe, it, expect } from "vitest";
import { analyzeURL } from "../utils/analyzer";

describe("URL Inspector Analyzer", () => {
	it("flags empty URLs as invalid", () => {
		const res = analyzeURL("");
		expect(res.isValid).toBe(false);
		expect(res.riskLevel).toBe("SAFE");
	});

	it("detects dangerous script pseudo-protocols", () => {
		const res = analyzeURL("javascript://alert(1)");
		expect(res.isValid).toBe(false);
		expect(res.riskScore).toBe(100);
		expect(res.riskLevel).toBe("CRITICAL");
		expect(res.flags.some((f) => f.id === "dangerous-protocol")).toBe(true);
	});

	it("identifies safe standard HTTPS websites", () => {
		const res = analyzeURL("https://google.com/search?q=test");
		expect(res.isValid).toBe(true);
		expect(res.riskScore).toBe(0);
		expect(res.riskLevel).toBe("SAFE");
		expect(res.structure?.hostname).toBe("google.com");
		expect(res.structure?.protocol).toBe("https");
	});

	it("flags insecure HTTP connections", () => {
		const res = analyzeURL("http://example.com");
		expect(res.isValid).toBe(true);
		expect(res.flags.some((f) => f.id === "insecure-http")).toBe(true);
		expect(res.riskScore).toBeGreaterThan(0);
	});

	it("detects raw IP address hostnames", () => {
		const res = analyzeURL("http://192.168.1.1/admin");
		expect(res.flags.some((f) => f.id === "raw-ip-domain")).toBe(true);
		expect(res.structure?.isIpAddress).toBe(true);
	});

	it("detects Punycode IDN homograph attacks", () => {
		const res = analyzeURL("https://xn--pple-43d.com");
		expect(res.flags.some((f) => f.id === "punycode-homograph")).toBe(true);
		expect(res.structure?.isPunycode).toBe(true);
	});

	it("detects brand impersonation / typosquatting", () => {
		const res = analyzeURL("https://paypal-security-update.xyz/login");
		expect(res.flags.some((f) => f.id === "brand-impersonation")).toBe(true);
		expect(res.flags.some((f) => f.id === "suspicious-tld")).toBe(true);
		expect(res.riskLevel).toBe("HIGH");
	});

	it("detects embedded user credentials in URL", () => {
		const res = analyzeURL("https://admin:password@evil.com/dashboard");
		expect(res.flags.some((f) => f.id === "userinfo-embedding")).toBe(true);
	});

	it("detects known URL shorteners", () => {
		const res = analyzeURL("https://bit.ly/xyz123");
		expect(res.isShortened).toBe(true);
		expect(res.shortenerDomain).toBe("bit.ly");
		expect(res.flags.some((f) => f.id === "shortened-url")).toBe(true);
	});

	it("detects double percent encoding or null bytes", () => {
		const res = analyzeURL(
			"https://example.com/download%00.php?file=%252e%252e",
		);
		expect(res.flags.some((f) => f.id === "double-encoding-nullbyte")).toBe(
			true,
		);
	});
});
