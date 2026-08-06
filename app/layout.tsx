import { Suspense } from "react";
import type { Metadata } from "next";
import { Varela_Round, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CompactBottomBar from "@/features/shared/components/CompactBottomBar";
import NavigationLoader from "@/features/shared/components/NavigationLoader";
import CommandPalette from "@/features/shared/components/CommandPalette";
import AuthProvider from "@/features/auth/components/AuthProvider";
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
				className={`${varela.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-slate-50/80 bg-dot-pattern text-slate-900`}
			>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
				<AuthProvider>
					<Suspense fallback={null}>
						<NavigationLoader />
					</Suspense>
					{children}
					<CommandPalette />
					<CompactBottomBar />
				</AuthProvider>
			</body>
		</html>
	);
}
