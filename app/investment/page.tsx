import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import InvestmentView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Market Insights | Investments",
	description:
		"Real-time market sentiment analysis and portfolio strategy tools. Fear & Greed Index and Factor Analysis.",
	path: "/investment",
	keywords: [
		"Market Sentiment",
		"Fear and Greed Index",
		"Investment Strategy",
		"Fintech Analysis",
		"Portfolio Management",
	],
});

export default function InvestmentPage() {
	return <InvestmentView />;
}
