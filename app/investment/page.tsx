import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import InvestmentView from "@/features/investment/components/View";

import { getCombinedMarketIntelligence } from "@/features/investment/actions";

export const revalidate = 3600;

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

export default async function InvestmentPage() {
	const initialData = await getCombinedMarketIntelligence();
	return <InvestmentView initialData={initialData} />;
}
