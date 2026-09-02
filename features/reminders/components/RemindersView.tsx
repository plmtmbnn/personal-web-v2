"use client";

import { useState, useTransition, useCallback, useMemo } from "react";
import type { Reminder, ReminderTTL } from "../types";
import { addReminder, deleteReminder, extendReminder } from "../actions";
import {
	Bell,
	Trash2,
	Clock,
	Plus,
	Loader2,
	Calendar,
	CalendarDays,
	AlertCircle,
	Copy,
	Check,
	ExternalLink,
	Search,
	X,
	Sparkles,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

/**
 * Regex to detect URLs in text (http, https, or bare www.)
 */
const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+\.[^\s<]+)/gi;

/**
 * Extracts a short display label from a URL (hostname + truncated path).
 */
function shortenUrl(raw: string): string {
	try {
		const url = new URL(raw.startsWith("www.") ? `https://${raw}` : raw);
		const host = url.hostname.replace(/^www\./, "");
		const path = url.pathname === "/" ? "" : url.pathname;
		const display = host + path;
		return display.length > 32 ? `${display.slice(0, 30)}…` : display;
	} catch {
		return raw.length > 32 ? `${raw.slice(0, 30)}…` : raw;
	}
}

/**
 * Renders text with detected URLs as shortened, clickable, copiable link pills.
 */
