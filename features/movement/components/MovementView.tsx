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
import {
	saveMovementStateAction,
	syncLocalMovementStateAction,
	getMovementStateAction,
} from "../actions";

import MovementHeader from "./MovementHeader";
import DailyProgressCard from "./DailyProgressCard";
import TodayScheduleTimeline from "./TodayScheduleTimeline";
import MovementLibraryView from "./MovementLibraryView";
import WeeklyHistoryView from "./WeeklyHistoryView";
import SessionTimerModal from "./SessionTimerModal";
import QuickCompleteModal from "./QuickCompleteModal";
import RoutineSettingsModal from "./RoutineSettingsModal";
import MovementSkeleton from "./MovementSkeleton";

interface MovementViewProps {
	initialState?: MovementAppState | null;
}

export default function MovementView({ initialState }: MovementViewProps) {
	const [isMounted, setIsMounted] = useState<boolean>(false);
	const [state, setState] = useState<MovementAppState | null>(
		initialState || null,
	);
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

	// Load and synchronize state on mount
	useEffect(() => {
		let isCancelled = false;

		async function init() {
			if (typeof window === "undefined") return;

			const migrated = localStorage.getItem(
				"movement:snacks:migrated_to_redis",
			);
			const localState = loadMovementState();
			const hasLocalSessions = Object.keys(localState.logs || {}).some(
				(k) => (localState.logs[k] || []).length > 0,
			);

			if (!migrated && hasLocalSessions) {
				// One-time sync of legacy client-side localStorage data into Redis
				try {
					const synced = await syncLocalMovementStateAction(localState);
					if (!isCancelled) {
						setState(synced);
						saveMovementState(synced);
					}
				} catch (err) {
					console.error("Failed to sync local movement state to Redis:", err);
					if (!isCancelled) {
						const fallback = initialState || localState;
						setState(fallback);
					}
				} finally {
					localStorage.setItem("movement:snacks:migrated_to_redis", "true");
				}
			} else {
				// Already migrated or clean slate: prefer server initialState, fall back to localStorage
				const activeState = initialState || localState;
				if (!isCancelled) {
					setState(activeState);
					saveMovementState(activeState);
				}
				localStorage.setItem("movement:snacks:migrated_to_redis", "true");
			}

			if (!isCancelled) {
				setIsMounted(true);
			}
		}

		init();

		return () => {
			isCancelled = true;
		};
	}, [initialState]);

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

	// Re-sync with Redis when tab becomes visible if no modal is active
	useEffect(() => {
		const handleVisibilityChange = async () => {
			if (
				document.visibilityState === "visible" &&
				!timerModalData &&
				!isQuickLogOpen &&
				!isSettingsOpen
			) {
				try {
					const remote = await getMovementStateAction();
					setState(remote);
					saveMovementState(remote);
				} catch (err) {
					console.error("Tab focus sync error:", err);
				}
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [timerModalData, isQuickLogOpen, isSettingsOpen]);

	// Persistent state updater with instant local write & background Redis sync
	const persistState = useCallback((updated: MovementAppState) => {
		setState(updated);
		saveMovementState(updated);
		saveMovementStateAction(updated).catch((err) => {
			console.error("Failed to save movement state to Redis:", err);
		});
	}, []);

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
			persistState(updatedState);
			if (state.config.soundEnabled) playChimeSound();
		},
		[state, todayKey, persistState],
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
			persistState(updatedState);
		},
		[state, timerModalData, todayKey, persistState],
	);

	// Undo Logged Session
	const handleUndoSession = useCallback(
		(sessionId: string) => {
			if (!state) return;
			const updated = undoMovementSession(state, todayKey, sessionId);
			persistState(updated);
		},
		[state, todayKey, persistState],
	);

	// Toggle Skip Slot
	const handleToggleSkipSlot = useCallback(
		(slot: ScheduledMovementSlot, movement: Movement) => {
			if (!state) return;
			const updated = toggleSlotSkip(state, todayKey, slot.id, movement.id);
			persistState(updated);
		},
		[state, todayKey, persistState],
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
			persistState(updatedState);
		},
		[state, todayKey, persistState],
	);

	// Save Routine Configuration
	const handleSaveConfig = useCallback(
		(updatedConfig: MovementRoutineConfig) => {
			if (!state) return;
			const updated: MovementAppState = {
				...state,
				config: updatedConfig,
			};
			persistState(updated);
		},
		[state, persistState],
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
	const handleImportJson = useCallback(
		(jsonString: string): boolean => {
			const restored = importMovementDataFromJson(jsonString);
			if (restored) {
				persistState(restored);
				return true;
			}
			return false;
		},
		[persistState],
	);

	// Reset History
	const handleResetHistory = useCallback(() => {
		if (!state) return;
		const cleared = clearMovementHistory(state);
		persistState(cleared);
	}, [state, persistState]);

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
