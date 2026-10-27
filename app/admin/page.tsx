import Link from "next/link";
import {
	BookOpen,
	CheckSquare,
	LogOut,
	Database,
	Bell,
	ArrowUpRight,
	Plus,
	Server,
	Activity,
	ArrowRightLeft,
	ChevronRight,
	Layers,
	TrendingUp,
} from "lucide-react";
import { logout } from "@/features/auth/actions";
import { requireAuth } from "@/features/auth/server";
import { createAdminClient } from "@/lib/core/supabase-server";
import { getReminderCount } from "@/features/reminders/actions";

export const metadata = {
	title: "Admin Dashboard | Operations Gateway",
	description:
		"Central operational console to manage technical publications, execution agendas, market registries, and expiring notes.",
};

export function AdminSkeleton() {
	return (
		<main
			className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36"
			role="status"
			aria-live="polite"
			aria-label="Loading admin console"
		>
			<div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
				{/* Top Floating Header Card Skeleton */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 pb-5 border-b border-slate-100">
						<div className="space-y-2.5">
							<div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
							<div className="h-8 sm:h-9 w-64 sm:w-80 bg-slate-200 rounded-xl animate-pulse" />
							<div className="h-4 w-full max-w-xl bg-slate-200 rounded animate-pulse" />
						</div>

						<div className="h-9 w-24 bg-slate-100 rounded-xl animate-pulse shrink-0" />
					</div>

					{/* System Telemetry Quick Strip Skeleton */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-1.5"
							>
								<div className="flex items-center gap-1.5">
									<div className="w-3.5 h-3.5 rounded bg-slate-200 animate-pulse" />
									<div className="h-2.5 w-16 bg-slate-200 rounded animate-pulse" />
								</div>
								<div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
							</div>
						))}
					</div>
				</div>

				{/* Group 1 Skeleton */}
				<div className="space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
							<div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
						</div>
						<div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-[180px] animate-pulse"
							>
								<div className="flex items-start justify-between gap-3 mb-3">
									<div className="flex items-center gap-3.5">
										<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 shrink-0" />
										<div className="h-6 w-36 bg-slate-200 rounded-lg" />
									</div>
									<div className="h-6 w-20 bg-slate-100 rounded-lg" />
								</div>
								<div className="h-4 w-4/5 bg-slate-200 rounded mb-4" />
								<div className="pt-4 border-t border-slate-100 flex items-center justify-between">
									<div className="h-4 w-28 bg-slate-200 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Group 2 Skeleton */}
				<div className="space-y-4">
					<div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
						<div className="flex items-center gap-2.5">
							<div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
							<div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
						</div>
						<div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs h-[180px] animate-pulse"
							>
								<div className="flex items-start justify-between gap-3 mb-3">
									<div className="flex items-center gap-3.5">
										<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-200 shrink-0" />
										<div className="h-6 w-36 bg-slate-200 rounded-lg" />
									</div>
									<div className="h-6 w-20 bg-slate-100 rounded-lg" />
								</div>
								<div className="h-4 w-4/5 bg-slate-200 rounded mb-4" />
								<div className="pt-4 border-t border-slate-100 flex items-center justify-between">
									<div className="h-4 w-28 bg-slate-200 rounded" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}