function LinkifiedText({ text }: { text: string }) {
	const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

	const handleCopy = useCallback(async (e: React.MouseEvent, url: string) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const fullUrl = url.startsWith("www.") ? `https://${url}` : url;
			await navigator.clipboard.writeText(fullUrl);
			setCopiedUrl(url);
			setTimeout(() => setCopiedUrl(null), 1500);
		} catch {
			/* clipboard not available */
		}
	}, []);

	const parts = text.split(URL_REGEX);

	return (
		<>
			{parts.map((part, i) => {
				if (URL_REGEX.test(part)) {
					URL_REGEX.lastIndex = 0;
					const href = part.startsWith("www.") ? `https://${part}` : part;
					const isCopied = copiedUrl === part;

					return (
						<span
							key={`${part}-${i}`}
							className="inline-flex items-center gap-1 my-0.5 align-middle"
						>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-semibold rounded-lg border border-indigo-200 transition-all !no-underline"
								title={href}
							>
								<ExternalLink className="w-3 h-3 shrink-0" />
								<span>{shortenUrl(part)}</span>
							</a>
							<button
								type="button"
								onClick={(e) => handleCopy(e, part)}
								className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer active:scale-90"
								title="Copy link"
							>
								{isCopied ? (
									<Check className="w-3 h-3 text-emerald-600" />
								) : (
									<Copy className="w-3 h-3" />
								)}
							</button>
						</span>
					);
				}
				return part;
			})}
		</>
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
	const [ttl, setTtl] = useState<ReminderTTL>("day");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterTtl, setFilterTtl] = useState<
		"all" | "expiring_soon" | ReminderTTL
	>("all");
	const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const charsLeft = 150 - text.length;
	const isOverLimit = charsLeft < 0;

	const showToast = useCallback((msg: string) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 2000);
	}, []);

	const handleAdd = () => {
		if (!text.trim() || isOverLimit || isPending) return;

		startTransition(async () => {
			try {
				const { success, reminder } = await addReminder(text, ttl);
				if (success && reminder) {
					setReminders((prev) =>
						[...prev, reminder].sort(
							(a, b) =>
								new Date(a.expiresAt).getTime() -
								new Date(b.expiresAt).getTime(),
						),
					);
					setText("");
					setTtl("day");
					showToast("Reminder created successfully");
				}
			} catch (error) {
				console.error("Failed to add reminder", error);
			}
		});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
			e.preventDefault();
			handleAdd();
		}
	};

	const handleDelete = (id: string) => {
		if (isPending) return;
		startTransition(async () => {
			try {
				const { success } = await deleteReminder(id);
				if (success) {
					setReminders((prev) => prev.filter((r) => r.id !== id));
					showToast("Reminder deleted");
				}
			} catch (error) {
				console.error("Failed to delete reminder", error);
			}
		});
	};

	const handleExtend = (id: string, extendBy: ReminderTTL) => {
		if (isPending) return;
		startTransition(async () => {
			try {
				const { success, reminder } = await extendReminder(id, extendBy);
				if (success && reminder) {
					setReminders((prev) =>
						prev
							.map((r) => (r.id === id ? reminder : r))
							.sort(
								(a, b) =>
									new Date(a.expiresAt).getTime() -
									new Date(b.expiresAt).getTime(),
							),
					);
					showToast(
						`Extended by ${extendBy === "day" ? "1 Day" : extendBy === "week" ? "1 Week" : "1 Month"}`,
					);
				}
			} catch (error) {
				console.error("Failed to extend reminder", error);
			}
		});
	};

	const handleCopyNote = async (reminder: Reminder) => {
		try {
			await navigator.clipboard.writeText(reminder.text);
			setCopiedNoteId(reminder.id);
			showToast("Note copied to clipboard");
			setTimeout(() => setCopiedNoteId(null), 2000);
		} catch {
			/* clipboard unavailable */
		}
	};

	const ttlOptions: {
		value: ReminderTTL;
		label: string;
		icon: React.ElementType;
	}[] = [
		{ value: "day", label: "1 Day", icon: Clock },
		{ value: "week", label: "1 Week", icon: Calendar },
		{ value: "month", label: "1 Month", icon: CalendarDays },
	];

	// Filtered list
	const filteredReminders = useMemo(() => {
		return reminders.filter((r) => {
			const matchesSearch = r.text
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			if (!matchesSearch) return false;

			if (filterTtl === "all") return true;
			if (filterTtl === "expiring_soon") {
				const diff = new Date(r.expiresAt).getTime() - Date.now();
				return diff > 0 && diff < 86400 * 1000;
			}
			return r.ttl === filterTtl;
		});
	}, [reminders, searchQuery, filterTtl]);

	const expiringCount = useMemo(() => {
		const now = Date.now();
		return reminders.filter((r) => {
			const diff = new Date(r.expiresAt).getTime() - now;
			return diff > 0 && diff < 86400 * 1000;
		}).length;
	}, [reminders]);

	return (
		<div className="w-full max-w-4xl mx-auto space-y-6">
			{/* New Reminder Creation Card */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
							<Plus className="w-5 h-5 text-indigo-600" />
						</div>
						<div>
							<h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
								Create Quick Reminder
							</h2>
							<p className="text-xs text-slate-500 font-medium">
								Auto-expiring temporary notes and task links. Max 150 chars.
							</p>
						</div>
					</div>

					<span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-[10px] font-bold text-slate-500">
						<kbd className="font-mono font-bold">⌘/Ctrl + ↵</kbd> to save
					</span>
				</div>

				<div className="space-y-3">
					<div className="relative">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="What do you need to remember? (Paste links, tasks, or quick notes)..."
							className="w-full h-24 p-3.5 text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none placeholder:text-slate-400"
							maxLength={150}
						/>
						<div
							className={`absolute bottom-3 right-3.5 text-xs font-bold font-mono ${
								charsLeft <= 20 ? "text-amber-600" : "text-slate-400"
							}`}
						>
							{charsLeft}
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
						{/* TTL Switcher */}
						<div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80 w-full sm:w-auto gap-1">
							{ttlOptions.map((opt) => {
								const Icon = opt.icon;
								const isActive = ttl === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setTtl(opt.value)}
										className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
											isActive
												? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
												: "text-slate-500 hover:text-slate-900"
										}`}
									>
										<Icon className="w-3.5 h-3.5" />
										<span>{opt.label}</span>
									</button>
								);
							})}
						</div>

						{/* Submit Button */}
						<button
							type="button"
							onClick={handleAdd}
							disabled={!text.trim() || isOverLimit || isPending}
							className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
						>
							{isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Bell className="w-4 h-4" />
							)}
							<span>Save Note</span>
						</button>
					</div>
				</div>
			</div>

			{/* List Header, Search & Filter Bar */}
			<div className="space-y-3">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
							Active Reminders
						</h3>
						<span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700">
							{reminders.length}
						</span>
						{expiringCount > 0 && (
							<span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
								{expiringCount} expiring soon
							</span>
						)}
					</div>

					{/* Search Input */}
					<div className="relative w-full sm:w-64">
						<Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search notes or URLs..."
							className="w-full pl-8.5 pr-8 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-xs"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>
				</div>

				{/* Filter Tabs */}
				<div className="flex flex-wrap items-center gap-1.5 px-1">
					<button
						type="button"
						onClick={() => setFilterTtl("all")}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							filterTtl === "all"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
						}`}
					>
						All ({reminders.length})
					</button>

					{expiringCount > 0 && (
						<button
							type="button"
							onClick={() => setFilterTtl("expiring_soon")}
							className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
								filterTtl === "expiring_soon"
									? "bg-amber-600 text-white shadow-xs"
									: "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
							}`}
						>
							<AlertCircle className="w-3 h-3" />
							<span>Expiring Soon ({expiringCount})</span>
						</button>
					)}

					<button
						type="button"
						onClick={() => setFilterTtl("day")}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							filterTtl === "day"
								? "bg-indigo-600 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
						}`}
					>
						1 Day
					</button>

					<button
						type="button"
						onClick={() => setFilterTtl("week")}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							filterTtl === "week"
								? "bg-indigo-600 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
						}`}
					>
						1 Week
					</button>

					<button
						type="button"
						onClick={() => setFilterTtl("month")}
						className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
							filterTtl === "month"
								? "bg-indigo-600 text-white shadow-xs"
								: "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
						}`}
					>
						1 Month
					</button>
				</div>

				{/* Reminders Grid */}
				{filteredReminders.length === 0 ? (
					<div className="py-12 bg-white border border-slate-200/80 rounded-2xl text-center shadow-xs space-y-2">
						<div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
							<Bell className="w-5 h-5" />
						</div>
						<p className="text-sm font-extrabold text-slate-800">
							{searchQuery
								? "No matching reminders found"
								: "No active reminders"}
						</p>
						<p className="text-xs text-slate-500 max-w-sm mx-auto">
							{searchQuery
								? "Try a different search query or clear the filter."
								: "Create a note above to quickly store temporary tasks or URLs."}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
						{filteredReminders.map((reminder) => {
							const isExpiringSoon =
								new Date(reminder.expiresAt).getTime() - Date.now() <
								86400 * 1000; // < 1 day

							return (
								<motion.div
									key={reminder.id}
									initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
									animate={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.3 }}
									className={`group bg-white rounded-2xl border ${
										isExpiringSoon ? "border-amber-300" : "border-slate-200/80"
									} shadow-xs hover:shadow-md transition-all p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between h-full`}
								>
									{/* Solid Accent Top Bar (No Gradients) */}
									{isExpiringSoon && (
										<div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
									)}

									{/* Note Body Text */}
									<div className="text-xs sm:text-sm font-medium text-slate-800 mb-5 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
										<LinkifiedText text={reminder.text} />
									</div>

									{/* Card Footer Actions */}
									<div className="flex flex-wrap items-center justify-between mt-auto gap-2 pt-2 border-t border-slate-100">
										{/* Expiry Timestamp */}
										<div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-500">
											{isExpiringSoon ? (
												<AlertCircle className="w-3.5 h-3.5 text-amber-600" />
											) : (
												<Clock className="w-3.5 h-3.5 text-slate-400" />
											)}
											<span
												className={
													isExpiringSoon ? "text-amber-700 font-extrabold" : ""
												}
											>
												Exp {formatDistanceToNow(new Date(reminder.expiresAt))}
											</span>
										</div>

										{/* Quick Action Buttons */}
										<div className="flex items-center gap-1">
											{/* Copy Note Button */}
											<button
												type="button"
												onClick={() => handleCopyNote(reminder)}
												className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
												title="Copy full note"
												aria-label="Copy note text"
											>
												{copiedNoteId === reminder.id ? (
													<Check className="w-3.5 h-3.5 text-emerald-600" />
												) : (
													<Copy className="w-3.5 h-3.5" />
												)}
											</button>

											{/* Duration Extension Badges */}
											<div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5">
												<button
													type="button"
													onClick={() => handleExtend(reminder.id, "day")}
													disabled={isPending}
													className="px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600 hover:text-indigo-700 hover:bg-white rounded transition-all cursor-pointer"
													title="Extend +1 Day"
												>
													+1D
												</button>
												<button
													type="button"
													onClick={() => handleExtend(reminder.id, "week")}
													disabled={isPending}
													className="px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600 hover:text-indigo-700 hover:bg-white rounded transition-all cursor-pointer"
													title="Extend +1 Week"
												>
													+1W
												</button>
												<button
													type="button"
													onClick={() => handleExtend(reminder.id, "month")}
													disabled={isPending}
													className="px-1.5 py-0.5 text-[10px] font-extrabold text-slate-600 hover:text-indigo-700 hover:bg-white rounded transition-all cursor-pointer"
													title="Extend +1 Month"
												>
													+1M
												</button>
											</div>

											{/* Delete Action */}
											<button
												type="button"
												onClick={() => handleDelete(reminder.id)}
												disabled={isPending}
												className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
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
					</div>
				)}
			</div>

			{/* Toast Notification Alert */}
			<AnimatePresence>
				{toastMessage && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold shadow-lg z-[100] flex items-center gap-2"
					>
						<Sparkles className="w-3.5 h-3.5 text-indigo-400" />
						<span className="text-xs text-white font-medium">
							{toastMessage}
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
