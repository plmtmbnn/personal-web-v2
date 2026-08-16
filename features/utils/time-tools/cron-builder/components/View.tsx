"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Clock,
	Calendar,
	Copy,
	Check,
	Sparkles,
	Sliders,
	AlertCircle,
	CheckCircle2,
	Play,
	Layers,
	CalendarDays,
	Hourglass,
	RefreshCw,
} from "lucide-react";
import type { CronFieldType, CronParts } from "../types";
import {
	humanizeCron,
	parseCronExpression,
	getNextExecutions,
	formatRelativeTime,
} from "../utils/cron-parser";
import { CRON_PRESETS } from "../utils/cron-presets";

const DAYS_OF_WEEK = [
	{ id: "0", label: "Sun", name: "Sunday" },
	{ id: "1", label: "Mon", name: "Monday" },
	{ id: "2", label: "Tue", name: "Tuesday" },
	{ id: "3", label: "Wed", name: "Wednesday" },
	{ id: "4", label: "Thu", name: "Thursday" },
	{ id: "5", label: "Fri", name: "Friday" },
	{ id: "6", label: "Sat", name: "Saturday" },
];

const MONTHS = [
	{ id: "1", label: "Jan", name: "January" },
	{ id: "2", label: "Feb", name: "February" },
	{ id: "3", label: "Mar", name: "March" },
	{ id: "4", label: "Apr", name: "April" },
	{ id: "5", label: "May", name: "May" },
	{ id: "6", label: "Jun", name: "June" },
	{ id: "7", label: "Jul", name: "July" },
	{ id: "8", label: "Aug", name: "August" },
	{ id: "9", label: "Sep", name: "September" },
	{ id: "10", label: "Oct", name: "October" },
	{ id: "11", label: "Nov", name: "November" },
	{ id: "12", label: "Dec", name: "December" },
];

