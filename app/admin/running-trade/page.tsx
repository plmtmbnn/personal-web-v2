import { requireAuth } from "@/features/auth/server";
import RunningTradeView from "@/features/running-trade/components/RunningTradeView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Running Trade Retriever | Admin Hub",
	description:
		"Fetch IDX running trade for a ticker from an external API and export it as CSV.",
};

export const dynamic = "force-dynamic";

export default async function AdminRunningTradePage() {
	await requireAuth({ requireAdmin: true, redirectTo: "/admin/running-trade" });

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<RunningTradeView />
			</div>
		</main>
	);
}
