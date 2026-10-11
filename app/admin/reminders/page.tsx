import { redirect } from "next/navigation";
import { checkAdmin } from "@/features/auth/actions";
import { getReminders } from "@/features/reminders/actions";
import RemindersView from "@/features/reminders/components/RemindersView";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Quick Reminders | Admin Hub",
	description:
		"Manage ephemeral notes and URL bookmarks with automatic Redis expiration and duration extensions.",
};

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const reminders = await getReminders();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				<RemindersView initialReminders={reminders} />
			</div>
		</main>
	);
}
