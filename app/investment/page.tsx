import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import { SITE } from "@/lib/shared/constants";
import InvestmentCompassView from "@/features/investment/components/View";
import { getInvestmentCompass } from "@/features/investment/actions";

export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
	title: "Investment Compass | IHSG & Crypto Market Operating System",
	description:
		"Risk-first investment guidelines and operating framework for IHSG and Crypto. Macro regime analysis, permissions matrix, and execution playbooks.",
	path: "/investment",
	keywords: [
		"Investment Compass",
		"IHSG Strategy",
		"Crypto Playbook",
		"Risk Management",
		"Market Regime",
		"Indonesian Equities",
		"Bitcoin",
	],
});

export default async function InvestmentPage() {
	const initialData = await getInvestmentCompass();

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name: "Investment Compass | IHSG & Crypto Market Operating System",
		description:
			"Risk-first investment guidelines and operating framework for IHSG and Crypto. Macro regime analysis, permissions matrix, and execution playbooks.",
		url: `${SITE.url}/investment`,
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
