export type PayloadType =
	| "url"
	| "text"
	| "wifi"
	| "vcard"
	| "email"
	| "sms"
	| "crypto";

export interface WiFiPayload {
	ssid: string;
	password: string;
	encryption: "WPA" | "WEP" | "nopass";
	hidden: boolean;
}

export interface VCardPayload {
	firstName: string;
	lastName: string;
	organization: string;
	title: string;
	phone: string;
	email: string;
	url: string;
	note: string;
}

export interface EmailPayload {
	email: string;
	subject: string;
	body: string;
}

export interface SmsPayload {
	phone: string;
	message: string;
}

export type CryptoCurrency = "BTC" | "ETH" | "SOL" | "USDT";

export interface CryptoPayload {
	currency: CryptoCurrency;
	address: string;
	amount: string;
	memo: string;
}

export type DotStyle = "square" | "rounded" | "dots" | "classy";
export type EyeFrameStyle = "square" | "rounded" | "circle" | "leaf";
export type EyeBallStyle = "square" | "rounded" | "circle";
export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";
export type FrameStyle = "none" | "bottom-banner" | "top-badge" | "card";

export interface LogoConfig {
	type: "none" | "preset" | "custom";
	presetId?: string;
	customDataUrl?: string;
	sizeRatio: number; // e.g. 0.22 (22% of QR size)
	bgPadding: number;
}

export interface QRStyleConfig {
	dotStyle: DotStyle;
	eyeFrameStyle: EyeFrameStyle;
	eyeBallStyle: EyeBallStyle;
	fgColor: string;
	bgColor: string;
	transparentBg: boolean;
	customEyeColors: boolean;
	eyeFrameColor: string;
	eyeBallColor: string;
	errorCorrectionLevel: ErrorCorrectionLevel;
	margin: number;
	logo: LogoConfig;
	frame: {
		style: FrameStyle;
		text: string;
		textColor: string;
		bgColor: string;
	};
}

export interface PresetTheme {
	id: string;
	name: string;
	fgColor: string;
	bgColor: string;
	eyeFrameColor?: string;
	eyeBallColor?: string;
	accent: string;
}
