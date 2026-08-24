import { describe, it, expect } from "vitest";
import {
	formatUrl,
	formatWiFi,
	formatVCard,
	formatEmail,
	formatSms,
	formatCrypto,
	generatePayloadString,
} from "../utils/formatters";

describe("QR Code Formatters", () => {
	describe("formatUrl()", () => {
		it("prepends https:// if scheme is missing", () => {
			expect(formatUrl("google.com")).toBe("https://google.com");
			expect(formatUrl("www.github.com/profile")).toBe(
				"https://www.github.com/profile",
			);
		});

		it("preserves existing http and https protocols", () => {
			expect(formatUrl("http://localhost:3000")).toBe("http://localhost:3000");
			expect(formatUrl("https://my-domain.com")).toBe("https://my-domain.com");
		});

		it("returns empty string on empty input", () => {
			expect(formatUrl("")).toBe("");
			expect(formatUrl("   ")).toBe("");
		});
	});

	describe("formatWiFi()", () => {
		it("returns empty string if SSID is blank", () => {
			expect(
				formatWiFi({
					ssid: "",
					password: "123",
					encryption: "WPA",
					hidden: false,
				}),
			).toBe("");
		});

		it("formats standard WPA wifi string and escapes special characters", () => {
			const res = formatWiFi({
				ssid: "Home;WiFi:1",
				password: "my\\password;",
				encryption: "WPA",
				hidden: true,
			});
			expect(res).toBe(
				"WIFI:T:WPA;S:Home\\;WiFi\\:1;P:my\\\\password\\;;H:true;;",
			);
		});

		it("formats open network with nopass", () => {
			const res = formatWiFi({
				ssid: "Public-Hotspot",
				password: "",
				encryption: "nopass",
				hidden: false,
			});
			expect(res).toBe("WIFI:T:nopass;S:Public-Hotspot;;");
		});
	});

	describe("formatVCard()", () => {
		it("formats complete vCard 3.0 string", () => {
			const vcard = formatVCard({
				firstName: "John",
				lastName: "Doe",
				organization: "Acme Corp",
				title: "Engineer",
				phone: "+1234567890",
				email: "john@acme.com",
				url: "acme.com",
				note: "Friend from college",
			});

			expect(vcard).toContain("BEGIN:VCARD");
			expect(vcard).toContain("VERSION:3.0");
			expect(vcard).toContain("N:Doe;John;;;");
			expect(vcard).toContain("FN:John Doe");
			expect(vcard).toContain("ORG:Acme Corp");
			expect(vcard).toContain("TITLE:Engineer");
			expect(vcard).toContain("TEL;TYPE=CELL:+1234567890");
			expect(vcard).toContain("EMAIL:john@acme.com");
			expect(vcard).toContain("URL:https://acme.com");
			expect(vcard).toContain("NOTE:Friend from college");
			expect(vcard).toContain("END:VCARD");
		});
	});

	describe("formatEmail()", () => {
		it("returns empty string if email is missing", () => {
			expect(formatEmail({ email: "", subject: "Hi", body: "Hello" })).toBe("");
		});

		it("formats mailto URL with subject and body params", () => {
			const res = formatEmail({
				email: "info@example.com",
				subject: "Inquiry",
				body: "Hello world",
			});
			expect(res).toBe(
				"mailto:info@example.com?subject=Inquiry&body=Hello+world",
			);
		});
	});

	describe("formatSms()", () => {
		it("formats SMSTO with message or simple tel: if message empty", () => {
			expect(formatSms({ phone: "+6281234567", message: "Hi" })).toBe(
				"SMSTO:+6281234567:Hi",
			);
			expect(formatSms({ phone: "+6281234567", message: "" })).toBe(
				"tel:+6281234567",
			);
			expect(formatSms({ phone: "", message: "Hi" })).toBe("");
		});
	});

	describe("formatCrypto()", () => {
		it("formats Bitcoin URL with amount and message", () => {
			const res = formatCrypto({
				currency: "BTC",
				address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
				amount: "0.05",
				memo: "Invoice 123",
			});
			expect(res).toBe(
				"bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.05&message=Invoice+123",
			);
		});

		it("formats Ethereum URL with value", () => {
			const res = formatCrypto({
				currency: "ETH",
				address: "0x0000000000000000000000000000000000000000",
				amount: "1.5",
				memo: "",
			});
			expect(res).toBe(
				"ethereum:0x0000000000000000000000000000000000000000?value=1.5",
			);
		});

		it("formats Solana and USDT addresses", () => {
			const sol = formatCrypto({
				currency: "SOL",
				address: "SolAddress123",
				amount: "10",
				memo: "Tip",
			});
			expect(sol).toBe("solana:SolAddress123?amount=10&memo=Tip");

			const usdt = formatCrypto({
				currency: "USDT",
				address: "TRXAddress123",
				amount: "100",
				memo: "",
			});
			expect(usdt).toBe("TRXAddress123");
		});
	});

	describe("generatePayloadString()", () => {
		const sampleData = {
			url: "test.com",
			text: "plain text note",
			wifi: {
				ssid: "TestNet",
				password: "pwd",
				encryption: "WPA" as const,
				hidden: false,
			},
			vcard: {
				firstName: "A",
				lastName: "B",
				organization: "",
				title: "",
				phone: "",
				email: "",
				url: "",
				note: "",
			},
			email: { email: "test@example.com", subject: "", body: "" },
			sms: { phone: "123", message: "" },
			crypto: {
				currency: "BTC" as const,
				address: "btc123",
				amount: "",
				memo: "",
			},
		};

		it("dispatches to correct formatter based on type", () => {
			expect(generatePayloadString("url", sampleData)).toBe("https://test.com");
			expect(generatePayloadString("text", sampleData)).toBe("plain text note");
			expect(generatePayloadString("wifi", sampleData)).toContain(
				"WIFI:T:WPA;S:TestNet",
			);
			expect(generatePayloadString("email", sampleData)).toBe(
				"mailto:test@example.com",
			);
		});
	});
});
