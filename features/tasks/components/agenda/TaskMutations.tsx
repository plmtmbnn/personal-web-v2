"use client";

import {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
	type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { Task } from "../../types";
import {
	archiveTask,
	deleteTask,
	updateTask,
	reorderTasks,
} from "../../actions/server-actions";
import { UNDO_TOAST_DURATION_MS } from "../../constants";
import { useToast } from "../shared/Toast";

interface MutationState {
	tasks: Task[];
	pending: boolean;
	update: (id: string, changes: Partial<Task>) => Promise<boolean>;
	reorder: typeof reorderTasks;
	isHidden: (id: string) => boolean;
	remove: (task: Task, kind: "archive" | "delete") => void;
}
const Context = createContext<MutationState | null>(null);

export function TaskMutations({
	tasks,
	children,
}: {
	tasks: Task[];
	children: ReactNode;
}) {
	const { showSuccess, showError } = useToast();
	const router = useRouter();
	const [hidden, setHidden] = useState<Set<string>>(new Set());
	const [patches, setPatches] = useState<Record<string, Partial<Task>>>({});
	const [moving, setMoving] = useState(false);
	const inFlight = useRef(new Set<string>());
	const topLevelIds = useRef(new Set(tasks.map((task) => task.id)));
	const timers = useRef(
		new Map<
			string,
			{ timer: ReturnType<typeof setTimeout>; commit: () => Promise<void> }
		>(),
	);
	const reveal = (id: string) =>
		setHidden((previous) => {
			const next = new Set(previous);
			next.delete(id);
			return next;
		});

	useEffect(() => {
		const pending = timers.current;
		return () => {
			for (const { timer, commit } of pending.values()) {
				clearTimeout(timer);
				void commit();
			}
			pending.clear();
		};
	}, []);
	useEffect(() => {
		for (const task of tasks) topLevelIds.current.add(task.id);
		setHidden((previous) => {
			const next = new Set(
				[...previous].filter(
					(id) =>
						!topLevelIds.current.has(id) ||
						timers.current.has(id) ||
						tasks.some((task) => task.id === id),
				),
			);
			return next.size === previous.size ? previous : next;
		});
	}, [tasks]);

	const reorder: typeof reorderTasks = async (...args) => {
		setMoving(true);
		try {
			await reorderTasks(...args);
		} finally {
			setMoving(false);
		}
	};

	const update = async (id: string, changes: Partial<Task>) => {
		if (inFlight.current.has(id)) return false;
		inFlight.current.add(id);
		setPatches((previous) => ({
			...previous,
			[id]: {
				...changes,
				...(changes.status
					? {
							completed_at:
								changes.status === "done" ? new Date().toISOString() : null,
						}
					: {}),
			},
		}));
		try {
			await updateTask(id, changes);
			return true;
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Could not save task.",
			);
			return false;
		} finally {
			inFlight.current.delete(id);
			setPatches((previous) => {
				const next = { ...previous };
				delete next[id];
				return next;
			});
		}
	};

	const remove = (task: Task, kind: "archive" | "delete") => {
		if (timers.current.has(task.id)) return;
		setHidden((previous) => new Set([...previous, task.id]));
		const commit = async () => {
			timers.current.delete(task.id);
			try {
				await (kind === "archive" ? archiveTask : deleteTask)(task.id);
				router.refresh();
			} catch (error) {
				reveal(task.id);
				showError(
					error instanceof Error ? error.message : "Could not remove task.",
				);
			}
		};
		const timer = setTimeout(() => void commit(), UNDO_TOAST_DURATION_MS);
		timers.current.set(task.id, { timer, commit });
		showSuccess(
			kind === "archive" ? "Task archived" : "Task deleted",
			task.title,
			{
				label: "Undo",
				onClick: () => {
					const entry = timers.current.get(task.id);
					if (!entry) return;
					clearTimeout(entry.timer);
					timers.current.delete(task.id);
					reveal(task.id);
				},
			},
		);
	};

	return (
		<Context.Provider
			value={{
				tasks: tasks
					.filter((task) => !hidden.has(task.id))
					.map((task) =>
						patches[task.id] ? { ...task, ...patches[task.id] } : task,
					),
				pending: moving || Object.keys(patches).length > 0,
				reorder,
				isHidden: (id) => hidden.has(id),
				update,
				remove,
			}}
		>
			{children}
		</Context.Provider>
	);
}

export function useTaskMutations() {
	const state = useContext(Context);
	if (!state) throw new Error("Task mutations require a provider");
	return state;
}
