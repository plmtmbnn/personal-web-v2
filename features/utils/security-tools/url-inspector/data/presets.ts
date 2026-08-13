import type { PresetURL } from "../types";

export const PRESET_URLS: PresetURL[] = [
	{
		label: "🟢 Safe Official URL",
		url: "https://github.com/plmtmbnn/personal-web-v2",
		type: "normal",
		description: "Standard secure HTTPS repository link.",
	},
	{
		label: "🔗 Shortened Link",
		url: "https://bit.ly/3xY8zQ1",
		type: "shortened",
		description: "Obfuscated shortened URL hiding final target.",
	},
	{
		label: "🚨 Homograph Attack",
		url: "https://xn--80ak6aa92e.com",
		type: "homograph",
		description:
			"Punycode domain using Cyrillic characters to mimic 'apple.com'.",
	},
	{
		label: "⚠️ Raw IP Phishing",
		url: "http://192.168.1.50/paypal-security/login.php",
		type: "ip",
		description: "Unencrypted HTTP link hosted on a raw IP address.",
	},
	{
		label: "🛑 Brand Impersonation",
		url: "http://paypal-verify-account.security-login.xyz/auth?user=admin",
		type: "suspicious",
		description: "Fake PayPal domain using excessive subdomains & .xyz TLD.",
	},
];
