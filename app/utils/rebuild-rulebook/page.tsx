import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import dynamic from "next/dynamic";

const RebuildRulebookView = dynamic(
	() => import("@/features/utils/stock-tools/rebuild-rulebook/components/View"),
);

export const metadata: Metadata = createMetadata({
	title: "Disciplined Rebuild Rulebook",
	description:
		"Interactive capital allocation sizer (40/45/15), 5-gate pre-trade verification checklist, and mechanical drawdown recovery calculator.",
	path: "/utils/rebuild-rulebook",
	keywords: [
		"Investment Rulebook",
		"Risk Management",
		"Capital Preservation",
		"Drawdown Calculator",
		"Pre-Trade Checklist",
		"Trading Discipline",
		"Portfolio Allocation",
	],
});

export default function RebuildRulebookPage() {
	return <RebuildRulebookView />;
}
