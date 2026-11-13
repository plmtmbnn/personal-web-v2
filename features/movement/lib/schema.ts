import { z } from "zod";

const id = z.string().min(1).max(128);
const count = z.number().int().nonnegative();

export const movementStateSchema = z.object({
	config: z.object({
		dailyTarget: count.max(100),
		slots: z
			.array(
				z.object({
					id,
					slotNumber: count,
					scheduledTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
					movementId: id,
					enabled: z.boolean(),
				}),
			)
			.max(100),
		soundEnabled: z.boolean(),
		notificationsEnabled: z.boolean(),
	}),
	logs: z.record(
		z.iso.date(),
		z
			.array(
				z.object({
					id,
					slotId: id.optional(),
					movementId: id,
					completedAt: z.iso.datetime({ offset: true }),
					status: z.enum(["completed", "skipped"]),
					reps: count.optional(),
					durationSeconds: count.optional(),
					isBonus: z.boolean().optional(),
					note: z.string().max(2000).optional(),
				}),
			)
			.max(500),
	),
	customMovements: z
		.array(
			z.object({
				id,
				name: z.string().min(1).max(160),
				category: z.enum([
					"lower-body",
					"upper-body",
					"mobility",
					"walking",
					"core",
				]),
				instructions: z.string().max(5000),
				targetReps: count.optional(),
				targetSeconds: count.optional(),
				tempo: z.string().max(120).optional(),
				referenceUrl: z.union([
					z.literal(""),
					z.url({ protocol: /^https?$/ }).max(2048),
				]),
				primaryMuscles: z.string().max(500),
				estimatedDuration: z.string().max(120),
			}),
		)
		.max(500),
});
