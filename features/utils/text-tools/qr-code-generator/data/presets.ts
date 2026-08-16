import type { PresetTheme } from "../types";

export const PRESET_THEMES: PresetTheme[] = [
	{
		id: "classic-dark",
		name: "Classic Onyx",
		fgColor: "#0f172a",
		bgColor: "#ffffff",
		accent: "#0f172a",
	},
	{
		id: "indigo-electric",
		name: "Indigo Modern",
		fgColor: "#4f46e5",
		bgColor: "#ffffff",
		accent: "#4f46e5",
	},
	{
		id: "emerald-pro",
		name: "Emerald Green",
		fgColor: "#059669",
		bgColor: "#ffffff",
		accent: "#059669",
	},
	{
		id: "violet-pulse",
		name: "Royal Violet",
		fgColor: "#7c3aed",
		bgColor: "#ffffff",
		accent: "#7c3aed",
	},
	{
		id: "midnight-blue",
		name: "Midnight Ocean",
		fgColor: "#0284c7",
		bgColor: "#ffffff",
		accent: "#0284c7",
	},
	{
		id: "crimson-fire",
		name: "Crimson Bold",
		fgColor: "#e11d48",
		bgColor: "#ffffff",
		accent: "#e11d48",
	},
	{
		id: "cyber-gold",
		name: "Cyber Amber",
		fgColor: "#d97706",
		bgColor: "#ffffff",
		accent: "#d97706",
	},
	{
		id: "dark-mode",
		name: "Dark Inverted",
		fgColor: "#f8fafc",
		bgColor: "#0f172a",
		accent: "#6366f1",
	},
];

export interface PresetLogo {
	id: string;
	name: string;
	svgPath: string;
	viewBox?: string;
}

export const PRESET_LOGOS: PresetLogo[] = [
	{
		id: "globe",
		name: "Web / Link",
		viewBox: "0 0 24 24",
		svgPath:
			"M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8 8 0 0 1 18.93 8zM12 4.07a14 14 0 0 1 1.88 3.93h-3.76A14 14 0 0 1 12 4.07zM4.26 14a7.82 7.82 0 0 1 0-4h3.38a16.53 16.53 0 0 0-.14 2c0 .68.05 1.35.14 2zm.81 2h2.95a15.65 15.65 0 0 0 1.38 3.56A8 8 0 0 1 5.07 16zm2.95-8H5.07a8 8 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.02 8zM12 19.93A14 14 0 0 1 10.12 16h3.76A14 14 0 0 1 12 19.93zM14.34 14H9.66a14.7 14.7 0 0 1-.16-2c0-.68.05-1.35.16-2h4.68c.11.65.16 1.32.16 2s-.05 1.32-.16 2zm.26 5.56A15.65 15.65 0 0 0 15.98 16h2.95a8 8 0 0 1-4.33 3.56zM16.36 14a16.53 16.53 0 0 0 .14-2c0-.68-.05-1.35-.14-2h3.38a7.82 7.82 0 0 1 0 4z",
	},
	{
		id: "wifi",
		name: "Wi-Fi",
		viewBox: "0 0 24 24",
		svgPath:
			"M12 18a2 2 0 1 1-2 2 2 2 0 0 1 2-2zm-4.95-3.05a7 7 0 0 1 9.9 0l-1.41 1.41a5 5 0 0 0-7.08 0zm-2.83-2.83a11 11 0 0 1 15.56 0l-1.42 1.42a9 9 0 0 0-12.72 0zm-2.83-2.83a15 15 0 0 1 21.22 0l-1.42 1.42a13 13 0 0 0-18.38 0z",
	},
	{
		id: "user",
		name: "User / Contact",
		viewBox: "0 0 24 24",
		svgPath:
			"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
	},
	{
		id: "mail",
		name: "Email",
		viewBox: "0 0 24 24",
		svgPath:
			"M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z",
	},
	{
		id: "shield",
		name: "Security",
		viewBox: "0 0 24 24",
		svgPath:
			"M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
	},
	{
		id: "star",
		name: "Star",
		viewBox: "0 0 24 24",
		svgPath:
			"M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
	},
	{
		id: "bitcoin",
		name: "Bitcoin",
		viewBox: "0 0 24 24",
		svgPath:
			"M17.06 11.57c.59-.69.94-1.59.94-2.57 0-2.21-1.79-4-4-4H8v14h6.5c2.48 0 4.5-2.02 4.5-4.5 0-1.28-.54-2.43-1.44-3.23zM10.5 7.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10.5v-3.5H14c.96 0 1.75.79 1.75 1.75S14.96 16.5 14 16.5z",
	},
];

export const INITIAL_PAYLOAD_EXAMPLES = {
	url: "https://plmtmbnn.dev",
	text: "Welcome to personal-web-v2 developer utilities suite!",
	wifi: {
		ssid: "Starlink-HighSpeed",
		password: "SuperSecretPassword123!",
		encryption: "WPA" as const,
		hidden: false,
	},
	vcard: {
		firstName: "Paul",
		lastName: "Tambunan",
		organization: "Software Engineering",
		title: "Lead Engineer",
		phone: "+6281234567890",
		email: "contact@plmtmbnn.dev",
		url: "https://plmtmbnn.dev",
		note: "Specializing in High-Performance Web Systems",
	},
	email: {
		email: "hello@plmtmbnn.dev",
		subject: "Collaboration Inquiry",
		body: "Hi Paul,\n\nI would love to connect and discuss potential collaboration opportunities.\n\nBest regards,",
	},
	sms: {
		phone: "+6281234567890",
		message: "Hello! Let's connect.",
	},
	crypto: {
		currency: "ETH" as const,
		address: "0x71C8fb43E3CED52e2B50c33075193BCE10738A56",
		amount: "0.05",
		memo: "Project Bounty",
	},
};
