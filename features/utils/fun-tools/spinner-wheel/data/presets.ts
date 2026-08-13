import type { WheelPreset, ColorTheme } from "../types";

export const COLOR_THEMES: Record<
	ColorTheme,
	{ name: string; colors: string[] }
> = {
	rainbow: {
		name: "Vibrant Rainbow",
		colors: [
			"#f43f5e", // Rose
			"#f97316", // Orange
			"#eab308", // Yellow
			"#10b981", // Emerald
			"#06b6d4", // Cyan
			"#3b82f6", // Blue
			"#8b5cf6", // Purple
			"#ec4899", // Pink
		],
	},
	cyber: {
		name: "Cyber Neon",
		colors: [
			"#00f5d4", // Neon Cyan
			"#7b2cbf", // Deep Purple
			"#ff007f", // Neon Pink
			"#3a86ff", // Bright Blue
			"#ffb703", // Gold
			"#fb5607", // Electric Orange
		],
	},
	sunset: {
		name: "Warm Sunset",
		colors: [
			"#ff4d6d",
			"#ff758f",
			"#ff8fa3",
			"#ffb3c1",
			"#f72585",
			"#b5179e",
			"#7209b7",
		],
	},
	emerald: {
		name: "Emerald Forest",
		colors: ["#059669", "#10b981", "#34d399", "#6ee7b7", "#047857", "#065f46"],
	},
	ocean: {
		name: "Ocean Breeze",
		colors: ["#0284c7", "#38bdf8", "#7dd3fc", "#0369a1", "#0c4a6e", "#0284c7"],
	},
	monochrome: {
		name: "Sleek Dark",
		colors: ["#1e293b", "#334155", "#475569", "#64748b", "#0f172a", "#3b82f6"],
	},
};

export const PRESETS: WheelPreset[] = [
	{
		id: "team-lunch",
		name: "🍕 Team Lunch",
		icon: "Utensils",
		items: [
			"Pizza 🍕",
			"Sushi 🍱",
			"Ramen 🍜",
			"Burgers 🍔",
			"Tacos 🌮",
			"Salad Bowl 🥗",
			"Thai Cuisine 🍲",
			"Indian Curry 🍛",
		],
	},
	{
		id: "yes-no",
		name: "🎲 Yes / No / Maybe",
		icon: "HelpCircle",
		items: [
			"YES! ✅",
			"NO ❌",
			"MAYBE ❓",
			"DEFINITELY ✨",
			"SPIN AGAIN 🔄",
			"NO WAY 🛑",
		],
	},
	{
		id: "names",
		name: "🎟️ Random Student / Member",
		icon: "UserCheck",
		items: [
			"Alice",
			"Bob",
			"Charlie",
			"David",
			"Emma",
			"Frank",
			"Grace",
			"Henry",
		],
	},
	{
		id: "truth-dare",
		name: "🎮 Truth or Dare",
		icon: "Sparkles",
		items: [
			"TRUTH 💡",
			"DARE ⚡",
			"DOUBLE DARE 🔥",
			"PASS ✋",
			"SPIN AGAIN 🔄",
			"PICK A FRIEND 🤝",
		],
	},
	{
		id: "numbers",
		name: "🔢 Numbers 1 - 10",
		icon: "Hash",
		items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
	},
];
