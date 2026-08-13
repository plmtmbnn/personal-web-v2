import type {
	URLAnalysisResult,
	URLStructure,
	RiskFlag,
	RiskLevel,
} from "../types";

const KNOWN_SHORTENERS = new Set([
	"bit.ly",
	"tinyurl.com",
	"t.co",
	"goo.gl",
	"is.gd",
	"ow.ly",
	"buff.ly",
	"cutt.ly",
	"rb.gy",
	"shorturl.at",
	"v.gd",
	"bl.ink",
	"rebrand.ly",
	"qr.ae",
	"adf.ly",
	"bc.vc",
	"po.st",
]);

const HIGH_RISK_TLDS = new Set([
	"xyz",
	"top",
	"tk",
	"ml",
	"cf",
	"gq",
	"work",
	"zip",
	"mov",
	"country",
	"stream",
	"download",
	"racing",
	"win",
	"bid",
	"men",
	"date",
	"loan",
]);

const MAJOR_BRANDS = [
	"paypal",
	"google",
	"apple",
	"microsoft",
	"amazon",
	"facebook",
	"instagram",
	"netflix",
	"binance",
	"coinbase",
	"chase",
	"bankofamerica",
	"wells-fargo",
	"stripe",
];

/**
 * Analyzes a given URL string for safety threats, look-alike homographs, shortener obfuscation, and structural flaws.
 */
