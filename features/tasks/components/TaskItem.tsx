"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
	Trash2,
	Check,
	Clock,
	GripVertical,
	Tag,
	Edit2,
	RefreshCw,
	FileText,
	ChevronDown,
	ChevronUp,
	AlertTriangle,
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import {
	motion,
	AnimatePresence,
	useMotionValue,
	useTransform,
	type PanInfo,
} from "framer-motion";
import type {
	DraggableProvided,
	DraggableStateSnapshot,
} from "@hello-pangea/dnd";
import { renderTextWithLinks } from "@/features/tasks/utils";
import {
	differenceInDays,
	parseISO,
	startOfDay,
	format,
	addDays,
} from "date-fns";

// ─── Constants (module-level — not recreated on every render) ─────────────────

// #14 — moved outside component
const PRIORITY_COLORS = {
	HIGH: "bg-rose-50 text-rose-700 border-rose-100",
	MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
	LOW: "bg-emerald-50 text-emerald-700 border-emerald-100",
} as const;

const PRIORITY_BAR = {
	HIGH: "bg-rose-500",
	MEDIUM: "bg-amber-500",
	LOW: "bg-emerald-500",
} as const;

const RECURRENCE_LABELS = {
	none: null,
	daily: "Daily",
	weekly: "Weekly",
	monthly: "Monthly",
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskItemProps {
	task: Task;
	index: number;
	provided: DraggableProvided;
	snapshot: DraggableStateSnapshot;
	onToggle: (taskId: string, currentStatus: boolean) => void;
	onDelete: (taskId: string) => void;
	onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskItem({
	task,
	provided,
	snapshot,
	onToggle,
	onDelete,
	onUpdate,
}: TaskItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(task.title);
	const [editDescription, setEditDescription] = useState(
		task.description || "",
	);
	const [editDueDate, setEditDueDate] = useState(task.due_date);
	const [editPriority, setEditPriority] = useState(task.priority);
	const [editCategory, setEditCategory] = useState(task.category || "");
	const [editRecurrence, setEditRecurrence] = useState(task.recurrence);

	const [isNotesOpen, setIsNotesOpen] = useState(false);

	// #8 — Optimistic toggle state
	const [optimisticCompleted, setOptimisticCompleted] = useState(
		task.is_completed,
	);

	// #6 — Delete confirmation state
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const titleRef = useRef<HTMLTextAreaElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	// Swipe action state
	const x = useMotionValue(0);
	const background = useTransform(
		x,
		[-100, 0, 100],
		["#fef2f2", "rgba(255, 255, 255, 0)", "#eff6ff"],
	);

	// Dynamic swipe label opacity based on x offset
	const editOpacity = useTransform(x, [0, 60], [0, 1]);
	const deleteOpacity = useTransform(x, [-60, 0], [1, 0]);

	// Sync states when task changes externally (only when not editing)
	useEffect(() => {
		if (!isEditing) {
			setEditValue(task.title);
			setEditDescription(task.description || "");
			setEditDueDate(task.due_date);
			setEditPriority(task.priority);
			setEditCategory(task.category || "");
			setEditRecurrence(task.recurrence);
		}
	}, [task, isEditing]);

	// #8 — Keep optimistic state in sync with server state
	useEffect(() => {
		setOptimisticCompleted(task.is_completed);
	}, [task.is_completed]);

	// Helper to auto-expand textarea
	const adjustHeight = (el: HTMLTextAreaElement | null) => {
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	};

	// Auto-expand and focus edit textareas
	useEffect(() => {
		if (isEditing) {
			if (titleRef.current) {
				adjustHeight(titleRef.current);
				titleRef.current.focus();
				titleRef.current.setSelectionRange(
					titleRef.current.value.length,
					titleRef.current.value.length,
				);
			}
			if (descriptionRef.current) {
				adjustHeight(descriptionRef.current);
			}
		}
	}, [isEditing]);

	// Cleanup delete confirmation timer on unmount
	useEffect(() => {
		return () => {
			if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
		};
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const startEditing = useCallback(() => {
		setEditValue(task.title);
		setEditDescription(task.description || "");
		setEditDueDate(task.due_date);
		setEditPriority(task.priority);
		setEditCategory(task.category || "");
		setEditRecurrence(task.recurrence);
		setIsEditing(true);
	}, [task]);

	const handleCancel = useCallback(() => {
		setEditValue(task.title);
		setEditDescription(task.description || "");
		setEditDueDate(task.due_date);
		setEditPriority(task.priority);
		setEditCategory(task.category || "");
		setEditRecurrence(task.recurrence);
		setIsEditing(false);
	}, [task]);

	const handleSave = useCallback(() => {
		const updates: Partial<Task> = {};

		const cleanTitle = editValue.trim();
		if (cleanTitle && cleanTitle !== task.title) {
			updates.title = cleanTitle;
		}

		const cleanDescription = editDescription.trim();
		if (cleanDescription !== (task.description || "")) {
			updates.description = cleanDescription || null;
		}

		if (editPriority !== task.priority) {
			updates.priority = editPriority;
		}

		const cleanCategory = editCategory.trim();
		if (cleanCategory !== (task.category || "")) {
			updates.category = cleanCategory || null;
		}

		if (editRecurrence !== task.recurrence) {
			updates.recurrence = editRecurrence;
		}

		if (editDueDate !== task.due_date) {
			updates.due_date = editDueDate;
			// Increment reschedule_count if new due date is after original due date
			if (editDueDate > task.due_date) {
				updates.reschedule_count = (task.reschedule_count || 0) + 1;
			}
		}

		if (Object.keys(updates).length > 0) {
			onUpdate(task.id, updates);
		}
		setIsEditing(false);
	}, [
		editValue,
		editDescription,
		editPriority,
		editCategory,
		editRecurrence,
		editDueDate,
		task,
		onUpdate,
	]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				handleSave();
			}
			if (e.key === "Escape") {
				handleCancel();
			}
		},
		[handleSave, handleCancel],
	);

	// #8 — Optimistic toggle: flip immediately, let parent sync server state
	const handleToggle = useCallback(() => {
		setOptimisticCompleted((prev) => !prev);
		onToggle(task.id, task.is_completed);
	}, [task.id, task.is_completed, onToggle]);

	// #6 — Two-step delete: first click arms, second confirms; auto-disarms after 3s
	const handleDeleteClick = useCallback(() => {
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			deleteTimerRef.current = setTimeout(() => setDeleteConfirm(false), 3000);
		} else {
			if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
			onDelete(task.id);
		}
	}, [deleteConfirm, task.id, onDelete]);

	// #13 — Properly typed with framer-motion's PanInfo
	const handleDragEnd = useCallback(
		(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
			if (info.offset.x > 100) {
				startEditing();
			} else if (info.offset.x < -100) {
				handleDeleteClick();
			}
		},
		[startEditing, handleDeleteClick],
	);

	// ── Derived values ────────────────────────────────────────────────────────

	// #1 — Formatted date, #2 — Overdue / today states
	const dueDateInfo = useMemo(() => {
		if (!task.due_date) return null;
		const today = startOfDay(new Date());
		const dueDate = startOfDay(parseISO(task.due_date));
		const diff = differenceInDays(dueDate, today);
		const formatted = format(parseISO(task.due_date), "dd MMM");

		return { diff, formatted };
	}, [task.due_date]);

	const timeLeft = useMemo(() => {
		if (!dueDateInfo || task.is_completed) return null;
		const { diff } = dueDateInfo;

		// #2 — Overdue state
		if (diff < 0)
			return {
				text: `${Math.abs(diff)}d overdue`,
				emoji: "🔥",
				color: "text-rose-700 bg-rose-50 border-rose-200",
			};
		// Due today
		if (diff === 0)
			return {
				text: "Due today",
				emoji: "⚡",
				color: "text-orange-700 bg-orange-50 border-orange-200",
			};
		if (diff === 1)
			return {
				text: "1 day more",
				emoji: "⏳",
				color: "text-orange-600 bg-orange-50 border-orange-100",
			};
		if (diff <= 3)
			return {
				text: `${diff} days more`,
				emoji: "📅",
				color: "text-blue-600 bg-blue-50 border-blue-100",
			};
		return {
			text: `${diff} days more`,
			emoji: "🗓️",
			color: "text-slate-500 bg-slate-100 border-slate-200",
		};
	}, [dueDateInfo, task.is_completed]);

	// #9 — Overdue visual flag (for card border / priority bar)
	const isOverdue = !task.is_completed && !!dueDateInfo && dueDateInfo.diff < 0;
	const isDueToday =
		!task.is_completed && !!dueDateInfo && dueDateInfo.diff === 0;

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			className="relative overflow-hidden rounded-[1.5rem] sm:rounded-2xl"
		>
			{/* Swipe Action Backgrounds */}
			<motion.div
				style={{ background }}
				className="absolute inset-0 flex items-center justify-between px-6 -z-10"
			>
				<motion.div
					style={{ opacity: editOpacity }}
					className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest"
				>
					<Edit2 className="w-4 h-4" /> Edit
				</motion.div>
				<motion.div
					style={{ opacity: deleteOpacity }}
					className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest"
				>
					Delete <Trash2 className="w-4 h-4" />
				</motion.div>
			</motion.div>

			<motion.div
				drag={isEditing ? false : "x"}
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.4}
				onDragEnd={handleDragEnd}
				style={{ x }}
				className={`group flex items-start gap-3 sm:gap-4 p-4 bg-white border-2 transition-all duration-300 ${
					snapshot.isDragging
						? "shadow-2xl border-emerald-500 ring-2 ring-emerald-500/10 z-50"
						: isEditing
							? "border-emerald-500 shadow-md ring-2 ring-emerald-500/5"
							: isOverdue
								? "border-rose-200 hover:border-rose-300 shadow-sm"
								: isDueToday
									? "border-orange-200 hover:border-orange-300 shadow-sm"
									: "border-slate-200 hover:border-slate-300 shadow-sm"
				} ${optimisticCompleted ? "bg-slate-50/50 opacity-75" : ""}`}
			>
				{/* Drag Handle */}
				<div
					{...provided.dragHandleProps}
					className={`text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing py-1 ${isEditing ? "opacity-50 pointer-events-none" : ""}`}
					title={isEditing ? "Cannot drag while editing" : "Drag to reorder"}
				>
					<GripVertical className="w-4 h-4" />
				</div>

				{/* Visual Indicator Line */}
				{/* #9 — Overdue turns the priority bar red regardless of priority */}
				<div
					className={`w-1 self-stretch rounded-full transition-all min-h-[1.5rem] ${
						optimisticCompleted
							? "bg-slate-200"
							: isEditing
								? "bg-emerald-500"
								: isOverdue
									? "bg-rose-500 animate-pulse"
									: PRIORITY_BAR[task.priority]
					}`}
				/>

				{/* #11 — Proper aria attributes on checkbox */}
				{!isEditing && (
					<button
						onClick={handleToggle}
						aria-label={`Mark "${task.title}" as ${optimisticCompleted ? "incomplete" : "complete"}`}
						className={`flex-shrink-0 transition-all duration-200 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center mt-1 sm:mt-0.5 ${
							optimisticCompleted
								? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
								: "bg-white border-slate-300 hover:border-emerald-500"
						}`}
					>
						<AnimatePresence mode="wait">
							{optimisticCompleted && (
								<motion.div
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
								>
									<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4]" />
								</motion.div>
							)}
						</AnimatePresence>
					</button>
				)}

				{/* Main Content */}
				<div className="flex-1 min-w-0">
					{/* Title — edit or display */}
					{isEditing ? (
						<div className="space-y-4 py-1" onKeyDown={handleKeyDown}>
							{/* Form Title & Description */}
							<div className="space-y-1">
								<label
									htmlFor={`edit-title-${task.id}`}
									className="text-[9px] font-black uppercase tracking-widest text-slate-400"
								>
									Task Title
								</label>
								<textarea
									id={`edit-title-${task.id}`}
									ref={titleRef}
									value={editValue}
									onChange={(e) => {
										setEditValue(e.target.value);
										adjustHeight(e.target);
									}}
									rows={1}
									placeholder="What needs to be done?"
									className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none overflow-hidden block transition-all"
								/>
							</div>

							<div className="space-y-1">
								<label
									htmlFor={`edit-desc-${task.id}`}
									className="text-[9px] font-black uppercase tracking-widest text-slate-400"
								>
									Description & Notes
								</label>
								<textarea
									id={`edit-desc-${task.id}`}
									ref={descriptionRef}
									value={editDescription}
									onChange={(e) => {
										setEditDescription(e.target.value);
										adjustHeight(e.target);
									}}
									rows={2}
									placeholder="Add some details or notes here..."
									className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 resize-none overflow-hidden block transition-all"
								/>
							</div>

							{/* Priority & Category & Recurrence Selector Grid */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{/* Priority Level */}
								<div className="space-y-1">
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
										Priority
									</span>
									<div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1">
										{(["LOW", "MEDIUM", "HIGH"] as const).map((p) => (
											<button
												key={p}
												type="button"
												onClick={() => setEditPriority(p)}
												className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
													editPriority === p
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
										))}
									</div>
								</div>

								{/* Category Select */}
								<div className="space-y-1">
									<label
										htmlFor={`edit-cat-${task.id}`}
										className="text-[9px] font-black uppercase tracking-widest text-slate-400"
									>
										Category
									</label>
									<div className="relative">
										<select
											id={`edit-cat-${task.id}`}
											value={editCategory}
											onChange={(e) => setEditCategory(e.target.value)}
											className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
										>
											<option value="">No Category</option>
											{[
												"Work",
												"Personal",
												"Fintech",
												"Health",
												"Urgent",
												"Study",
												"Finance",
											].map((c) => (
												<option key={c} value={c}>
													{c}
												</option>
											))}
										</select>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
											<ChevronDown className="w-3.5 h-3.5" />
										</div>
									</div>
								</div>

								{/* Recurrence Selector */}
								<div className="space-y-1">
									<label
										htmlFor={`edit-rec-${task.id}`}
										className="text-[9px] font-black uppercase tracking-widest text-slate-400"
									>
										Recurrence
									</label>
									<div className="relative">
										<select
											id={`edit-rec-${task.id}`}
											value={editRecurrence}
											onChange={(e) => setEditRecurrence(e.target.value as any)}
											className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all appearance-none cursor-pointer"
										>
											<option value="none">None</option>
											<option value="daily">Daily</option>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
										</select>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
											<ChevronDown className="w-3.5 h-3.5" />
										</div>
									</div>
								</div>
							</div>

							{/* Due Date & Quick Reschedule */}
							<div className="space-y-2 border-t border-slate-100 pt-3">
								<label
									htmlFor={`edit-due-${task.id}`}
									className="text-[9px] font-black uppercase tracking-widest text-slate-400 block"
								>
									Due Date
								</label>
								<div className="flex flex-col sm:flex-row gap-3">
									<input
										id={`edit-due-${task.id}`}
										type="date"
										value={editDueDate}
										onChange={(e) => setEditDueDate(e.target.value)}
										className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
									/>
									<div className="flex flex-wrap gap-1.5 items-center">
										{[
											{ label: "Today", days: 0 },
											{ label: "Tomorrow", days: 1 },
											{ label: "+3 Days", days: 3 },
											{ label: "+7 Days", days: 7 },
										].map((opt) => {
											const targetDateStr = format(
												addDays(new Date(), opt.days),
												"yyyy-MM-dd",
											);
											const isActive = editDueDate === targetDateStr;
											return (
												<button
													key={opt.label}
													type="button"
													onClick={() => setEditDueDate(targetDateStr)}
													className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
														isActive
															? "bg-emerald-500 border-emerald-500 text-white shadow-sm ring-2 ring-emerald-300"
															: "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
													}`}
												>
													{opt.label}
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* Buttons Bar */}
							<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-100 pt-3">
								<span className="text-[9px] text-slate-400 font-medium order-2 sm:order-1">
									Press{" "}
									<kbd className="bg-slate-100 px-1 rounded font-bold">
										Ctrl+Enter
									</kbd>{" "}
									to save •{" "}
									<kbd className="bg-slate-100 px-1 rounded font-bold">Esc</kbd>{" "}
									to cancel
								</span>
								<div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
									<button
										type="button"
										onClick={handleCancel}
										className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={handleSave}
										disabled={!editValue.trim()}
										className="px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5"
									>
										<Check className="w-3.5 h-3.5 stroke-[3]" /> Save
									</button>
								</div>
							</div>
						</div>
					) : (
						<>
							<div
								onDoubleClick={startEditing}
								className={`text-base sm:text-sm font-semibold text-slate-900 transition-all cursor-text break-words whitespace-pre-wrap ${
									optimisticCompleted ? "line-through text-slate-400" : ""
								}`}
								title="Double-click to edit"
							>
								{renderTextWithLinks(task.title)}
							</div>

							{/* #4 — Description / Notes preview (collapsible) */}
							{task.description && (
								<div className="mt-1.5">
									<button
										type="button"
										onClick={() => setIsNotesOpen((v) => !v)}
										className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-violet-500 hover:text-violet-700 transition-colors"
										aria-label={isNotesOpen ? "Hide notes" : "Show notes"}
									>
										<FileText className="w-2.5 h-2.5" />
										Notes
										{isNotesOpen ? (
											<ChevronUp className="w-2.5 h-2.5" />
										) : (
											<ChevronDown className="w-2.5 h-2.5" />
										)}
									</button>
									<AnimatePresence>
										{isNotesOpen && (
											<motion.div
												key="notes"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.18, ease: "easeInOut" }}
												className="overflow-hidden"
											>
												<p className="mt-1.5 text-xs text-slate-500 leading-relaxed bg-violet-50/60 border border-violet-100 rounded-xl px-3 py-2 whitespace-pre-wrap break-words">
													{renderTextWithLinks(task.description)}
												</p>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

							{/* Metadata Badges */}
							<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
								{/* Priority */}
								<span
									className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${PRIORITY_COLORS[task.priority]}`}
								>
									{task.priority}
								</span>

								{/* Category */}
								{task.category && (
									<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
										<Tag className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{task.category}
									</span>
								)}

								{/* #1 — Formatted due date */}
								{dueDateInfo && (
									<div
										className={`flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold ml-0.5 sm:ml-1 ${
											isOverdue
												? "text-rose-500"
												: isDueToday
													? "text-orange-500"
													: "text-slate-400"
										}`}
									>
										<Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
										<span>{dueDateInfo.formatted}</span>
									</div>
								)}

								{/* #5 — Recurrence badge */}
								{task.recurrence && task.recurrence !== "none" && (
									<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100">
										<RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{RECURRENCE_LABELS[task.recurrence]}
									</span>
								)}

								{/* Reschedule count */}
								{task.reschedule_count > 0 && !task.is_completed && (
									<div
										className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[8px] sm:text-[9px] font-black"
										title={`Delayed ${task.reschedule_count} times`}
									>
										<RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{task.reschedule_count}
									</div>
								)}

								{/* #2 — Time left / overdue / due today */}
								{timeLeft && (
									<span
										className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-tight border ${timeLeft.color}`}
									>
										<span>{timeLeft.emoji}</span>
										{timeLeft.text}
									</span>
								)}
							</div>

							{/* #10 — Mobile edit hint (shown on focus / when not completed) */}
							{!optimisticCompleted && (
								<p className="mt-1 text-[8px] text-slate-300 font-medium sm:hidden">
									Double-tap title to edit
								</p>
							)}
						</>
					)}
				</div>

				{/* Desktop Only Actions */}
				{!isEditing && (
					<div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
						{/* #12 — aria-label linked to task name */}
						<button
							onClick={startEditing}
							className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
							aria-label={`Edit task: ${task.title}`}
							title="Quick Edit"
						>
							<Edit2 className="w-4 h-4" />
						</button>

						{/* #6 — Two-step delete confirmation */}
						<button
							onClick={handleDeleteClick}
							aria-label={
								deleteConfirm ? "Confirm delete" : `Delete task: ${task.title}`
							}
							title={deleteConfirm ? "Click again to confirm" : "Delete Task"}
							className={`p-2 rounded-xl transition-all ${
								deleteConfirm
									? "text-white bg-rose-500 hover:bg-rose-600 scale-105"
									: "text-slate-300 hover:text-rose-600 hover:bg-rose-50"
							}`}
						>
							{deleteConfirm ? (
								<AlertTriangle className="w-4 h-4" />
							) : (
								<Trash2 className="w-4 h-4" />
							)}
						</button>
					</div>
				)}
			</motion.div>
		</div>
	);
}
