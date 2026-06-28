"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
	Trophy,
	Zap,
	Activity,
	ArrowLeft,
	Route,
	Flame,
	Milestone,
	Gauge,
	Mountain,
	Calendar,
	ExternalLink,
	CheckCircle,
	ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import type { StravaDataResult } from "@/services/strava/service";

/**
 * Personal Bests Data - Updated with user performance
 */
const personalBests = [
	{
		distance: "5K",
		time: "25:45",
		pace: "5:09/km",
		icon: Flame,
		color: "text-orange-400",
	},
	{
		distance: "10K",
		time: "54:42",
		pace: "5:28/km",
		icon: Zap,
		color: "text-yellow-400",
	},
	{
		distance: "Half Marathon",
		time: "2:05:37",
		pace: "5:57/km",
		icon: Milestone,
		color: "text-emerald-400",
	},
	{
		distance: "Marathon",
		time: "4:30:29",
		pace: "6:24/km",
		icon: Trophy,
		color: "text-blue-400",
	},
	{
		distance: "Ultra Trail (65.9k)",
		time: "19:40:28",
		pace: "17:55/km",
		elevation: "2,982 m",
		icon: Mountain,
		color: "text-purple-400",
	},
];

interface RunningViewProps {
	initialData?: StravaDataResult;
}