export default async function AdminDashboardPage() {
	await requireAuth({ requireAdmin: true, redirectTo: "/admin" });

	// Fetch live operational telemetry in parallel
	let publishedBlogs = 0;
	let pendingTasks = 0;
	let reminderCount = 0;

	try {
		const supabase = await createAdminClient();
		const [blogPublishedRes, taskRes, reminders] = await Promise.allSettled([
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

	const toolGroups = [
		{
			id: "operations",
			title: "Operations & Productivity",
			icon: Layers,
			tools: [
				{
					title: "Blog Management",
					description:
						"Create, edit, and publish technical essays, engineering guides, and endurance race reports.",
					href: "/admin/blog",
					quickAction: {
						label: "New Article",
						href: "/admin/blog/editor",
					},
					icon: BookOpen,
					color: "text-blue-600",
					bg: "bg-blue-50",
					border: "border-blue-200/70",
					hoverAccent: "group-hover:text-blue-600",
					statusBadge: `${publishedBlogs} Published`,
				},
				{
					title: "Task Management",
					description:
						"Track daily operational objectives, sprint velocity retrospectives, and 6-month horizons.",
					href: "/tasks",
					icon: CheckSquare,
					color: "text-emerald-600",
					bg: "bg-emerald-50",
					border: "border-emerald-200/70",
					hoverAccent: "group-hover:text-emerald-600",
					statusBadge: `${pendingTasks} Active`,
				},
				{
					title: "Quick Reminders",
					description:
						"Straightforward reminders with target due dates, linear checklist, and 1-click completion.",
					href: "/admin/reminders",
					icon: Bell,
					color: "text-amber-600",
					bg: "bg-amber-50",
					border: "border-amber-200/70",
					hoverAccent: "group-hover:text-amber-600",
					statusBadge: `${reminderCount} In Memory`,
				},
				{
					title: "Daily Movement Snacks",
					description:
						"Track micro movement breaks during long desk work sessions. Flexible 6-slot schedule.",
					href: "/admin/movement",
					icon: Activity,
					color: "text-teal-600",
					bg: "bg-teal-50",
					border: "border-teal-200/70",
					hoverAccent: "group-hover:text-teal-600",
					statusBadge: "6 Daily Slots",
				},
			],
		},
		{
			id: "market",
			title: "Market Systems",
			icon: TrendingUp,
			tools: [
				{
					title: "Stock Explorer Manager",
					description:
						"Synchronize IDX instruments with Redis cache, update market telemetry, and purge registries.",
					href: "/utils/stock-explorer/admin",
					icon: Database,
					color: "text-indigo-600",
					bg: "bg-indigo-50",
					border: "border-indigo-200/70",
					hoverAccent: "group-hover:text-indigo-600",
					statusBadge: "Redis Engine",
				},
				{
					title: "Running Trade Retriever",
					description:
						"Pull IDX running trade for one ticker from an external API by cursor and export as CSV.",
					href: "/admin/running-trade",
					icon: ArrowRightLeft,
					color: "text-sky-600",
					bg: "bg-sky-50",
					border: "border-sky-200/70",
					hoverAccent: "group-hover:text-sky-600",
					statusBadge: "BEI / IDX Feed",
				},
			],
		},
	];

	return (
		<main className="min-h-screen bg-slate-50/80 relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
				{/* Top Floating Header Card */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6 pb-5 border-b border-slate-100">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Home
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<span className="text-slate-900 font-bold">Admin Console</span>
							</div>

							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
								Operations &amp; Control Center
							</h1>

							<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-xl">
								Central operational console to orchestrate technical essays,
								sprint agendas, financial registries, and expiring notes.
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
							<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
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
							<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
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
							<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
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
							<p className="text-sm sm:text-base font-extrabold text-slate-900 font-mono flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								<span>Connected</span>
							</p>
						</div>
					</div>
				</div>

				{/* Minimalist Grouped Tool Modules */}
				<div className="space-y-8 sm:space-y-10">
					{toolGroups.map((group) => {
						const GroupIcon = group.icon;

						return (
							<section
								key={group.id}
								className="space-y-4 sm:space-y-5"
								aria-label={group.title}
							>
								{/* Minimalist Group Header */}
								<div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
									<div className="flex items-center gap-2.5">
										<div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/70 flex items-center justify-center text-slate-700 shrink-0">
											<GroupIcon className="w-4 h-4" />
										</div>
										<h2 className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">
											{group.title}
										</h2>
									</div>

									<span className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60 text-slate-600 text-[11px] font-mono font-bold">
										{group.tools.length} Tools
									</span>
								</div>

								{/* Streamlined Cards Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
									{group.tools.map((tool) => (
										<div
											key={tool.title}
											className="group flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-slate-300 transition-[border-color,box-shadow] duration-200 shadow-xs hover:shadow-md"
										>
											<div>
												{/* Header: Icon beside Title + Right-aligned Status Pill */}
												<div className="flex items-start justify-between gap-3 mb-3">
													<div className="flex items-center gap-3.5 min-w-0">
														<div
															className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl shrink-0 ${tool.bg} ${tool.border} border shadow-2xs group-hover:scale-105 transition-transform duration-200`}
														>
															<tool.icon
																className={`w-5 h-5 sm:w-6 sm:h-6 ${tool.color}`}
															/>
														</div>

														<Link
															href={tool.href}
															className="!no-underline min-w-0"
														>
															<h3
																className={`text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug ${tool.hoverAccent} transition-colors truncate`}
															>
																{tool.title}
															</h3>
														</Link>
													</div>

													{tool.statusBadge && (
														<span className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-slate-600 text-[11px] font-mono font-bold">
															{tool.statusBadge}
														</span>
													)}
												</div>

												{/* Description */}
												<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-4">
													{tool.description}
												</p>
											</div>

											{/* Bottom Actions Row */}
											<div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
												<Link
													href={tool.href}
													className={`inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 ${tool.hoverAccent} transition-colors !no-underline`}
												>
													<span>Launch Console</span>
													<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
												</Link>

												{tool.quickAction && (
													<Link
														href={tool.quickAction.href}
														className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-lg transition-colors !no-underline active:scale-95"
													>
														<Plus className="w-3 h-3" />
														<span>{tool.quickAction.label}</span>
													</Link>
												)}
											</div>
										</div>
									))}
								</div>
							</section>
						);
					})}
				</div>
			</div>
		</main>
	);
}
