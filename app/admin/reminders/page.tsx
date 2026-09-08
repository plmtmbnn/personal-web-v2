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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Top Floating Header Card */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
						<div className="space-y-1.5 sm:space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100/80 text-amber-700 text-xs font-bold uppercase tracking-wider">
								<Bell className="w-3.5 h-3.5 text-amber-600" />
								<span>Administrative Gateway</span>
								<span className="w-1 h-1 rounded-full bg-amber-400" />
								<span className="text-[11px] font-semibold text-amber-600 lowercase tracking-normal">
									temporary notes & alerts
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Quick Reminders
							</h1>
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/admin"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Admin Dashboard
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<span className="text-slate-900 font-bold">Reminders</span>
							</div>
						</div>
					</div>
				</div>

				{/* Reminders View */}
				<RemindersView initialReminders={reminders} />
			</div>
		</main>
	);
}
