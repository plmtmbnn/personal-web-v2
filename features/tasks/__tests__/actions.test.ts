import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
	admin: vi.fn(),
	rpc: vi.fn(),
	client: vi.fn(),
	from: vi.fn(),
	revalidate: vi.fn(),
	invalidate: vi.fn(),
}));
vi.mock("@/features/auth/actions", () => ({ checkAdmin: mocks.admin }));
vi.mock("@/lib/core/supabase-server", () => ({
	createAdminClient: mocks.client,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/core/redis", () => ({ invalidateStatsCache: mocks.invalidate }));
import {
	getTasks,
	reorderTasks,
	updateTask,
	rescheduleOverdueTasks,
} from "../actions/tasks";

const id = "00000000-0000-4000-8000-000000000001";
beforeEach(() => {
	vi.clearAllMocks();
	mocks.admin.mockResolvedValue(true);
	mocks.client.mockResolvedValue({ rpc: mocks.rpc, from: mocks.from });
	mocks.rpc.mockResolvedValue({ error: null });
});

describe("Task server boundary", () => {
	it("rejects writes before obtaining a privileged client", async () => {
		mocks.admin.mockResolvedValue(false);
		await expect(updateTask(id, { status: "done" })).rejects.toThrow(
			"Unauthorized",
		);
		expect(mocks.client).not.toHaveBeenCalled();
	});
	it("sends a move and destination positions in one RPC", async () => {
		const second = "00000000-0000-4000-8000-000000000002";
		await reorderTasks([second, id], {
			id,
			updates: { status: "in_progress" },
		});
		expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("task_apply", {
			p_updates: [
				{ id: second, position: 0 },
				{ id, position: 1, status: "in_progress" },
			],
		});
		expect(mocks.invalidate).toHaveBeenCalledOnce();
	});
	it("does not invalidate caches on transaction failure", async () => {
		mocks.rpc.mockResolvedValueOnce({
			error: { message: "Transaction rolled back" },
		});
		await expect(updateTask(id, { status: "done" })).rejects.toThrow(
			"Transaction rolled back",
		);
		expect(mocks.revalidate).not.toHaveBeenCalled();
		expect(mocks.invalidate).not.toHaveBeenCalled();
	});
	it("sends only the rollover IDs and dates shown in the preview", async () => {
		await rescheduleOverdueTasks({
			ids: [id],
			previewDate: "2026-11-16",
			targetDate: "2026-11-17",
		});
		expect(mocks.rpc).toHaveBeenCalledWith("task_rollover", {
			p_ids: [id],
			p_preview_date: "2026-11-16",
			p_target_date: "2026-11-17",
		});
	});
	it("rejects date injection before building a query", async () => {
		await expect(
			getTasks({ startDate: "2026-11-16),status.eq.done" }),
		).rejects.toThrow("Invalid task date");
		expect(mocks.from).not.toHaveBeenCalled();
	});
	it("uses an exclusive Jakarta completion boundary and reports failed reads", async () => {
		const query = {
			select: vi.fn(),
			or: vi.fn(),
			is: vi.fn(),
			order: vi.fn(),
			range: vi.fn(),
		};
		for (const key of ["select", "or", "is", "order"] as const)
			query[key].mockReturnValue(query);
		query.range.mockResolvedValue({
			data: null,
			error: { message: "Unavailable" },
		});
		mocks.from.mockReturnValue(query);
		await expect(
			getTasks({
				startDate: "2026-11-16",
				endDate: "2026-11-22",
				includeCompleted: true,
			}),
		).rejects.toThrow("Could not load tasks");
		expect(query.or).toHaveBeenCalledWith(
			expect.stringContaining(
				"completed_at.gte.2026-11-15T17:00:00.000Z,completed_at.lt.2026-11-22T17:00:00.000Z",
			),
		);
	});
});
