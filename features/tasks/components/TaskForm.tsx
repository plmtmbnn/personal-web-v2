"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
	Plus,
	Loader2,
	Calendar,
	Flag,
	Tag,
	Sparkles,
	X,
	Target,
	ChevronDown,
	Layers,
	Zap,
	ZapOff,
	CheckCircle2,
	AlertCircle,
	RefreshCw,
	FileText,
	ChevronUp,
	ListTodo,
} from "lucide-react";
import { addTask, addBatchTasks } from "@/features/tasks/actions/tasks";
import { useRouter } from "next/navigation";
import type { TaskPriority, TaskRecurrence } from "@/features/tasks/types";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
	TASK_CATEGORIES,
	QUICK_DATE_CHIPS,
	RECURRENCE_OPTIONS,
	DRAFT_STORAGE_KEY,
	DRAFT_AUTOSAVE_DEBOUNCE_MS,
} from "@/features/tasks/constants";

// ─── Draft shape ─────────────────────────────────────────────────────────────

interface TaskFormDraft {
	title: string;
	category: string;
	priority: TaskPriority;
	dueDate: string;
	recurrence: TaskRecurrence;
	description: string;
	timestamp?: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface TaskFormProps {
	isOpen?: boolean;
	onClose?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TaskForm({ isOpen, onClose }: TaskFormProps) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [recurrence, setRecurrence] = useState<TaskRecurrence>("none");
	const [description, setDescription] = useState("");
	const [isNotesOpen, setIsNotesOpen] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isBatchEnabled, setIsBatchEnabled] = useState(true);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [draftRestored, setDraftRestored] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const router = useRouter();

	// ── Derived values ────────────────────────────────────────────────────────

	const taskTitles = title.split("\n").filter((t) => t.trim() !== "");
	const hasMultipleLines = taskTitles.length > 1;
	const finalBatchActive = hasMultipleLines && isBatchEnabled;

	// Active date chip for visual feedback
	const activeDateChipDays = QUICK_DATE_CHIPS.find(
		(chip) => dueDate === format(addDays(new Date(), chip.days), "yyyy-MM-dd"),
	)?.days;

	// ── D: Restore draft on mount with validation ────────────────────────────
	useEffect(() => {
		try {
			const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
			if (!raw) return;

			const draft: TaskFormDraft = JSON.parse(raw);

			// Validate draft structure and data types
			if (!draft || typeof draft !== "object") {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				return;
			}

			// Validate title exists and is a string
			if (!draft.title || typeof draft.title !== "string") {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				return;
			}

			// Validate priority is valid
			const validPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
			if (draft.priority && !validPriorities.includes(draft.priority)) {
				draft.priority = "MEDIUM";
			}

			// Validate recurrence is valid
			const validRecurrence: TaskRecurrence[] = [
				"none",
				"daily",
				"weekly",
				"monthly",
			];
			if (draft.recurrence && !validRecurrence.includes(draft.recurrence)) {
				draft.recurrence = "none";
			}

			// Validate and fix due date if in the past
			const today = format(new Date(), "yyyy-MM-dd");
			let validatedDueDate = draft.dueDate ?? today;

			// Check if date is valid and not in the past
			if (draft.dueDate) {
				try {
					const dueDate = new Date(draft.dueDate);
					const todayDate = new Date(today);
					if (Number.isNaN(dueDate.getTime()) || dueDate < todayDate) {
						validatedDueDate = today;
					}
				} catch {
					validatedDueDate = today;
				}
			}

			// Restore draft with validated data
			setTitle(draft.title);
			setCategory(draft.category ?? "");
			setPriority(draft.priority ?? "MEDIUM");
			setDueDate(validatedDueDate);
			setRecurrence(draft.recurrence ?? "none");
			setDescription(draft.description ?? "");
			if (draft.description) setIsNotesOpen(true);

			setDraftRestored(true);
			setTimeout(() => setDraftRestored(false), 3000);
		} catch (error) {
			console.error("Failed to restore draft:", error);
			localStorage.removeItem(DRAFT_STORAGE_KEY);
		}
	}, []);

