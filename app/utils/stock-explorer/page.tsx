import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import dynamic from "next/dynamic";

const StockExplorerView = dynamic(
	() => import("@/features/utils/stock-tools/stock-explorer/components/View"),
);

export const metadata: Metadata = createMetadata({
	title: "Advanced IDX Stock Explorer",
	description:
		"Interactive Indonesia Stock Exchange (IDX) explorer with real-time summary data, high-performance filtering, and volume analysis.",
	path: "/utils/stock-explorer",
	keywords: [
		"IDX",
		"Stock Market",
		"Indonesia Stock Exchange",
		"Stock Summary",
		"Investment Tools",
		"Financial Dashboard",
	],
});

export default function StockExplorerPage() {
	return <StockExplorerView />;
}
