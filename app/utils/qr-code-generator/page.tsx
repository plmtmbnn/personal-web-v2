import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import QRCodeGeneratorView from "@/features/utils/text-tools/qr-code-generator/components/View";

export const metadata: Metadata = createMetadata({
	title: "QR Code Generator - URL & Text to Vector QR",
	description:
		"Generate high-resolution, customized QR codes for URLs, text, Wi-Fi networks, digital business cards (vCard), emails, SMS, and crypto addresses.",
	path: "/utils/qr-code-generator",
	keywords: [
		"QR Code Generator",
		"URL to QR Code",
		"Text to QR Code",
		"WiFi QR Code Generator",
		"vCard QR Code",
		"SVG QR Code",
		"Vector QR Generator",
		"High Resolution QR Code",
		"Developer Tools",
	],
});

export default function QRCodeGeneratorPage() {
	return <QRCodeGeneratorView />;
}
