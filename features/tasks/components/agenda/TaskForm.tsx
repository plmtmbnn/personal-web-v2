"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
	Plus,
	Loader2,
	Calendar,
	Flag,
	Tag,
	X,
	Target,
	ChevronDown,
	Layers,
	CheckCircle2,
	AlertCircle,
	RefreshCw,
	FileText,
	ChevronUp,
	ListTodo,
	Clock,
	Hash,
} from "lucide-react";
import { addTask, addBatchTasks } from "@/features/tasks/actions/tasks";
import { useRouter } from "next/navigation";
import type {
	TaskPriority,
	TaskRecurrence,
	TaskStatus,
} from "@/features/tasks/types";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	TASK_CATEGORIES,
	QUICK_DATE_CHIPS,
	RECURRENCE_OPTIONS,
	DRAFT_STORAGE_KEY,
	DRAFT_AUTOSAVE_DEBOUNCE_MS,
	TASK_STATUS_CONFIG,
	EFFORT_CHIPS,
	formatEstimatedTime,
} from "@/features/tasks/constants";
import { useTags } from "@/lib/hooks/useTags";

// ─── Draft shape ─────────────────────────────────────────────────────────────

interface TaskFormDraft {
	title: string;
	category: string;
	priority: TaskPriority;
	dueDate: string;
	recurrence: TaskRecurrence;
	description: string;
	status: TaskStatus;
	estimatedMinutes: number | null;
	tags: string[];
	startDate: string | null;
	startTime: string | null;
	dueTime: string | null;
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
	const [status, setStatus] = useState<TaskStatus>("todo");
	const [estimatedMinutes, setEstimatedMinutes] = useState<number | null>(null);

	const { tags, tagInput, setTagInput, handleTagKeyDown, removeTag, setTags } =
		useTags([]);

