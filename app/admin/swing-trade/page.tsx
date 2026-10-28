import type { Metadata } from "next";
import { requireAuth } from "@/features/auth/server";
import SwingTradeTabs from "@/features/swing-trade/components/SwingTradeTabs";

export const metadata: Metadata = {
	title: "Swing Trade Hub | Admin Hub",
	description:
		"Access swing trade data feeds, daily historical summaries, and quantitative datasets.",
};

export const dynamic = "force-dynamic";

export default async function AdminSwingTradePage() {
	await requireAuth({
		requireAdmin: true,
		redirectTo: "/admin/swing-trade",
	});

	return (
		<main className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<SwingTradeTabs />
			</div>
		</main>
	);
}
