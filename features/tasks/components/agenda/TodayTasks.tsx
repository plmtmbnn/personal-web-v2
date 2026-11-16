"use client";

import { useState } from "react";
import type { Task } from "../../types";
import { todayGroups } from "../../today";
import { useTaskMutations } from "./TaskMutations";
import TaskItem from "./TaskItem";
import TaskBoard from "./TaskBoard";
import RolloverTasks from "./RolloverTasks";
import CustomModal from "@/features/shared/components/CustomModal";

export default function TodayTasks({
	tasks,
	day,
	board,
}: {
	tasks: Task[];
	day: string;
	board: boolean;
}) {
	const groups = todayGroups(tasks, day);
	const visible = Object.values(groups).flat();
	const { update, remove, pending } = useTaskMutations();
	const [deleting, setDeleting] = useState<Task | null>(null);
	const [rescheduling, setRescheduling] = useState<string | null>(null);
	return (
		<div className="space-y-6" aria-busy={pending}>
			{visible.some((task) => task.due_date < day) && (
				<RolloverTasks tasks={visible.filter((task) => task.due_date < day)} />
			)}
			{board ? (
				<TaskBoard
					todayTasks={visible}
					upcomingTasks={[]}
					completedTasks={[]}
				/>
			) : (
				Object.entries(groups).map(([label, group]) => (
					<section key={label} aria-label={label} className="space-y-3">
						<h3 className="text-base font-semibold text-slate-900">
							{label} <span className="text-slate-500">({group.length})</span>
						</h3>
						{group.length === 0 && (
							<p className="text-sm text-slate-500">No tasks.</p>
						)}
						{group.map((task, index) => (
							<div key={task.id} className="space-y-2">
								<TaskItem
									index={index}
									task={task}
									onUpdate={update}
									onDelete={() => setDeleting(task)}
									onArchive={() => remove(task, "archive")}
								/>
								<div className="flex flex-wrap items-center gap-2">
									{task.status === "todo" && (
										<button
											type="button"
											disabled={pending}
											onClick={() =>
												void update(task.id, { status: "in_progress" })
											}
											className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
										>
											Start
										</button>
									)}
									{task.status !== "blocked" && (
										<button
											type="button"
											disabled={pending}
											onClick={() => void update(task.id, { status: "done" })}
											className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
										>
											Complete
										</button>
									)}
									<button
										type="button"
										disabled={pending}
										aria-expanded={rescheduling === task.id}
										aria-controls={`reschedule-${task.id}`}
										onClick={() =>
											setRescheduling(rescheduling === task.id ? null : task.id)
										}
										className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
									>
										Reschedule
									</button>
								</div>
								{rescheduling === task.id && (
									<form
										id={`reschedule-${task.id}`}
										className="flex flex-wrap items-end gap-2"
										onSubmit={async (event) => {
											event.preventDefault();
											const date = String(
												new FormData(event.currentTarget).get("due_date"),
											);
											if (await update(task.id, { due_date: date }))
												setRescheduling(null);
										}}
									>
										<label className="text-sm text-slate-700">
											Due date (Jakarta)
											<input
												required
												name="due_date"
												type="date"
												defaultValue={task.due_date}
												min={task.start_date || undefined}
												className="mt-1 block min-h-11 max-w-full rounded-xl border border-slate-200 px-3 focus-visible:outline-2"
											/>
										</label>
										<button
											type="submit"
											disabled={pending}
											className="min-h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
										>
											Save date
										</button>
									</form>
								)}
							</div>
						))}
					</section>
				))
			)}
			<CustomModal
				isOpen={!!deleting}
				onClose={() => setDeleting(null)}
				onConfirm={() => {
					if (deleting) remove(deleting, "delete");
					setDeleting(null);
				}}
				title="Delete task"
				description="Delete this task and its subtasks? You have five seconds to undo."
				confirmText="Delete"
				cancelText="Cancel"
				variant="danger"
			/>
		</div>
	);
}
