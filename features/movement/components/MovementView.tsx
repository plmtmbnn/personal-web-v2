"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type {
	Movement,
	MovementAppState,
	MovementRoutineConfig,
	ScheduledMovementSlot,
} from "../types";
import { INITIAL_MOVEMENT_LIBRARY } from "../data/default-library";
import {
	loadMovementState,
	saveMovementState,
	recordMovementSession,
	undoMovementSession,
	toggleSlotSkip,
	calculateSummaryStats,
	getLocalDateKey,
	exportMovementDataAsJson,
	importMovementDataFromJson,
	clearMovementHistory,
} from "../lib/storage";
import { playChimeSound } from "../lib/sound";
import { sendMovementNotification } from "../lib/notifications";

import MovementHeader from "./MovementHeader";
import DailyProgressCard from "./DailyProgressCard";
import TodayScheduleTimeline from "./TodayScheduleTimeline";
import MovementLibraryView from "./MovementLibraryView";
import WeeklyHistoryView from "./WeeklyHistoryView";
import SessionTimerModal from "./SessionTimerModal";
import QuickCompleteModal from "./QuickCompleteModal";
import RoutineSettingsModal from "./RoutineSettingsModal";
import MovementSkeleton from "./MovementSkeleton";

export default function MovementView() {
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [state, setState] = useState<MovementAppState | null>(null);
	const [activeTab, setActiveTab] = useState<"today" | "library" | "history">(
		"today",
	);

	// Modals State
	const [timerModalData, setTimerModalData] = useState<{
		isOpen: boolean;
		slot?: ScheduledMovementSlot;
		movement: Movement;
	} | null>(null);
	const [isQuickLogOpen, setIsQuickLogOpen] = useState<boolean>(false);
	const [quickLogInitialMovementId, setQuickLogInitialMovementId] = useState<
		string | undefined
	>(undefined);
	const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

	// Load persistent client-side state after mounting
	useEffect(() => {
		const initial = loadMovementState();
		setState(initial);
		setIsMounted(true);
	}, []);

	const todayKey = useMemo(() => getLocalDateKey(), []);

	const todaySessions = useMemo(() => {
		if (!state) return [];
		return state.logs[todayKey] || [];
	}, [state, todayKey]);

	const allMovements = useMemo(() => {
		if (!state) return INITIAL_MOVEMENT_LIBRARY;
		return [...INITIAL_MOVEMENT_LIBRARY, ...state.customMovements];
	}, [state]);

	const stats = useMemo(() => {
		if (!state) {
			return {
				totalCompletedToday: 0,
				targetToday: 6,
				percentToday: 0,
				totalAllTimeCompleted: 0,
				currentStreakDays: 0,
				totalWalkingMinutesThisWeek: 0,
				weeklyDaysMetTarget: 0,
				weeklyTotalSessions: 0,
				weeklyAveragePerDay: 0,
			};
		}
		return calculateSummaryStats(state, todayKey, allMovements);
	}, [state, todayKey, allMovements]);

	// In-Page & Browser Reminder Polling (runs every minute if notifications enabled)
	useEffect(() => {
		if (!state?.config.notificationsEnabled) return;

		const interval = setInterval(() => {
			const now = new Date();
			const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
				now.getMinutes(),
			).padStart(2, "0")}`;

			const matchingSlot = state.config.slots.find(
				(s) => s.enabled && s.scheduledTime === currentTime,
			);
			if (matchingSlot) {
				const isAlreadyDone = todaySessions.some(
					(s) => s.slotId === matchingSlot.id && s.status === "completed",
				);
				if (!isAlreadyDone) {
					const m = allMovements.find((x) => x.id === matchingSlot.movementId);
					sendMovementNotification(
						`Time for a Movement Snack: ${m?.name || "Break"}`,
						{
							body: `Take a 1–2 minute desk break. Move naturally and reset your focus.`,
						},
					);
				}
			}
		}, 60000);

		return () => clearInterval(interval);
	}, [state, todaySessions, allMovements]);

	// 1-Click Fast Complete Slot
	const handleQuickCompleteSlot = useCallback(
		(slot: ScheduledMovementSlot, movement: Movement) => {
			if (!state) return;
			const { updatedState } = recordMovementSession(state, {
				movementId: movement.id,
				slotId: slot.id,
				status: "completed",
				reps: movement.targetReps,
				durationSeconds: movement.targetSeconds || 60,
				dateKey: todayKey,
			});
			setState(updatedState);
			if (state.config.soundEnabled) playChimeSound();
		},
		[state, todayKey],
	);

	// Start Interactive Timer for Slot
	const handleStartSession = useCallback(
		(slot: ScheduledMovementSlot, movement: Movement) => {
			setTimerModalData({
				isOpen: true,
				slot,
				movement,
			});
		},
		[],
	);

	// Start Interactive Timer directly from Library
	const handleStartMovementFromLibrary = useCallback((movement: Movement) => {
		setTimerModalData({
			isOpen: true,
			movement,
		});
	}, []);

	// Complete from Timer Modal
	const handleCompleteFromTimer = useCallback(
		(data: { reps?: number; durationSeconds?: number }) => {
			if (!state || !timerModalData) return;
			const { updatedState } = recordMovementSession(state, {
				movementId: timerModalData.movement.id,
				slotId: timerModalData.slot?.id,
				status: "completed",
				reps: data.reps,
				durationSeconds: data.durationSeconds,
				dateKey: todayKey,
			});
			setState(updatedState);
		},
		[state, timerModalData, todayKey],
	);

	// Undo Logged Session
	const handleUndoSession = useCallback(
		(sessionId: string) => {
			if (!state) return;
			const updated = undoMovementSession(state, todayKey, sessionId);
			setState(updated);
		},
		[state, todayKey],
	);

	// Toggle Skip Slot
	const handleToggleSkipSlot = useCallback(
		(slot: ScheduledMovementSlot, movement: Movement) => {
			if (!state) return;
			const updated = toggleSlotSkip(state, todayKey, slot.id, movement.id);
			setState(updated);
		},
		[state, todayKey],
	);

	// Record Session from Quick Log Modal
	const handleRecordQuickSession = useCallback(
		(movementId: string, reps?: number, durationSeconds?: number) => {
			if (!state) return;
			const { updatedState } = recordMovementSession(state, {
				movementId,
				status: "completed",
				reps,
				durationSeconds,
				isBonus: true,
				dateKey: todayKey,
			});
			setState(updatedState);
		},
		[state, todayKey],
	);

	// Save Routine Configuration
	const handleSaveConfig = useCallback(
		(updatedConfig: MovementRoutineConfig) => {
			if (!state) return;
			const updated: MovementAppState = {
				...state,
				config: updatedConfig,
			};
			saveMovementState(updated);
			setState(updated);
		},
		[state],
	);

	// Export Data to JSON Download
	const handleExportJson = useCallback(() => {
		if (!state) return;
		const json = exportMovementDataAsJson(state);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `movement-snacks-backup-${todayKey}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}, [state, todayKey]);

	// Import Data from JSON
	const handleImportJson = useCallback((jsonString: string): boolean => {
		const restored = importMovementDataFromJson(jsonString);
		if (restored) {
			setState(restored);
			return true;
		}
		return false;
	}, []);

	// Reset History
	const handleResetHistory = useCallback(() => {
		if (!state) return;
		const cleared = clearMovementHistory(state);
		setState(cleared);
	}, [state]);

	if (!isMounted || !state) {
		return <MovementSkeleton />;
	}

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Canonical Floating Header Card */}
			<MovementHeader
				stats={stats}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onOpenQuickLog={() => {
					setQuickLogInitialMovementId(undefined);
					setIsQuickLogOpen(true);
				}}
				onOpenSettings={() => setIsSettingsOpen(true)}
			/>

			{/* Tab 1: Today's Routine View */}
			{activeTab === "today" && (
				<div className="space-y-6 sm:space-y-8">
					{/* Daily Progress Floating Card */}
					<DailyProgressCard
						stats={stats}
						config={state.config}
						todaySessions={todaySessions}
						allMovements={allMovements}
						onQuickLogWalk={() => {
							setQuickLogInitialMovementId("easy-walking");
							setIsQuickLogOpen(true);
						}}
						onQuickLogSession={() => {
							setQuickLogInitialMovementId(undefined);
							setIsQuickLogOpen(true);
						}}
					/>

					{/* Today's Schedule Vertical Timeline */}
					<TodayScheduleTimeline
						config={state.config}
						todaySessions={todaySessions}
						allMovements={allMovements}
						onStartSession={handleStartSession}
						onQuickCompleteSlot={handleQuickCompleteSlot}
						onUndoSession={handleUndoSession}
						onToggleSkipSlot={handleToggleSkipSlot}
						onLogBonusBreak={() => {
							setQuickLogInitialMovementId(undefined);
							setIsQuickLogOpen(true);
						}}
					/>
				</div>
			)}

			{/* Tab 2: Movement Library View */}
			{activeTab === "library" && (
				<MovementLibraryView
					movements={allMovements}
					onStartMovement={handleStartMovementFromLibrary}
					onQuickLogMovement={(m) => {
						setQuickLogInitialMovementId(m.id);
						setIsQuickLogOpen(true);
					}}
				/>
			)}

			{/* Tab 3: Consistency & History View */}
			{activeTab === "history" && (
				<WeeklyHistoryView state={state} stats={stats} />
			)}

			{/* Modals & Dialogs */}
			{timerModalData?.isOpen && (
				<SessionTimerModal
					isOpen={timerModalData.isOpen}
					slot={timerModalData.slot}
					movement={timerModalData.movement}
					soundEnabled={state.config.soundEnabled}
					onClose={() => setTimerModalData(null)}
					onComplete={handleCompleteFromTimer}
				/>
			)}

			{isQuickLogOpen && (
				<QuickCompleteModal
					isOpen={isQuickLogOpen}
					movements={allMovements}
					soundEnabled={state.config.soundEnabled}
					initialMovementId={quickLogInitialMovementId}
					onClose={() => setIsQuickLogOpen(false)}
					onRecordSession={handleRecordQuickSession}
				/>
			)}

			{isSettingsOpen && (
				<RoutineSettingsModal
					isOpen={isSettingsOpen}
					config={state.config}
					allMovements={allMovements}
					onClose={() => setIsSettingsOpen(false)}
					onSaveConfig={handleSaveConfig}
					onExportJson={handleExportJson}
					onImportJson={handleImportJson}
					onResetHistory={handleResetHistory}
				/>
			)}
		</div>
	);
}
