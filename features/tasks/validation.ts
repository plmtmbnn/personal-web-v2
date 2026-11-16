import { z } from "zod";
import { isTaskDate } from "./dates";

const date = z.string().refine(isTaskDate, "Invalid task date");
const time = z
	.string()
	.regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
	.nullable();
export const taskIdSchema = z.string().uuid();
export const taskIdsSchema = z
	.array(taskIdSchema)
	.min(1)
	.max(1000)
	.refine((ids) => new Set(ids).size === ids.length, "Duplicate task IDs");
export const taskFieldsSchema = z
	.object({
		title: z.string().trim().min(1).max(1000),
		description: z.string().max(20000).nullable(),
		priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
		category: z.string().max(200).nullable(),
		due_date: date,
		start_date: date.nullable(),
		start_time: time,
		due_time: time,
		status: z.enum(["todo", "in_progress", "done", "blocked", "cancelled"]),
		recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
		estimated_minutes: z.number().int().min(0).max(525600).nullable(),
		tags: z.array(z.string().max(100)).max(50),
	})
	.partial()
	.strict();

export const taskCreateSchema = taskFieldsSchema.extend({
	title: z.string().trim().min(1).max(1000),
	due_date: date,
	priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
	parent_id: taskIdSchema.optional(),
});

export const rolloverSchema = z
	.object({
		ids: taskIdsSchema,
		previewDate: date,
		targetDate: date,
	})
	.strict();
