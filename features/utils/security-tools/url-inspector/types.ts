export type RiskLevel = "SAFE" | "LOW" | "SUSPICIOUS" | "HIGH" | "CRITICAL";

export interface RiskFlag {
	id: string;
	title: string;
	description: string;
	severity: "info" | "low" | "medium" | "high" | "critical";
	category: "format" | "homograph" | "shortener" | "domain" | "protocol";
}

export interface URLStructure {
	protocol: string;
	hostname: string;
	port: string;
	pathname: string;
	searchParams: Record<string, string>;
	hash: string;
	isIpAddress: boolean;
	punycodeDecoded?: string;
	isPunycode: boolean;
	subdomainCount: number;
	tld: string;
}

export interface URLAnalysisResult {
	originalUrl: string;
	isValid: boolean;
	validationError?: string;
	riskScore: number; // 0 to 100
	riskLevel: RiskLevel;
	structure?: URLStructure;
	flags: RiskFlag[];
	isShortened: boolean;
	shortenerDomain?: string;
	unmaskedUrl?: string;
	redirectChain?: string[];
}

export interface PresetURL {
	label: string;
	url: string;
	type: "normal" | "shortened" | "homograph" | "suspicious" | "ip";
	description: string;
}
