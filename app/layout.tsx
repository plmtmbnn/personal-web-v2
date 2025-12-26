import type { Metadata } from "next";
import { Varela_Round, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import CompactBottomBar from "@/components/CompactBottomBar";
import { createMetadata } from "@/lib/metadata";
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<SpeedInsights />
			<body
				className={`${varela.variable} ${jetbrainsMono.variable} antialiased`}
			>
				{children}
				<CompactBottomBar />
			</body>
		</html>
	);
}
