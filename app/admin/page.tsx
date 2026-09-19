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
	Plus,
	Server,
} from "lucide-react";
import { logout, checkAdmin } from "@/features/auth/actions";
import { createAdminClient } from "@/lib/core/supabase-server";
import { getReminderCount } from "@/features/reminders/actions";

export const metadata = {
	title: "Admin Dashboard | Operations Gateway",
	description:
		"Central operational console to manage technical publications, execution agendas, market registries, and expiring notes.",
};

export default async function AdminDashboardPage() {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	// Fetch live operational telemetry in parallel
	let totalBlogs = 0;
	let publishedBlogs = 0;
	let pendingTasks = 0;
	let reminderCount = 0;

	try {
		const supabase = await createAdminClient();
		const [blogTotalRes, blogPublishedRes, taskRes, reminders] =
			await Promise.allSettled([
				supabase.from("blogs").select("id", { count: "exact", head: true }),
				supabase
					.from("blogs")
					.select("id", { count: "exact", head: true })
					.eq("published", true),
				supabase
					.from("tasks")
					.select("id", { count: "exact", head: true })
					.neq("status", "done")
					.neq("status", "cancelled"),
				getReminderCount(),
			]);

		if (blogTotalRes.status === "fulfilled") {
			totalBlogs = blogTotalRes.value.count ?? 0;
		}
		if (blogPublishedRes.status === "fulfilled") {
			publishedBlogs = blogPublishedRes.value.count ?? 0;
		}
		if (taskRes.status === "fulfilled") {
			pendingTasks = taskRes.value.count ?? 0;
		}
		if (reminders.status === "fulfilled") {
			reminderCount = reminders.value ?? 0;
		}
	} catch (error) {
		console.error("Error fetching admin telemetry:", error);
	}

	const adminActions = [
		{
			title: "Blog Management",
			category: "Publishing",
			description:
				"Create, edit, and publish technical essays, engineering guides, and endurance race reports.",
			href: "/admin/blog",
			quickAction: {
				label: "New Article",
				href: "/admin/blog/editor",
			},
			metricLabel: `${publishedBlogs} Published`,
			metricSub:
				totalBlogs > publishedBlogs
					? `${totalBlogs - publishedBlogs} Draft`
					: "SSG Ready",
			icon: BookOpen,
			color: "text-blue-600",
			bg: "bg-blue-50",
			border: "border-blue-200/70",
			badgeText: "text-blue-700",
			hoverAccent: "group-hover:text-blue-600",
			tags: ["Markdown WYSIWYG", "SSG Pipeline", "Category Index"],
		},
		{
			title: "Task Management",
			category: "Execution",
			description:
				"Track daily operational objectives, sprint velocity retrospectives, and 6-month horizons.",
			href: "/tasks",
			metricLabel: `${pendingTasks} Pending`,
			metricSub: "Active Backlog",
			icon: CheckSquare,
			color: "text-emerald-600",
			bg: "bg-emerald-50",
			border: "border-emerald-200/70",
			badgeText: "text-emerald-700",
			hoverAccent: "group-hover:text-emerald-600",
			tags: ["Sprint Horizon", "Priority Matrix", "Kanban Board"],
		},
		{
			title: "Stock Explorer Manager",
			category: "Financial Registry",
			description:
				"Synchronize IDX instruments with Redis cache, update market telemetry, and purge registries.",
			href: "/utils/stock-explorer/admin",
			metricLabel: "IDX Live",
			metricSub: "Redis Engine",
			icon: Database,
			color: "text-indigo-600",
			bg: "bg-indigo-50",
			border: "border-indigo-200/70",
			badgeText: "text-indigo-700",
			hoverAccent: "group-hover:text-indigo-600",
			tags: ["Redis Cache Sync", "JSON Ingestion", "Registry Purge"],
		},
		{
			title: "Quick Reminders",
			category: "Ephemeral Notes",
			description:
				"Jot down expiring operational notes, URL links, and daily reminders with automatic Redis TTL.",
			href: "/admin/reminders",
			metricLabel: `${reminderCount} Active`,
			metricSub: "TTL Expiration",
			icon: Bell,
			color: "text-amber-600",
			bg: "bg-amber-50",
			border: "border-amber-200/70",
			badgeText: "text-amber-700",
			hoverAccent: "group-hover:text-amber-600",
			tags: ["Redis Auto-Expiry", "Linkified Pills", "Duration Extend"],
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
				{/* ═══════════════════════════════════════
				    TOP FLOATING HEADER CARD
				═══════════════════════════════════════ */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 pb-5 border-b border-slate-100">
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-2xs">
								<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
								<span>ADMINISTRATIVE GATEWAY</span>
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[11px] font-semibold text-indigo-600 lowercase tracking-normal">
									active session
								</span>
							</div>

							<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
								Operations &amp; Control Center
							</h1>

							<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
								Central console to orchestrate technical essays, sprint agendas,
								financial registries, and expiring notes.
							</p>
						</div>

						<form action={logout} className="shrink-0">
							<button
								type="submit"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-[background-color,border-color,transform] shadow-2xs active:scale-95 cursor-pointer"
							>
								<LogOut className="w-4 h-4 text-rose-600" />
								<span>Sign Out</span>
							</button>
						</form>
					</div>

					{/* System Telemetry Quick Strip */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
						<div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
							<div className="flex items-center gap-1.5 text-slate-400 mb-1">
								<BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
								<span className="text-[10px] font-bold uppercase tracking-wider truncate">
									Articles
								</span>
							</div>
							<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
								{publishedBlogs}{" "}
								<span className="text-[11px] font-normal text-slate-400">
									published
								</span>
							</p>
						</div>

						<div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
							<div className="flex items-center gap-1.5 text-slate-400 mb-1">
								<CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
								<span className="text-[10px] font-bold uppercase tracking-wider truncate">
									Pending Tasks
								</span>
							</div>
							<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
								{pendingTasks}{" "}
								<span className="text-[11px] font-normal text-slate-400">
									active
								</span>
							</p>
						</div>

						<div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
							<div className="flex items-center gap-1.5 text-slate-400 mb-1">
								<Bell className="w-3.5 h-3.5 text-amber-600 shrink-0" />
								<span className="text-[10px] font-bold uppercase tracking-wider truncate">
									Reminders
								</span>
							</div>
							<p className="text-sm sm:text-base font-black text-slate-900 font-mono">
								{reminderCount}{" "}
								<span className="text-[11px] font-normal text-slate-400">
									in memory
								</span>
							</p>
						</div>

						<div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70">
							<div className="flex items-center gap-1.5 text-slate-400 mb-1">
								<Server className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
								<span className="text-[10px] font-bold uppercase tracking-wider truncate">
									Infra Engines
								</span>
							</div>
							<p className="text-sm sm:text-base font-black text-slate-900 font-mono flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								<span>Connected</span>
							</p>
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    2x2 COMMAND MODULES GRID
				═══════════════════════════════════════ */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
					{adminActions.map((action) => (
						<div
							key={action.title}
							className="group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-[border-color,box-shadow,transform] duration-200 shadow-xs hover:shadow-lg"
						>
							<div>
								{/* Top Row: Squircle Icon & Category Badge + Metric Pill */}
								<div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
									<div
										className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl shrink-0 ${action.bg} ${action.border} border shadow-2xs group-hover:scale-105 transition-transform duration-200`}
									>
										<action.icon
											className={`w-6 h-6 sm:w-7 sm:h-7 ${action.color}`}
										/>
									</div>

									<div className="flex flex-col items-end gap-1.5">
										<div className="flex items-center gap-2">
											<span
												className={`px-3 py-1 rounded-full ${action.bg} ${action.border} border text-[10px] font-black uppercase tracking-wider ${action.badgeText}`}
											>
												{action.category}
											</span>
											<Link
												href={action.href}
												className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200/70 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors"
												aria-label={`Open ${action.title}`}
											>
												<ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
											</Link>
										</div>

										{/* Real-time Metric Pill */}
										<div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-700 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200/70">
											<span className="text-slate-900">
												{action.metricLabel}
											</span>
											<span className="text-slate-300">•</span>
											<span className="text-slate-400 font-normal">
												{action.metricSub}
											</span>
										</div>
									</div>
								</div>

								{/* Title & Description */}
								<div className="mb-4">
									<Link href={action.href} className="!no-underline">
										<h2
											className={`text-xl font-black text-slate-900 tracking-tight leading-snug ${action.hoverAccent} transition-colors mb-2`}
										>
											{action.title}
										</h2>
									</Link>
									<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
										{action.description}
									</p>
								</div>

								{/* Capability Tags */}
								<div className="flex flex-wrap gap-1.5 mb-5">
									{action.tags.map((tag) => (
										<span
											key={tag}
											className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[11px] font-bold border border-slate-200/60"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							{/* Bottom Actions Row */}
							<div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
								<Link
									href={action.href}
									className={`inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 ${action.hoverAccent} transition-colors !no-underline`}
								>
									<span>Launch Console</span>
									<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
								</Link>

								{action.quickAction && (
									<Link
										href={action.quickAction.href}
										className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-lg transition-colors !no-underline active:scale-95"
									>
										<Plus className="w-3 h-3" />
										<span>{action.quickAction.label}</span>
									</Link>
								)}
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
