import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import dynamic from "next/dynamic";

const StockExplorerView = dynamic(
	() => import("@/features/utils/stock-tools/stock-explorer/components/View"),
);

export const metadata: Metadata = createMetadata({
	title: "IDX Swing Scanner",
	description:
		"A shortlist of confirmed IDX stock breakouts with buy ranges, stops, and first targets for the next opening session.",
	path: "/utils/stock-explorer",
	keywords: [
		"IDX",
		"Stock Market",
		"Indonesia Stock Exchange",
		"Swing Trading",
		"Stock Breakouts",
	],
});

export default function StockExplorerPage() {
	return <StockExplorerView />;
}
