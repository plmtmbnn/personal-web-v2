"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CustomModal from "@/features/shared/components/CustomModal";
import { getJakartaDateString, nextDate } from "../../dates";
import { rescheduleOverdueTasks } from "../../actions/server-actions";
import { useToast } from "../shared/Toast";
import type { Task } from "../../types";

export default function RolloverTasks({ tasks }: { tasks: Task[] }) {
	const [preview, setPreview] = useState<{
		ids: string[];
		previewDate: string;
		targetDate: string;
	} | null>(null);
	const [pending, setPending] = useState(false);
	const { showError, showSuccess } = useToast();
	const router = useRouter();
	const open = (days: number) => {
		const day = getJakartaDateString();
		const ids = tasks
			.filter(
				(t) =>
					t.due_date < day &&
					t.status !== "done" &&
					t.status !== "cancelled" &&
					(!t.start_date || t.start_date <= day),
			)
			.map((t) => t.id);
		setPreview({ ids, previewDate: day, targetDate: nextDate(day, days) });
	};
	const confirm = async () => {
		if (!preview || pending) return;
		setPending(true);
		try {
			const result = await rescheduleOverdueTasks(preview);
			showSuccess(result.message);
		} catch (error) {
			showError(
				error instanceof Error ? error.message : "Could not reschedule tasks.",
			);
		} finally {
			setPending(false);
			setPreview(null);
			router.refresh();
		}
	};
	return (
		<>
			<div className="flex flex-wrap gap-2">
				{["Move to Today", "Move to Tomorrow"].map((label, days) => (
					<button
						key={label}
						type="button"
						disabled={pending}
						onClick={() => open(days)}
						className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50"
					>
						{label}
					</button>
				))}
			</div>
			<CustomModal
				isOpen={!!preview}
				onClose={() => {
					if (!pending) setPreview(null);
				}}
				onConfirm={confirm}
				title="Reschedule visible overdue tasks"
				description={`Move ${preview?.ids.length ?? 0} visible overdue tasks to ${preview?.targetDate ?? ""} (Jakarta). Other tasks stay unchanged.`}
				confirmText="Reschedule"
				cancelText="Cancel"
				isLoading={pending}
			/>
		</>
	);
}
