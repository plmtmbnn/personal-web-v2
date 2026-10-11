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
	ArrowLeft,
	ChevronRight,
	ArrowUpDown,
	Server,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import CustomModal from "@/features/shared/components/CustomModal";
import Link from "next/link";

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
									className="inline-flex items-center justify-center shrink-0 w-6 h-6 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all cursor-pointer active:scale-90 touch-manipulation"
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
		approxSeconds: number;
		iconBg: string;
		iconColor: string;
		iconBorder: string;
		icon: React.ElementType;
	}
> = {
	day: {
		label: "1 Day",
		shortLabel: "1D",
		approxSeconds: 86400,
		iconBg: "bg-sky-50",
		iconColor: "text-sky-600",
		iconBorder: "border-sky-200/70",
		icon: Clock,
	},
	week: {
		label: "1 Week",
		shortLabel: "1W",
		approxSeconds: 604800,
		iconBg: "bg-indigo-50",
		iconColor: "text-indigo-600",
		iconBorder: "border-indigo-200/70",
		icon: Calendar,
	},
	month: {
		label: "1 Month",
		shortLabel: "1M",
		approxSeconds: 2592000,
		iconBg: "bg-purple-50",
		iconColor: "text-purple-600",
		iconBorder: "border-purple-200/70",
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
	const [sortBy, setSortBy] = useState<"expiry" | "created">("expiry");
	const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const [deleteReminderId, setDeleteReminderId] = useState<string | null>(null);
	const [extendingId, setExtendingId] = useState<string | null>(null);
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
				showToast("Failed to create reminder");
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
		if (isPending || extendingId) return;
		setExtendingId(id);

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
				showToast("Failed to extend reminder");
			} finally {
				setExtendingId(null);
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

	// Filtered & Sorted list
	const filteredReminders = useMemo(() => {
		const filtered = reminders.filter((r) => {
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

		return filtered.sort((a, b) => {
			if (sortBy === "created") {
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			}
			// Default: soonest expiry first
			return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
		});
	}, [reminders, searchQuery, filterTtl, sortBy]);

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
			    TOP FLOATING HEADER CARD (Clean Header Standard)
			═══════════════════════════════════════ */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
				<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 sm:gap-6 pb-6 border-b border-slate-100">
					<div className="flex items-start gap-4">
						<div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center shrink-0 shadow-2xs text-amber-600">
							<Bell className="w-6 h-6 sm:w-7 sm:h-7" />
						</div>
						<div className="space-y-1.5">
							{/* Contextual Breadcrumbs */}
							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
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
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
								Quick Reminders
							</h1>
							<p className="text-sm text-slate-500 max-w-xl leading-relaxed">
								Manage ephemeral notes and URL bookmarks with automatic Redis
								expiration and duration extensions.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center shrink-0">
						<Link
							href="/admin"
							className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline group"
						>
							<ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-transform" />
							<span>Admin Hub</span>
						</Link>
					</div>
				</div>

				{/* Header Telemetry Quick Strip (Canonical 4-Tier Internal Structure) */}
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
					{/* Tile 1: Total Active Notes */}
					<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5">
						<div className="flex items-center justify-between gap-2">
							<div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
								<Bell className="w-3.5 h-3.5" />
							</div>
							<span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
								Live
							</span>
						</div>
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Active Notes
						</span>
						<span className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums block truncate">
							{reminders.length}
						</span>
						<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
							In-memory cache
						</span>
					</div>

					{/* Tile 2: Expiring Soon */}
					<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5">
						<div className="flex items-center justify-between gap-2">
							<div
								className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
									expiringCount > 0
										? "bg-rose-50 border-rose-200/70 text-rose-600"
										: "bg-emerald-50 border-emerald-200/70 text-emerald-600"
								}`}
							>
								<Clock className="w-3.5 h-3.5" />
							</div>
							<span
								className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
									expiringCount > 0
										? "text-rose-700 bg-rose-50 border-rose-200/60"
										: "text-emerald-700 bg-emerald-50 border-emerald-200/60"
								}`}
							>
								{expiringCount > 0 ? "Urgent" : "Calm"}
							</span>
						</div>
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Expiring Soon
						</span>
						<span className="text-lg sm:text-2xl font-bold font-mono text-slate-900 tracking-tight tabular-nums block truncate">
							{expiringCount}
						</span>
						<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
							&lt; 24h lifespan
						</span>
					</div>

					{/* Tile 3: Redis TTL Storage Engine */}
					<div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 space-y-1.5 col-span-2 sm:col-span-1">
						<div className="flex items-center justify-between gap-2">
							<div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-600 flex items-center justify-center shrink-0">
								<Server className="w-3.5 h-3.5" />
							</div>
							<span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								<span>Active</span>
							</span>
						</div>
						<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
							Redis TTL Engine
						</span>
						<span className="text-sm sm:text-base font-bold font-mono text-slate-900 tracking-tight block truncate">
							1D / 1W / 1M
						</span>
						<span className="text-[10px] sm:text-[11px] text-slate-400 font-medium block truncate">
							Auto-eviction active
						</span>
					</div>
				</div>
			</div>

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
							placeholder="What do you need to remember? (e.g. review PR https://github.com/org/repo/pull/123 or check server logs)..."
							className="w-full h-28 sm:h-32 p-4 text-base sm:text-sm font-medium text-slate-900 bg-slate-50/70 border border-slate-200/80 rounded-2xl focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none placeholder:text-slate-400 leading-relaxed shadow-inner"
							maxLength={150}
						/>
						<div className="absolute bottom-3.5 right-4 flex items-center gap-2">
							{text.length > 0 && (
								<button
									type="button"
									onClick={() => setText("")}
									className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded-md hover:bg-slate-200/60 transition-colors cursor-pointer"
									title="Clear text"
								>
									Clear
								</button>
							)}
							<div
								className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
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
										className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-[background-color,color,box-shadow] cursor-pointer touch-manipulation active:scale-95 ${
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
							className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-[background-color,transform] shadow-xs active:scale-95 cursor-pointer touch-manipulation"
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
					{/* Filter Pills Track (Defensive scrollbar suppression) */}
					<div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
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

					<div className="flex items-center gap-2.5 w-full md:w-auto">
						{/* Sort Switcher */}
						<div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/70 shrink-0">
							<button
								type="button"
								onClick={() =>
									setSortBy((prev) =>
										prev === "expiry" ? "created" : "expiry",
									)
								}
								className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
								title={`Currently sorted by: ${sortBy === "expiry" ? "Soonest Expiry" : "Newest Created"}`}
							>
								<ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
								<span className="hidden sm:inline">
									{sortBy === "expiry" ? "Soonest Expiry" : "Newest Created"}
								</span>
								<span className="sm:hidden">
									{sortBy === "expiry" ? "Expiry" : "Newest"}
								</span>
							</button>
						</div>

						{/* Search Input (Strict UI hygiene: pointer-events-none z-10 with pl-10) */}
						<div className="relative flex-1 md:w-64 group">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 group-focus-within:text-amber-600 transition-colors" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search notes or URLs..."
								className="w-full pl-10 pr-9 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-amber-500 rounded-xl text-base sm:text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
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
							className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-800 cursor-pointer active:scale-95"
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
						const expiresAtMs = new Date(reminder.expiresAt).getTime();
						const createdAtMs = new Date(reminder.createdAt).getTime();
						const nowMs = Date.now();
						const remainingMs = expiresAtMs - nowMs;
						const totalMs = Math.max(1, expiresAtMs - createdAtMs);
						const remainingPercent = Math.min(
							100,
							Math.max(0, Math.round((remainingMs / totalMs) * 100)),
						);
						const isExpiringSoon =
							remainingMs > 0 && remainingMs < 86400 * 1000;
						const isExpired = remainingMs <= 0;

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
								} shadow-xs hover:shadow-lg transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between h-full relative cursor-default`}
							>
								<div>
									{/* Top Header: Duration Squircle + Lifespan info + Expiry status pill */}
									<div className="flex items-center justify-between gap-3 mb-3">
										<div className="flex items-center gap-2.5 min-w-0">
											<div
												className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${ttlMeta.iconBg} ${ttlMeta.iconColor} ${ttlMeta.iconBorder}`}
											>
												<TTLIcon className="w-4 h-4" />
											</div>
											<div className="min-w-0">
												<span className="text-xs font-black uppercase tracking-wider text-slate-900 block leading-tight">
													{ttlMeta.label} TTL
												</span>
												<span className="text-[10px] font-mono text-slate-400 block leading-tight">
													{formatCreatedTime(reminder.createdAt)}
												</span>
											</div>
										</div>

										{/* Expiry status badge */}
										{isExpired ? (
											<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-black tracking-tight shrink-0 shadow-2xs">
												Expired
											</span>
										) : isExpiringSoon ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black tracking-tight shrink-0 shadow-2xs">
												<span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
												<span>
													Expires in{" "}
													{formatDistanceToNow(new Date(reminder.expiresAt))}
												</span>
											</span>
										) : (
											<span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70 shrink-0">
												<Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
												<span>
													{formatDistanceToNow(new Date(reminder.expiresAt))}{" "}
													left
												</span>
											</span>
										)}
									</div>

									{/* Lifespan Remaining Micro-Bar */}
									<div
										className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mb-4"
										title={`${remainingPercent}% lifespan remaining`}
									>
										<div
											className={`h-full rounded-full transition-all duration-500 ${
												isExpiringSoon
													? "bg-amber-500"
													: "bg-slate-300 group-hover:bg-slate-400"
											}`}
											style={{ width: `${remainingPercent}%` }}
										/>
									</div>

									{/* Message Body Text */}
									<div className="text-base sm:text-lg font-bold text-slate-900 leading-snug sm:leading-relaxed tracking-tight break-words whitespace-pre-wrap mb-5">
										<LinkifiedText text={reminder.text} />
									</div>
								</div>

								{/* Card Footer Actions */}
								<div className="flex flex-wrap items-center justify-between mt-auto gap-2 pt-3.5 border-t border-slate-100">
									{/* Copy Note Button with Multi-Modal In-Place Feedback */}
									<button
										type="button"
										onClick={() => handleCopyNote(reminder)}
										className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/70 transition-all cursor-pointer active:scale-95 touch-manipulation shadow-2xs group/copy"
										title="Copy full note text"
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
												<Copy className="w-3.5 h-3.5 text-slate-400 group-hover/copy:text-slate-600 transition-colors" />
												<span>Copy Note</span>
											</>
										)}
									</button>

									{/* Action Tray: Extensions + Delete */}
									<div className="flex items-center gap-1.5 shrink-0">
										{/* Duration Extension Segmented Track */}
										<div className="flex items-center gap-0.5 bg-slate-100/90 border border-slate-200/80 rounded-xl p-0.5">
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "day")}
												disabled={isPending || extendingId === reminder.id}
												className="px-2 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 touch-manipulation"
												title="Extend +1 Day"
											>
												{extendingId === reminder.id ? (
													<Loader2 className="w-3 h-3 animate-spin text-slate-600 inline" />
												) : (
													"+1D"
												)}
											</button>
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "week")}
												disabled={isPending || extendingId === reminder.id}
												className="px-2 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 touch-manipulation"
												title="Extend +1 Week"
											>
												+1W
											</button>
											<button
												type="button"
												onClick={() => handleExtend(reminder.id, "month")}
												disabled={isPending || extendingId === reminder.id}
												className="px-2 py-1 text-[11px] font-mono font-bold text-slate-600 hover:text-slate-950 hover:bg-white rounded-lg transition-all cursor-pointer disabled:opacity-50 active:scale-95 touch-manipulation"
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
											className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all shrink-0 cursor-pointer disabled:opacity-50 active:scale-90 touch-manipulation"
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

			{/* Multi-Modal Floating Confirmation Toast */}
			<AnimatePresence>
				{toastMessage && (
					<motion.div
						initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 12 }}
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
