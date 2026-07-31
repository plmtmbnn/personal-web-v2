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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			{/* Structural Hero Header */}
			<div className="bg-slate-900 border-b border-slate-800 mb-10 pt-8 sm:pt-10 pb-10 sm:pb-12 text-white shadow-md">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
						<div className="space-y-2 text-center sm:text-left">
							<div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
								<ShieldCheck className="w-4 h-4 text-indigo-400" />
								Administrative Gateway
							</div>
							<h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
								Dashboard
							</h1>
							<div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-slate-400">
								<span className="text-slate-200 font-bold">System Root</span>
								<ChevronRight className="w-3 h-3 opacity-40" />
								<span>Overview</span>
							</div>
						</div>

						<form action={logout} className="flex justify-center">
							<button
								type="submit"
								className="flex items-center gap-2 px-5 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
							>
								<LogOut className="w-4 h-4" />
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Action Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className="group flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all duration-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 !no-underline h-full"
						>
							<div>
								<div className="flex items-center justify-between gap-3 mb-4">
									<div
										className={`w-12 h-12 flex items-center justify-center rounded-xl shrink-0 ${action.bg} border border-slate-100 shadow-2xs group-hover:scale-110 transition-transform duration-300`}
									>
										<action.icon className={`w-6 h-6 ${action.color}`} />
									</div>
									<span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
										Manage →
									</span>
								</div>
								<h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors mb-2">
									{action.title}
								</h3>
								<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
									{action.description}
								</p>
							</div>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
