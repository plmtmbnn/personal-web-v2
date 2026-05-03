import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import StockCryptoCalculatorView from "./View";

export const metadata: Metadata = createMetadata({
	title: "Asset Averaging Calculator",
	description:
		"Professional investment utility to calculate consolidated average price, breakeven points, and generate acquisition plans for stocks and crypto.",
	path: "/utils/stock-crypto-calculator",
	keywords: [
		"Stock Calculator",
		"Crypto Calculator",
		"Average Down Calculator",
		"DCA Calculator",
		"Investment Tools",
		"Cost Basis Calculator",
	],
});

export default function StockCryptoCalculatorPage() {
	return <StockCryptoCalculatorView />;
}