export function analyzeURL(inputUrl: string): URLAnalysisResult {
	const raw = inputUrl.trim();

	// 1. Basic String Sanity Check
	if (!raw) {
		return {
			originalUrl: inputUrl,
			isValid: false,
			validationError: "URL string is empty.",
			riskScore: 0,
			riskLevel: "SAFE",
			flags: [],
			isShortened: false,
		};
	}

	// Check for illegal control characters
	// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally scanning for illegal control characters
	if (/[\x00-\x1F\x7F]/.test(raw)) {
		return {
			originalUrl: inputUrl,
			isValid: false,
			validationError: "URL contains illegal control characters.",
			riskScore: 90,
			riskLevel: "CRITICAL",
			flags: [
				{
					id: "control-chars",
					title: "Control Characters Detected",
					description:
						"The URL string contains hidden control characters often used to evade security scanners.",
					severity: "critical",
					category: "format",
				},
			],
			isShortened: false,
		};
	}

	// Check for missing protocol and prepend http for parsing
	let formattedUrl = raw;
	if (!/^https?:\/\//i.test(formattedUrl)) {
		if (/^[a-z0-9]+:\/\//i.test(formattedUrl)) {
			// Non HTTP protocol (e.g. ftp://, javascript:, data:)
			if (/^(javascript|data|vbscript):/i.test(formattedUrl)) {
				return {
					originalUrl: inputUrl,
					isValid: false,
					validationError:
						"Dangerous pseudo-protocol detected (javascript/data URI).",
					riskScore: 100,
					riskLevel: "CRITICAL",
					flags: [
						{
							id: "dangerous-protocol",
							title: "Executable / Script Protocol",
							description:
								"URL uses javascript: or data: scheme which can execute malicious code in the browser.",
							severity: "critical",
							category: "protocol",
						},
					],
					isShortened: false,
				};
			}
		} else {
			formattedUrl = `https://${formattedUrl}`;
		}
	}

	let parsed: URL;
	try {
		parsed = new URL(formattedUrl);
	} catch (_e) {
		return {
			originalUrl: inputUrl,
			isValid: false,
			validationError:
				"Invalid URL format. Could not parse hostname or structure.",
			riskScore: 80,
			riskLevel: "HIGH",
			flags: [
				{
					id: "malformed-url",
					title: "Malformed URL Structure",
					description:
						"The input string breaks standard RFC 3986 URL syntax rules.",
					severity: "high",
					category: "format",
				},
			],
			isShortened: false,
		};
	}

	const flags: RiskFlag[] = [];
	let score = 0;

	// Extract structure components
	const hostname = parsed.hostname.toLowerCase();
	const protocol = parsed.protocol.toLowerCase();
	const port = parsed.port;
	const isIpAddress =
		/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":");
	const isPunycode = hostname.startsWith("xn--");

	// Subdomains calculation
	const hostParts = hostname.split(".");
	const tld = hostParts.length > 1 ? hostParts[hostParts.length - 1] : "";
	const subdomainCount = Math.max(0, hostParts.length - 2);

	// 2. Protocol Safety Check
	if (protocol === "http:") {
		score += 15;
		flags.push({
			id: "insecure-http",
			title: "Unencrypted HTTP Protocol",
			description:
				"URL uses unencrypted HTTP instead of secure HTTPS. Data sent over this link can be intercepted.",
			severity: "medium",
			category: "protocol",
		});
	}

	// 3. IP Address Domain Check
	if (isIpAddress) {
		score += 35;
		flags.push({
			id: "raw-ip-domain",
			title: "Raw IP Address Host",
			description:
				"Host uses a raw IP address instead of a domain name. Often used by malware command servers to bypass DNS filtering.",
			severity: "high",
			category: "domain",
		});
	}

	// 4. Punycode & Homograph Attack Check
	if (isPunycode) {
		score += 40;
		flags.push({
			id: "punycode-homograph",
			title: "IDN Punycode Homograph Attack",
			description:
				"Domain uses Punycode (xn--) encoding to display non-Latin look-alike characters (e.g., Cyrillic 'а' replacing Latin 'a').",
			severity: "critical",
			category: "homograph",
		});
	} else {
		// Check for non-ASCII characters in raw hostname
		// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentionally scanning for non-ASCII characters
		if (/[^\x00-\x7F]/.test(hostname)) {
			score += 35;
			flags.push({
				id: "unicode-homograph",
				title: "Non-ASCII Unicode Characters in Host",
				description:
					"Hostname contains non-ASCII characters which can be visually confused with legit brand names.",
				severity: "high",
				category: "homograph",
			});
		}
	}

	// 5. Typosquatting / Brand Impersonation Check
	const matchedBrand = MAJOR_BRANDS.find((brand) => hostname.includes(brand));
	if (matchedBrand) {
		const isOfficial =
			hostname === `${matchedBrand}.com` ||
			hostname.endsWith(`.${matchedBrand}.com`) ||
			hostname === `${matchedBrand}.org` ||
			hostname.endsWith(`.${matchedBrand}.org`);

		if (!isOfficial) {
			score += 40;
			flags.push({
				id: "brand-impersonation",
				title: `Potential ${matchedBrand.toUpperCase()} Impersonation`,
				description: `Domain contains the brand name '${matchedBrand}', but does not belong to official ${matchedBrand} domains.`,
				severity: "critical",
				category: "domain",
			});
		}
	}

	// 6. Suspicious TLD Check
	if (HIGH_RISK_TLDS.has(tld)) {
		score += 25;
		flags.push({
			id: "suspicious-tld",
			title: `High-Risk Top Level Domain (.${tld})`,
			description: `Top-level domain .${tld} is frequently associated with spam, disposable phishing sites, or malware distribution.`,
			severity: "medium",
			category: "domain",
		});
	}

	// 7. Excessive Subdomains Check
	if (subdomainCount >= 3) {
		score += 20;
		flags.push({
			id: "excessive-subdomains",
			title: `Excessive Subdomains (${subdomainCount} levels)`,
			description:
				"URL uses deep subdomain nesting (e.g. paypal.com.account-login.xyz) to mislead users into seeing a legit domain name.",
			severity: "medium",
			category: "domain",
		});
	}

	// 8. Embedded Authentication Credentials (@ symbol in authority)
	if (parsed.username || parsed.password) {
		score += 45;
		flags.push({
			id: "userinfo-embedding",
			title: "Embedded User Credentials in URL",
			description:
				"URL embeds authentication info (user:pass@host) which browsers ignore, hiding the real target host.",
			severity: "critical",
			category: "format",
		});
	}

	// 9. Non-Standard Port Check
	if (port && !["80", "443"].includes(port)) {
		score += 15;
		flags.push({
			id: "non-standard-port",
			title: `Non-Standard Web Port (:${port})`,
			description: `URL connects to unusual port :${port} instead of standard HTTP (80) or HTTPS (443).`,
			severity: "low",
			category: "protocol",
		});
	}

	// 10. URL Shortener Detection
	const isShortened = KNOWN_SHORTENERS.has(hostname);
	if (isShortened) {
		score += 15;
		flags.push({
			id: "shortened-url",
			title: "Shortened / Obfuscated Link",
			description: `URL uses shortener service '${hostname}' which masks the true destination website.`,
			severity: "medium",
			category: "shortener",
		});
	}

	// 11. Encoding & Null Byte Injection Check
	if (/%25|%00/i.test(raw)) {
		score += 30;
		flags.push({
			id: "double-encoding-nullbyte",
			title: "Double Percent-Encoding / Null Byte Injection",
			description:
				"URL contains double-encoded characters (%25) or null bytes (%00) used for WAF evasion or path traversal.",
			severity: "high",
			category: "format",
		});
	}

	// Clamp final risk score to 0–100
	const finalScore = Math.min(100, Math.max(0, score));

	// Calculate Risk Level Category
	let riskLevel: RiskLevel = "SAFE";
	if (finalScore >= 75) riskLevel = "CRITICAL";
	else if (finalScore >= 50) riskLevel = "HIGH";
	else if (finalScore >= 25) riskLevel = "SUSPICIOUS";
	else if (finalScore > 0) riskLevel = "LOW";

	// Structure object
	const structure: URLStructure = {
		protocol: parsed.protocol.replace(":", ""),
		hostname: parsed.hostname,
		port: parsed.port || (parsed.protocol === "https:" ? "443" : "80"),
		pathname: parsed.pathname,
		searchParams: Object.fromEntries(parsed.searchParams.entries()),
		hash: parsed.hash,
		isIpAddress,
		isPunycode,
		subdomainCount,
		tld,
	};

	return {
		originalUrl: inputUrl,
		isValid: true,
		riskScore: finalScore,
		riskLevel,
		structure,
		flags,
		isShortened,
		shortenerDomain: isShortened ? hostname : undefined,
	};
}
