"use client";

import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/lib/hooks/useNotification";
import type { Task } from "@/features/tasks/types";
import { calculateProgress } from "@/features/tasks/utils";
import { BellOff, BellRing } from "lucide-react";
import { notificationDispatcher } from "@/services/notifications/dispatcher";
import { BrowserChannel } from "@/services/notifications/channels/browser";
import { remoteConfigService } from "@/services/config/remote-config";

interface TaskNotificationHandlerProps {
	tasks: Task[];
}

export default function TaskNotificationHandler({
	tasks,
}: TaskNotificationHandlerProps) {
	const { permission, requestPermission, isSupported } = useNotification();
	const [isMuted, setIsMuted] = useState(false);
	const notifiedTasksRef = useRef<{ [key: string]: string[] }>({}); // date-time -> [taskIds]
	const goalReachedRef = useRef<boolean>(false);

	// Load mute state and Register Browser Channel
	useEffect(() => {
		let isMounted = true;
		const storedMute = localStorage.getItem("tasks-notifications-muted");
		if (storedMute === "true") {
			setIsMuted(true);
		}

		// Pluggable Architecture: Register Browser Channel if enabled in Cloud
		const initChannels = async () => {
			const isBrowserEnabled = await remoteConfigService.getConfigValue(
				"enable_browser_notifications",
			);
			if (isMounted && isBrowserEnabled) {
				notificationDispatcher.registerChannel(new BrowserChannel());
			}
		};

		initChannels();
		return () => {
			isMounted = false;
		};
	}, []);

	const toggleMute = () => {
		const newMute = !isMuted;
		setIsMuted(newMute);
		localStorage.setItem("tasks-notifications-muted", String(newMute));
	};

	useEffect(() => {
		if (permission !== "granted" || isMuted) return;

		const checkReminders = () => {
			const now = new Date();
			const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
			const dateStr = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
			const key = `${dateStr}-${timeStr}`;

			// Check for specific times: 10:00 AM or 02:00 PM
			if (timeStr === "10:00" || timeStr === "14:00") {
				const highPriorityTasks = tasks.filter(
					(t) => t.priority === "HIGH" && t.status !== "done",
				);

				highPriorityTasks.forEach((task) => {
					if (!notifiedTasksRef.current[key]?.includes(task.id)) {
						notificationDispatcher.dispatch({
							title: "Heads up!",
							body: `You have a high-priority task: ${task.title}`,
							data: { taskId: task.id },
						});

						if (!notifiedTasksRef.current[key]) {
							notifiedTasksRef.current[key] = [];
						}
						notifiedTasksRef.current[key].push(task.id);
					}
				});
			}

			// Progress check for "Goal Reached!"
			const progress = calculateProgress(tasks);
			if (progress === 100 && tasks.length > 0 && !goalReachedRef.current) {
				notificationDispatcher.dispatch({
					title: "Goal Reached!",
					body: "All tasks completed successfully.",
				});
				goalReachedRef.current = true;
			} else if (progress < 100) {
				goalReachedRef.current = false;
			}
		};

		const interval = setInterval(checkReminders, 60000); // Check every minute
		checkReminders(); // Initial check

		return () => clearInterval(interval);
	}, [tasks, permission, isMuted]);

	if (!isSupported) return null;

	return (
		<div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4">
			<div className="flex items-center gap-3">
				<div
					className={`p-2 rounded-xl ${permission === "granted" && !isMuted ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60" : "bg-slate-100 text-slate-400"}`}
				>
					{permission === "granted" && !isMuted ? (
						<BellRing className="w-5 h-5" />
					) : (
						<BellOff className="w-5 h-5" />
					)}
				</div>
				<div>
					<h3 className="text-sm font-bold text-slate-900">
						Desktop Notifications
					</h3>
					<p className="text-xs text-slate-500">
						{permission === "default"
							? "Stay updated with task alerts."
							: permission === "denied"
								? "Alerts are blocked in your browser."
								: isMuted
									? "Notifications are currently muted."
									: "Active: 10:00 AM, 02:00 PM & 100% Progress"}
					</p>
				</div>
			</div>

			{permission === "default" && (
				<button
					type="button"
					onClick={requestPermission}
					className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
				>
					Enable Alerts
				</button>
			)}

			{permission === "granted" && (
				<button
					type="button"
					onClick={toggleMute}
					className={`px-4 py-2 rounded-xl transition-all text-xs font-bold uppercase tracking-wider border cursor-pointer ${
						isMuted
							? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
							: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
					}`}
				>
					{isMuted ? "Unmute" : "Mute"}
				</button>
			)}
		</div>
	);
}
