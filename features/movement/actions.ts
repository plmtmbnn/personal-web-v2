"use server";

import { redis, CACHE_KEYS } from "@/lib/core/redis";
import { checkAdmin } from "@/features/auth/actions";
import { revalidatePath } from "next/cache";
import type { MovementAppState } from "./types";
import {
	getDefaultMovementState,
	mergeMovementStates,
	pruneExpiredLogs,
	calculateUndoneCount,
} from "./lib/storage";

const MOVEMENT_REDIS_KEY = CACHE_KEYS.MOVEMENT_STATE || "admin:movement:state";

/**
 * Retrieves the current movement state from Redis, falling back to default state.
 * Automatically performs logic delete on records older than 3 calendar months.
 */
export async function getMovementStateAction(): Promise<MovementAppState> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return getDefaultMovementState();
	}

	try {
		const raw = await redis.get<MovementAppState | string>(MOVEMENT_REDIS_KEY);
		if (!raw) {
			return getDefaultMovementState();
		}

		const parsed: MovementAppState =
			typeof raw === "string" ? JSON.parse(raw) : raw;

		const defaultState = getDefaultMovementState();

		const rawState: MovementAppState = {
			config: {
				...defaultState.config,
				...(parsed.config || {}),
				slots: parsed.config?.slots || defaultState.config.slots,
			},
			logs: parsed.logs && typeof parsed.logs === "object" ? parsed.logs : {},
			customMovements: Array.isArray(parsed.customMovements)
				? parsed.customMovements
				: [],
		};

		// Enforce 3-month retention logic delete
		const { state: prunedState, prunedCount } = pruneExpiredLogs(rawState);
		if (prunedCount > 0) {
			redis
				.set(MOVEMENT_REDIS_KEY, JSON.stringify(prunedState))
				.catch((err) => {
					console.error("Failed to prune expired logs in Redis:", err);
				});
		}

		return prunedState;
	} catch (error) {
		console.error("Redis Get Movement State Error:", error);
		return getDefaultMovementState();
	}
}

/**
 * Persists the entire movement state to Redis after pruning records older than 3 months.
 */
export async function saveMovementStateAction(
	state: MovementAppState,
): Promise<{ success: boolean }> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	try {
		// Enforce 3-month retention logic delete prior to saving in Redis
		const { state: prunedState } = pruneExpiredLogs(state);
		await redis.set(MOVEMENT_REDIS_KEY, JSON.stringify(prunedState));
		revalidatePath("/admin/movement");
		return { success: true };
	} catch (error) {
		console.error("Redis Save Movement State Error:", error);
		throw new Error("Failed to save movement state to Redis");
	}
}

/**
 * Merges client-side localStorage movement data into Redis and returns the resolved state.
 * Prunes records older than 3 calendar months.
 */
export async function syncLocalMovementStateAction(
	localState: MovementAppState,
): Promise<MovementAppState> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	try {
		const serverState = await getMovementStateAction();
		const merged = mergeMovementStates(serverState, localState);
		const { state: prunedMerged } = pruneExpiredLogs(merged);
		await redis.set(MOVEMENT_REDIS_KEY, JSON.stringify(prunedMerged));
		revalidatePath("/admin/movement");
		return prunedMerged;
	} catch (error) {
		console.error("Redis Sync Movement State Error:", error);
		return localState;
	}
}

/**
 * Retrieves the count of undone movement snacks for today.
 * Evaluates targetToday minus completedToday.
 */
export async function getUndoneMovementSnacksCount(): Promise<number> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return 0;
	}

	try {
		const state = await getMovementStateAction();
		return calculateUndoneCount(state);
	} catch (error) {
		console.error("Error in getUndoneMovementSnacksCount:", error);
		return 0;
	}
}
