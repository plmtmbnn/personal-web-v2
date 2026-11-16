import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import {
	TaskMutations,
	useTaskMutations,
} from "../components/agenda/TaskMutations";
import type { Task } from "../types";

const mocks = vi.hoisted(() => ({
	update: vi.fn(),
	archive: vi.fn(),
	remove: vi.fn(),
	success: vi.fn(),
	error: vi.fn(),
	refresh: vi.fn(),
}));
vi.mock("../actions/server-actions", () => ({
	updateTask: mocks.update,
	archiveTask: mocks.archive,
	deleteTask: mocks.remove,
}));
vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: mocks.refresh }),
}));
vi.mock("../components/shared/Toast", () => ({
	useToast: () => ({ showSuccess: mocks.success, showError: mocks.error }),
}));
const task = { id: "a", title: "Write report", status: "todo" } as Task;
function View() {
	const { tasks, remove, update } = useTaskMutations();
	return (
		<>
			{tasks.map((t) => (
				<span key={t.id}>
					{t.title}: {t.status}
				</span>
			))}
			<button onClick={() => remove(task, "archive")}>Archive</button>
			<button onClick={() => void update(task.id, { status: "done" })}>
				Complete
			</button>
		</>
	);
}
function Harness() {
	const [board, setBoard] = useState(false);
	return (
		<TaskMutations tasks={[task]}>
			<button onClick={() => setBoard(!board)}>Switch</button>
			<View key={String(board)} />
		</TaskMutations>
	);
}
afterEach(() => {
	vi.useRealTimers();
	vi.clearAllMocks();
});
describe("Shared task mutations", () => {
	it("keeps Undo pending across view switches and cancels the write", async () => {
		vi.useFakeTimers();
		render(<Harness />);
		fireEvent.click(screen.getByText("Archive"));
		fireEvent.click(screen.getByText("Switch"));
		expect(screen.queryByText("Write report: todo")).toBeNull();
		expect(mocks.archive).not.toHaveBeenCalled();
		act(() => mocks.success.mock.calls[0][2].onClick());
		await act(() => vi.advanceTimersByTimeAsync(6000));
		expect(mocks.archive).not.toHaveBeenCalled();
		expect(screen.getByText("Write report: todo")).toBeTruthy();
	});
	it("restores a row when delayed archive fails", async () => {
		vi.useFakeTimers();
		mocks.archive.mockRejectedValueOnce(new Error("Archive failed"));
		render(<Harness />);
		fireEvent.click(screen.getByText("Archive"));
		await act(() => vi.advanceTimersByTimeAsync(5000));
		expect(screen.getByText("Write report: todo")).toBeTruthy();
		expect(mocks.error).toHaveBeenCalledWith("Archive failed");
	});
	it("rolls back an optimistic completion on failure", async () => {
		mocks.update.mockRejectedValueOnce(new Error("Save failed"));
		render(<Harness />);
		await act(async () => fireEvent.click(screen.getByText("Complete")));
		expect(screen.getByText("Write report: todo")).toBeTruthy();
		expect(mocks.error).toHaveBeenCalledWith("Save failed");
	});
});