	// ── D: Persist draft on every change (debounced) ───────────────────
	useEffect(() => {
		const timer = setTimeout(() => {
			if (!title && !category && !description) {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				return;
			}
			const draft: TaskFormDraft = {
				title,
				category,
				priority,
				dueDate,
				recurrence,
				description,
				timestamp: Date.now(),
			};
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
		}, DRAFT_AUTOSAVE_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [title, category, priority, dueDate, recurrence, description]);

	// ── Auto-expand textarea ──────────────────────────────────────────────────
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [title]);

	const setQuickDate = useCallback((days: number) => {
		setDueDate(format(addDays(new Date(), days), "yyyy-MM-dd"));
	}, []);

	// ── Ctrl+Enter / Cmd+Enter submit ─────────────────────────────────────────
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				e.currentTarget.form?.requestSubmit();
			}
		},
		[],
	);

	// ── Submit ────────────────────────────────────────────────────────────────
	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!title.trim() || isSubmitting) return;

			setSubmitError(null);
			setIsSubmitting(true);
			try {
				const metadata = {
					priority,
					category: category.trim() || "General",
					due_date: dueDate,
					recurrence,
					description: description.trim() || undefined,
				};

				if (finalBatchActive) {
					await addBatchTasks(
						taskTitles.map((t) => ({
							title: t.trim(),
							...metadata,
						})),
					);
				} else {
					await addTask({
						title: title.trim(),
						...metadata,
					});
				}

				localStorage.removeItem(DRAFT_STORAGE_KEY);

				setSubmitSuccess(true);
				setTimeout(() => {
					setSubmitSuccess(false);
					setTitle("");
					setCategory("");
					setPriority("MEDIUM");
					setDueDate(format(new Date(), "yyyy-MM-dd"));
					setRecurrence("none");
					setDescription("");
					setIsNotesOpen(false);
					router.refresh();
					setIsFocused(false);
					onClose?.();
				}, 600);
			} catch (error) {
				console.error("Task creation failed:", error);
				setSubmitError("Failed to create task. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		},
		[
			title,
			isSubmitting,
			priority,
			category,
			dueDate,
			recurrence,
			description,
			isBatchEnabled,
			router,
			onClose,
		],
	);

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<AnimatePresence>
			{(!onClose || isOpen) && (
				<>
					{/* Backdrop for mobile */}
					{onClose && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={onClose}
							className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
						/>
					)}

					<motion.div
						initial={onClose ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
						animate={onClose ? { y: 0 } : { scale: 1, opacity: 1 }}
						exit={onClose ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
						transition={{ type: "spring", damping: 25, stiffness: 200 }}
						className={`${
							onClose
								? "fixed bottom-0 left-0 right-0 z-[60] lg:relative lg:z-0 lg:bottom-auto"
								: "relative"
						} transition-all duration-500 ${isFocused ? "scale-[1.01]" : "scale-100"}`}
					>
						<form
							onSubmit={handleSubmit}
							className={`bg-white border-2 transition-all duration-300 ${
								onClose
									? "rounded-t-[3rem] lg:rounded-[2rem]"
									: "rounded-[2rem]"
							} overflow-hidden shadow-sm ${
								isFocused
									? "border-emerald-500/40 shadow-xl shadow-emerald-500/5"
									: "border-slate-200"
							}`}
						>
							{/* Drag Handle for mobile */}
							{onClose && (
								<div className="w-full flex justify-center pt-4 lg:hidden">
									<div className="w-12 h-1.5 bg-slate-200 rounded-full" />
								</div>
							)}

							{/* Main Content Area */}
							<div className="p-6 md:p-8 space-y-6">
								{/* Header Label */}
								<div className="flex items-center justify-between mb-2">
									<div className="flex items-center gap-2">
										<label
											htmlFor="task-title"
											className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2"
										>
											{finalBatchActive ? (
												<Layers className="w-3 h-3 text-blue-500" />
											) : (
												<Target className="w-3 h-3 text-emerald-500" />
											)}
											{finalBatchActive
												? `Batch Initialization (${taskTitles.length} Tasks)`
												: "New Objective"}
										</label>

										{/* D: Draft Restored badge */}
										<AnimatePresence>
											{draftRestored && (
												<motion.span
													initial={{ opacity: 0, scale: 0.8 }}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.8 }}
													className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full"
												>
													Draft restored
												</motion.span>
											)}
										</AnimatePresence>
									</div>

									<div className="flex items-center gap-2">
										{hasMultipleLines && (
											<button
												type="button"
												onClick={() => setIsBatchEnabled(!isBatchEnabled)}
												aria-pressed={isBatchEnabled}
												className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
													isBatchEnabled
														? "bg-blue-50 border-blue-100 text-blue-600"
														: "bg-slate-50 border-slate-100 text-slate-400"
												}`}
												title={
													isBatchEnabled
														? "Batch Mode Active"
														: "Single Task Mode"
												}
											>
												{isBatchEnabled ? (
													<Zap className="w-3 h-3 fill-current" />
												) : (
													<ZapOff className="w-3 h-3" />
												)}
												<span className="text-[8px] font-black uppercase tracking-wider">
													Batch Protocol
												</span>
											</button>
										)}

										{/* J: Notes toggle */}
										<button
											type="button"
											onClick={() => setIsNotesOpen((v) => !v)}
											aria-pressed={isNotesOpen}
											className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all ${
												isNotesOpen || description
													? "bg-violet-50 border-violet-100 text-violet-600"
													: "bg-slate-50 border-slate-100 text-slate-400 hover:text-slate-600"
											}`}
											title="Toggle notes"
										>
											<FileText className="w-3 h-3" />
											<span className="text-[8px] font-black uppercase tracking-wider">
												Notes
											</span>
											{isNotesOpen ? (
												<ChevronUp className="w-3 h-3" />
											) : (
												<ChevronDown className="w-3 h-3" />
											)}
										</button>

										{title && (
											<button
												type="button"
												onClick={() => setTitle("")}
												className="text-slate-300 hover:text-rose-500 transition-colors ml-1"
											>
												<X className="w-4 h-4" />
											</button>
										)}
										{onClose && (
											<button
												type="button"
												onClick={onClose}
												className="lg:hidden text-slate-300 hover:text-slate-900 transition-colors"
											>
												<ChevronDown className="w-5 h-5" />
											</button>
										)}
									</div>
								</div>

								{/* Dynamic Title Input */}
								<div className="relative">
									<textarea
										id="task-title"
										ref={textareaRef}
										placeholder="Enter task titles (one per line for multiple)..."
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										onFocus={() => setIsFocused(true)}
										onBlur={() => !title && setIsFocused(false)}
										onKeyDown={handleKeyDown}
										rows={1}
										disabled={isSubmitting}
										className="w-full bg-transparent text-xl md:text-2xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none resize-none leading-tight overflow-hidden"
									/>

									{/* B: Batch status badges */}
									{hasMultipleLines && isBatchEnabled && (
										<div className="absolute -bottom-4 right-0 flex items-center gap-2">
											<div className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
												Auto-Detection Active
											</div>
											<div className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
												{taskTitles.length} tasks ·{" "}
												{title.replace(/\n/g, "").replace(/\s+/g, "").length}{" "}
												chars
											</div>
										</div>
									)}
									{hasMultipleLines && !isBatchEnabled && (
										<div className="absolute -bottom-4 right-0 text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
											Single Entry Mode
										</div>
									)}
								</div>

								{/* J: Notes / Description (collapsible) */}
								<AnimatePresence>
									{isNotesOpen && (
										<motion.div
											key="notes"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2, ease: "easeInOut" }}
											className="overflow-hidden"
										>
											<div className="relative pt-1">
												<div className="flex items-center justify-between mb-2">
													<label
														htmlFor="task-description"
														className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"
													>
														<FileText className="w-3 h-3 text-violet-400" />
														Notes / Description
														{finalBatchActive && (
															<span className="text-[8px] font-bold text-violet-400 normal-case tracking-normal ml-1">
																— applied to all tasks
															</span>
														)}
													</label>
													<button
														type="button"
														onClick={() => {
															const textarea = document.getElementById(
																"task-description",
															) as HTMLTextAreaElement;
															if (!textarea) return;
															const start = textarea.selectionStart;
															const end = textarea.selectionEnd;
															const text = textarea.value;
															const before = text.substring(0, start);
															const after = text.substring(end);
															const prefix =
																start === 0 || text[start - 1] === "\n"
																	? ""
																	: "\n";
															const insertedText = `${prefix}- [ ] `;
															setDescription(before + insertedText + after);

															setTimeout(() => {
																textarea.focus();
																textarea.setSelectionRange(
																	start + insertedText.length,
																	start + insertedText.length,
																);
															}, 0);
														}}
														className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-violet-500 hover:text-violet-750 transition-colors px-2 py-0.5 bg-violet-50 hover:bg-violet-100 rounded-lg active:scale-95 cursor-pointer"
													>
														<ListTodo className="w-2.5 h-2.5" /> + Checklist
													</button>
												</div>
												<textarea
													id="task-description"
													placeholder="Add context, links, or references…"
													value={description}
													onChange={(e) => setDescription(e.target.value)}
													rows={3}
													disabled={isSubmitting}
													className="w-full bg-violet-50/50 border border-violet-100 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-violet-400 focus:outline-none transition-all resize-none leading-relaxed"
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Metadata Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 pt-4 border-t border-slate-50">
									{/* Category with Suggestions + Quick Pills */}
									<div className="space-y-2">
										<label
											htmlFor="task-category"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
										>
											<Tag className="w-3 h-3" /> Category
										</label>
										<div className="flex flex-wrap gap-1.5 mb-2">
											{TASK_CATEGORIES.map((cat) => (
												<button
													key={cat}
													type="button"
													onClick={() =>
														setCategory(category === cat ? "" : cat)
													}
													className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wide border transition-all ${
														category === cat
															? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
															: "bg-slate-50 border-slate-100 text-slate-500 hover:border-emerald-300 hover:text-emerald-600"
													}`}
												>
													{cat}
												</button>
											))}
										</div>
										<div className="relative group">
											<input
												id="task-category"
												list="category-suggestions"
												type="text"
												placeholder="e.g. Work"
												value={category}
												onChange={(e) => setCategory(e.target.value)}
												className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-base md:text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none"
											/>
											<datalist id="category-suggestions">
												{TASK_CATEGORIES.map((cat) => (
													<option key={cat} value={cat} />
												))}
											</datalist>
										</div>
									</div>

									{/* Due Date Picker with Quick Chips */}
									<div className="space-y-3">
										<label
											htmlFor="task-due-date"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
										>
											<Calendar className="w-3 h-3" /> Due Date
										</label>
										<div className="flex flex-wrap gap-2">
											{QUICK_DATE_CHIPS.map((chip) => {
												const isActive = activeDateChipDays === chip.days;
												return (
													<button
														key={chip.label}
														type="button"
														onClick={() => setQuickDate(chip.days)}
														className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
															isActive
																? "bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-300"
																: "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
														}`}
													>
														{chip.label}
													</button>
												);
											})}
										</div>
										<input
											id="task-due-date"
											type="date"
											value={dueDate}
											onChange={(e) => setDueDate(e.target.value)}
											className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-base md:text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none"
										/>
									</div>

									{/* Visual Priority Selector */}
									<div className="space-y-2">
										<label
											htmlFor="task-priority"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
										>
											<Flag className="w-3 h-3" /> Priority Level
										</label>
										<fieldset
											id="task-priority"
											className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl"
											aria-label="Priority Level"
										>
											{(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map(
												(p) => (
													<button
														key={p}
														type="button"
														onClick={() => setPriority(p)}
														aria-pressed={priority === p}
														className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
															priority === p
																? p === "HIGH"
																	? "bg-rose-500 text-white shadow-sm"
																	: p === "MEDIUM"
																		? "bg-amber-500 text-white shadow-sm"
																		: "bg-emerald-500 text-white shadow-sm"
																: "text-slate-400 hover:text-slate-600"
														}`}
													>
														{p}
													</button>
												),
											)}
										</fieldset>
									</div>

									{/* A: Recurring Task Toggle */}
									<div className="space-y-2">
										<label
											htmlFor="task-recurrence"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1"
										>
											<RefreshCw className="w-3 h-3" /> Recurrence
										</label>
										<fieldset
											id="task-recurrence"
											className="flex flex-wrap gap-1 p-1 bg-slate-50 border border-slate-100 rounded-xl"
											aria-label="Recurrence"
										>
											{RECURRENCE_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setRecurrence(opt.value)}
													aria-pressed={recurrence === opt.value}
													className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
														recurrence === opt.value
															? "bg-violet-500 text-white shadow-sm"
															: "text-slate-400 hover:text-slate-600"
													}`}
												>
													{opt.label}
												</button>
											))}
										</fieldset>
									</div>
								</div>
							</div>

							{/* Action Footer */}
							<div
								className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2"
								style={{
									paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
								}}
							>
								{/* Error message */}
								<AnimatePresence>
									{submitError && (
										<motion.div
											initial={{ opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -4 }}
											className="flex items-center gap-2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2"
										>
											<AlertCircle className="w-3.5 h-3.5 shrink-0" />
											{submitError}
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<Sparkles className="w-3.5 h-3.5 text-emerald-500" />
										<span className="text-[10px] font-bold text-slate-400 uppercase">
											{finalBatchActive
												? "Collective execution."
												: "Strategic initialization."}
										</span>
										{/* Keyboard shortcut hint */}
										{isFocused && (
											<span className="hidden sm:inline-flex items-center text-[9px] font-bold text-slate-300 border border-slate-100 rounded px-1.5 py-0.5 gap-1">
												⌘ Enter
											</span>
										)}
									</div>

									<button
										type="submit"
										disabled={isSubmitting || submitSuccess || !title.trim()}
										className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 active:scale-95 ${
											submitSuccess
												? "bg-emerald-500 text-white"
												: finalBatchActive
													? "bg-blue-600 hover:bg-blue-700 text-white"
													: "bg-slate-900 hover:bg-emerald-600 text-white"
										}`}
									>
										{isSubmitting ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : submitSuccess ? (
											<CheckCircle2 className="w-4 h-4" />
										) : (
											<Plus className="w-4 h-4" />
										)}
										{isSubmitting
											? "Initializing…"
											: submitSuccess
												? "Done!"
												: finalBatchActive
													? `Initialize ${taskTitles.length} Tasks`
													: "Initialize"}
									</button>
								</div>
							</div>
						</form>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
