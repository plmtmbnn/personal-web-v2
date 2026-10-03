import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import InvestmentCompassView from "@/features/investment/components/View";
import { getInvestmentCompass } from "@/features/investment/actions";

export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
	title: "Investment Compass | Global Markets & Guidelines",
	description:
		"Top-down global investment guideline covering Macro, Micro, SP500, Europe, Asia, Crypto, and Actionable Playbook.",
	path: "/investment",
	keywords: [
		"Investment Compass",
		"Market Guideline",
		"Macro Economy",
		"Global Markets",
		"Portfolio Strategy",
	],
});

export default async function InvestmentPage() {
	const initialData = await getInvestmentCompass();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Investment Compass | Global Markets & Guidelines",
		description:
			"Top-down global investment guideline covering Macro, Micro, SP500, Europe, Asia, Crypto, and Actionable Playbook.",
		url: "https://polma.me/investment", // Assuming polma.me, or we can use SITE.url if we import it
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<InvestmentCompassView initialData={initialData} />
		</>
	);
}
