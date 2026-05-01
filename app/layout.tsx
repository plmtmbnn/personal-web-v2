import type { Metadata } from "next";
import { Varela_Round, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CompactBottomBar from "@/features/shared/components/CompactBottomBar";
import { createMetadata } from "@/lib/shared/metadata";
import { SpeedInsights } from "@vercel/speed-insights/next";
export const metadata: Metadata = createMetadata();

// Primary font - Varela Round
const varela = Varela_Round({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-varela",
	display: "swap",
});

// Monospace font for code snippets
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

import { SITE } from "@/lib/shared/constants";

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Person",
		name: SITE.name,
		url: SITE.url,
		jobTitle: "Software Engineer",
		description: SITE.description,
		sameAs: [
			"https://github.com/plmtmbnn",
			"https://linkedin.com/in/polma-tambunan",
			"https://x.com/LFC",
		],
	};

	return (
		<html lang="en">
			<SpeedInsights />
			<body
				className={`${varela.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				{children}
				<CompactBottomBar />
			</body>
		</html>
	);
}
