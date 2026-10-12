import type { MovementRoutineConfig, ScheduledMovementSlot } from "../types";

export const DEFAULT_SCHEDULED_SLOTS: ScheduledMovementSlot[] = [
	{
		id: "slot-1",
		slotNumber: 1,
		scheduledTime: "09:00",
		movementId: "slow-squat",
		enabled: true,
	},
	{
		id: "slot-2",
		slotNumber: 2,
		scheduledTime: "10:30",
		movementId: "calf-raise",
		enabled: true,
	},
	{
		id: "slot-3",
		slotNumber: 3,
		scheduledTime: "12:00",
		movementId: "slow-squat",
		enabled: true,
	},
	{
		id: "slot-4",
		slotNumber: 4,
		scheduledTime: "14:00",
		movementId: "desk-pushup",
		enabled: true,
	},
	{
		id: "slot-5",
		slotNumber: 5,
		scheduledTime: "15:30",
		movementId: "slow-squat",
		enabled: true,
	},
	{
		id: "slot-6",
		slotNumber: 6,
		scheduledTime: "17:00",
		movementId: "glute-bridge",
		enabled: true,
	},
];

export const DEFAULT_ROUTINE_CONFIG: MovementRoutineConfig = {
	dailyTarget: 6,
	slots: DEFAULT_SCHEDULED_SLOTS,
	soundEnabled: true,
	notificationsEnabled: false,
};
