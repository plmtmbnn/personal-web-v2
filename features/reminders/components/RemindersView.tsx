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
	CornerDownLeft,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import CustomModal from "@/features/shared/components/CustomModal";

/**
 * Regex to detect URLs in text (http, https, or bare www.)
 */
const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+\.[^\s<]+)/gi;

/**
 * Strips trailing sentence punctuation (. , ! ? ; : ) ] } ") from a raw matched URL string
 */
function cleanRawUrl(raw: string): { url: string; trailing: string } {
	const match = raw.match(/^(.*?)([.,;:!?)]+)$/);
	if (match) {
		return { url: match[1], trailing: match[2] };
	}
	return { url: raw, trailing: "" };
}

/**
 * Extracts a concise display label from a URL (e.g. "github.com/…" or "example.com").
 * Shortens URLs to stay compact inside card messages.
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

		// If total length is short (<= 16 chars, e.g. "github.com/me"), display it directly
		const display = `${host}${path}`;
		if (display.length <= 16) {
			return display;
		}

		// Otherwise, display concise host/… (e.g. "github.com/…", "figma.com/…")
		return `${host}/…`;
	} catch {
		return raw.length > 16 ? `${raw.slice(0, 14)}…` : raw;
	}
}

/**
 * Formats reminder creation timestamp with a concise and consistent label.
 */
function formatCreatedTime(createdAt: string): string {
	const createdTime = new Date(createdAt).getTime();
	const now = Date.now();
	const diffSeconds = Math.max(0, Math.floor((now - createdTime) / 1000));

	if (diffSeconds < 60) {
		return "Created < 1 min ago";
	}

	const distance = formatDistanceToNow(new Date(createdAt), {
		addSuffix: true,
	});

	if (distance.includes("less than a minute")) {
		return "Created < 1 min ago";
	}

	return `Created ${distance}`;
}

