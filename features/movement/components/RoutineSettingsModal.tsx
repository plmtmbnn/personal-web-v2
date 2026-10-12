"use client";

import { useState, useRef } from "react";
import {
	X,
	Settings,
	Clock,
	Volume2,
	VolumeX,
	Bell,
	BellOff,
	Download,
	Upload,
	Trash2,
	Check,
	RotateCcw,
} from "lucide-react";
import type {
	Movement,
	MovementRoutineConfig,
	ScheduledMovementSlot,
} from "../types";
import { requestNotificationPermission } from "../lib/notifications";
import { DEFAULT_SCHEDULED_SLOTS } from "../data/default-routine";

interface RoutineSettingsModalProps {
	isOpen: boolean;
	config: MovementRoutineConfig;
	allMovements: Movement[];
	onClose: () => void;
	onSaveConfig: (updatedConfig: MovementRoutineConfig) => void;
	onExportJson: () => void;
	onImportJson: (jsonString: string) => boolean;
	onResetHistory: () => void;
}

export default function RoutineSettingsModal({
	isOpen,
	config,
	allMovements,
	onClose,
	onSaveConfig,
	onExportJson,
	onImportJson,
	onResetHistory,
}: RoutineSettingsModalProps) {
	const [dailyTarget, setDailyTarget] = useState<number>(config.dailyTarget);
	const [slots, setSlots] = useState<ScheduledMovementSlot[]>(config.slots);
	const [soundEnabled, setSoundEnabled] = useState<boolean>(
		config.soundEnabled,
	);
	const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
		config.notificationsEnabled,
	);
	const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	if (!isOpen) return null;

	const handleSlotTimeChange = (slotId: string, newTime: string) => {
		setSlots((prev) =>
			prev.map((s) => (s.id === slotId ? { ...s, scheduledTime: newTime } : s)),
		);
	};

	const handleSlotMovementChange = (slotId: string, movementId: string) => {
		setSlots((prev) =>
			prev.map((s) => (s.id === slotId ? { ...s, movementId } : s)),
		);
	};

	const handleToggleNotification = async () => {
		if (!notificationsEnabled) {
			const granted = await requestNotificationPermission();
			setNotificationsEnabled(granted);
		} else {
			setNotificationsEnabled(false);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const text = event.target?.result as string;
			if (text) {
				const success = onImportJson(text);
				if (success) {
					onClose();
				}
			}
		};
		reader.readAsText(file);
	};

	const handleSave = () => {
		onSaveConfig({
			dailyTarget,
			slots,
			soundEnabled,
			notificationsEnabled,
		});
		onClose();
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
		>
			<div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200/80 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Top Bar */}
				<div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
							<Settings className="w-5 h-5" />
						</div>
						<div>
							<h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
								Routine &amp; Habits Configuration
							</h3>
							<p className="text-xs text-slate-500 font-normal">
								Customize slots, audio, notifications, and data backups.
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close settings"
						className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Settings Content */}
				<div className="p-5 sm:p-6 space-y-6 max-h-[72vh] overflow-y-auto">
					{/* Daily Target Setting */}
					<div className="space-y-2">
						<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
							Daily Session Target
						</span>
						<div className="grid grid-cols-4 gap-2">
							{[5, 6, 7, 8].map((target) => (
								<button
									key={target}
									type="button"
									onClick={() => setDailyTarget(target)}
									className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
										dailyTarget === target
											? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
											: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
									}`}
								>
									{target} breaks
								</button>
							))}
						</div>
						<p className="text-[11px] text-slate-500">
							Recommended minimum: 5 sessions. Standard work habit: 6 sessions.
						</p>
					</div>

					{/* Scheduled Slots Configuration */}
					<div className="space-y-3 pt-3 border-t border-slate-100">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
								Scheduled Time Slots &amp; Exercises
							</span>
							<button
								type="button"
								onClick={() => setSlots(DEFAULT_SCHEDULED_SLOTS)}
								className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
							>
								<RotateCcw className="w-3 h-3" />
								<span>Reset Default Times</span>
							</button>
						</div>

						<div className="space-y-2.5">
							{slots.map((slot) => (
								<div
									key={slot.id}
									className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
								>
									{/* Slot Number & Time Input */}
									<div className="flex items-center gap-2">
										<span className="text-xs font-mono font-bold text-slate-500 w-12">
											Slot {slot.slotNumber}
										</span>
										<div className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg">
											<Clock className="w-3 h-3 text-slate-400" />
											<input
												type="time"
												value={slot.scheduledTime}
												onChange={(e) =>
													handleSlotTimeChange(slot.id, e.target.value)
												}
												className="text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden"
											/>
										</div>
									</div>

									{/* Exercise Dropdown */}
									<div className="flex-1 min-w-[180px]">
										<select
											value={slot.movementId}
											onChange={(e) =>
												handleSlotMovementChange(slot.id, e.target.value)
											}
											aria-label={`Select exercise for slot ${slot.slotNumber}`}
											className="w-full text-xs font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
										>
											{allMovements.map((m) => (
												<option key={m.id} value={m.id}>
													{m.name} ({m.estimatedDuration})
												</option>
											))}
										</select>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Audio & Browser Notification Toggles */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
						{/* Sound Toggle */}
						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								{soundEnabled ? (
									<Volume2 className="w-4 h-4 text-emerald-600" />
								) : (
									<VolumeX className="w-4 h-4 text-slate-400" />
								)}
								<div>
									<span className="text-xs font-bold text-slate-900 block">
										Sound Chimes
									</span>
									<span className="text-[10px] text-slate-500">
										Gentle Web Audio cue
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setSoundEnabled(!soundEnabled)}
								className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
									soundEnabled ? "bg-emerald-600" : "bg-slate-300"
								}`}
							>
								<div
									className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
										soundEnabled ? "right-1" : "left-1"
									}`}
								/>
							</button>
						</div>

						{/* Notification Toggle */}
						<div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								{notificationsEnabled ? (
									<Bell className="w-4 h-4 text-emerald-600" />
								) : (
									<BellOff className="w-4 h-4 text-slate-400" />
								)}
								<div>
									<span className="text-xs font-bold text-slate-900 block">
										Notifications
									</span>
									<span className="text-[10px] text-slate-500">
										Browser prompt
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={handleToggleNotification}
								className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
									notificationsEnabled ? "bg-emerald-600" : "bg-slate-300"
								}`}
							>
								<div
									className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
										notificationsEnabled ? "right-1" : "left-1"
									}`}
								/>
							</button>
						</div>
					</div>

					{/* Backup & History Management */}
					<div className="space-y-3 pt-3 border-t border-slate-100">
						<span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
							Data Backup &amp; Storage
						</span>

						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={onExportJson}
								className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
							>
								<Download className="w-3.5 h-3.5 text-slate-500" />
								<span>Export JSON</span>
							</button>

							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
							>
								<Upload className="w-3.5 h-3.5 text-slate-500" />
								<span>Import JSON</span>
							</button>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileSelect}
								accept=".json"
								className="hidden"
							/>

							{!showResetConfirm ? (
								<button
									type="button"
									onClick={() => setShowResetConfirm(true)}
									className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer ml-auto"
								>
									<Trash2 className="w-3.5 h-3.5 text-rose-600" />
									<span>Reset History</span>
								</button>
							) : (
								<div className="flex items-center gap-2 ml-auto">
									<button
										type="button"
										onClick={() => {
											onResetHistory();
											setShowResetConfirm(false);
										}}
										className="px-3 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
									>
										Confirm Reset
									</button>
									<button
										type="button"
										onClick={() => setShowResetConfirm(false)}
										className="px-2 py-2 text-xs font-semibold text-slate-500 cursor-pointer"
									>
										Cancel
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Modal Actions */}
				<div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={handleSave}
						className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs active:scale-95 cursor-pointer"
					>
						<Check className="w-4 h-4" />
						<span>Save Preferences</span>
					</button>
				</div>
			</div>
		</div>
	);
}