	const [startDate, setStartDate] = useState<string | null>(null);
	const [startTime, setStartTime] = useState<string | null>(null);
	const [dueTime, setDueTime] = useState<string | null>(null);
	const [isNotesOpen, setIsNotesOpen] = useState(false);
	const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isBatchEnabled, setIsBatchEnabled] = useState(true);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [draftRestored, setDraftRestored] = useState(false);

	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const tagInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const reduceMotion = useReducedMotion();

	// ── Derived values ────────────────────────────────────────────────────────

	const taskTitles = title.split("\n").filter((t) => t.trim() !== "");
	const hasMultipleLines = taskTitles.length > 1;
	const finalBatchActive = hasMultipleLines && isBatchEnabled;

	// Active date chip for visual feedback
	const activeDateChipDays = QUICK_DATE_CHIPS.find(
		(chip) => dueDate === format(addDays(new Date(), chip.days), "yyyy-MM-dd"),
	)?.days;

	// Count configured advanced settings
	const advancedCount = [
		status !== "todo" ? 1 : 0,
		estimatedMinutes ? 1 : 0,
		tags.length > 0 ? 1 : 0,
		startDate || startTime || dueTime ? 1 : 0,
	].reduce((a, b) => a + b, 0);

	// ── Draft: Restore on mount ────────────────────────────────────────────────
	useEffect(() => {
		try {
			const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
			if (!raw) return;

			const draft: TaskFormDraft = JSON.parse(raw);
			if (!draft || typeof draft !== "object") {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				return;
			}
			if (!draft.title || typeof draft.title !== "string") {
				localStorage.removeItem(DRAFT_STORAGE_KEY);
				return;
			}

			const validPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
			if (draft.priority && !validPriorities.includes(draft.priority)) {
				draft.priority = "MEDIUM";
			}

			const validRecurrence: TaskRecurrence[] = [
				"none",
				"daily",
				"weekly",
				"monthly",
			];
			if (draft.recurrence && !validRecurrence.includes(draft.recurrence)) {
				draft.recurrence = "none";
			}

			const today = format(new Date(), "yyyy-MM-dd");
			let validatedDueDate = draft.dueDate ?? today;
			if (draft.dueDate) {
				try {
					const dd = new Date(draft.dueDate);
					const todayDate = new Date(today);
					if (Number.isNaN(dd.getTime()) || dd < todayDate) {
						validatedDueDate = today;
					}
				} catch {
					validatedDueDate = today;
				}
			}

			setTitle(draft.title);
			setCategory(draft.category ?? "");
			setPriority(draft.priority ?? "MEDIUM");
			setDueDate(validatedDueDate);
			setRecurrence(draft.recurrence ?? "none");
			setDescription(draft.description ?? "");
			setStatus(draft.status ?? "todo");
			setEstimatedMinutes(draft.estimatedMinutes ?? null);
			setTags(Array.isArray(draft.tags) ? draft.tags : []);
			setStartDate(draft.startDate ?? null);
			setStartTime(draft.startTime ?? null);
			setDueTime(draft.dueTime ?? null);
			if (draft.description) setIsNotesOpen(true);

			setDraftRestored(true);
			setTimeout(() => setDraftRestored(false), 3000);
		} catch (error) {
			console.error("Failed to restore draft:", error);
			localStorage.removeItem(DRAFT_STORAGE_KEY);
		}
	}, [setTags]);

	// ── Draft: Persist on change (debounced) ───────────────────────────────────
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
				status,
				estimatedMinutes,
				tags,
				startDate,
				startTime,
				dueTime,
				timestamp: Date.now(),
			};
			localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
		}, DRAFT_AUTOSAVE_DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [
		title,
		category,
		priority,
		dueDate,
		recurrence,
		description,
		status,
		estimatedMinutes,
		tags,
		startDate,
		startTime,
		dueTime,
	]);

	// ── Auto-expand textarea ───────────────────────────────────────────────────
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 44)}px`;
		}
	}, [title]);

	// Smart syntax parsing handler (!high, #category, @today, @tomorrow)
	const handleTitleChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			let val = e.target.value;

			// Smart Priority token parsing (!high, !medium, !low)
			const priorityMatch = val.match(/!(high|medium|low)\b/i);
			if (priorityMatch) {
				const p = priorityMatch[1].toUpperCase() as TaskPriority;
				setPriority(p);
				val = val.replace(priorityMatch[0], "").trimStart();
			}

			// Smart Category token parsing (#work, #personal, etc.)
			const categoryMatch = val.match(/#([a-zA-Z0-9_-]+)\b/);
			if (categoryMatch) {
				const matchedCat = categoryMatch[1];
				setCategory(matchedCat);
				val = val.replace(categoryMatch[0], "").trimStart();
			}

			// Smart Date token parsing (@today, @tomorrow)
			const dateMatch = val.match(/@(today|tomorrow)\b/i);
			if (dateMatch) {
				const d = dateMatch[1].toLowerCase();
				if (d === "today") {
					setDueDate(format(new Date(), "yyyy-MM-dd"));
				} else if (d === "tomorrow") {
					setDueDate(format(addDays(new Date(), 1), "yyyy-MM-dd"));
				}
				val = val.replace(dateMatch[0], "").trimStart();
			}

			setTitle(val);
		},
		[],
	);

	const setQuickDate = useCallback((days: number) => {
		setDueDate(format(addDays(new Date(), days), "yyyy-MM-dd"));
	}, []);

	// ── Ctrl+Enter / Cmd+Enter submit ──────────────────────────────────────────
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
				e.preventDefault();
				e.currentTarget.form?.requestSubmit();
			}
		},
		[],
	);

	// ── Reset ─────────────────────────────────────────────────────────────────
	const resetForm = useCallback(() => {
		setTitle("");
		setCategory("");
		setPriority("MEDIUM");
		setDueDate(format(new Date(), "yyyy-MM-dd"));
		setRecurrence("none");
		setDescription("");
		setStatus("todo");
		setEstimatedMinutes(null);
		setTags([]);
		setTagInput("");
		setStartDate(null);
		setStartTime(null);
		setDueTime(null);
		setIsNotesOpen(false);
		setIsAdvancedOpen(false);
		localStorage.removeItem(DRAFT_STORAGE_KEY);
	}, [setTags, setTagInput]);

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
					status,
					estimated_minutes: estimatedMinutes || undefined,
					tags,
					start_date: startDate || undefined,
					start_time: startTime || undefined,
					due_time: dueTime || undefined,
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
					resetForm();
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
			status,
			estimatedMinutes,
			tags,
			startDate,
			startTime,
			dueTime,
			finalBatchActive,
			taskTitles,
			router,
			onClose,
			resetForm,
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
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={onClose}
							className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
						/>
					)}

					<motion.div
						initial={
							reduceMotion
								? false
								: onClose
									? { y: "100%" }
									: { scale: 0.98, opacity: 0 }
						}
						animate={onClose ? { y: 0 } : { scale: 1, opacity: 1 }}
						exit={onClose ? { y: "100%" } : { scale: 0.98, opacity: 0 }}
						transition={{ type: "spring", damping: 26, stiffness: 220 }}
						className={`${
							onClose
								? "fixed bottom-0 left-0 right-0 z-[60] lg:relative lg:z-0 lg:bottom-auto"
								: "relative"
						} transition-transform duration-300`}
					>
						<form
							onSubmit={handleSubmit}
							className={`bg-white border transition-all duration-300 ${
								onClose
									? "rounded-t-[2.5rem] lg:rounded-3xl border-slate-200/80 shadow-2xl"
									: "rounded-3xl border-slate-200/80 shadow-xs hover:shadow-sm"
							} overflow-hidden ${
								isFocused
									? "border-emerald-500/50 shadow-lg shadow-emerald-500/5"
									: ""
							}`}
						>
							{/* Drag Handle for mobile */}
							{onClose && (
								<div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
									<div className="w-12 h-1.5 bg-slate-200 rounded-full" />
								</div>
							)}

							{/* Main Content Area */}
							<div className="p-5 sm:p-7 md:p-8 space-y-5 sm:space-y-6">
								{/* Header Context Bar */}
								<div className="flex items-center justify-between gap-2">
									<div className="flex items-center gap-2 flex-wrap">
										<div
											className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs transition-colors ${
												finalBatchActive
													? "bg-blue-50 border-blue-200/70 text-blue-700"
													: "bg-emerald-50 border-emerald-200/70 text-emerald-700"
											}`}
										>
											{finalBatchActive ? (
												<Layers className="w-3 h-3 text-blue-600" />
											) : (
												<Target className="w-3 h-3 text-emerald-600" />
											)}
											<span>
												{finalBatchActive
													? `Batch Mode (${taskTitles.length} Tasks)`
													: "New Objective"}
											</span>
										</div>

										{/* Draft Restored badge */}
										<AnimatePresence>
											{draftRestored && (
												<motion.span
													initial={
														reduceMotion ? false : { opacity: 0, scale: 0.85 }
													}
													animate={{ opacity: 1, scale: 1 }}
													exit={{ opacity: 0, scale: 0.85 }}
													className="text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/70 px-2.5 py-0.5 rounded-full"
												>
													Draft restored
												</motion.span>
											)}
										</AnimatePresence>
									</div>

									{/* Action Toolbar */}
									<div className="flex items-center gap-1.5">
										{hasMultipleLines && (
											<button
												type="button"
												onClick={() => setIsBatchEnabled(!isBatchEnabled)}
												aria-pressed={isBatchEnabled}
												className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
													isBatchEnabled
														? "bg-blue-50 border-blue-200/80 text-blue-700 shadow-2xs"
														: "bg-slate-50 border-slate-200/70 text-slate-400 hover:text-slate-600"
												}`}
												title={
													isBatchEnabled
														? "Batch Mode Active: Multi-line entry creates individual tasks"
														: "Single Task Mode: Multi-line entry kept as one task"
												}
											>
												<Layers className="w-3 h-3" />
												<span className="hidden sm:inline">Batch Protocol</span>
											</button>
										)}

										{/* Notes toggle */}
										<button
											type="button"
											onClick={() => setIsNotesOpen((v) => !v)}
											aria-pressed={isNotesOpen}
											className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${
												isNotesOpen || description
													? "bg-slate-900 border-slate-900 text-white shadow-2xs"
													: "bg-slate-50 border-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
											}`}
											title="Toggle notes & checklist"
										>
											<FileText className="w-3 h-3" />
											<span>Notes</span>
											{isNotesOpen ? (
												<ChevronUp className="w-3 h-3" />
											) : (
												<ChevronDown className="w-3 h-3" />
											)}
										</button>

										{/* Clear button */}
										{(title || description) && (
											<button
												type="button"
												onClick={resetForm}
												className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
												title="Clear form"
												aria-label="Clear form"
											>
												<X className="w-4 h-4" />
											</button>
										)}

										{/* Close button for mobile modal */}
										{onClose && (
											<button
												type="button"
												onClick={onClose}
												className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-0.5"
												title="Close dialog"
												aria-label="Close dialog"
											>
												<ChevronDown className="w-5 h-5" />
											</button>
										)}
									</div>
								</div>

								{/* Dynamic Title Input */}
								<div className="space-y-1.5">
									<textarea
										id="task-title"
										ref={textareaRef}
										placeholder="What needs to be accomplished? (one per line for multiple)..."
										value={title}
										onChange={handleTitleChange}
										onFocus={() => setIsFocused(true)}
										onBlur={() => !title && setIsFocused(false)}
										onKeyDown={handleKeyDown}
										rows={1}
										disabled={isSubmitting}
										className="w-full bg-transparent text-lg sm:text-xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:placeholder:text-slate-200 focus:outline-none resize-none leading-snug overflow-hidden min-h-[44px]"
									/>

									{/* Smart Syntax Quick Helper Strip */}
									<div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-400">
										<span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">
											Pro Tip:
										</span>
										<button
											type="button"
											onClick={() => setPriority("HIGH")}
											className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-rose-50 border border-slate-200/70 hover:border-rose-200 text-slate-500 hover:text-rose-600 font-mono transition-colors"
											title="Set Priority to High"
										>
											!high
										</button>
										<button
											type="button"
											onClick={() => setCategory("Work")}
											className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 text-slate-500 hover:text-emerald-700 font-mono transition-colors"
											title="Set Category to #work"
										>
											#work
										</button>
										<button
											type="button"
											onClick={() =>
												setDueDate(format(new Date(), "yyyy-MM-dd"))
											}
											className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 text-slate-500 hover:text-blue-700 font-mono transition-colors"
											title="Set Due Date to Today"
										>
											@today
										</button>
										<button
											type="button"
											onClick={() =>
												setDueDate(format(addDays(new Date(), 1), "yyyy-MM-dd"))
											}
											className="px-2 py-0.5 rounded-md bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 text-slate-500 hover:text-blue-700 font-mono transition-colors"
											title="Set Due Date to Tomorrow"
										>
											@tomorrow
										</button>
										{finalBatchActive && (
											<span className="ml-auto text-[9px] font-black text-blue-600 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
												{taskTitles.length} tasks detected
											</span>
										)}
									</div>
								</div>

								{/* Notes / Description (Collapsible) */}
								<AnimatePresence>
									{isNotesOpen && (
										<motion.div
											key="notes"
											initial={reduceMotion ? false : { opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.2, ease: "easeInOut" }}
											className="overflow-hidden"
										>
											<div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 space-y-2 focus-within:bg-white focus-within:border-slate-300 transition-all">
												<div className="flex items-center justify-between">
													<label
														htmlFor="task-description"
														className="text-[9px] font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5"
													>
														<FileText className="w-3.5 h-3.5 text-slate-400" />
														<span>Notes & Reference Context</span>
														{finalBatchActive && (
															<span className="text-[8px] font-bold text-slate-400 normal-case">
																(applies to all batch items)
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
														className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-slate-600 hover:text-slate-900 px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200/80 rounded-lg shadow-2xs active:scale-95 transition-all cursor-pointer"
													>
														<ListTodo className="w-3 h-3 text-slate-500" />
														<span>+ Checklist</span>
													</button>
												</div>
												<textarea
													id="task-description"
													placeholder="Add supplementary notes, links, or checklist items…"
													value={description}
													onChange={(e) => setDescription(e.target.value)}
													rows={3}
													disabled={isSubmitting}
													className="w-full bg-transparent border-0 text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
												/>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								{/* Metadata Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-3 border-t border-slate-100">
									{/* Category Selector */}
									<div className="space-y-2">
										<label
											htmlFor="task-category"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5"
										>
											<Tag className="w-3 h-3 text-slate-400" /> Category
										</label>
										<div className="flex flex-wrap gap-1.5">
											{TASK_CATEGORIES.map((cat) => (
												<button
													key={cat}
													type="button"
													onClick={() =>
														setCategory(category === cat ? "" : cat)
													}
													className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${
														category === cat
															? "bg-slate-900 border-slate-900 text-white shadow-xs"
															: "bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
													}`}
												>
													{cat}
												</button>
											))}
										</div>
										<div className="relative">
											<Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
											<input
												id="task-category"
												list="category-suggestions"
												type="text"
												placeholder="Custom category..."
												value={category}
												onChange={(e) => setCategory(e.target.value)}
												className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none"
											/>
											<datalist id="category-suggestions">
												{TASK_CATEGORIES.map((cat) => (
													<option key={cat} value={cat} />
												))}
											</datalist>
										</div>
									</div>

									{/* Due Date Picker */}
									<div className="space-y-2">
										<label
											htmlFor="task-due-date"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5"
										>
											<Calendar className="w-3 h-3 text-slate-400" /> Due Date
										</label>
										<div className="flex flex-wrap gap-1.5">
											{QUICK_DATE_CHIPS.map((chip) => {
												const isActive = activeDateChipDays === chip.days;
												return (
													<button
														key={chip.label}
														type="button"
														onClick={() => setQuickDate(chip.days)}
														className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
															isActive
																? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
																: "bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
														}`}
													>
														{chip.label}
													</button>
												);
											})}
										</div>
										<div className="relative">
											<Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
											<input
												id="task-due-date"
												type="date"
												value={dueDate}
												onChange={(e) => setDueDate(e.target.value)}
												className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none cursor-pointer"
											/>
										</div>
									</div>

									{/* Priority Selector */}
									<div className="space-y-2">
										<label
											htmlFor="task-priority"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5"
										>
											<Flag className="w-3 h-3 text-slate-400" /> Priority Level
										</label>
										<fieldset
											id="task-priority"
											className="flex p-1 bg-slate-50 border border-slate-200/80 rounded-xl gap-1"
											aria-label="Priority Level"
										>
											{(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map(
												(p) => (
													<button
														key={p}
														type="button"
														onClick={() => setPriority(p)}
														aria-pressed={priority === p}
														className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${
															priority === p
																? p === "HIGH"
																	? "bg-rose-600 text-white shadow-xs"
																	: p === "MEDIUM"
																		? "bg-amber-500 text-white shadow-xs"
																		: "bg-emerald-600 text-white shadow-xs"
																: "text-slate-500 hover:text-slate-800"
														}`}
													>
														{p}
													</button>
												),
											)}
										</fieldset>
									</div>

									{/* Recurrence Selector */}
									<div className="space-y-2">
										<label
											htmlFor="task-recurrence"
											className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5"
										>
											<RefreshCw className="w-3 h-3 text-slate-400" />{" "}
											Recurrence
										</label>
										<fieldset
											id="task-recurrence"
											className="flex p-1 bg-slate-50 border border-slate-200/80 rounded-xl gap-1"
											aria-label="Recurrence"
										>
											{RECURRENCE_OPTIONS.map((opt) => (
												<button
													key={opt.value}
													type="button"
													onClick={() => setRecurrence(opt.value)}
													aria-pressed={recurrence === opt.value}
													className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
														recurrence === opt.value
															? opt.value === "none"
																? "bg-slate-900 text-white shadow-xs"
																: "bg-indigo-600 text-white shadow-xs"
															: "text-slate-500 hover:text-slate-800"
													}`}
												>
													{opt.label}
												</button>
											))}
										</fieldset>
									</div>
								</div>

								{/* Advanced Drawer Trigger */}
								<div>
									<button
										type="button"
										onClick={() => setIsAdvancedOpen((v) => !v)}
										aria-expanded={isAdvancedOpen}
										className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-200/80 text-[10px] font-black uppercase tracking-wider text-slate-600 transition-colors cursor-pointer"
									>
										{isAdvancedOpen ? (
											<ChevronUp className="w-3.5 h-3.5 text-slate-400" />
										) : (
											<ChevronDown className="w-3.5 h-3.5 text-slate-400" />
										)}
										<span>Advanced Settings</span>
										{advancedCount > 0 && (
											<span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-700">
												{advancedCount} set
											</span>
										)}
									</button>

									{/* Advanced Drawer Content */}
									<AnimatePresence>
										{isAdvancedOpen && (
											<motion.div
												key="advanced"
												initial={
													reduceMotion ? false : { opacity: 0, height: 0 }
												}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2, ease: "easeInOut" }}
												className="overflow-hidden"
											>
												<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 pt-4 border-t border-slate-100 mt-3">
													{/* Initial Status */}
													<div className="space-y-2">
														<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5">
															<CheckCircle2 className="w-3 h-3 text-slate-400" />{" "}
															Initial Status
														</span>
														<div className="flex flex-col gap-1.5">
															{(
																Object.entries(TASK_STATUS_CONFIG) as [
																	TaskStatus,
																	(typeof TASK_STATUS_CONFIG)[TaskStatus],
																][]
															)
																.filter(([key]) => key !== "cancelled")
																.map(([key, cfg]) => (
																	<button
																		key={key}
																		type="button"
																		onClick={() => setStatus(key)}
																		className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
																			status === key
																				? `${cfg.color} shadow-2xs`
																				: "bg-slate-50 border-slate-200/70 text-slate-400 hover:border-slate-300"
																		}`}
																	>
																		<span
																			className={`w-2 h-2 rounded-full ${cfg.dotColor}`}
																		/>
																		<span>{cfg.label}</span>
																	</button>
																))}
														</div>
													</div>

													{/* Effort Estimation */}
													<div className="space-y-2">
														<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5">
															<Clock className="w-3 h-3 text-slate-400" />{" "}
															Effort Estimate
														</span>
														<div className="flex flex-wrap gap-1.5">
															{EFFORT_CHIPS.map((chip) => (
																<button
																	key={chip.minutes}
																	type="button"
																	onClick={() =>
																		setEstimatedMinutes(
																			estimatedMinutes === chip.minutes
																				? null
																				: chip.minutes,
																		)
																	}
																	className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all ${
																		estimatedMinutes === chip.minutes
																			? "bg-cyan-600 text-white border-cyan-600 shadow-2xs"
																			: "bg-slate-50 border-slate-200/70 text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
																	}`}
																>
																	{chip.label}
																</button>
															))}
														</div>
														<div className="flex items-center gap-2 mt-2">
															<div className="relative flex-1">
																<Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
																<input
																	type="number"
																	min="1"
																	max="480"
																	placeholder="Custom (min)"
																	value={
																		estimatedMinutes !== null &&
																		!EFFORT_CHIPS.some(
																			(c) => c.minutes === estimatedMinutes,
																		)
																			? estimatedMinutes
																			: ""
																	}
																	onChange={(e) => {
																		const v = Number.parseInt(
																			e.target.value,
																			10,
																		);
																		setEstimatedMinutes(
																			Number.isNaN(v) || v <= 0 ? null : v,
																		);
																	}}
																	className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-cyan-500 transition-all outline-none"
																/>
															</div>
															{estimatedMinutes && (
																<span className="text-[9px] font-black text-cyan-700 bg-cyan-50 border border-cyan-200/70 px-2 py-1 rounded-lg whitespace-nowrap">
																	⏱ {formatEstimatedTime(estimatedMinutes)}
																</span>
															)}
														</div>
													</div>

													{/* Tags Input */}
													<div className="space-y-2">
														<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5">
															<Hash className="w-3 h-3 text-slate-400" /> Tags
														</span>
														<div
															className="min-h-[64px] bg-slate-50 border border-slate-200/80 rounded-xl p-2 flex flex-wrap gap-1.5 cursor-text focus-within:bg-white focus-within:border-slate-300 transition-all"
															onClick={() => tagInputRef.current?.focus()}
														>
															{tags.map((tag) => (
																<span
																	key={tag}
																	className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-slate-200/80 text-slate-700"
																>
																	#{tag}
																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			removeTag(tag);
																		}}
																		className="text-slate-400 hover:text-rose-600 transition-colors"
																	>
																		<X className="w-2.5 h-2.5" />
																	</button>
																</span>
															))}
															<input
																ref={tagInputRef}
																type="text"
																value={tagInput}
																onChange={(e) => setTagInput(e.target.value)}
																onKeyDown={handleTagKeyDown}
																placeholder={
																	tags.length === 0
																		? "Type tag and press Enter…"
																		: ""
																}
																className="bg-transparent text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none min-w-[90px] flex-1 px-1"
															/>
														</div>
													</div>

													{/* Scheduling Window */}
													<div className="space-y-2">
														<span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-0.5">
															<Calendar className="w-3 h-3 text-slate-400" />{" "}
															Scheduling Window
														</span>
														<div className="space-y-2">
															<div>
																<span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">
																	Start Date
																</span>
																<div className="relative">
																	<Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
																	<input
																		type="date"
																		value={startDate || ""}
																		onChange={(e) =>
																			setStartDate(e.target.value || null)
																		}
																		className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none cursor-pointer"
																	/>
																</div>
															</div>
															<div className="grid grid-cols-2 gap-2">
																<div>
																	<span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">
																		Start Time
																	</span>
																	<input
																		type="time"
																		value={startTime || ""}
																		onChange={(e) =>
																			setStartTime(e.target.value || null)
																		}
																		className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none cursor-pointer"
																	/>
																</div>
																<div>
																	<span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block mb-1">
																		Due Time
																	</span>
																	<input
																		type="time"
																		value={dueTime || ""}
																		onChange={(e) =>
																			setDueTime(e.target.value || null)
																		}
																		className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none cursor-pointer"
																	/>
																</div>
															</div>
														</div>
													</div>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>

							{/* Action Footer */}
							<div
								className="px-5 sm:px-7 md:px-8 py-3.5 sm:py-4 bg-slate-50/90 border-t border-slate-100 flex flex-col gap-2"
								style={{
									paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
								}}
							>
								{/* Error message */}
								<AnimatePresence>
									{submitError && (
										<motion.div
											initial={reduceMotion ? false : { opacity: 0, y: -4 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -4 }}
											className="flex items-center gap-2 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3.5 py-2"
										>
											<AlertCircle className="w-3.5 h-3.5 shrink-0" />
											<span>{submitError}</span>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex items-center justify-between gap-3">
									<div className="flex items-center gap-2">
										<Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
										<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
											{finalBatchActive
												? "Batch collective execution"
												: "Direct execution objective"}
										</span>
										{/* Keyboard shortcut hint */}
										<kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[9px] font-mono text-slate-400 shadow-2xs">
											⌘/Ctrl+Enter
										</kbd>
									</div>

									<button
										type="submit"
										disabled={isSubmitting || submitSuccess || !title.trim()}
										className={`flex items-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer ${
											submitSuccess
												? "bg-emerald-600 text-white"
												: finalBatchActive
													? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10"
													: "bg-slate-900 hover:bg-emerald-600 text-white shadow-slate-900/10"
										}`}
									>
										{isSubmitting ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : submitSuccess ? (
											<CheckCircle2 className="w-4 h-4" />
										) : (
											<Plus className="w-4 h-4" />
										)}
										<span>
											{isSubmitting
												? "Initializing…"
												: submitSuccess
													? "Done!"
													: finalBatchActive
														? `Initialize ${taskTitles.length} Tasks`
														: "Initialize"}
										</span>
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