/**
 * Renders text with detected URLs as shortened, clickable pills opening in a new tab.
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
					const { url: matchedUrl, trailing } = cleanRawUrl(part);
					const href = matchedUrl.startsWith("www.")
						? `https://${matchedUrl}`
						: matchedUrl;
					const isCopied = copiedUrl === matchedUrl;

					return (
						<span key={`${part}-${i}`}>
							<span className="inline-flex items-center gap-1 my-0.5 align-middle mx-1">
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 border border-indigo-200/80 transition-all font-mono text-xs font-bold !no-underline shadow-2xs hover:shadow-xs group/link cursor-pointer"
									title={`Open link in new tab:\n${href}`}
								>
									<ExternalLink className="w-3.5 h-3.5 text-indigo-500 group-hover/link:text-indigo-700 shrink-0 transition-colors" />
									<span className="tracking-tight">
										{shortenUrl(matchedUrl)}
									</span>
								</a>
								<button
									type="button"
									onClick={(e) => handleCopy(e, matchedUrl)}
									className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer active:scale-90"
									title="Copy link address"
									aria-label="Copy link address"
								>
									{isCopied ? (
										<Check className="w-3.5 h-3.5 text-emerald-600" />
									) : (
										<Copy className="w-3.5 h-3.5" />
									)}
								</button>
							</span>
							{trailing}
						</span>
					);
				}
				return <span key={i}>{part}</span>;
			})}
		</>
	);
}

const TTL_CONFIG: Record<
	ReminderTTL,
	{
		label: string;
		shortLabel: string;
		badgeBg: string;
		badgeText: string;
		badgeBorder: string;
		solidAccent: string;
		icon: React.ElementType;
	}
> = {
	day: {
		label: "1 Day",
		shortLabel: "1D",
		badgeBg: "bg-sky-50",
		badgeText: "text-sky-700",
		badgeBorder: "border-sky-200/80",
		solidAccent: "bg-sky-500",
		icon: Clock,
	},
	week: {
		label: "1 Week",
		shortLabel: "1W",
		badgeBg: "bg-indigo-50",
		badgeText: "text-indigo-700",
		badgeBorder: "border-indigo-200/80",
		solidAccent: "bg-indigo-500",
		icon: Calendar,
	},
	month: {
		label: "1 Month",
		shortLabel: "1M",
		badgeBg: "bg-purple-50",
		badgeText: "text-purple-700",
		badgeBorder: "border-purple-200/80",
		solidAccent: "bg-purple-500",
		icon: CalendarDays,
	},
};

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
	const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isPending, startTransition] = useTransition();

	const charsLeft = 150 - text.length;
	const isOverLimit = charsLeft < 0;

	const showToast = useCallback((msg: string) => {
		setToastMessage(msg);
		setTimeout(() => setToastMessage(null), 2200);
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
		setDeleteReminderId(id);
	};

	const handleConfirmDelete = () => {
		if (!deleteReminderId || isDeleting) return;
		const id = deleteReminderId;
		setIsDeleting(true);

		startTransition(async () => {
			try {
				const { success } = await deleteReminder(id);
				if (success) {
					setReminders((prev) => prev.filter((r) => r.id !== id));
					showToast("Reminder deleted");
				}
			} catch (error) {
				console.error("Failed to delete reminder", error);
				showToast("Failed to delete reminder");
			} finally {
				setIsDeleting(false);
				setDeleteReminderId(null);
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

	const countsByTtl = useMemo(() => {
		return {
			day: reminders.filter((r) => r.ttl === "day").length,
			week: reminders.filter((r) => r.ttl === "week").length,
			month: reminders.filter((r) => r.ttl === "month").length,
		};
	}, [reminders]);

	return (
		<div className="w-full space-y-6 sm:space-y-8">
			{/* ═══════════════════════════════════════
			    NEW REMINDER CREATION CARD
			═══════════════════════════════════════ */}
			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-4">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3.5">
						<div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs">
							<Plus className="w-5 h-5 text-amber-600" />
						</div>
						<div>
							<h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
								Create Quick Reminder
							</h2>
							<p className="text-xs sm:text-sm text-slate-500 font-normal">
								Auto-expiring temporary notes, URLs, and immediate execution
								tasks.
							</p>
						</div>
					</div>

					<span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-500 shrink-0">
						<kbd className="font-mono font-bold text-slate-700">⌘/Ctrl + ↵</kbd>{" "}
						to save
					</span>
				</div>

				<div className="space-y-3 pt-1">
					<div className="relative">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="What do you need to remember? (e.g. review https://github.com/org/repo/pull/123 or check server logs)..."
							className="w-full h-28 sm:h-32 p-4 text-sm sm:text-base font-medium text-slate-900 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none placeholder:text-slate-400 leading-relaxed shadow-inner"
							maxLength={150}
						/>
						<div
							className={`absolute bottom-3.5 right-4 text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
								charsLeft < 0
									? "bg-rose-50 text-rose-600 border border-rose-200"
									: charsLeft <= 20
										? "bg-amber-50 text-amber-700 border border-amber-200"
										: "text-slate-400 bg-white/80"
							}`}
						>
							{charsLeft} left
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
						{/* TTL Switcher Segmented Track */}
						<div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/70 gap-1">
							{ttlOptions.map((opt) => {
								const Icon = opt.icon;
								const isActive = ttl === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setTtl(opt.value)}
										className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-[background-color,color,box-shadow] cursor-pointer ${
											isActive
												? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black"
												: "text-slate-600 hover:text-slate-900 hover:bg-white/60"
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
							className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-[background-color,transform] shadow-xs active:scale-95 cursor-pointer"
						>
							{isPending ? (
								<Loader2 className="w-4 h-4 animate-spin text-white" />
							) : (
								<CornerDownLeft className="w-4 h-4 text-white" />
							)}
							<span>Save Note</span>
						</button>
					</div>
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    FLOATING CONTROLS TOOLBAR: Filter & Search
			═══════════════════════════════════════ */}
			<div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs space-y-3">
				<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
					{/* Filter Pills Track */}
					<div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar py-0.5">
						<button
							type="button"
							onClick={() => setFilterTtl("all")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
								filterTtl === "all"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
							}`}
						>
							<span>All</span>
							<span
								className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
									filterTtl === "all"
										? "bg-slate-800 text-slate-200"
										: "bg-white text-slate-500 border border-slate-200/60"
								}`}
							>
								{reminders.length}
							</span>
						</button>

						{expiringCount > 0 && (
							<button
								type="button"
								onClick={() => setFilterTtl("expiring_soon")}
								className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
									filterTtl === "expiring_soon"
										? "bg-amber-600 text-white shadow-xs"
										: "bg-amber-50 border border-amber-200/80 text-amber-800 hover:bg-amber-100"
								}`}
							>
								<AlertCircle className="w-3.5 h-3.5 text-amber-600" />
								<span>Expiring Soon</span>
								<span
									className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
										filterTtl === "expiring_soon"
											? "bg-amber-700 text-white"
											: "bg-white text-amber-700 border border-amber-200"
									}`}
								>
									{expiringCount}
								</span>
							</button>
						)}

						<button
							type="button"
							onClick={() => setFilterTtl("day")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
								filterTtl === "day"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
							}`}
						>
							<span>1 Day</span>
							<span
								className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
									filterTtl === "day"
										? "bg-slate-800 text-slate-200"
										: "bg-white text-slate-500 border border-slate-200/60"
								}`}
							>
								{countsByTtl.day}
							</span>
						</button>

						<button
							type="button"
							onClick={() => setFilterTtl("week")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
								filterTtl === "week"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
							}`}
						>
							<span>1 Week</span>
							<span
								className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
									filterTtl === "week"
										? "bg-slate-800 text-slate-200"
										: "bg-white text-slate-500 border border-slate-200/60"
								}`}
							>
								{countsByTtl.week}
							</span>
						</button>

						<button
							type="button"
							onClick={() => setFilterTtl("month")}
							className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
								filterTtl === "month"
									? "bg-slate-900 text-white shadow-xs"
									: "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
							}`}
						>
							<span>1 Month</span>
							<span
								className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
									filterTtl === "month"
										? "bg-slate-800 text-slate-200"
										: "bg-white text-slate-500 border border-slate-200/60"
								}`}
							>
								{countsByTtl.month}
							</span>
						</button>
					</div>

					{/* Search Input (Strict UI hygiene: pointer-events-none z-10 with pl-10) */}
					<div className="relative w-full md:w-72 group">
						<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 group-focus-within:text-indigo-600 transition-colors" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search notes or links..."
							className="w-full pl-10 pr-9 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
						/>
						{searchQuery && (
							<button
								type="button"
								onClick={() => setSearchQuery("")}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 cursor-pointer z-10"
								title="Clear search"
							>
								<X className="w-2.5 h-2.5" />
							</button>
						)}
					</div>
				</div>

				{/* Active Filter Summary Strip */}
				{(searchQuery || filterTtl !== "all") && (
					<div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
						<span>
							Showing{" "}
							<strong className="text-slate-900">
								{filteredReminders.length}
							</strong>{" "}
							{filteredReminders.length === 1 ? "reminder" : "reminders"}
							{filterTtl !== "all" && ` with duration ${filterTtl}`}
							{searchQuery && ` matching "${searchQuery}"`}
						</span>
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setFilterTtl("all");
							}}
							className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer active:scale-95"
						>
							<X className="w-3.5 h-3.5" />
							<span>Reset Filters</span>
						</button>
					</div>
				)}
			</div>

			{/* ═══════════════════════════════════════
			    REMINDERS GRID
			═══════════════════════════════════════ */}
			{filteredReminders.length === 0 ? (
				<div className="py-16 bg-white border border-slate-200/80 rounded-3xl text-center shadow-xs space-y-3 p-8 max-w-md mx-auto">
					<div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center text-amber-600 mx-auto shadow-2xs">
						<Bell className="w-5 h-5" />
					</div>
					<div className="space-y-1">
						<h3 className="text-base font-black text-slate-900 tracking-tight">
							{searchQuery
								? "No matching reminders found"
								: "No active reminders"}
						</h3>
						<p className="text-xs text-slate-500 font-normal leading-relaxed max-w-xs mx-auto">
							{searchQuery
								? "Try a different keyword or reset the duration filter."
								: "Create a note above to quickly store temporary tasks, links, or alerts."}
						</p>
					</div>
					{(searchQuery || filterTtl !== "all") && (
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setFilterTtl("all");
							}}
							className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
						>
							<span>Clear Filters</span>
						</button>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
					{filteredReminders.map((reminder) => {
						const isExpiringSoon =
							new Date(reminder.expiresAt).getTime() - Date.now() <
							86400 * 1000; // < 1 day
						const ttlMeta = TTL_CONFIG[reminder.ttl] || TTL_CONFIG.day;
						const TTLIcon = ttlMeta.icon;

						return (
							<motion.div
								key={reminder.id}
								initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.2 }}
								className={`group bg-white rounded-3xl border ${
									isExpiringSoon
										? "border-amber-300 ring-1 ring-amber-200/70"
										: "border-slate-200/80 hover:border-slate-300"
								} shadow-xs hover:shadow-md transition-[box-shadow,border-color,transform] p-5 sm:p-6 relative overflow-hidden flex flex-col justify-between h-full`}
							>
								{/* Solid Accent Top Bar (Strict Anti-Gradient mandate) */}
								<div
									className={`absolute top-0 left-0 right-0 h-1.5 ${
										isExpiringSoon ? "bg-amber-500" : ttlMeta.solidAccent
									}`}
								/>

								<div>
									{/* Top Metadata Header */}
									<div className="flex items-center justify-between gap-2 mb-3.5">
										{/* Lifespan category badge */}
										<span
											className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${ttlMeta.badgeBg} ${ttlMeta.badgeText} ${ttlMeta.badgeBorder}`}
										>
											<TTLIcon className="w-3.5 h-3.5" />
											<span>{ttlMeta.label}</span>
										</span>

										{/* Expiry status */}
										{isExpiringSoon ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black tracking-tight">
												<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
												<span>
													Expires in{" "}
													{formatDistanceToNow(new Date(reminder.expiresAt))}
												</span>
											</span>
										) : (
											<span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/70">
												<Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>
													{formatDistanceToNow(new Date(reminder.expiresAt))}{" "}
													left
												</span>
											</span>
										)}
									</div>

									{/* Message Body Text: Revamped with bold high-contrast font */}
									<div className="text-base sm:text-lg font-bold text-slate-900 leading-snug sm:leading-relaxed tracking-tight break-words whitespace-pre-wrap mb-5">
										<LinkifiedText text={reminder.text} />
									</div>
								</div>

								{/* Card Footer Actions */}
								<div className="flex flex-wrap items-center justify-between mt-auto gap-2 pt-3.5 border-t border-slate-100">
									{/* Creation timestamp */}
									<span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
										{formatCreatedTime(reminder.createdAt)}
									</span>

									{/* Quick Action Buttons */}
									<div className="flex items-center gap-1.5 shrink-0">
										{/* Copy Note Button */}
										<button
											type="button"
											onClick={() => handleCopyNote(reminder)}
											className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer active:scale-95"
											title="Copy full note"
											aria-label="Copy note text"
										>
											{copiedNoteId === reminder.id ? (
												<>
													<Check className="w-3.5 h-3.5 text-emerald-600" />
													<span className="text-emerald-700 font-extrabold">
														Copied
													</span>
												</>
											) : (
												<>
													<Copy className="w-3.5 h-3.5" />
													<span>Copy</span>
												</>
											)}
										</button>

										{/* Duration Extension Badges */}
										<div className="flex items-center gap-0.5 bg-slate-100/90 border border-slate-200/80 rounded-lg p-0.5">
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "day")}
												disabled={isPending}
												className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 hover:text-slate-950 hover:bg-white rounded-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
												title="Extend +1 Day"
											>
												+1D
											</button>
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "week")}
												disabled={isPending}
												className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 hover:text-slate-950 hover:bg-white rounded-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
												title="Extend +1 Week"
											>
												+1W
											</button>
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "month")}
												disabled={isPending}
												className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 hover:text-slate-950 hover:bg-white rounded-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
												title="Extend +1 Month"
											>
												+1M
											</button>
										</div>

										{/* Delete Action */}
										<button
											type="button"
											onClick={() => handleDelete(reminder.id)}
											disabled={isPending || isDeleting}
											className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50 active:scale-95"
											title="Delete reminder"
											aria-label="Delete reminder"
										>
											{isDeleting && deleteReminderId === reminder.id ? (
												<Loader2 className="w-4 h-4 animate-spin text-rose-500" />
											) : (
												<Trash2 className="w-4 h-4" />
											)}
										</button>
									</div>
								</div>
							</motion.div>
						);
					})}
				</div>
			)}

			{/* Custom Delete Confirmation Modal */}
			<CustomModal
				isOpen={!!deleteReminderId}
				onClose={() => {
					if (!isDeleting) setDeleteReminderId(null);
				}}
				onConfirm={handleConfirmDelete}
				title="Delete Reminder"
				description="Are you sure you want to permanently delete this reminder? This action cannot be undone."
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
				isLoading={isDeleting}
			/>

			{/* Toast Notification Alert */}
			<AnimatePresence>
				{toastMessage && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 15 }}
						className="fixed bottom-24 left-1/2 -translate-x-1/2 w-auto px-4 py-2.5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl z-[100] flex items-center gap-2 border border-slate-800"
					>
						<Check className="w-4 h-4 text-emerald-400 shrink-0" />
						<span className="text-xs sm:text-sm text-white font-medium">
							{toastMessage}
						</span>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
