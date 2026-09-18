import Link from "next/link";
import { redirect } from "next/navigation";
import {
	BookOpen,
	CheckSquare,
	LogOut,
	ShieldCheck,
	Database,
	Bell,
	ArrowUpRight,
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
			category: "Publishing",
			description:
				"Create, edit, and publish technical essays, engineering guides, and endurance race reports.",
			href: "/admin/blog",
			icon: BookOpen,
			color: "text-blue-600",
			bg: "bg-blue-50",
			border: "border-blue-100",
			badgeText: "text-blue-700",
			hoverAccent: "group-hover:text-blue-600",
			tags: ["Markdown WYSIWYG", "Categories", "SSG Pipeline"],
		},
		{
			title: "Task Management",
			category: "Execution",
			description:
				"Track daily operational objectives, sprint velocity retrospectives, and 6-month horizons.",
			href: "/tasks",
			icon: CheckSquare,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
			border: "border-emerald-100",
			badgeText: "text-emerald-700",
			hoverAccent: "group-hover:text-emerald-600",
			tags: ["Sprint Velocity", "Kanban Board", "6-Mo Horizon"],
		},
		{
			title: "Stock Explorer Manager",
			category: "Financial Registry",
			description:
				"Synchronize IDX instruments with the Redis cache, update market telemetry, and purge registries.",
			href: "/utils/stock-explorer/admin",
			icon: Database,
			color: "text-indigo-600",
			bg: "bg-indigo-50",
			border: "border-indigo-100",
			badgeText: "text-indigo-700",
			hoverAccent: "group-hover:text-indigo-600",
			tags: ["IDX Cache Sync", "Redis Key Expiry", "JSON Upload"],
		},
		{
			title: "Quick Reminders",
			category: "Notes & Alerts",
			description:
				"Jot down expiring operational notes, URL links, and daily reminders with automatic Redis TTL.",
			href: "/admin/reminders",
			icon: Bell,
			color: "text-amber-600",
			bg: "bg-amber-50",
			border: "border-amber-100",
			badgeText: "text-amber-700",
			hoverAccent: "group-hover:text-amber-600",
			tags: ["Redis TTL", "One-Click Copy", "Rapid Extend"],
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-4xl mx-auto px-4 sm:px-6">
				{/* Top Floating Header Card */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
						<div className="space-y-1.5 sm:space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider">
								<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
								<span>Administrative Gateway</span>
								<span className="w-1 h-1 rounded-full bg-indigo-400" />
								<span className="text-[11px] font-semibold text-indigo-600 lowercase tracking-normal">
									active session
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Dashboard Overview
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
								Central operational console to manage technical publications,
								execution agendas, market registries, and expiring notes.
							</p>
						</div>

						<form action={logout} className="shrink-0">
							<button
								type="submit"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 text-rose-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-[background-color,border-color,transform] shadow-2xs active:scale-95 cursor-pointer"
							>
								<LogOut className="w-4 h-4 text-rose-600" />
								<span>Sign Out</span>
							</button>
						</form>
					</div>
				</div>

				{/* 2x2 Balanced Action Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
					{adminActions.map((action) => (
						<Link
							key={action.title}
							href={action.href}
							className="group flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-[border-color,box-shadow,transform] duration-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 !no-underline"
						>
							<div>
								{/* Top Row: Squircle Icon & Category Badge + Arrow Circle */}
								<div className="flex items-center justify-between gap-4 mb-4 sm:mb-5">
									<div
										className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl shrink-0 ${action.bg} ${action.border} border shadow-2xs group-hover:scale-105 transition-transform duration-300`}
									>
										<action.icon
											className={`w-6 h-6 sm:w-7 sm:h-7 ${action.color}`}
										/>
									</div>

									<div className="flex items-center gap-2">
										<span
											className={`px-3 py-1 rounded-full ${action.bg} ${action.border} border text-[10px] font-bold uppercase tracking-wider ${action.badgeText}`}
										>
											{action.category}
										</span>
										<div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/60 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
											<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
										</div>
									</div>
								</div>

								{/* Title & Description */}
								<div className="mb-3.5 sm:mb-4">
									<h2
										className={`text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug ${action.hoverAccent} transition-colors mb-1.5 sm:mb-2`}
									>
										{action.title}
									</h2>
									<p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
										{action.description}
									</p>
								</div>

								{/* Capability Tags */}
								<div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
									{action.tags.map((tag) => (
										<span
											key={tag}
											className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-[11px] font-medium"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							{/* Bottom Action Row */}
							<div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex items-center justify-between">
								<span
									className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 ${action.hoverAccent} transition-colors`}
								>
									<span>Manage Console</span>
									<ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
