import { requireAuth } from "@/features/auth/server";
import { getReminders } from "@/features/reminders/actions";
import RemindersView from "@/features/reminders/components/RemindersView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Quick Reminders | Admin Hub",
	description: "Straightforward reminders and due-date tracking.",
};

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
	await requireAuth({ requireAdmin: true, redirectTo: "/admin/reminders" });

	const reminders = await getReminders();

	return (
		<main className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<RemindersView initialReminders={reminders} />
			</div>
		</main>
	);
}
