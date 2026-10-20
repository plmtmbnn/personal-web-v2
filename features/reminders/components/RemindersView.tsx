"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import type { Reminder, DueDatePreset } from "../types";
import { addReminder, deleteReminder } from "../actions";
import {
	Bell,
	Check,
	Trash2,
	Plus,
	Loader2,
	ChevronRight,
	ArrowLeft,
	Search,
	X,
	Calendar as CalendarIcon,
	AlertCircle,
	Copy,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";

/**
 * Regex to detect URLs in text (http, https, or bare www.)
 */
const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+\.[^\s<]+)/gi;

/**
 * Extracts a concise display label from a URL (e.g. "github.com/org/repo" -> "github.com/…").
 */
function shortenUrl(raw: string): string {
	try {
		const clean = raw.startsWith("www.") ? `https://${raw}` : raw;
		const url = new URL(clean);
		const host = url.hostname.replace(/^www\./, "");
		const path = url.pathname.replace(/\/$/, "");

		if (!path || path === "") {
			return host;
		}
		const display = `${host}${path}`;
		if (display.length <= 18) {
			return display;
		}
		return `${host}/…`;
	} catch {
		return raw.length > 18 ? `${raw.slice(0, 16)}…` : raw;
	}
}

/**
 * Formats due date with intuitive relative tags and high-contrast status colors.
 */
function formatDueDate(dateStr: string): {
	label: string;
	status: "overdue" | "today" | "tomorrow" | "upcoming";
	fullDate: string;
} {
	const due = new Date(dateStr);
	const now = new Date();

	// Local calendar day normalization
	const startOfToday = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	).getTime();
	const startOfTomorrow = startOfToday + 86400000;
	const startOfDayAfter = startOfTomorrow + 86400000;
	const dueTime = due.getTime();

	const fullDate = due.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: due.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});

	if (dueTime < startOfToday) {
		const daysOverdue = Math.max(
			1,
			Math.floor((startOfToday - dueTime) / 86400000),
		);
		return {
			label:
				daysOverdue === 1
					? "Overdue (Yesterday)"
					: `Overdue (${daysOverdue}d ago)`,
			status: "overdue",
			fullDate,
		};
	}

	if (dueTime < startOfTomorrow) {
		return {
			label: "Due Today",
			status: "today",
			fullDate,
		};
	}

	if (dueTime < startOfDayAfter) {
		return {
			label: "Due Tomorrow",
			status: "tomorrow",
			fullDate,
		};
	}

	return {
		label: fullDate,
		status: "upcoming",
		fullDate,
	};
}

/**
 * Text renderer that styles URLs as clean clickable external pills.
 */
function LinkifiedItemText({ text }: { text: string }) {
	const parts = text.split(URL_REGEX);

	return (
		<span className="leading-relaxed">
			{parts.map((part, index) => {
				const isUrl = part.match(URL_REGEX);
				if (!isUrl) {
					return <span key={`text-${index}-${part.slice(0, 8)}`}>{part}</span>;
				}

				const href = part.startsWith("www.") ? `https://${part}` : part;
				const displayLabel = shortenUrl(part);

				return (
					<a
						key={`url-${index}-${href}`}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200/80 text-slate-800 hover:text-slate-950 font-mono text-xs font-semibold border border-slate-200/80 transition-colors !no-underline"
						title={href}
					>
						<span>{displayLabel}</span>
					</a>
				);
			})}
		</span>
	);
}