export default function CronBuilderView() {
	const reduceMotion = useReducedMotion();

	const [rawCronInput, setRawCronInput] = useState("*/15 9-17 * * 1-5");
	const [activeFieldTab, setActiveFieldTab] = useState<CronFieldType>("minute");
	const [isCopied, setIsCopied] = useState(false);
	const [presetFilter, setPresetFilter] = useState<string>("All");
	const [currentTime, setCurrentTime] = useState<Date>(new Date());

	// Update live clock every 10 seconds for countdowns
	useEffect(() => {
		const timer = setInterval(() => setCurrentTime(new Date()), 10000);
		return () => clearInterval(timer);
	}, []);

	// Validation and parsing
	const { parts, validation } = useMemo(() => {
		return parseCronExpression(rawCronInput);
	}, [rawCronInput]);

	// Plain English human translation
	const humanizedText = useMemo(() => {
		return humanizeCron(rawCronInput);
	}, [rawCronInput]);

	// Next 10 executions
	const nextExecutions = useMemo(() => {
		if (!validation.isValid) return [];
		return getNextExecutions(rawCronInput, 10, currentTime);
	}, [rawCronInput, validation.isValid, currentTime]);

	const handleCopyCron = () => {
		navigator.clipboard.writeText(rawCronInput);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	// Update a specific field part
	const updatePart = useCallback((field: CronFieldType, newValue: string) => {
		setRawCronInput((prev) => {
			const { parts: currentParts } = parseCronExpression(prev);
			const fallback: CronParts = currentParts || {
				minute: "*",
				hour: "*",
				dayOfMonth: "*",
				month: "*",
				dayOfWeek: "*",
			};
			const updated: CronParts = { ...fallback, [field]: newValue };
			return `${updated.minute} ${updated.hour} ${updated.dayOfMonth} ${updated.month} ${updated.dayOfWeek}`;
		});
	}, []);

	// Filtered presets
	const filteredPresets = useMemo(() => {
		if (presetFilter === "All") return CRON_PRESETS;
		return CRON_PRESETS.filter((p) => p.category === presetFilter);
	}, [presetFilter]);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto space-y-8">
				{/* Top Breadcrumb & Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						POSIX / Quartz Standard • 100% Client-Side
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
								<Clock className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Cron Expression{" "}
									<span className="text-indigo-600">Studio</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Interactive visual schedule builder, plain-English humanizer,
									and live execution timeline simulator.
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Live Expression & Human Translation Banner */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
				>
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
						{/* Expression Input Area */}
						<div className="space-y-2 flex-1">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
									<Sliders className="w-4 h-4 text-indigo-600" />
									Cron Expression (5 Fields)
								</span>
								{validation.isValid ? (
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
										<CheckCircle2 className="w-3 h-3 text-emerald-600" />
										Valid Syntax
									</span>
								) : (
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
										<AlertCircle className="w-3 h-3 text-rose-600" />
										Syntax Error
									</span>
								)}
							</div>

							<div className="flex items-center gap-3">
								<div className="flex-1 relative">
									<input
										type="text"
										value={rawCronInput}
										onChange={(e) => setRawCronInput(e.target.value)}
										placeholder="* * * * *"
										className="w-full p-4 font-mono text-xl sm:text-2xl font-extrabold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 tracking-wider"
									/>
								</div>
								<button
									type="button"
									onClick={handleCopyCron}
									className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs ${
										isCopied
											? "bg-emerald-600 text-white"
											: "bg-indigo-600 hover:bg-indigo-700 text-white"
									}`}
								>
									{isCopied ? (
										<Check className="w-4 h-4" />
									) : (
										<Copy className="w-4 h-4" />
									)}
									{isCopied ? "Copied" : "Copy"}
								</button>
							</div>

							{/* Field Labels Guide */}
							<div className="grid grid-cols-5 gap-2 text-center text-[10px] font-mono font-bold text-slate-400 pt-1">
								<span>MIN (0-59)</span>
								<span>HOUR (0-23)</span>
								<span>DOM (1-31)</span>
								<span>MON (1-12)</span>
								<span>DOW (0-6)</span>
							</div>
						</div>

						{/* Plain English Humanized Card */}
						<div className="lg:w-[460px] p-6 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
									<Sparkles className="w-4 h-4 text-indigo-600" />
									Plain-English Schedule
								</span>
								{nextExecutions[0] && (
									<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-[10px] font-bold text-indigo-700 shadow-2xs">
										<Hourglass className="w-3 h-3 text-indigo-600" />
										Next:{" "}
										{formatRelativeTime(
											new Date(nextExecutions[0].timestamp),
											currentTime,
										)}
									</span>
								)}
							</div>
							<p className="text-base sm:text-lg font-extrabold text-indigo-950 leading-snug">
								“{humanizedText}”
							</p>
						</div>
					</div>
				</motion.div>

				{/* Visual Schedule Builder */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
				>
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
							<Sliders className="w-4 h-4 text-indigo-600" />
							<span>Interactive Field Builder</span>
						</div>

						{/* Field Tabs */}
						<div className="flex items-center p-1 bg-slate-100 rounded-2xl gap-1 overflow-x-auto">
							{[
								{ id: "minute", label: "Minute", sub: "0-59" },
								{ id: "hour", label: "Hour", sub: "0-23" },
								{ id: "dayOfMonth", label: "Day of Month", sub: "1-31" },
								{ id: "month", label: "Month", sub: "1-12" },
								{ id: "dayOfWeek", label: "Day of Week", sub: "Sun-Sat" },
							].map((tab) => (
								<button
									key={tab.id}
									type="button"
									onClick={() => setActiveFieldTab(tab.id as CronFieldType)}
									className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
										activeFieldTab === tab.id
											? "bg-white text-slate-900 shadow-2xs"
											: "text-slate-500 hover:text-slate-900"
									}`}
								>
									<span>{tab.label}</span>
									<span className="text-[10px] font-mono text-slate-400 ml-1.5">
										({parts ? parts[tab.id as keyof CronParts] : "*"})
									</span>
								</button>
							))}
						</div>
					</div>

					{/* ─── Minute Builder ─────────────────────────────────────────── */}
					{activeFieldTab === "minute" && (
						<div className="space-y-5 pt-2">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{[
									{ label: "Every Minute (*)", val: "*" },
									{ label: "Every 5 Mins (*/5)", val: "*/5" },
									{ label: "Every 15 Mins (*/15)", val: "*/15" },
									{ label: "Every 30 Mins (*/30)", val: "*/30" },
									{ label: "At Minute 0 (0)", val: "0" },
									{ label: "Quarter Past (15)", val: "15" },
									{ label: "Half Past (30)", val: "30" },
									{ label: "Quarter To (45)", val: "45" },
								].map((preset) => (
									<button
										key={preset.val}
										type="button"
										onClick={() => updatePart("minute", preset.val)}
										className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
											parts?.minute === preset.val
												? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>

							{/* Custom Minute Number Grid */}
							<div className="space-y-2 pt-3 border-t border-slate-100">
								<span className="text-xs font-bold text-slate-700 block">
									Or Select Specific Minutes (0–59):
								</span>
								<div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
									{Array.from({ length: 60 }, (_, i) => String(i)).map((m) => {
										const isSelected =
											parts?.minute === m ||
											parts?.minute.split(",").includes(m);
										return (
											<button
												key={m}
												type="button"
												onClick={() => {
													if (parts?.minute === "*") {
														updatePart("minute", m);
													} else {
														const currentList = parts?.minute.split(",") || [];
														if (currentList.includes(m)) {
															const next = currentList.filter((x) => x !== m);
															updatePart(
																"minute",
																next.length > 0 ? next.join(",") : "*",
															);
														} else {
															updatePart(
																"minute",
																[...currentList, m].join(","),
															);
														}
													}
												}}
												className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
													isSelected
														? "bg-slate-900 text-white shadow-xs"
														: "bg-slate-50 text-slate-600 hover:bg-slate-200"
												}`}
											>
												{m.padStart(2, "0")}
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* ─── Hour Builder ───────────────────────────────────────────── */}
					{activeFieldTab === "hour" && (
						<div className="space-y-5 pt-2">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{[
									{ label: "Every Hour (*)", val: "*" },
									{ label: "Every 2 Hours (*/2)", val: "*/2" },
									{ label: "Every 6 Hours (*/6)", val: "*/6" },
									{ label: "Business Hours (9-17)", val: "9-17" },
									{ label: "Midnight Only (0)", val: "0" },
									{ label: "Morning (9:00)", val: "9" },
									{ label: "Noon (12:00)", val: "12" },
									{ label: "Evening (18:00)", val: "18" },
								].map((preset) => (
									<button
										key={preset.val}
										type="button"
										onClick={() => updatePart("hour", preset.val)}
										className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
											parts?.hour === preset.val
												? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>

							{/* Hour Grid (0-23) */}
							<div className="space-y-2 pt-3 border-t border-slate-100">
								<span className="text-xs font-bold text-slate-700 block">
									Or Select Specific Hours (0–23):
								</span>
								<div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2">
									{Array.from({ length: 24 }, (_, i) => String(i)).map((h) => {
										const isSelected =
											parts?.hour === h || parts?.hour.split(",").includes(h);
										const hourNum = Number(h);
										const label12 =
											hourNum === 0
												? "12 AM"
												: hourNum < 12
													? `${hourNum} AM`
													: hourNum === 12
														? "12 PM"
														: `${hourNum - 12} PM`;
										return (
											<button
												key={h}
												type="button"
												onClick={() => {
													if (parts?.hour === "*") {
														updatePart("hour", h);
													} else {
														const currentList = parts?.hour.split(",") || [];
														if (currentList.includes(h)) {
															const next = currentList.filter((x) => x !== h);
															updatePart(
																"hour",
																next.length > 0 ? next.join(",") : "*",
															);
														} else {
															updatePart("hour", [...currentList, h].join(","));
														}
													}
												}}
												className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
													isSelected
														? "bg-slate-900 text-white shadow-xs"
														: "bg-slate-50 text-slate-700 hover:bg-slate-200"
												}`}
											>
												<span className="block font-mono text-xs font-extrabold">
													{h.padStart(2, "0")}:00
												</span>
												<span className="block text-[10px] opacity-70 font-semibold">
													{label12}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						</div>
					)}

					{/* ─── Day of Month Builder ───────────────────────────────────── */}
					{activeFieldTab === "dayOfMonth" && (
						<div className="space-y-5 pt-2">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{[
									{ label: "Every Day (*)", val: "*" },
									{ label: "1st of Month (1)", val: "1" },
									{ label: "15th of Month (15)", val: "15" },
									{ label: "1st and 15th (1,15)", val: "1,15" },
									{ label: "Every 2 Days (*/2)", val: "*/2" },
									{ label: "Last Day of Month (L)", val: "L" },
									{ label: "First 10 Days (1-10)", val: "1-10" },
									{ label: "Mid-Month (10-20)", val: "10-20" },
								].map((preset) => (
									<button
										key={preset.val}
										type="button"
										onClick={() => updatePart("dayOfMonth", preset.val)}
										className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
											parts?.dayOfMonth === preset.val
												? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>

							{/* Day Grid (1-31) */}
							<div className="space-y-2 pt-3 border-t border-slate-100">
								<span className="text-xs font-bold text-slate-700 block">
									Or Select Specific Days of the Month (1–31):
								</span>
								<div className="grid grid-cols-7 sm:grid-cols-11 gap-1.5">
									{Array.from({ length: 31 }, (_, i) => String(i + 1)).map(
										(d) => {
											const isSelected =
												parts?.dayOfMonth === d ||
												parts?.dayOfMonth.split(",").includes(d);
											return (
												<button
													key={d}
													type="button"
													onClick={() => {
														if (parts?.dayOfMonth === "*") {
															updatePart("dayOfMonth", d);
														} else {
															const currentList =
																parts?.dayOfMonth.split(",") || [];
															if (currentList.includes(d)) {
																const next = currentList.filter((x) => x !== d);
																updatePart(
																	"dayOfMonth",
																	next.length > 0 ? next.join(",") : "*",
																);
															} else {
																updatePart(
																	"dayOfMonth",
																	[...currentList, d].join(","),
																);
															}
														}
													}}
													className={`py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
														isSelected
															? "bg-slate-900 text-white shadow-xs"
															: "bg-slate-50 text-slate-600 hover:bg-slate-200"
													}`}
												>
													{d}
												</button>
											);
										},
									)}
								</div>
							</div>
						</div>
					)}

					{/* ─── Month Builder ──────────────────────────────────────────── */}
					{activeFieldTab === "month" && (
						<div className="space-y-5 pt-2">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{[
									{ label: "Every Month (*)", val: "*" },
									{ label: "Every Quarter (1,4,7,10)", val: "1,4,7,10" },
									{ label: "Every Half-Year (1,7)", val: "1,7" },
									{ label: "January Only (1)", val: "1" },
								].map((preset) => (
									<button
										key={preset.val}
										type="button"
										onClick={() => updatePart("month", preset.val)}
										className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
											parts?.month === preset.val
												? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
								{MONTHS.map((m) => {
									const isSelected =
										parts?.month === m.id ||
										parts?.month.split(",").includes(m.id);
									return (
										<button
											key={m.id}
											type="button"
											onClick={() => {
												if (parts?.month === "*") {
													updatePart("month", m.id);
												} else {
													const currentList = parts?.month.split(",") || [];
													if (currentList.includes(m.id)) {
														const next = currentList.filter((x) => x !== m.id);
														updatePart(
															"month",
															next.length > 0 ? next.join(",") : "*",
														);
													} else {
														updatePart(
															"month",
															[...currentList, m.id].join(","),
														);
													}
												}
											}}
											className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
												isSelected
													? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
													: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
											}`}
										>
											<span className="block text-xs font-extrabold">
												{m.name}
											</span>
											<span className="block text-[10px] font-mono text-slate-400">
												Month {m.id}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* ─── Day of Week Builder ────────────────────────────────────── */}
					{activeFieldTab === "dayOfWeek" && (
						<div className="space-y-5 pt-2">
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
								{[
									{ label: "Every Day (*)", val: "*" },
									{ label: "Weekdays Only (1-5)", val: "1-5" },
									{ label: "Weekends Only (0,6)", val: "0,6" },
									{ label: "Sunday Only (0)", val: "0" },
								].map((preset) => (
									<button
										key={preset.val}
										type="button"
										onClick={() => updatePart("dayOfWeek", preset.val)}
										className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
											parts?.dayOfWeek === preset.val
												? "border-indigo-600 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{preset.label}
									</button>
								))}
							</div>

							<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-2 border-t border-slate-100">
								{DAYS_OF_WEEK.map((d) => {
									const isSelected =
										parts?.dayOfWeek === d.id ||
										parts?.dayOfWeek.split(",").includes(d.id);
									return (
										<button
											key={d.id}
											type="button"
											onClick={() => {
												if (parts?.dayOfWeek === "*") {
													updatePart("dayOfWeek", d.id);
												} else {
													const currentList = parts?.dayOfWeek.split(",") || [];
													if (currentList.includes(d.id)) {
														const next = currentList.filter((x) => x !== d.id);
														updatePart(
															"dayOfWeek",
															next.length > 0 ? next.join(",") : "*",
														);
													} else {
														updatePart(
															"dayOfWeek",
															[...currentList, d.id].join(","),
														);
													}
												}
											}}
											className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
												isSelected
													? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
													: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-700"
											}`}
										>
											<span className="block text-xs font-extrabold">
												{d.name}
											</span>
											<span className="block text-[10px] font-mono text-slate-400">
												Day {d.id}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</motion.div>

				{/* Presets & Next Executions Workspace */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
					{/* Left: Presets Library */}
					<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
									<CalendarDays className="w-4 h-4 text-indigo-600" />
									Operational Presets
								</span>

								{/* Filter Pills */}
								<div className="flex items-center gap-1">
									{["All", "Frequent", "Daily", "Weekly", "Monthly"].map(
										(f) => (
											<button
												key={f}
												type="button"
												onClick={() => setPresetFilter(f)}
												className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
													presetFilter === f
														? "bg-slate-900 text-white"
														: "bg-slate-100 text-slate-600 hover:bg-slate-200"
												}`}
											>
												{f}
											</button>
										),
									)}
								</div>
							</div>

							<div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
								{filteredPresets.map((preset) => (
									<button
										key={preset.label}
										type="button"
										onClick={() => setRawCronInput(preset.cron)}
										className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
											rawCronInput === preset.cron
												? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 text-slate-800"
										}`}
									>
										<div className="space-y-0.5 min-w-0">
											<div className="flex items-center gap-2">
												<h4 className="text-xs font-extrabold text-slate-900 truncate">
													{preset.label}
												</h4>
												<span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-slate-200/60 text-slate-600">
													{preset.category}
												</span>
											</div>
											<p className="text-[11px] text-slate-500 truncate">
												{preset.description}
											</p>
										</div>
										<code className="font-mono text-xs font-bold text-indigo-600 bg-white border border-indigo-100 px-2 py-1 rounded-lg shrink-0">
											{preset.cron}
										</code>
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Right: Next Executions Timeline */}
					<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
									<Play className="w-4 h-4 text-indigo-600" />
									Execution Timeline (Next 10 Runs)
								</span>
								<button
									type="button"
									onClick={() => setCurrentTime(new Date())}
									className="text-slate-400 hover:text-indigo-600 transition-colors"
									title="Refresh countdowns"
								>
									<RefreshCw className="w-3.5 h-3.5" />
								</button>
							</div>

							{nextExecutions.length > 0 ? (
								<div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
									{nextExecutions.map((item, idx) => (
										<div
											key={`${item.timestamp}-${idx}`}
											className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors ${
												idx === 0
													? "bg-indigo-50/70 border-indigo-200/80 text-indigo-950 font-bold"
													: "bg-slate-50/50 border-slate-200/60 text-slate-700"
											}`}
										>
											<div className="flex items-center gap-3 min-w-0">
												<span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
													{idx + 1}
												</span>
												<span className="font-medium truncate">
													{item.localString}
												</span>
											</div>
											<span
												className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold shrink-0 ${
													idx === 0
														? "bg-indigo-600 text-white shadow-2xs"
														: "bg-slate-200/70 text-slate-600"
												}`}
											>
												{item.relativeString}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className="p-8 text-center text-slate-400 space-y-2">
									<AlertCircle className="w-8 h-8 mx-auto text-slate-300" />
									<p className="text-xs font-bold">
										No upcoming execution dates found for this expression.
									</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Guidelines & Spec Highlights */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
				>
					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
							<Calendar className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							POSIX Cron Standard
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Supports step values (`*/N`), ranges (`A-B`), lists (`A,B`), and
							aliases compatible with standard Linux/Unix schedulers.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
							<Layers className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Zero Ambiguity Translation
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Eliminate scheduling bugs with instant human-readable sentence
							generation and step verification.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
							<Clock className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Future Timeline Simulation
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Inspect the exact upcoming execution dates in your local timezone
							and UTC before deploying to production.
						</p>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
