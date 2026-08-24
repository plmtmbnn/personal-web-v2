"use client";

import { useState, useTransition } from "react";
import type { Reminder, ReminderTTL } from "../types";
import { addReminder, deleteReminder } from "../actions";
import {
	Bell,
	Trash2,
	Clock,
	Plus,
	Loader2,
	Calendar,
	CalendarDays,
	AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
						<div className="flex bg-slate-50 p-1 rounded-full border border-slate-200/80 self-start sm:self-auto w-full sm:w-auto">
							{ttlOptions.map((opt) => {
								const Icon = opt.icon;
								const isActive = ttl === opt.value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => setTtl(opt.value)}
										className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${
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

									<p className="text-sm font-medium text-slate-800 mb-6 leading-relaxed whitespace-pre-wrap">
										{reminder.text}
									</p>

									<div className="flex items-center justify-between mt-auto">
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

										<button
											onClick={() => handleDelete(reminder.id)}
											disabled={isPending}
											className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
											title="Delete reminder"
										>
											<Trash2 className="w-4 h-4" />
										</button>
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
