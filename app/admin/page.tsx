import Link from "next/link";
import { redirect } from "next/navigation";
import {
	BookOpen,
	CheckSquare,
	LogOut,
	ShieldCheck,
	ChevronRight,
	Database,
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
		{
			title: "Stock Explorer Manager",
			description:
				"Synchronize IDX market data with the local Redis registry for real-time analysis.",
			href: "/utils/stock-explorer/admin",
			icon: Database,
			color: "text-indigo-600",
			bg: "bg-indigo-50",
			border: "hover:border-indigo-200",
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
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className="group block relative p-5 rounded-2xl bg-white border border-slate-200 transition-all duration-300 hover:shadow-xl hover:border-blue-500/30 overflow-hidden h-28 !no-underline"
						>
							<div className="relative z-10 h-full flex flex-col justify-center">
								{/* Default view: Icon & Title centered */}
								<div className="flex items-center gap-3 transition-all duration-300 group-hover:-translate-y-3 group-hover:blur-[2px] group-hover:opacity-20">
									<div
										className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${action.bg} border border-slate-100 group-hover:scale-105 transition-transform duration-300`}
									>
										<action.icon className={`w-6 h-6 ${action.color}`} />
									</div>
									<div className="min-w-0">
										<h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
											{action.title}
										</h3>
									</div>
								</div>

								{/* Description: Hidden by default, slides & fades in on hover */}
								<div className="absolute bottom-0 left-0 right-0 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
									<p className="text-[10px] text-slate-500 font-medium leading-normal line-clamp-2">
										{action.description}
									</p>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
