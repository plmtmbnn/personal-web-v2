import type {
	CryptoPayload,
	EmailPayload,
	PayloadType,
	SmsPayload,
	VCardPayload,
	WiFiPayload,
} from "../types";

export function formatUrl(url: string): string {
	const trimmed = url.trim();
	if (!trimmed) return "";
	if (/^https?:\/\//i.test(trimmed)) return trimmed;
	return `https://${trimmed}`;
}

export function formatWiFi(payload: WiFiPayload): string {
	const { ssid, password, encryption, hidden } = payload;
	if (!ssid.trim()) return "";

	// Escape special characters: '\', ';', ',', ':', '"'
	const escapeSpecialChars = (str: string) =>
		str.replace(/([\\;:,"])/g, "\\$1");

	let encType = encryption;
	if (encryption === "nopass" || !password) {
		encType = "nopass";
	}

	const parts = [
		`T:${encType}`,
		`S:${escapeSpecialChars(ssid)}`,
		encType !== "nopass" ? `P:${escapeSpecialChars(password)}` : "",
		hidden ? "H:true" : "",
	].filter(Boolean);

	return `WIFI:${parts.join(";")};;`;
}

export function formatVCard(payload: VCardPayload): string {
	const { firstName, lastName, organization, title, phone, email, url, note } =
		payload;

	const fullName = [firstName.trim(), lastName.trim()]
		.filter(Boolean)
		.join(" ");

	const lines = [
		"BEGIN:VCARD",
		"VERSION:3.0",
		`N:${lastName.trim()};${firstName.trim()};;;`,
		fullName ? `FN:${fullName}` : "",
		organization.trim() ? `ORG:${organization.trim()}` : "",
		title.trim() ? `TITLE:${title.trim()}` : "",
		phone.trim() ? `TEL;TYPE=CELL:${phone.trim()}` : "",
		email.trim() ? `EMAIL:${email.trim()}` : "",
		url.trim() ? `URL:${formatUrl(url)}` : "",
		note.trim() ? `NOTE:${note.trim().replace(/\n/g, "\\n")}` : "",
		"END:VCARD",
	].filter(Boolean);

	return lines.join("\n");
}

export function formatEmail(payload: EmailPayload): string {
	const { email, subject, body } = payload;
	if (!email.trim()) return "";

	const params = new URLSearchParams();
	if (subject.trim()) params.append("subject", subject.trim());
	if (body.trim()) params.append("body", body.trim());

	const queryString = params.toString();
	return `mailto:${email.trim()}${queryString ? `?${queryString}` : ""}`;
}

export function formatSms(payload: SmsPayload): string {
	const { phone, message } = payload;
	const cleanPhone = phone.trim();
	if (!cleanPhone) return "";

	if (!message.trim()) {
		return `tel:${cleanPhone}`;
	}
	return `SMSTO:${cleanPhone}:${message.trim()}`;
}

export function formatCrypto(payload: CryptoPayload): string {
	const { currency, address, amount, memo } = payload;
	const cleanAddress = address.trim();
	if (!cleanAddress) return "";

	switch (currency) {
		case "BTC": {
			const params = new URLSearchParams();
			if (amount.trim()) params.append("amount", amount.trim());
			if (memo.trim()) params.append("message", memo.trim());
			const query = params.toString();
			return `bitcoin:${cleanAddress}${query ? `?${query}` : ""}`;
		}
		case "ETH": {
			const params = new URLSearchParams();
			if (amount.trim()) params.append("value", amount.trim());
			const query = params.toString();
			return `ethereum:${cleanAddress}${query ? `?${query}` : ""}`;
		}
		case "SOL": {
			const params = new URLSearchParams();
			if (amount.trim()) params.append("amount", amount.trim());
			if (memo.trim()) params.append("memo", memo.trim());
			const query = params.toString();
			return `solana:${cleanAddress}${query ? `?${query}` : ""}`;
		}
		case "USDT": {
			return cleanAddress;
		}
		default:
			return cleanAddress;
	}
}

export function generatePayloadString(
	type: PayloadType,
	data: {
		url: string;
		text: string;
		wifi: WiFiPayload;
		vcard: VCardPayload;
		email: EmailPayload;
		sms: SmsPayload;
		crypto: CryptoPayload;
	},
): string {
	switch (type) {
		case "url":
			return formatUrl(data.url);
		case "text":
			return data.text;
		case "wifi":
			return formatWiFi(data.wifi);
		case "vcard":
			return formatVCard(data.vcard);
		case "email":
			return formatEmail(data.email);
		case "sms":
			return formatSms(data.sms);
		case "crypto":
			return formatCrypto(data.crypto);
		default:
			return data.text || "";
	}
}