export default function RunningPage({ initialData }: RunningViewProps) {
	const [mounted, setMounted] = useState(false);
	const searchParams = useSearchParams();
	const [statusMessage, setStatusMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const success = searchParams.get("success");
		const error = searchParams.get("error");

		if (success === "true") {
			setStatusMessage({
				type: "success",
				text: "Strava authentication successful! Activities are now synced.",
			});
		} else if (error) {
			setStatusMessage({
				type: "error",
				text: `Strava authentication failed: ${decodeURIComponent(error)}`,
			});
		}
	}, [searchParams, mounted]);

	if (!mounted) return null;

	const runs = initialData?.runs || [];
	const stats = initialData?.stats;
	const isConfigured = initialData?.isConfigured || false;

	const totalRuns = stats?.all_run_totals?.count
		? stats.all_run_totals.count.toLocaleString()
		: "1,000+";

	const kmPerYear = stats?.ytd_run_totals?.distance
		? Math.round(stats.ytd_run_totals.distance / 1000).toLocaleString()
		: "1,000+";

	const hasToken = initialData?.hasToken || false;
	const showConnectPrompt = isConfigured && !hasToken;

	const oauthUrl =
		initialData?.clientId && initialData?.siteUrl
			? `https://www.strava.com/oauth/authorize?client_id=${initialData.clientId}&redirect_uri=${initialData.siteUrl}/api/strava/callback&response_type=code&scope=activity:read_all`
			: null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden flex items-center py-24">
			{/* Aesthetic Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-6xl w-full mx-auto px-6 space-y-8">
				{/* Status Banners */}
				{statusMessage && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className={`p-4 rounded-2xl flex items-center gap-3 border backdrop-blur-md ${
							statusMessage.type === "success"
								? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
								: "bg-rose-500/10 border-rose-500/20 text-rose-400"
						}`}
					>
						{statusMessage.type === "success" ? (
							<CheckCircle className="w-5 h-5 shrink-0" />
						) : (
							<ShieldAlert className="w-5 h-5 shrink-0" />
						)}
						<p className="text-xs font-bold leading-normal">
							{statusMessage.text}
						</p>
					</motion.div>
				)}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
					{/* ═══════════════════════════════════════
					    LEFT COLUMN: Header & Quick Stats
					═══════════════════════════════════════ */}
					<div className="lg:col-span-5 space-y-6">
						{/* Breadcrumb */}
						<motion.div
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
						>
							<Link
								href="/adventures"
								className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-emerald-500 transition-colors gap-2 group"
							>
								<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
								Back to Adventures
							</Link>
						</motion.div>

						{/* Header Content */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-4"
						>
							<div className="flex items-center gap-2.5 text-emerald-500">
								<Activity className="w-5 h-5" />
								<span className="text-[9px] font-black uppercase tracking-[0.4em]">
									Performance Hub
								</span>
							</div>
							<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-foreground leading-[0.95]">
								Endurance <span className="gradient-text">Journey</span>
							</h1>
							<p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-md">
								Tracking physical limits and mental discipline. Running is the
								ultimate feedback loop for consistency and resilience in both
								engineering and life.
							</p>
						</motion.div>

						{/* Quick Stats Cards */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.15 }}
							className="grid grid-cols-2 gap-4 p-5 bg-white/5 border border-white/10 rounded-[1.5rem] max-w-sm backdrop-blur-md"
						>
							<div className="text-center py-1">
								<p className="text-xl sm:text-2xl font-black text-foreground">
									{totalRuns}
								</p>
								<p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
									Total Runs
								</p>
							</div>
							<div className="text-center py-1 border-l border-white/10">
								<p className="text-xl sm:text-2xl font-black text-foreground">
									{kmPerYear}
								</p>
								<p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-0.5">
									KM / Year
								</p>
							</div>
						</motion.div>
					</div>

					{/* ═══════════════════════════════════════
					    RIGHT COLUMN: Personal Bests
					═══════════════════════════════════════ */}
					<div className="lg:col-span-7 space-y-6">
						<motion.h3
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.1 }}
							className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2"
						>
							<Trophy className="w-4 h-4 text-emerald-500" /> Personal
							Milestones
						</motion.h3>

						<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 animate-fade-in">
							{personalBests.map((pb, idx) => (
								<motion.div
									key={pb.distance}
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.05 * idx, duration: 0.4 }}
									className="p-5 glass-card border border-white/10 rounded-[1.8rem] bg-white/5 hover:border-emerald-500/20 transition-all group flex flex-col justify-between h-full"
								>
									<div>
										<div className="flex justify-between items-start mb-4">
											<pb.icon
												className={`w-5 h-5 ${pb.color} group-hover:scale-110 transition-transform`}
											/>
											<span className="text-[7.5px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
												Record
											</span>
										</div>
										<p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">
											{pb.distance}
										</p>
										<p className="text-xl sm:text-2xl font-black text-foreground tracking-tighter leading-none">
											{pb.time}
										</p>
									</div>

									<div className="mt-6 pt-4 border-t border-white/5 space-y-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<Gauge className="w-3 h-3 text-emerald-500/60" />
												<span className="text-[10px] font-bold text-foreground/80 leading-none">
													{pb.pace}
												</span>
											</div>
											<span className="text-[7.5px] font-black uppercase text-muted-foreground/30">
												Pace
											</span>
										</div>
										{pb.elevation && (
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5">
													<Route className="w-3 h-3 text-emerald-500/60" />
													<span className="text-[10px] font-bold text-foreground/80 leading-none">
														{pb.elevation}
													</span>
												</div>
												<span className="text-[7.5px] font-black uppercase text-muted-foreground/30">
													Gain
												</span>
											</div>
										)}
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>

				{/* ═══════════════════════════════════════
				    OAUTH CONNECTION PROMPT (ADMIN / DEV)
				═══════════════════════════════════════ */}
				{showConnectPrompt && oauthUrl && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="mt-12 p-8 glass-card border border-emerald-500/20 rounded-[2.5rem] bg-emerald-500/5 max-w-xl mx-auto backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden"
					>
						<div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl" />
						<div className="space-y-2 text-center sm:text-left relative z-10">
							<div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-400">
								<Zap className="w-4 h-4" />
								<span className="text-[9px] font-black uppercase tracking-[0.2em]">
									Strava Sync Setup
								</span>
							</div>
							<h4 className="text-lg font-black text-foreground leading-tight">
								Connect Strava Profile
							</h4>
							<p className="text-muted-foreground text-xs font-medium leading-relaxed max-w-sm">
								Your API applications settings are ready. Authorize this
								dashboard to start pulling your running achievements.
							</p>
						</div>
						<a
							href={oauthUrl}
							className="px-6 py-4 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all duration-350 shrink-0 shadow-lg shadow-emerald-500/10 !no-underline relative z-10"
						>
							Connect Account
						</a>
					</motion.div>
				)}

				{/* ═══════════════════════════════════════
				    RECENT ACTIVITIES SECTION
				═══════════════════════════════════════ */}
				{runs && runs.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="mt-20 space-y-6"
					>
						<div className="flex items-center justify-between">
							<h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
								<Activity className="w-4 h-4 text-emerald-500" /> Recent Running
								Activities
							</h3>
							<span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/30 italic">
								Real-Time Connection
							</span>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{runs.map((run, idx) => {
								const date = new Date(run.start_date_local);
								const formattedDate = format(date, "MMM dd, yyyy");
								const distanceKm = (run.distance / 1000).toFixed(2);

								// Pace calculation: seconds per km
								const paceSeconds =
									run.distance > 0
										? run.moving_time / (run.distance / 1000)
										: 0;
								const paceMin = Math.floor(paceSeconds / 60);
								const paceSec = Math.floor(paceSeconds % 60)
									.toString()
									.padStart(2, "0");
								const formattedPace = `${paceMin}:${paceSec}/km`;

								// Duration formatting: e.g. 52m 10s, or 1h 05m
								const hrs = Math.floor(run.moving_time / 3600);
								const mins = Math.floor((run.moving_time % 3600) / 60);
								const secs = run.moving_time % 60;
								const formattedDuration =
									hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m ${secs}s`;

								return (
									<motion.div
										key={run.id}
										initial={{ opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.05 * idx, duration: 0.4 }}
										className="p-6 glass-card border border-white/10 rounded-[2rem] bg-white/5 hover:border-emerald-500/20 transition-all group flex flex-col justify-between h-full relative overflow-hidden"
									>
										{/* Inner gradient highlight */}
										<div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl group-hover:bg-emerald-500/10 transition-colors" />

										<div className="space-y-4 relative z-10">
											<div className="flex justify-between items-start">
												<div className="space-y-1">
													<p className="text-sm font-black text-foreground/90 line-clamp-1 group-hover:text-emerald-400 transition-colors">
														{run.name}
													</p>
													<div className="flex items-center gap-1.5 text-[8.5px] font-bold text-muted-foreground/60">
														<Calendar className="w-3.5 h-3.5" />
														<span>{formattedDate}</span>
													</div>
												</div>
												<a
													href={`https://www.strava.com/activities/${run.id}`}
													target="_blank"
													rel="noopener noreferrer"
													className="p-2.5 bg-white/5 hover:bg-emerald-500/10 rounded-xl text-muted-foreground hover:text-emerald-500 transition-all duration-300 active:scale-95 flex items-center justify-center border border-white/5"
													title="View on Strava"
												>
													<ExternalLink className="w-3.5 h-3.5" />
												</a>
											</div>

											<div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
												<div className="space-y-0.5">
													<span className="text-[7.5px] font-black uppercase text-muted-foreground/40 block">
														Distance
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-black text-foreground">
															{distanceKm}
														</span>
														<span className="text-[8px] font-bold text-muted-foreground">
															KM
														</span>
													</div>
												</div>
												<div className="space-y-0.5 border-l border-white/5 pl-2">
													<span className="text-[7.5px] font-black uppercase text-muted-foreground/40 block">
														Pace
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-black text-foreground">
															{formattedPace}
														</span>
													</div>
												</div>
												<div className="space-y-0.5 border-l border-white/5 pl-2">
													<span className="text-[7.5px] font-black uppercase text-muted-foreground/40 block">
														Duration
													</span>
													<div className="flex items-baseline gap-0.5">
														<span className="text-sm font-black text-foreground">
															{formattedDuration}
														</span>
													</div>
												</div>
											</div>
										</div>

										<div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
											<div className="flex items-center gap-1.5">
												<Mountain className="w-3.5 h-3.5 text-emerald-500/60" />
												<span className="text-[9px] font-bold text-foreground/80 leading-none">
													+{run.total_elevation_gain}m
												</span>
											</div>
											{run.has_heartrate && run.average_heartrate && (
												<div className="flex items-center gap-1">
													<Flame className="w-3.5 h-3.5 text-rose-500/60 animate-pulse" />
													<span className="text-[9px] font-bold text-foreground/80 leading-none">
														{Math.round(run.average_heartrate)} bpm
													</span>
												</div>
											)}
										</div>
									</motion.div>
								);
							})}
						</div>
					</motion.div>
				)}

				{initialData?.isConfigured === false && (
					<div className="mt-12 text-center text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.3em]">
						Strava Integration Inactive • Displaying Static Milestones
					</div>
				)}
			</div>
		</main>
	);
}
