import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { Task } from "../types";

const mocks = vi.hoisted(() => ({ reorder: vi.fn(), error: vi.fn() }));
vi.mock("next/navigation", () => ({
	useSearchParams: () => new URLSearchParams(),
}));
vi.mock("../components/agenda/useTaskDay", () => ({
	useTaskDay: () => "2026-11-16",
}));
vi.mock("../components/agenda/TaskMutations", () => ({
	useTaskMutations: () => ({
		reorder: mocks.reorder,
		update: vi.fn(),
		remove: vi.fn(),
		pending: false,
	}),
}));
vi.mock("../components/shared/Toast", () => ({
	useToast: () => ({ showError: mocks.error }),
}));
vi.mock("../components/agenda/TaskItem", () => ({
	default: ({ task }: { task: Task }) => (
		<span data-testid="task">{task.title}</span>
	),
}));
vi.mock("@/features/shared/components/CustomModal", () => ({
	default: () => null,
}));
vi.mock("@hello-pangea/dnd", () => ({
	DragDropContext: ({
		children,
		onDragEnd,
	}: {
		children: ReactNode;
		onDragEnd: (result: unknown) => void;
	}) => (
		<>
			<button
				onClick={() =>
					onDragEnd({
						draggableId: "a",
						source: { droppableId: "todo", index: 0 },
						destination: { droppableId: "in_progress", index: 1 },
					})
				}
			>
				Drop
			</button>
			{children}
		</>
	),
	Droppable: ({
		children,
	}: {
		children: (provided: unknown, snapshot: unknown) => ReactNode;
	}) =>
		children(
			{ innerRef: vi.fn(), droppableProps: {}, placeholder: null },
			{ isDraggingOver: false },
		),
	Draggable: ({
		children,
	}: {
		children: (provided: unknown, snapshot: unknown) => ReactNode;
	}) =>
		children(
			{ innerRef: vi.fn(), draggableProps: {}, dragHandleProps: {} },
			{ isDragging: false },
		),
}));
import TaskBoard from "../components/agenda/TaskBoard";

const tasks = [
	{ id: "a", title: "A", status: "todo", position: 0 },
	{ id: "b", title: "B", status: "in_progress", position: 0 },
	{ id: "c", title: "C", status: "in_progress", position: 1 },
] as Task[];
beforeEach(() => vi.clearAllMocks());
it("persists the drop position with status and renders that order after refresh", async () => {
	mocks.reorder.mockResolvedValue(undefined);
	const view = render(
		<TaskBoard todayTasks={tasks} upcomingTasks={[]} completedTasks={[]} />,
	);
	fireEvent.click(screen.getByText("Drop"));
	await waitFor(() =>
		expect(mocks.reorder).toHaveBeenCalledWith(["b", "a", "c"], {
			id: "a",
			updates: { status: "in_progress" },
		}),
	);
	view.rerender(
		<TaskBoard
			todayTasks={[
				{ ...tasks[0], status: "in_progress", position: 1 },
				tasks[1],
				{ ...tasks[2], position: 2 },
			]}
			upcomingTasks={[]}
			completedTasks={[]}
		/>,
	);
	expect(screen.getAllByTestId("task").map((node) => node.textContent)).toEqual(
		["B", "A", "C"],
	);
});

it("reports a failed drag and restores the previous columns", async () => {
	mocks.reorder.mockRejectedValueOnce(new Error("Offline"));
	const log = vi.spyOn(console, "error").mockImplementation(() => {});
	render(
		<TaskBoard todayTasks={tasks} upcomingTasks={[]} completedTasks={[]} />,
	);
	fireEvent.click(screen.getByText("Drop"));
	await waitFor(() => expect(mocks.error).toHaveBeenCalled());
	expect(screen.getAllByTestId("task").map((node) => node.textContent)).toEqual(
		["A", "B", "C"],
	);
	log.mockRestore();
});
