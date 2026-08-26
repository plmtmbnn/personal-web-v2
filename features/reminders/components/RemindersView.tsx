"use client";

import { useState, useTransition, useCallback } from "react";
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
} from "lucide-react";
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
							className="inline-flex items-center gap-1 my-0.5"
						>
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-100 hover:border-indigo-200 transition-all !no-underline"
								title={href}
							>
								<ExternalLink className="w-3 h-3 shrink-0" />
								{shortenUrl(part)}
							</a>
							<button
								type="button"
								onClick={(e) => handleCopy(e, part)}
								className="inline-flex items-center justify-center shrink-0 w-5 h-5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
								title="Copy link"
							>
								{isCopied ? (
									<Check className="w-3 h-3 text-emerald-500" />
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
	const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
	const [text, setText] = useState("");
	const [ttl, setTtl] = useState<ReminderTTL>("day");
	const [isPending, startTransition] = useTransition();

	const charsLeft = 150 - text.length;
	const isOverLimit = charsLeft < 0;

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
				}
			} catch (error) {
				console.error("Failed to add reminder", error);
			}
		});
	};

	const handleDelete = (id: string) => {
		if (isPending) return;
		startTransition(async () => {
			try {
				const { success } = await deleteReminder(id);
				if (success) {
					setReminders((prev) => prev.filter((r) => r.id !== id));
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
				}
			} catch (error) {
				console.error("Failed to extend reminder", error);
			}
		});
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

	return (
		<div className="w-full max-w-3xl mx-auto space-y-8">
			{/* Input Card */}
			<div className="bg-white rounded-[2rem] border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
				<div className="flex items-center gap-3 mb-6">
					<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
						<Plus className="w-5 h-5 text-indigo-600" />
					</div>
					<div>
						<h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
							New Reminder
						</h2>
						<p className="text-xs font-semibold text-slate-500">
							Jot down a quick note or urgent task. Max 150 characters.
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div className="relative">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="What do you need to remember?"
							className="w-full h-24 p-4 text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400"
							maxLength={150}
						/>
						<div
							className={`absolute bottom-3 right-4 text-xs font-bold ${
								charsLeft <= 20 ? "text-amber-500" : "text-slate-400"
							}`}
						>
							{charsLeft}
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
						<div className="flex flex-wrap sm:flex-nowrap bg-slate-50 p-1 rounded-2xl sm:rounded-full border border-slate-200/80 w-full sm:w-auto gap-1 sm:gap-0">
							{ttlOptions.map((opt) => {
								const Icon = opt.icon;
								const isActive = ttl === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setTtl(opt.value)}
										className={`grow sm:grow-0 basis-[48%] sm:basis-auto flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-bold transition-all ${
											isActive
												? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
												: "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
										}`}
									>
										<Icon className="w-3.5 h-3.5" />
										{opt.label}
									</button>
								);
							})}
						</div>

						<button
							onClick={handleAdd}
							disabled={!text.trim() || isOverLimit || isPending}
							className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
						>
							{isPending ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Bell className="w-4 h-4" />
							)}
							Save Note
						</button>
					</div>
				</div>
			</div>

			{/* List Section */}
			<div className="space-y-4">
				<h3 className="text-sm font-extrabold text-slate-900 tracking-tight pl-2">
					Active Reminders ({reminders.length})
				</h3>

				{reminders.length === 0 ? (
					<div className="py-12 bg-white/50 backdrop-blur-xl border border-slate-200/50 rounded-3xl text-center shadow-sm">
						<Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
						<p className="text-sm font-bold text-slate-500">
							No active reminders.
						</p>
						<p className="text-xs text-slate-400 mt-1">
							Your short notes will appear here.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{reminders.map((reminder) => {
							const isExpiringSoon =
								new Date(reminder.expiresAt).getTime() - Date.now() <
								86400 * 1000; // < 1 day

							return (
								<div
									key={reminder.id}
									className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-5 relative overflow-hidden flex flex-col justify-between h-full"
								>
									{/* Decorative glowing edge if expiring soon */}
									{isExpiringSoon && (
										<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-rose-400 opacity-80" />
									)}

									<p className="text-sm font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
										<LinkifiedText text={reminder.text} />
									</p>

									<div className="flex flex-wrap items-center justify-between mt-auto gap-3 pt-2">
										<div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-slate-400">
											{isExpiringSoon ? (
												<AlertCircle className="w-3.5 h-3.5 text-amber-500" />
											) : (
												<Clock className="w-3.5 h-3.5" />
											)}
											<span className={isExpiringSoon ? "text-amber-600" : ""}>
												Exp {formatDistanceToNow(new Date(reminder.expiresAt))}
											</span>
										</div>

										<div className="flex items-center gap-1">
											<div className="flex items-center gap-0.5 bg-slate-50 border border-slate-100 rounded-lg p-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
												<button
													onClick={() => handleExtend(reminder.id, "day")}
													disabled={isPending}
													className="px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
													title="Extend 1 Day"
												>
													+1D
												</button>
												<button
													onClick={() => handleExtend(reminder.id, "week")}
													disabled={isPending}
													className="px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
													title="Extend 1 Week"
												>
													+1W
												</button>
												<button
													onClick={() => handleExtend(reminder.id, "month")}
													disabled={isPending}
													className="px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
													title="Extend 1 Month"
												>
													+1M
												</button>
											</div>
											<button
												onClick={() => handleDelete(reminder.id)}
												disabled={isPending}
												className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
												title="Delete reminder"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
