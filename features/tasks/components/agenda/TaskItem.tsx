"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
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
	ListTodo,
	Plus,
	X,
	Hash,
	ChevronRight,
	Archive,
} from "lucide-react";
import type { Task, TaskStatus } from "@/features/tasks/types";
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
	isAfter,
} from "date-fns";
import {
	QUICK_RESCHEDULE_OPTIONS,
	DELETE_CONFIRM_TIMEOUT_MS,
	TASK_STATUS_CONFIG,
	STATUS_CYCLE,
	EFFORT_CHIPS,
	formatEstimatedTime,
	TASK_CATEGORIES,
	RECURRENCE_OPTIONS,
} from "@/features/tasks/constants";
import {
	addSubtask,
	getSubtasks,
	addTaskDependency,
	removeTaskDependency,
	getTaskDependencies,
	getPotentialBlockers,
	archiveTask,
} from "@/features/tasks/actions/tasks";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLORS = {
	HIGH: "bg-rose-50 text-rose-700 border-rose-100",
	MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
	LOW: "bg-emerald-50 text-emerald-700 border-emerald-100",
} as const;

const RECURRENCE_LABELS = {
	none: null,
	daily: "Daily",
	weekly: "Weekly",
	monthly: "Monthly",
} as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SubtaskItemProps {
	subtask: Task;
	onToggle: (id: string, current: boolean) => void;
	onDelete: (id: string) => void;
}

