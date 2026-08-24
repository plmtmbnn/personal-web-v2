import { redirect } from "next/navigation";
import { checkAdmin } from "@/features/auth/actions";
import { getReminders } from "@/features/reminders/actions";
import RemindersView from "@/features/reminders/components/RemindersView";
import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
	title: "Quick Reminders | Admin Hub",
	description: "Manage short time reminders and daily notes.",
};

export default async function AdminRemindersPage() {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const reminders = await getReminders();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			{/* Structural Hero Header */}
			<div className="bg-slate-900 border-b border-slate-800 mb-10 pt-8 sm:pt-10 pb-10 sm:pb-12 text-white shadow-md">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
						<div className="space-y-2 text-center sm:text-left">
							<div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
								<Bell className="w-4 h-4 text-indigo-400" />
								Administrative Gateway
							</div>
							<h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
								Quick Reminders
							</h1>
							<div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/admin"
									className="hover:text-white transition-colors"
								>
									System Root
								</Link>
								<ChevronRight className="w-3 h-3 opacity-40" />
								<span className="text-slate-200 font-bold">Reminders</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="px-4 sm:px-6 lg:px-8">
				<RemindersView initialReminders={reminders} />
			</div>
		</main>
	);
}