export default function RemindersView({
	initialReminders,
}: {
	initialReminders: Reminder[];
}) {
	const reduceMotion = useReducedMotion();
	const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
	const [text, setText] = useState("");
	const [duePreset, setDuePreset] = useState<DueDatePreset>("today");
	const [customDate, setCustomDate] = useState("");
	const [showCustomPicker, setShowCustomPicker] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isPending, startTransition] = useTransition();

	// Optimistic undo state
	const [recentlyCompleted, setRecentlyCompleted] = useState<Reminder | null>(
		null,
	);
	const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
	const [copiedId, setCopiedId] = useState<string | null>(null);

	const charsLeft = 150 - text.length;
	const isOverLimit = charsLeft < 0;

	// Submit reminder handler
	const handleAdd = () => {
		if (!text.trim() || isOverLimit || isPending) return;

		const targetDateParam =
			duePreset === "custom" && customDate ? customDate : duePreset;

		startTransition(async () => {
			try {
				const { success, reminder } = await addReminder(text, targetDateParam);
				if (success && reminder) {
					setReminders((prev) =>
						[...prev, reminder].sort(
							(a, b) =>
								new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
						),
					);
					setText("");
					setDuePreset("today");
					setShowCustomPicker(false);
					setCustomDate("");
				}
			} catch (err) {
				console.error("Failed to add reminder:", err);
			}
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAdd();
		}
	};

	// 1-Click Complete with 3.5-second Undo Toast
	const handleComplete = (reminder: Reminder) => {
		if (undoTimerRef.current) {
			clearTimeout(undoTimerRef.current);
		}

		// Optimistically remove from list immediately
		setReminders((prev) => prev.filter((r) => r.id !== reminder.id));
		setRecentlyCompleted(reminder);

		// Commit deletion after undo window expires
		undoTimerRef.current = setTimeout(() => {
			startTransition(async () => {
				try {
					await deleteReminder(reminder.id);
				} catch (err) {
					console.error("Failed to delete reminder:", err);
				}
			});
			setRecentlyCompleted(null);
		}, 3500);
	};

	// Undo action
	const handleUndo = () => {
		if (!recentlyCompleted) return;
		if (undoTimerRef.current) {
			clearTimeout(undoTimerRef.current);
		}
		const restored = recentlyCompleted;
		setRecentlyCompleted(null);
		setReminders((prev) =>
			[...prev, restored].sort(
				(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
			),
		);
	};

	// Direct delete without undo toast
	const handleDirectDelete = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setReminders((prev) => prev.filter((r) => r.id !== id));
		startTransition(async () => {
			try {
				await deleteReminder(id);
			} catch (err) {
				console.error("Failed to delete reminder:", err);
			}
		});
	};

	const handleCopyText = async (reminder: Reminder, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(reminder.text);
			setCopiedId(reminder.id);
			setTimeout(() => setCopiedId(null), 1500);
		} catch {
			/* clipboard unavailable */
		}
	};

	// Filtered list based on search, sorted by urgency (overdue & today first)
	const filteredReminders = useMemo(() => {
		const base = !searchQuery.trim()
			? reminders
			: reminders.filter((r) =>
					r.text.toLowerCase().includes(searchQuery.toLowerCase()),
				);
		return [...base].sort(
			(a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
		);
	}, [reminders, searchQuery]);

	// Counts
	const activeCount = reminders.length;
	const overdueCount = useMemo(() => {
		const startOfToday = new Date().setHours(0, 0, 0, 0);
		return reminders.filter((r) => new Date(r.dueDate).getTime() < startOfToday)
			.length;
	}, [reminders]);

	return (
		<div className="w-full space-y-6 sm:space-y-7 max-w-4xl mx-auto">
			{/* ═══════════════════════════════════════
			    TOP FLOATING HEADER CARD (Clean Header Standard)
			═══════════════════════════════════════ */}
			<div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
					<div className="flex items-start gap-3.5 sm:gap-4">
						<div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs text-amber-600">
							<Bell className="w-5 h-5 sm:w-6 sm:h-6" />
						</div>
						<div className="space-y-1">
							{/* Contextual Breadcrumbs */}
							<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
								<Link
									href="/admin"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Admin Dashboard
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
								<span className="text-slate-900 font-bold">
									Quick Reminders
								</span>
							</div>
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
								Quick Reminders
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 max-w-lg leading-relaxed">
								Straightforward reminders and due-date tracking.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2 self-start sm:self-center shrink-0">
						{/* Active Count Badge */}
						<span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/70 text-xs font-bold text-slate-700">
							<span>{activeCount} Active</span>
							{overdueCount > 0 && (
								<span className="px-1.5 py-0.2 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-mono font-bold">
									{overdueCount} Overdue
								</span>
							)}
						</span>

						{/* Admin Hub Return Button */}
						<Link
							href="/admin"
							className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline group"
						>
							<ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
							<span>Admin Hub</span>
						</Link>
					</div>
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    INLINE QUICK-ADD COMPOSER BAR
			═══════════════════════════════════════ */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs p-3 sm:p-4 space-y-3">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
					{/* Text Input */}
					<div className="relative flex-1">
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Remind me to... (e.g. check index flows or reply to client)"
							className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50/80 focus:bg-white border border-slate-200/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-inner"
							maxLength={150}
						/>
						{/* Character counter */}
						<span
							className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold ${
								charsLeft < 0
									? "text-rose-600 font-extrabold"
									: charsLeft <= 20
										? "text-amber-600"
										: "text-slate-400"
							}`}
						>
							{charsLeft}
						</span>
					</div>

					{/* Add Button */}
					<button
						type="button"
						onClick={handleAdd}
						disabled={!text.trim() || isOverLimit || isPending}
						className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl transition-[background-color,transform] shadow-xs active:scale-95 cursor-pointer touch-manipulation shrink-0"
					>
						{isPending ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
						) : (
							<Plus className="w-3.5 h-3.5 text-white" />
						)}
						<span>Add Reminder</span>
					</button>
				</div>

				{/* Due Date Preset Selector Chips */}
				<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
					<span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
						Due:
					</span>

					<button
						type="button"
						onClick={() => {
							setDuePreset("today");
							setShowCustomPicker(false);
						}}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
							duePreset === "today" && !showCustomPicker
								? "bg-slate-900 text-white shadow-2xs font-extrabold"
								: "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60"
						}`}
					>
						Today
					</button>

					<button
						type="button"
						onClick={() => {
							setDuePreset("tomorrow");
							setShowCustomPicker(false);
						}}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
							duePreset === "tomorrow" && !showCustomPicker
								? "bg-slate-900 text-white shadow-2xs font-extrabold"
								: "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60"
						}`}
					>
						Tomorrow
					</button>

					<button
						type="button"
						onClick={() => {
							setDuePreset("week");
							setShowCustomPicker(false);
						}}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
							duePreset === "week" && !showCustomPicker
								? "bg-slate-900 text-white shadow-2xs font-extrabold"
								: "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60"
						}`}
					>
						In 1 Week
					</button>

					{/* Custom Date Toggle */}
					<button
						type="button"
						onClick={() => {
							setShowCustomPicker((prev) => !prev);
							setDuePreset("custom");
						}}
						className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-95 ${
							showCustomPicker || duePreset === "custom"
								? "bg-slate-900 text-white shadow-2xs font-extrabold"
								: "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 border border-slate-200/60"
						}`}
					>
						<CalendarIcon className="w-3 h-3" />
						<span>{customDate ? customDate : "Pick Date"}</span>
					</button>

					{/* Inline Native Date Picker */}
					{showCustomPicker && (
						<input
							type="date"
							value={customDate}
							onChange={(e) => {
								setCustomDate(e.target.value);
								setDuePreset("custom");
							}}
							className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-white border border-slate-300 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs"
						/>
					)}
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    SEARCH TOOLBAR (Conditional)
			═══════════════════════════════════════ */}
			{reminders.length > 0 && (
				<div className="flex items-center justify-between gap-3 px-1">
					<div className="relative flex-1 max-w-xs group">
						<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10 group-focus-within:text-slate-900 transition-colors" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search reminders..."
							className="w-full pl-9 pr-7 py-1.5 bg-white border border-slate-200/80 focus:border-slate-400 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-all"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
								title="Clear search"
							>
								<X className="w-2.5 h-2.5" />
							</button>
						)}
					</div>

					<span className="text-xs text-slate-400 font-medium shrink-0">
						{filteredReminders.length} of {reminders.length} items
					</span>
				</div>
			)}

			{/* ═══════════════════════════════════════
			    THE REMINDERS LIST (Focus: Item & Due Date)
			═══════════════════════════════════════ */}
			{filteredReminders.length === 0 ? (
				<div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs space-y-3">
					<div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
						<Bell className="w-5 h-5" />
					</div>
					<div className="space-y-1">
						<h2 className="text-base font-bold text-slate-900">
							{searchQuery
								? "No matching reminders found"
								: "No active reminders"}
						</h2>
						<p className="text-xs text-slate-500 max-w-sm mx-auto">
							{searchQuery
								? "Try a different search query or clear the filter."
								: "Add an item above to keep track of tasks with target due dates."}
						</p>
					</div>
					{searchQuery && (
						<button
							type="button"
							onClick={() => setSearchQuery("")}
							className="mt-2 text-xs font-bold text-slate-700 hover:text-slate-950 underline cursor-pointer"
						>
							Clear Search
						</button>
					)}
				</div>
			) : (
				<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
					<AnimatePresence initial={false}>
						{filteredReminders.map((reminder) => {
							const { label: dueLabel, status: dueStatus } = formatDueDate(
								reminder.dueDate,
							);
							const isCopied = copiedId === reminder.id;

							return (
								<motion.div
									key={reminder.id}
									layout="position"
									initial={reduceMotion ? false : { opacity: 0, y: -8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
									transition={{ duration: 0.18 }}
									className="group p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4"
								>
									{/* Top tier (Mobile) / Left side (Desktop): Checkbox + Item Description */}
									<div className="flex items-start gap-3 min-w-0 flex-1">
										{/* 1-Click Complete Circle Trigger with expanded touch bounding area */}
										<button
											type="button"
											onClick={() => handleComplete(reminder)}
											className="relative -m-1.5 p-1.5 rounded-full flex items-center justify-center shrink-0 cursor-pointer active:scale-90 touch-manipulation group/check"
											title="Mark as completed"
											aria-label={`Complete reminder: ${reminder.text}`}
										>
											<div className="w-5 h-5 rounded-full border-2 border-slate-300 group-hover/check:border-emerald-500 group-hover/check:bg-emerald-50 flex items-center justify-center text-emerald-600 transition-all shadow-2xs">
												<Check className="w-3 h-3 opacity-0 group-hover/check:opacity-100 transition-opacity" />
											</div>
										</button>

										{/* Message Text with Linkification */}
										<div className="min-w-0 flex-1 pt-0.5">
											<div className="text-sm font-semibold text-slate-800 leading-snug break-words">
												<LinkifiedItemText text={reminder.text} />
											</div>
										</div>
									</div>

									{/* Bottom tier (Mobile sub-row) / Right side (Desktop): Due Date Pill + Quick Actions */}
									<div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pl-8 sm:pl-0 shrink-0">
										{/* Due Date Pill */}
										<span
											className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs ${
												dueStatus === "overdue"
													? "bg-rose-50 border-rose-200/90 text-rose-700"
													: dueStatus === "today"
														? "bg-amber-50 border-amber-200/90 text-amber-800"
														: "bg-slate-50 border-slate-200/80 text-slate-600"
											}`}
										>
											{dueStatus === "overdue" ? (
												<AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
											) : (
												<CalendarIcon className="w-3 h-3 text-slate-400 shrink-0" />
											)}
											<span>{dueLabel}</span>
										</span>

										{/* Quick Actions (Always visible on mobile, hover-revealed on desktop) */}
										<div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100 transition-opacity">
											{/* Copy Note Button */}
											<button
												type="button"
												onClick={(e) => handleCopyText(reminder, e)}
												className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all active:scale-90 cursor-pointer touch-manipulation"
												title="Copy note text"
												aria-label="Copy note text"
											>
												{isCopied ? (
													<Check className="w-3.5 h-3.5 text-emerald-600" />
												) : (
													<Copy className="w-3.5 h-3.5" />
												)}
											</button>

											{/* Direct Delete Trigger */}
											<button
												type="button"
												onClick={(e) => handleDirectDelete(reminder.id, e)}
												className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90 cursor-pointer touch-manipulation"
												title="Delete reminder"
												aria-label="Delete reminder"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								</motion.div>
							);
						})}
					</AnimatePresence>
				</div>
			)}

			{/* ═══════════════════════════════════════
			    FLOATING UNDO TOAST (3.5s window)
			═══════════════════════════════════════ */}
			<AnimatePresence>
				{recentlyCompleted && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 12 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-2xl font-bold shadow-2xl z-[100] flex items-center gap-3 border border-slate-800"
					>
						<div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
							<Check className="w-4 h-4 text-emerald-400 shrink-0" />
							<span>Reminder completed</span>
						</div>
						<div className="h-4 w-px bg-slate-700" />
						<button
							type="button"
							onClick={handleUndo}
							className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer active:scale-95"
						>
							Undo
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
