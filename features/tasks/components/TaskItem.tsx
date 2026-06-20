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
import { differenceInDays, parseISO, startOfDay, format } from "date-fns";

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
	const [isNotesOpen, setIsNotesOpen] = useState(false);

	// #8 — Optimistic toggle state
	const [optimisticCompleted, setOptimisticCompleted] = useState(
		task.is_completed,
	);

	// #6 — Delete confirmation state
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Swipe action state
	const x = useMotionValue(0);
	const background = useTransform(
		x,
		[-100, 0, 100],
		["#fef2f2", "rgba(255, 255, 255, 0)", "#eff6ff"],
	);

	// #3 — Sync editValue when task.title changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditValue(task.title);
		}
	}, [task.title, isEditing]);

	// #8 — Keep optimistic state in sync with server state
	useEffect(() => {
		setOptimisticCompleted(task.is_completed);
	}, [task.is_completed]);

	// Auto-expand and focus edit textarea
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
			textareaRef.current.focus();
			textareaRef.current.setSelectionRange(
				textareaRef.current.value.length,
				textareaRef.current.value.length,
			);
		}
	}, [isEditing]);

	// Cleanup delete confirmation timer on unmount
	useEffect(() => {
		return () => {
			if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
		};
	}, []);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const handleSave = useCallback(() => {
		if (editValue.trim() && editValue !== task.title) {
			onUpdate(task.id, { title: editValue.trim() });
		}
		setIsEditing(false);
	}, [editValue, task.title, task.id, onUpdate]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleSave();
			}
			if (e.key === "Escape") {
				setEditValue(task.title);
				setIsEditing(false);
			}
		},
		[handleSave, task.title],
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
				setIsEditing(true);
			} else if (info.offset.x < -100) {
				handleDeleteClick();
			}
		},
		[handleDeleteClick],
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
				<div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
					<Edit2 className="w-4 h-4" /> Edit
				</div>
				<div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
					Delete <Trash2 className="w-4 h-4" />
				</div>
			</motion.div>

			<motion.div
				drag="x"
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.4}
				onDragEnd={handleDragEnd}
				style={{ x }}
				className={`group flex items-start gap-3 sm:gap-4 p-4 bg-white border-2 transition-all duration-300 ${
					snapshot.isDragging
						? "shadow-2xl border-emerald-500 ring-2 ring-emerald-500/10 z-50"
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
					className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing py-1"
					title="Drag to reorder"
				>
					<GripVertical className="w-4 h-4" />
				</div>

				{/* Visual Indicator Line */}
				{/* #9 — Overdue turns the priority bar red regardless of priority */}
				<div
					className={`w-1 self-stretch rounded-full transition-all min-h-[1.5rem] ${
						optimisticCompleted
							? "bg-slate-200"
							: isOverdue
								? "bg-rose-500 animate-pulse"
								: PRIORITY_BAR[task.priority]
					}`}
				/>

				{/* #11 — Proper aria attributes on checkbox */}
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

				{/* Main Content */}
				<div className="flex-1 min-w-0">
					{/* Title — edit or display */}
					{isEditing ? (
						<textarea
							ref={textareaRef}
							value={editValue}
							onChange={(e) => {
								setEditValue(e.target.value);
								e.target.style.height = "auto";
								e.target.style.height = `${e.target.scrollHeight}px`;
							}}
							onBlur={handleSave}
							onKeyDown={handleKeyDown}
							rows={1}
							aria-label={`Edit task: ${task.title}`}
							className="w-full bg-slate-50 border border-emerald-500 rounded-xl px-3 py-2 text-base font-semibold text-slate-900 focus:outline-none ring-4 ring-emerald-500/10 resize-none overflow-hidden block"
						/>
					) : (
						<div
							onDoubleClick={() => setIsEditing(true)}
							className={`text-base sm:text-sm font-semibold text-slate-900 transition-all cursor-text break-words whitespace-pre-wrap ${
								optimisticCompleted ? "line-through text-slate-400" : ""
							}`}
							title="Double-click to edit"
						>
							{renderTextWithLinks(task.title)}
						</div>
					)}

					{/* #4 — Description / Notes preview (collapsible) */}
					{task.description && !isEditing && (
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
					{!optimisticCompleted && !isEditing && (
						<p className="mt-1 text-[8px] text-slate-300 font-medium sm:hidden">
							Double-tap title to edit
						</p>
					)}
				</div>

				{/* Desktop Only Actions */}
				<div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
					{/* #12 — aria-label linked to task name */}
					<button
						onClick={() => setIsEditing(true)}
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
			</motion.div>
		</div>
	);
}
