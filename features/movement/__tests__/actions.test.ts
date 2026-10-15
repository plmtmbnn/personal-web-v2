import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	getMovementStateAction,
	saveMovementStateAction,
	syncLocalMovementStateAction,
	getUndoneMovementSnacksCount,
} from "../actions";
import { redis } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";
import { getDefaultMovementState } from "../lib/storage";

vi.mock("@/lib/core/redis", () => ({
	redis: {
		get: vi.fn(),
		set: vi.fn(),
	},
	CACHE_KEYS: {
		MOVEMENT_STATE: "admin:movement:state",
	},
}));

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

describe("Movement Server Actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getMovementStateAction()", () => {
		it("returns default state if user is not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const state = await getMovementStateAction();
			expect(state).toEqual(getDefaultMovementState());
			expect(redis.get).not.toHaveBeenCalled();
		});

		it("returns default state when redis has no data", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.get).mockResolvedValue(null);

			const state = await getMovementStateAction();
			expect(state).toEqual(getDefaultMovementState());
			expect(redis.get).toHaveBeenCalledWith("admin:movement:state");
		});

		it("returns parsed state when redis has valid data", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const mockState = {
				...getDefaultMovementState(),
				logs: {
					"2026-10-12": [
						{
							id: "s-1",
							movementId: "desk-pushup",
							completedAt: "2026-10-12T10:00:00Z",
							status: "completed" as const,
						},
					],
				},
			};
			vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockState));

			const state = await getMovementStateAction();
			expect(state.logs["2026-10-12"]).toHaveLength(1);
			expect(state.logs["2026-10-12"][0].movementId).toBe("desk-pushup");
		});
	});

	describe("saveMovementStateAction()", () => {
		it("throws unauthorized if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const state = getDefaultMovementState();
			await expect(saveMovementStateAction(state)).rejects.toThrow(
				"Unauthorized",
			);
			expect(redis.set).not.toHaveBeenCalled();
		});

		it("saves state to redis and revalidates path", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.set).mockResolvedValue("OK" as any);

			const state = getDefaultMovementState();
			const result = await saveMovementStateAction(state);

			expect(result).toEqual({ success: true });
			expect(redis.set).toHaveBeenCalledWith(
				"admin:movement:state",
				JSON.stringify(state),
			);
			expect(revalidatePath).toHaveBeenCalledWith("/admin/movement");
		});

		it("prunes records older than 3 months before saving to redis", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.set).mockResolvedValue("OK" as any);

			const state = getDefaultMovementState();
			// Add a very old date (e.g. 2020)
			state.logs["2020-01-01"] = [
				{
					id: "ancient",
					movementId: "desk-pushup",
					completedAt: "2020-01-01T10:00:00Z",
					status: "completed" as const,
				},
			];

			await saveMovementStateAction(state);

			const savedPayload = JSON.parse(
				vi.mocked(redis.set).mock.calls[0][1] as string,
			);
			expect(savedPayload.logs["2020-01-01"]).toBeUndefined();
		});
	});

	describe("syncLocalMovementStateAction()", () => {
		it("throws unauthorized if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const localState = getDefaultMovementState();
			await expect(syncLocalMovementStateAction(localState)).rejects.toThrow(
				"Unauthorized",
			);
		});

		it("merges local data into server data and saves to redis", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.get).mockResolvedValue(null);
			vi.mocked(redis.set).mockResolvedValue("OK" as any);

			const localState = getDefaultMovementState();
			localState.logs["2026-10-12"] = [
				{
					id: "local-1",
					movementId: "slow-squat",
					completedAt: "2026-10-12T10:00:00Z",
					status: "completed" as const,
				},
			];

			const merged = await syncLocalMovementStateAction(localState);
			expect(merged.logs["2026-10-12"]).toHaveLength(1);
			expect(redis.set).toHaveBeenCalledWith(
				"admin:movement:state",
				JSON.stringify(merged),
			);
			expect(revalidatePath).toHaveBeenCalledWith("/admin/movement");
		});
	});

	describe("getUndoneMovementSnacksCount()", () => {
		it("returns 0 if not admin", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(false);
			const count = await getUndoneMovementSnacksCount();
			expect(count).toBe(0);
		});

		it("returns full daily target when no sessions are completed today", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			vi.mocked(redis.get).mockResolvedValue(null);

			const count = await getUndoneMovementSnacksCount();
			expect(count).toBe(6); // default daily target is 6
		});

		it("returns correct undone count when some sessions are completed today", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const todayStr = new Date().toISOString().split("T")[0];
			const mockState = {
				...getDefaultMovementState(),
				config: {
					...getDefaultMovementState().config,
					dailyTarget: 6,
				},
				logs: {
					[todayStr]: [
						{
							id: "s-1",
							movementId: "desk-pushup",
							status: "completed" as const,
						},
						{
							id: "s-2",
							movementId: "slow-squat",
							status: "completed" as const,
						},
					],
				},
			};
			vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockState));

			const count = await getUndoneMovementSnacksCount();
			expect(count).toBe(4); // 6 target - 2 completed = 4 remaining
		});

		it("returns 0 when target is reached or exceeded", async () => {
			vi.mocked(checkAdmin).mockResolvedValue(true);
			const todayStr = new Date().toISOString().split("T")[0];
			const mockState = {
				...getDefaultMovementState(),
				config: {
					...getDefaultMovementState().config,
					dailyTarget: 2,
				},
				logs: {
					[todayStr]: [
						{
							id: "s-1",
							movementId: "desk-pushup",
							status: "completed" as const,
						},
						{
							id: "s-2",
							movementId: "slow-squat",
							status: "completed" as const,
						},
						{ id: "s-3", movementId: "wall-sit", status: "completed" as const },
					],
				},
			};
			vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockState));

			const count = await getUndoneMovementSnacksCount();
			expect(count).toBe(0);
		});
	});
});
