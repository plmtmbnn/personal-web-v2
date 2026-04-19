import Link from "next/link";
import { redirect } from "next/navigation";
import {
	BookOpen,
	CheckSquare,
	LogOut,
	ShieldCheck,
	ArrowRight,
	ChevronRight,
} from "lucide-react";
import { logout, checkAdmin } from "@/features/auth/actions";

export const metadata = {
	title: "Admin Dashboard | Personal Hub",
	description: "Manage your personal portal content and tasks.",
};

export default async function AdminDashboardPage() {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const adminActions = [
		{
			title: "Blog Management",
			description:
				"Create, edit, and delete your professional insights and technical journal entries.",
			href: "/admin/blog",
			icon: BookOpen,
			color: "text-blue-600",
			bg: "bg-blue-50",
			border: "hover:border-blue-200",
		},
		{
			title: "Task Management",
			description:
				"Track your daily objectives, strategic milestones, and operational execution.",
			href: "/tasks",
			icon: CheckSquare,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
			border: "hover:border-emerald-200",
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/50 pb-32 lg:pb-24">
			{/* Structural Header */}
			<div className="bg-white border-b border-slate-200 mb-8 sm:mb-12">
				<div className="max-w-5xl mx-auto px-6 py-10 sm:py-12">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
						<div className="space-y-1 sm:space-y-2 text-center sm:text-left">
							<div className="flex items-center justify-center sm:justify-start gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
								<ShieldCheck className="w-3.5 h-3.5" />
								Administrative Gateway
							</div>
							<h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
								Dashboard
							</h1>
							<div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-medium text-slate-400">
								<span className="text-slate-900">System Root</span>
								<ChevronRight className="w-3 h-3 opacity-50" />
								<span>Overview</span>
							</div>
						</div>

						<form action={logout} className="flex justify-center">
							<button
								type="submit"
								className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-[10px] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all uppercase tracking-widest active:scale-95 shadow-sm"
							>
								<LogOut className="w-3.5 h-3.5" />
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-6">
				{/* Action Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className={`group block p-8 sm:p-10 bg-white border border-slate-200 rounded-[2rem] sm:rounded-[2.5rem] transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${action.border} !no-underline relative overflow-hidden`}
						>
							<div
								className={`w-14 h-14 sm:w-16 sm:h-16 ${action.bg} rounded-2xl flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-500 border border-transparent group-hover:border-white/50`}
							>
								<action.icon
									className={`w-7 h-7 sm:w-8 sm:h-8 ${action.color}`}
								/>
							</div>

							<h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3 text-slate-900 tracking-tight">
								{action.title}
							</h3>
							<p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-8 sm:mb-10 font-medium">
								{action.description}
							</p>

							<div
								className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${action.color} group-hover:gap-4 transition-all`}
							>
								<span>Access Module</span>
								<ArrowRight className="w-3.5 h-3.5" />
							</div>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
