import { requireAuth } from "@/features/auth/server";
import OrderTradeTabs from "@/features/running-trade/components/OrderTradeTabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Order Trade Hub | Admin Hub",
	description:
		"Analyze IDX running trade and 1-minute trade book charts with institutional money flow.",
};

export const dynamic = "force-dynamic";

export default async function AdminRunningTradePage() {
	await requireAuth({ requireAdmin: true, redirectTo: "/admin/running-trade" });

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<OrderTradeTabs />
			</div>
		</main>
	);
}
