import { redirect } from "next/navigation";
import { checkAdmin } from "@/features/auth/actions";
import { getReminders } from "@/features/reminders/actions";
import RemindersView from "@/features/reminders/components/RemindersView";
import { ChevronRight } from "lucide-react";
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
						<div className="space-y-2">
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
							<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
								Quick Reminders
							</h1>
							<p className="text-sm text-slate-500 max-w-xl leading-relaxed">
								Manage ephemeral notes with automatic Redis expiration and
								duration extensions.
							</p>
						</div>

						<div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center">
							<div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-right">
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
									Active Notes
								</span>
								<span className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono leading-none">
									{reminders.length}
								</span>
							</div>
							<Link
								href="/admin"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline"
							>
								<span>Admin Hub</span>
							</Link>
						</div>
					</div>
				</div>

				{/* Reminders View */}
				<RemindersView initialReminders={reminders} />
			</div>
		</main>
	);
}
