import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import {
	Varela_Round,
	JetBrains_Mono,
	Montserrat,
	Caveat,
} from "next/font/google";
import "./globals.css";
import CompactBottomBar from "@/features/shared/components/CompactBottomBar";
import NavigationLoader from "@/features/shared/components/NavigationLoader";
import CommandPalette from "@/features/shared/components/CommandPalette";
import AuthProvider from "@/features/auth/components/AuthProvider";
import { createMetadata } from "@/lib/shared/metadata";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE, SOCIAL_LINKS } from "@/lib/shared/constants";

export const metadata: Metadata = createMetadata();

export const viewport: Viewport = {
	themeColor: "#f8fafc",
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

// Primary font - Varela Round
const varela = Varela_Round({
	weight: "400",
	subsets: ["latin"],
	variable: "--font-varela",
	display: "swap",
});

// Handwriting font for postcards
const caveat = Caveat({
	subsets: ["latin"],
	variable: "--font-caveat",
	display: "swap",
});

// Monospace font for code snippets
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

// Display font - Montserrat
const montserrat = Montserrat({
	subsets: ["latin"],
	variable: "--font-montserrat",
	display: "swap",
});

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
		sameAs: [SOCIAL_LINKS.github, SOCIAL_LINKS.linkedin, SOCIAL_LINKS.twitter],
	};

	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					id="schema-org"
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
			</head>
			<body
				className={`${varela.variable} ${jetbrainsMono.variable} ${montserrat.variable} ${caveat.variable} antialiased min-h-screen bg-slate-50/80 bg-dot-pattern text-slate-900`}
				suppressHydrationWarning
			>
				<AuthProvider>
					<Suspense fallback={null}>
						<NavigationLoader />
					</Suspense>
					{children}
					<CommandPalette />
					<CompactBottomBar />
					<SpeedInsights />
				</AuthProvider>
			</body>
		</html>
	);
}
