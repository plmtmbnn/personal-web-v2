"use client";

import { useState, useEffect, useTransition } from "react";
import {
	Archive,
	RotateCcw,
	Trash2,
	Search,
	X,
	Loader2,
	Inbox,
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import {
	getArchivedTasks,
	unarchiveTask,
	deleteTask,
} from "@/features/tasks/actions/tasks";
import { useToast } from "@/features/tasks/components/shared/Toast";
import { format, parseISO } from "date-fns";
import CustomModal from "@/features/shared/components/CustomModal";

interface ArchiveModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ArchiveModal({ isOpen, onClose }: ArchiveModalProps) {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<{
		id: string;
		title: string;
	} | null>(null);
	const [isPending, startTransition] = useTransition();
	const { showSuccess, showError } = useToast();

	const loadArchived = async () => {
		setIsLoading(true);
		try {
			const data = await getArchivedTasks();
			setTasks(data);
		} catch (err) {
			console.error("Failed to load archived tasks:", err);
			showError("Failed to load archived tasks.");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			loadArchived();
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const filteredTasks = tasks.filter((t) =>
		(t.title || "").toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleRestore = (taskId: string, title: string) => {
		startTransition(async () => {
			try {
				await unarchiveTask(taskId);
				setTasks((prev) => prev.filter((t) => t.id !== taskId));
				showSuccess(`Restored "${title}"`, "Task moved back to active agenda.");
			} catch (err) {
				console.error(err);
				showError("Failed to restore task.");
			}
		});
	};

	const handleDeleteForever = (taskId: string, title: string) => {
		setDeleteTarget({ id: taskId, title });
	};

	const confirmDeleteForever = () => {
		if (!deleteTarget) return;
		const { id: taskId } = deleteTarget;
		setDeleteTarget(null);

		startTransition(async () => {
			try {
				await deleteTask(taskId);
				setTasks((prev) => prev.filter((t) => t.id !== taskId));
				showSuccess("Task deleted permanently.");
			} catch (err) {
				console.error(err);
				showError("Failed to delete task.");
			}
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
				{/* Header */}
				<div className="p-6 border-b border-slate-100 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
							<Archive className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-lg font-black text-slate-900 tracking-tight">
								Archived Objectives
							</h3>
							<p className="text-xs text-slate-500 font-medium">
								Review, restore, or permanently remove archived tasks.
							</p>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
						aria-label="Close modal"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Search & Meta Bar */}
				<div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
					<div className="relative flex-1">
						<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search archived tasks..."
							className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
						/>
					</div>
					<span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-1 bg-white rounded-lg border border-slate-200/80">
						{tasks.length} total
					</span>
				</div>

				{/* Content List */}
				<div className="p-6 overflow-y-auto flex-1 space-y-3">
					{isLoading ? (
						<div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400">
							<Loader2 className="w-6 h-6 animate-spin text-slate-600" />
							<p className="text-xs font-bold uppercase tracking-wider">
								Loading archived tasks...
							</p>
						</div>
					) : filteredTasks.length === 0 ? (
						<div className="py-16 text-center border-2 border-dashed border-slate-100 rounded-2xl p-6">
							<Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-50" />
							<p className="text-xs font-black uppercase tracking-wider text-slate-600">
								No archived tasks found
							</p>
							<p className="text-[11px] text-slate-400 mt-0.5">
								{searchQuery
									? "Try a different search query."
									: "Your archive is currently clear."}
							</p>
						</div>
					) : (
						filteredTasks.map((task) => (
							<div
								key={task.id}
								className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
							>
								<div className="min-w-0 flex-1">
									<h4 className="text-sm font-extrabold text-slate-900 truncate">
										{task.title}
									</h4>
									<div className="flex flex-wrap items-center gap-2 mt-1">
										{task.category && (
											<span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
												{task.category}
											</span>
										)}
										<span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
											{task.priority}
										</span>
										{task.archived_at && (
											<span className="text-[9px] text-slate-400 font-medium">
												Archived{" "}
												{format(parseISO(task.archived_at), "dd MMM yyyy")}
											</span>
										)}
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onClick={() => handleRestore(task.id, task.title)}
										disabled={isPending}
										className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
										title="Restore to active agenda"
									>
										<RotateCcw className="w-3.5 h-3.5" /> Restore
									</button>
									<button
										type="button"
										onClick={() => handleDeleteForever(task.id, task.title)}
										disabled={isPending}
										className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer disabled:opacity-50"
										title="Delete forever"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			<CustomModal
				isOpen={!!deleteTarget}
				onClose={() => setDeleteTarget(null)}
				title="Delete Task Permanently"
				description={
					deleteTarget
						? `Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.`
						: "Are you sure you want to permanently delete this task?"
				}
				onConfirm={confirmDeleteForever}
				confirmText="Delete Forever"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
}
