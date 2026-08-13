export interface WheelItem {
	id: string;
	text: string;
	color: string;
}

export interface WheelPreset {
	id: string;
	name: string;
	icon: string;
	items: string[];
}

export type ColorTheme =
	| "rainbow"
	| "cyber"
	| "sunset"
	| "emerald"
	| "ocean"
	| "monochrome";

export interface SpinResult {
	id: string;
	item: WheelItem;
	timestamp: Date;
}