function SubtaskItem({ subtask, onToggle, onDelete }: SubtaskItemProps) {
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleDeleteClick = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		if (!deleteConfirm) {
			setDeleteConfirm(true);
			timerRef.current = setTimeout(() => setDeleteConfirm(false), 3000);
		} else {
			onDelete(subtask.id);
		}
	};

	useEffect(
		() => () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		},
		[],
	);

	const isDone = subtask.status === "done" || subtask.is_completed;

	return (
		<div className="flex items-center gap-2 py-1 group/sub">
			<button
				type="button"
				onClick={() => onToggle(subtask.id, subtask.is_completed)}
				className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
					isDone
						? "bg-emerald-500 border-emerald-500 text-white"
						: "bg-white border-slate-300 hover:border-emerald-400"
				}`}
			>
				{isDone && <Check className="w-2.5 h-2.5 stroke-[4]" />}
			</button>
			<span
				className={`flex-1 text-xs font-medium truncate ${
					isDone ? "line-through text-slate-400" : "text-slate-700"
				}`}
			>
				{subtask.title}
			</span>
			<button
				type="button"
				onClick={handleDeleteClick}
				className={`opacity-0 group-hover/sub:opacity-100 p-0.5 rounded transition-all ${
					deleteConfirm
						? "text-white bg-rose-500"
						: "text-slate-300 hover:text-rose-500"
				}`}
			>
				{deleteConfirm ? (
					<AlertTriangle className="w-3 h-3" />
				) : (
					<X className="w-3 h-3" />
				)}
			</button>
		</div>
	);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskItemProps {
	task: Task;
	index: number;
	provided?: DraggableProvided;
	snapshot?: DraggableStateSnapshot;
	onToggle: (taskId: string, currentStatus: boolean) => void;
	onDelete: (taskId: string) => void;
	onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

function TaskItem({
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
	const [editStatus, setEditStatus] = useState<TaskStatus>(
		task.status || "todo",
	);
	const [editEstimated, setEditEstimated] = useState<number | null>(
		task.estimated_minutes || null,
	);
	const [editTags, setEditTags] = useState<string[]>(task.tags || []);
	const [editTagInput, setEditTagInput] = useState("");
	const [editStartDate, setEditStartDate] = useState<string | null>(
		task.start_date || null,
	);
	const [editStartTime, setEditStartTime] = useState<string | null>(
		task.start_time || null,
	);
	const [editDueTime, setEditDueTime] = useState<string | null>(
		task.due_time || null,
	);

	const [blockers, setBlockers] = useState<Task[]>([]);
	const [blockersLoaded, setBlockersLoaded] = useState(false);
	const [potentialBlockers, setPotentialBlockers] = useState<Task[]>([]);
	const [potentialBlockersLoaded, setPotentialBlockersLoaded] = useState(false);

	const [isNotesOpen, setIsNotesOpen] = useState(false);
	const [isSubtasksOpen, setIsSubtasksOpen] = useState(false);
	const [subtasks, setSubtasks] = useState<Task[]>([]);
	const [subtasksLoaded, setSubtasksLoaded] = useState(false);
	const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
	const [isAddingSubtask, setIsAddingSubtask] = useState(false);
	const [subtaskLoading, setSubtaskLoading] = useState(false);

	// Optimistic status state
	const [optimisticStatus, setOptimisticStatus] = useState<TaskStatus>(
		task.status || "todo",
	);

	// Delete confirmation state
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const deleteTimeoutMs = DELETE_CONFIRM_TIMEOUT_MS;

	const titleRef = useRef<HTMLTextAreaElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);
	const subtaskInputRef = useRef<HTMLInputElement>(null);
	const editTagInputRef = useRef<HTMLInputElement>(null);

	// Swipe action state
	const x = useMotionValue(0);
	const background = useTransform(
		x,
		[-100, 0, 100],
		["#fef2f2", "rgba(255, 255, 255, 0)", "#eff6ff"],
	);

	const editOpacity = useTransform(x, [0, 60], [0, 1]);
	const deleteOpacity = useTransform(x, [-60, 0], [1, 0]);

	// Sync states when task changes externally
	useEffect(() => {
		if (!isEditing) {
			setEditValue(task.title);
			setEditDescription(task.description || "");
			setEditDueDate(task.due_date);
			setEditPriority(task.priority);
			setEditCategory(task.category || "");
			setEditRecurrence(task.recurrence);
			setEditStatus(task.status || "todo");
			setEditEstimated(task.estimated_minutes || null);
			setEditTags(task.tags || []);
			setEditStartDate(task.start_date || null);
			setEditStartTime(task.start_time || null);
			setEditDueTime(task.due_time || null);
		}
	}, [task, isEditing]);

	// Fetch blockers when status is blocked
	useEffect(() => {
		if (optimisticStatus === "blocked" && !blockersLoaded) {
			const loadBlockers = async () => {
				try {
					const data = await getTaskDependencies(task.id);
					setBlockers(data);
					setBlockersLoaded(true);
				} catch (err) {
					console.error("Failed to load blockers:", err);
				}
			};
			loadBlockers();
		}
	}, [optimisticStatus, blockersLoaded, task.id]);

	// Fetch blockers and potential blocker list when editing starts
	useEffect(() => {
		if (isEditing) {
			const loadEditData = async () => {
				try {
					const [currBlockers, potentials] = await Promise.all([
						getTaskDependencies(task.id),
						getPotentialBlockers(task.id),
					]);
					setBlockers(currBlockers);
					setBlockersLoaded(true);
					setPotentialBlockers(potentials);
					setPotentialBlockersLoaded(true);
				} catch (err) {
					console.error("Failed to load edit dependencies:", err);
				}
			};
			loadEditData();
		} else {
			setPotentialBlockersLoaded(false);
			setPotentialBlockers([]);
		}
	}, [isEditing, task.id]);

	useEffect(() => {
		setOptimisticStatus(task.status || "todo");
	}, [task.status]);

	const adjustHeight = (el: HTMLTextAreaElement | null) => {
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${el.scrollHeight}px`;
	};

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

	useEffect(() => {
		return () => {
			if (deleteTimerRef.current) {
				clearTimeout(deleteTimerRef.current);
				deleteTimerRef.current = null;
			}
		};
	}, [deleteConfirm]);

	// Load subtasks when opening
	useEffect(() => {
		if (isSubtasksOpen && !subtasksLoaded) {
			const load = async () => {
				try {
					const data = await getSubtasks(task.id);
					setSubtasks(data);
					setSubtasksLoaded(true);
				} catch (err) {
					console.error("Failed to load subtasks:", err);
				}
			};
			load();
		}
	}, [isSubtasksOpen, subtasksLoaded, task.id]);

	// ── Handlers ──────────────────────────────────────────────────────────────

	const startEditing = useCallback(() => {
		setEditValue(task.title);
		setEditDescription(task.description || "");
		setEditDueDate(task.due_date);
		setEditPriority(task.priority);
		setEditCategory(task.category || "");
		setEditRecurrence(task.recurrence);
		setEditStatus(task.status || "todo");
		setEditEstimated(task.estimated_minutes || null);
		setEditTags(task.tags || []);
		setEditStartDate(task.start_date || null);
		setEditStartTime(task.start_time || null);
		setEditDueTime(task.due_time || null);
		setIsEditing(true);
	}, [task]);

	const handleCancel = useCallback(() => {
		setEditValue(task.title);
		setEditDescription(task.description || "");
		setEditDueDate(task.due_date);
		setEditPriority(task.priority);
		setEditCategory(task.category || "");
		setEditRecurrence(task.recurrence);
		setEditStatus(task.status || "todo");
		setEditEstimated(task.estimated_minutes || null);
		setEditTags(task.tags || []);
		setEditStartDate(task.start_date || null);
		setEditStartTime(task.start_time || null);
		setEditDueTime(task.due_time || null);
		setEditTagInput("");
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
			if (editDueDate > task.due_date) {
				updates.reschedule_count = (task.reschedule_count || 0) + 1;
			}
		}

		if (editStatus !== (task.status || "todo")) {
			updates.status = editStatus;
			updates.is_completed = editStatus === "done";
			updates.completed_at =
				editStatus === "done" ? new Date().toISOString() : null;
		}

		if (editEstimated !== (task.estimated_minutes || null)) {
			updates.estimated_minutes = editEstimated;
		}

		const tagsChanged =
			JSON.stringify([...editTags].sort()) !==
			JSON.stringify([...(task.tags || [])].sort());
		if (tagsChanged) {
			updates.tags = editTags;
		}

		if (editStartDate !== (task.start_date || null)) {
			updates.start_date = editStartDate;
		}

		if (editStartTime !== (task.start_time || null)) {
			updates.start_time = editStartTime;
		}

		if (editDueTime !== (task.due_time || null)) {
			updates.due_time = editDueTime;
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
		editStatus,
		editEstimated,
		editTags,
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

	// Status cycle: click to advance through todo → in_progress → done
	const handleStatusCycle = useCallback(() => {
		const currentIndex = STATUS_CYCLE.indexOf(
			optimisticStatus as (typeof STATUS_CYCLE)[number],
		);
		const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
		const nextStatus = STATUS_CYCLE[nextIndex];
		setOptimisticStatus(nextStatus);
		setOptimisticCompleted(nextStatus === "done");
		onUpdate(task.id, {
			status: nextStatus,
			is_completed: nextStatus === "done",
			completed_at: nextStatus === "done" ? new Date().toISOString() : null,
		});
	}, [optimisticStatus, task.id, onUpdate]);

	// Long-press status: set blocked
	const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const handleStatusLongPress = useCallback(() => {
		longPressTimer.current = setTimeout(() => {
			const nextStatus: TaskStatus =
				optimisticStatus === "blocked" ? "todo" : "blocked";
			setOptimisticStatus(nextStatus);
			onUpdate(task.id, {
				status: nextStatus,
				is_completed: false,
				completed_at: null,
			});
		}, 600);
	}, [optimisticStatus, task.id, onUpdate]);

	const handleStatusMouseUp = useCallback(() => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}, []);

	// Two-step delete
	const handleDeleteClick = useCallback(() => {
		if (deleteTimerRef.current) {
			clearTimeout(deleteTimerRef.current);
			deleteTimerRef.current = null;
		}

		if (!deleteConfirm) {
			setDeleteConfirm(true);
			deleteTimerRef.current = setTimeout(
				() => setDeleteConfirm(false),
				deleteTimeoutMs,
			);
		} else {
			onDelete(task.id);
		}
	}, [deleteConfirm, task.id, onDelete, deleteTimeoutMs]);

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

	// Subtask handlers
	const handleAddSubtask = useCallback(async () => {
		const t = newSubtaskTitle.trim();
		if (!t) return;
		setSubtaskLoading(true);
		try {
			const newSub = await addSubtask({ parent_id: task.id, title: t });
			setSubtasks((prev) => [...prev, newSub]);
			setNewSubtaskTitle("");
			setIsAddingSubtask(false);
		} catch (err) {
			console.error("Failed to add subtask:", err);
		} finally {
			setSubtaskLoading(false);
		}
	}, [newSubtaskTitle, task.id]);

	const handleSubtaskToggle = useCallback(
		(subtaskId: string, currentStatus: boolean) => {
			const nextCompleted = !currentStatus;
			const nextStatus: TaskStatus = nextCompleted ? "done" : "todo";
			setSubtasks((prev) =>
				prev.map((s) =>
					s.id === subtaskId
						? { ...s, is_completed: nextCompleted, status: nextStatus }
						: s,
				),
			);
			onToggle(subtaskId, currentStatus);
		},
		[onToggle],
	);

	const handleSubtaskDelete = useCallback(
		(subtaskId: string) => {
			setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
			onDelete(subtaskId);
		},
		[onDelete],
	);

	// Edit-mode tag handlers
	const handleEditTagKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if ((e.key === "Enter" || e.key === ",") && editTagInput.trim()) {
				e.preventDefault();
				const newTag = editTagInput.trim().toLowerCase().replace(/\s+/g, "-");
				if (!editTags.includes(newTag)) {
					setEditTags((prev) => [...prev, newTag]);
				}
				setEditTagInput("");
			} else if (
				e.key === "Backspace" &&
				!editTagInput &&
				editTags.length > 0
			) {
				setEditTags((prev) => prev.slice(0, -1));
			}
		},
		[editTagInput, editTags],
	);

	// ── Derived values ────────────────────────────────────────────────────────

	const dueDateInfo = useMemo(() => {
		if (!task.due_date) return null;
		const today = startOfDay(new Date());
		const dueDate = startOfDay(parseISO(task.due_date));
		const diff = differenceInDays(dueDate, today);
		const formatted = format(parseISO(task.due_date), "dd MMM");
		return { diff, formatted };
	}, [task.due_date]);

	const timeLeft = useMemo(() => {
		if (!dueDateInfo || optimisticStatus === "done") return null;
		const { diff } = dueDateInfo;

		if (diff < 0)
			return {
				text: `${Math.abs(diff)}d overdue`,
				emoji: "🔥",
				color: "text-rose-700 bg-rose-50 border-rose-200",
			};
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
	}, [dueDateInfo, optimisticStatus]);

	const isOverdue =
		optimisticStatus !== "done" &&
		optimisticStatus !== "cancelled" &&
		!!dueDateInfo &&
		dueDateInfo.diff < 0;
	const isDueToday =
		optimisticStatus !== "done" && !!dueDateInfo && dueDateInfo.diff === 0;

	const statusConfig =
		TASK_STATUS_CONFIG[optimisticStatus] || TASK_STATUS_CONFIG.todo;

	// Subtask progress
	const subtaskDone = subtasks.filter(
		(s) => s.is_completed || s.status === "done",
	).length;
	const subtaskTotal = subtasks.length;
	const subtaskProgress =
		subtaskTotal > 0 ? Math.round((subtaskDone / subtaskTotal) * 100) : 0;

	// ─────────────────────────────────────────────────────────────────────────

	return (
		<div
			ref={provided?.innerRef}
			{...(provided ? provided.draggableProps : {})}
			className={`relative overflow-hidden rounded-[1.5rem] sm:rounded-2xl border-l-4 transition-all ${statusConfig.borderColor}`}
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
				drag={isEditing || !provided ? false : "x"}
				dragConstraints={{ left: 0, right: 0 }}
				dragElastic={0.4}
				onDragEnd={handleDragEnd}
				style={{ x }}
				className={`group flex items-start gap-3 sm:gap-4 p-4 bg-white border-2 transition-all duration-300 ${
					snapshot?.isDragging
						? "shadow-2xl border-emerald-500 ring-2 ring-emerald-500/10 z-50"
						: isEditing
							? "border-emerald-500 shadow-md ring-2 ring-emerald-500/5"
							: isOverdue
								? "border-rose-200 hover:border-rose-300 shadow-sm"
								: isDueToday
									? "border-orange-200 hover:border-orange-300 shadow-sm"
									: "border-slate-200 hover:border-slate-300 shadow-sm"
				} ${optimisticStatus === "done" ? "bg-slate-50/50 opacity-75" : ""} ${
					optimisticStatus === "cancelled" ? "opacity-50" : ""
				}`}
			>
				{/* Drag Handle */}
				{provided && (
					<div
						{...provided.dragHandleProps}
						className={`text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing py-1 ${isEditing ? "opacity-50 pointer-events-none" : ""}`}
						title={isEditing ? "Cannot drag while editing" : "Drag to reorder"}
					>
						<GripVertical className="w-4 h-4" />
					</div>
				)}

				{/* Status Cycle Button */}
				{!isEditing && (
					<button
						type="button"
						onClick={handleStatusCycle}
						onMouseDown={handleStatusLongPress}
						onMouseUp={handleStatusMouseUp}
						onTouchStart={handleStatusLongPress}
						onTouchEnd={handleStatusMouseUp}
						aria-label={`Status: ${statusConfig.label}. Click to advance, hold for blocked.`}
						title={`${statusConfig.label} — click to advance, hold to mark blocked`}
						className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center mt-1 sm:mt-0.5 transition-all duration-200 select-none ${
							optimisticStatus === "done"
								? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-200"
								: optimisticStatus === "in_progress"
									? "bg-blue-100 border-blue-400 text-blue-600"
									: optimisticStatus === "blocked"
										? "bg-amber-100 border-amber-400 text-amber-600"
										: optimisticStatus === "cancelled"
											? "bg-slate-100 border-slate-300 text-slate-400"
											: "bg-white border-slate-300 hover:border-emerald-500"
						}`}
					>
						<AnimatePresence mode="wait">
							{optimisticStatus === "done" && (
								<motion.div
									key="done"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
								>
									<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[4]" />
								</motion.div>
							)}
							{optimisticStatus === "in_progress" && (
								<motion.div
									key="ip"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									className="w-2 h-2 rounded-full bg-blue-500"
								/>
							)}
							{optimisticStatus === "blocked" && (
								<motion.div
									key="blocked"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									exit={{ scale: 0 }}
									className="w-2 h-2 rounded-sm bg-amber-500"
								/>
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
								<div className="flex items-center justify-between">
									<label
										htmlFor={`edit-desc-${task.id}`}
										className="text-[9px] font-black uppercase tracking-widest text-slate-400"
									>
										Description & Notes
									</label>
									<button
										type="button"
										onClick={() => {
											const textarea = document.getElementById(
												`edit-desc-${task.id}`,
											) as HTMLTextAreaElement;
											if (!textarea) return;
											const start = textarea.selectionStart;
											const end = textarea.selectionEnd;
											const text = textarea.value;
											const before = text.substring(0, start);
											const after = text.substring(end);
											const prefix =
												start === 0 || text[start - 1] === "\n" ? "" : "\n";
											const insertedText = `${prefix}- [ ] `;
											setEditDescription(before + insertedText + after);

											setTimeout(() => {
												textarea.focus();
												textarea.setSelectionRange(
													start + insertedText.length,
													start + insertedText.length,
												);
											}, 0);
										}}
										className="flex items-center gap-0.5 text-[8px] font-black uppercase tracking-wider text-violet-500 hover:text-violet-750 transition-colors px-1.5 py-0.5 bg-violet-50 hover:bg-violet-100 rounded-lg active:scale-95 cursor-pointer"
									>
										<ListTodo className="w-2 h-2" /> + Checklist
									</button>
								</div>
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

							{/* Status Selector */}
							<div className="space-y-1">
								<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
									Status
								</span>
								<div className="flex flex-wrap gap-1.5">
									{(
										Object.entries(TASK_STATUS_CONFIG) as [
											TaskStatus,
											(typeof TASK_STATUS_CONFIG)[TaskStatus],
										][]
									).map(([key, cfg]) => (
										<button
											key={key}
											type="button"
											onClick={() => setEditStatus(key)}
											className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
												editStatus === key
													? `${cfg.color} shadow-sm`
													: "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
											}`}
										>
											<span
												className={`w-2 h-2 rounded-full ${cfg.dotColor}`}
											/>
											{cfg.label}
										</button>
									))}
								</div>
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
											{TASK_CATEGORIES.map((c) => (
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
											{RECURRENCE_OPTIONS.map((opt) => (
												<option key={opt.value} value={opt.value}>
													{opt.label}
												</option>
											))}
										</select>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
											<ChevronDown className="w-3.5 h-3.5" />
										</div>
									</div>
								</div>
							</div>

							{/* Effort & Tags */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{/* Effort */}
								<div className="space-y-1">
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
										Effort Estimate
									</span>
									<div className="flex flex-wrap gap-1.5">
										{EFFORT_CHIPS.map((chip) => (
											<button
												key={chip.minutes}
												type="button"
												onClick={() =>
													setEditEstimated(
														editEstimated === chip.minutes
															? null
															: chip.minutes,
													)
												}
												className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all ${
													editEstimated === chip.minutes
														? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
														: "bg-slate-50 border-slate-100 text-slate-500 hover:border-cyan-300"
												}`}
											>
												{chip.label}
											</button>
										))}
										{editEstimated && (
											<span className="px-2.5 py-1 text-[9px] font-black text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg">
												⏱ {formatEstimatedTime(editEstimated)}
											</span>
										)}
									</div>
								</div>

								{/* Tags */}
								<div className="space-y-1">
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
										Tags
									</span>
									<div
										className="min-h-[32px] bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 flex flex-wrap gap-1 cursor-text focus-within:bg-white focus-within:border-slate-300 transition-all"
										onClick={() => editTagInputRef.current?.focus()}
									>
										{editTags.map((tag) => (
											<span
												key={tag}
												className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-slate-200 text-slate-700"
											>
												#{tag}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setEditTags((prev) =>
															prev.filter((t) => t !== tag),
														);
													}}
													className="text-slate-400 hover:text-slate-700"
												>
													<X className="w-2 h-2" />
												</button>
											</span>
										))}
										<input
											ref={editTagInputRef}
											type="text"
											value={editTagInput}
											onChange={(e) => setEditTagInput(e.target.value)}
											onKeyDown={handleEditTagKeyDown}
											placeholder={editTags.length === 0 ? "Add tags…" : ""}
											className="bg-transparent text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none min-w-[60px] flex-1"
										/>
									</div>
								</div>
							</div>

							{/* Schedule & Due Date */}
							<div className="space-y-3 border-t border-slate-100 pt-3">
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									<div>
										<label
											htmlFor={`edit-start-date-${task.id}`}
											className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1"
										>
											Start Date
										</label>
										<input
											id={`edit-start-date-${task.id}`}
											type="date"
											value={editStartDate || ""}
											onChange={(e) => setEditStartDate(e.target.value || null)}
											className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all animate-none"
										/>
									</div>
									<div>
										<label
											htmlFor={`edit-due-${task.id}`}
											className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1"
										>
											Due Date
										</label>
										<input
											id={`edit-due-${task.id}`}
											type="date"
											value={editDueDate}
											onChange={(e) => setEditDueDate(e.target.value)}
											className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all animate-none"
										/>
									</div>
									<div className="grid grid-cols-2 gap-2">
										<div>
											<label
												htmlFor={`edit-start-time-${task.id}`}
												className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1 text-center"
											>
												Start Time
											</label>
											<input
												id={`edit-start-time-${task.id}`}
												type="time"
												value={editStartTime || ""}
												onChange={(e) =>
													setEditStartTime(e.target.value || null)
												}
												className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all animate-none"
											/>
										</div>
										<div>
											<label
												htmlFor={`edit-due-time-${task.id}`}
												className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-1 text-center"
											>
												Due Time
											</label>
											<input
												id={`edit-due-time-${task.id}`}
												type="time"
												value={editDueTime || ""}
												onChange={(e) => setEditDueTime(e.target.value || null)}
												className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all animate-none"
											/>
										</div>
									</div>
								</div>

								{/* Quick Reschedule */}
								<div className="flex flex-wrap gap-1.5 items-center">
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1">
										Quick Reschedule:
									</span>
									{QUICK_RESCHEDULE_OPTIONS.map((opt) => {
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

							{/* Dependency Manager */}
							<div className="space-y-2 border-t border-slate-100 pt-3">
								<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
									Dependencies (Blockers)
								</span>

								{/* Current blockers list */}
								{blockersLoaded && blockers.length > 0 && (
									<div className="flex flex-wrap gap-1.5 mb-2">
										{blockers.map((b) => (
											<span
												key={b.id}
												className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-705 border border-amber-100"
											>
												Blocked by: {b.title}
												<button
													type="button"
													onClick={async () => {
														try {
															await removeTaskDependency(task.id, b.id);
															setBlockers((prev) =>
																prev.filter((item) => item.id !== b.id),
															);
															if (
																blockers.length === 1 &&
																editStatus === "blocked"
															) {
																setEditStatus("todo");
															}
														} catch (err) {
															console.error(err);
														}
													}}
													className="text-amber-400 hover:text-amber-700 transition-colors ml-1"
												>
													<X className="w-3 h-3 stroke-[3]" />
												</button>
											</span>
										))}
									</div>
								)}

								{/* Add dependency dropdown */}
								{potentialBlockersLoaded && potentialBlockers.length > 0 && (
									<div className="relative">
										<select
											value=""
											onChange={async (e) => {
												const selectId = e.target.value;
												if (!selectId) return;
												const chosen = potentialBlockers.find(
													(item) => item.id === selectId,
												);
												if (!chosen) return;
												try {
													await addTaskDependency(task.id, selectId);
													setBlockers((prev) => [...prev, chosen]);
													setEditStatus("blocked");
												} catch (err) {
													console.error(err);
												}
											}}
											className="w-full bg-slate-55 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
										>
											<option value="">+ Add blocker task...</option>
											{potentialBlockers
												.filter((pb) => !blockers.some((b) => b.id === pb.id))
												.map((pb) => (
													<option key={pb.id} value={pb.id}>
														{pb.title} ({pb.category || "General"})
													</option>
												))}
										</select>
										<div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
											<ChevronDown className="w-3.5 h-3.5" />
										</div>
									</div>
								)}
								{potentialBlockersLoaded && potentialBlockers.length === 0 && (
									<span className="text-[9px] text-slate-400 font-medium block">
										No other pending tasks available to set as blocker.
									</span>
								)}
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
									optimisticStatus === "done"
										? "line-through text-slate-400"
										: optimisticStatus === "cancelled"
											? "line-through text-slate-400"
											: ""
								}`}
								title="Double-click to edit"
							>
								{renderTextWithLinks(task.title)}
							</div>

							{/* Description / Notes preview (collapsible) */}
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
												<div className="mt-1.5 text-xs text-slate-500 leading-relaxed bg-violet-50/60 border border-violet-100 rounded-xl px-3 py-2 whitespace-pre-wrap break-words space-y-1">
													{(() => {
														if (!task.description) return null;
														const lines = task.description.split("\n");
														const hasChecklist = lines.some((line) =>
															/^(\s*[-*]\s+\[)([ xX]]\s+)/.test(line),
														);

														if (!hasChecklist) {
															return (
																<p>{renderTextWithLinks(task.description)}</p>
															);
														}

														return lines.map((line, lineIndex) => {
															const match = line.match(
																/^(\s*[-*]\s+\[)([ xX])\]\s+(.*)/,
															);
															if (!match) {
																return (
																	<div
																		key={lineIndex}
																		className="min-h-[1.5rem]"
																	>
																		{renderTextWithLinks(line)}
																	</div>
																);
															}

															const [, , statusChar, contentText] = match;
															const isChecked =
																statusChar.toLowerCase() === "x";

															const handleChecklistToggle = () => {
																const updatedLines = [...lines];
																const newStatus = isChecked ? " " : "x";
																updatedLines[lineIndex] = line.replace(
																	/\[([ xX])\]/,
																	`[${newStatus}]`,
																);
																onUpdate(task.id, {
																	description: updatedLines.join("\n"),
																});
															};

															return (
																<div
																	key={lineIndex}
																	className="flex items-start gap-2 py-0.5 group/checklist"
																>
																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleChecklistToggle();
																		}}
																		className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-all ${
																			isChecked
																				? "bg-violet-500 border-violet-500 text-white"
																				: "bg-white border-slate-300 hover:border-violet-500"
																		}`}
																	>
																		{isChecked && (
																			<Check className="w-3 h-3 stroke-[3]" />
																		)}
																	</button>
																	<span
																		className={`flex-1 ${
																			isChecked
																				? "line-through text-slate-400"
																				: "text-slate-650"
																		}`}
																	>
																		{renderTextWithLinks(contentText)}
																	</span>
																</div>
															);
														});
													})()}
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							)}

							{/* Subtasks Section */}
							<div className="mt-2">
								<button
									type="button"
									onClick={() => setIsSubtasksOpen((v) => !v)}
									className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
								>
									<ChevronRight
										className={`w-2.5 h-2.5 transition-transform ${isSubtasksOpen ? "rotate-90" : ""}`}
									/>
									Subtasks
									{subtaskTotal > 0 && (
										<span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[8px] font-bold">
											{subtaskDone}/{subtaskTotal}
										</span>
									)}
								</button>

								<AnimatePresence>
									{isSubtasksOpen && (
										<motion.div
											key="subtasks"
											initial={{ opacity: 0, height: 0 }}
											animate={{ opacity: 1, height: "auto" }}
											exit={{ opacity: 0, height: 0 }}
											transition={{ duration: 0.18, ease: "easeInOut" }}
											className="overflow-hidden"
										>
											<div className="mt-2 pl-2 border-l-2 border-slate-100 space-y-0.5">
												{/* Subtask progress bar */}
												{subtaskTotal > 0 && (
													<div className="mb-2">
														<div className="flex items-center justify-between mb-1">
															<span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
																Progress
															</span>
															<span className="text-[8px] font-black text-slate-500">
																{subtaskProgress}%
															</span>
														</div>
														<div className="h-1 bg-slate-100 rounded-full overflow-hidden">
															<motion.div
																initial={{ width: 0 }}
																animate={{
																	width: `${subtaskProgress}%`,
																}}
																transition={{ duration: 0.4, ease: "easeOut" }}
																className="h-full bg-emerald-500 rounded-full"
															/>
														</div>
													</div>
												)}

												{!subtasksLoaded && (
													<p className="text-[9px] text-slate-400 py-1">
														Loading…
													</p>
												)}

												{subtasksLoaded &&
													subtasks.length === 0 &&
													!isAddingSubtask && (
														<p className="text-[9px] text-slate-400 py-1">
															No subtasks yet
														</p>
													)}

												{subtasks.map((sub) => (
													<SubtaskItem
														key={sub.id}
														subtask={sub}
														onToggle={handleSubtaskToggle}
														onDelete={handleSubtaskDelete}
													/>
												))}

												{/* Add subtask input */}
												{isAddingSubtask ? (
													<div className="flex items-center gap-1.5 pt-1">
														<input
															ref={subtaskInputRef}
															autoFocus
															type="text"
															value={newSubtaskTitle}
															onChange={(e) =>
																setNewSubtaskTitle(e.target.value)
															}
															onKeyDown={(e) => {
																if (e.key === "Enter") handleAddSubtask();
																if (e.key === "Escape") {
																	setIsAddingSubtask(false);
																	setNewSubtaskTitle("");
																}
															}}
															placeholder="Subtask title…"
															className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-400"
														/>
														<button
															type="button"
															onClick={handleAddSubtask}
															disabled={
																subtaskLoading || !newSubtaskTitle.trim()
															}
															className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-40"
														>
															<Check className="w-3.5 h-3.5 stroke-[3]" />
														</button>
														<button
															type="button"
															onClick={() => {
																setIsAddingSubtask(false);
																setNewSubtaskTitle("");
															}}
															className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
														>
															<X className="w-3.5 h-3.5" />
														</button>
													</div>
												) : (
													<button
														type="button"
														onClick={() => {
															setIsAddingSubtask(true);
															setTimeout(
																() => subtaskInputRef.current?.focus(),
																50,
															);
														}}
														className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400 hover:text-emerald-600 transition-colors pt-1"
													>
														<Plus className="w-3 h-3" /> Add Subtask
													</button>
												)}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Metadata Badges */}
							<div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
								{/* Status Badge */}
								{optimisticStatus !== "todo" && (
									<span
										className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest border ${statusConfig.color}`}
									>
										{statusConfig.shortLabel}
									</span>
								)}

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

								{/* Effort estimate */}
								{task.estimated_minutes && (
									<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-cyan-50 text-cyan-700 border border-cyan-100">
										<Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{formatEstimatedTime(task.estimated_minutes)}
									</span>
								)}

								{/* Tags */}
								{task.tags && task.tags.length > 0 && (
									<>
										{task.tags.slice(0, 2).map((tag) => (
											<span
												key={tag}
												className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200"
											>
												<Hash className="w-2 h-2" />
												{tag}
											</span>
										))}
										{task.tags.length > 2 && (
											<span className="text-[8px] font-bold text-slate-400">
												+{task.tags.length - 2}
											</span>
										)}
									</>
								)}

								{/* Formatted due date */}
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

								{/* Future Start Date */}
								{task.start_date &&
									isAfter(
										parseISO(task.start_date),
										startOfDay(new Date()),
									) && (
										<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
											Starts {format(parseISO(task.start_date), "dd MMM")}
										</span>
									)}

								{/* Start Time / Due Time */}
								{(task.start_time || task.due_time) && (
									<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
										<Clock className="w-2 h-2" />
										{task.start_time && task.due_time
											? `${task.start_time.substring(0, 5)} - ${task.due_time.substring(0, 5)}`
											: task.start_time
												? `Start: ${task.start_time.substring(0, 5)}`
												: task.due_time
													? `Due: ${task.due_time.substring(0, 5)}`
													: ""}
									</span>
								)}

								{/* Recurrence badge */}
								{task.recurrence && task.recurrence !== "none" && (
									<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-violet-50 text-violet-600 border border-violet-100">
										<RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{RECURRENCE_LABELS[task.recurrence]}
									</span>
								)}

								{/* Reschedule count */}
								{task.reschedule_count > 0 && optimisticStatus !== "done" && (
									<div
										className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-[8px] sm:text-[9px] font-black"
										title={`Delayed ${task.reschedule_count} times`}
									>
										<RefreshCw className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
										{task.reschedule_count}
									</div>
								)}

								{/* Time left / overdue / due today */}
								{timeLeft && (
									<span
										className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-tight border ${timeLeft.color}`}
									>
										<span>{timeLeft.emoji}</span>
										{timeLeft.text}
									</span>
								)}

								{/* Blocked by badge */}
								{optimisticStatus === "blocked" &&
									blockersLoaded &&
									blockers.length > 0 && (
										<span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
											<AlertTriangle className="w-2 h-2" />
											Blocked by: {blockers.map((b) => b.title).join(", ")}
										</span>
									)}
							</div>

							{/* Mobile edit hint */}
							{optimisticStatus !== "done" &&
								optimisticStatus !== "cancelled" && (
									<p className="mt-1 text-[8px] text-slate-300 font-medium sm:hidden">
										Double-tap title to edit · Hold status to block
									</p>
								)}
						</>
					)}
				</div>

				{/* Desktop Only Actions */}
				{!isEditing && (
					<div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
						<button
							onClick={startEditing}
							className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
							aria-label={`Edit task: ${task.title}`}
							title="Quick Edit"
						>
							<Edit2 className="w-4 h-4" />
						</button>

						<button
							onClick={async () => {
								try {
									await archiveTask(task.id);
								} catch (err) {
									console.error(err);
								}
							}}
							className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
							aria-label={`Archive task: ${task.title}`}
							title="Archive Task"
						>
							<Archive className="w-4 h-4" />
						</button>

						{/* Two-step delete confirmation */}
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

// Wrap with React.memo to prevent unnecessary re-renders
export default memo(TaskItem);
