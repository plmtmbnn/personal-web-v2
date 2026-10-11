import { ExternalLink } from "lucide-react";
import type { Task } from "./types";

/**
 * Regex to detect URLs starting with http://, https://, or www.
 */
const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

/**
 * Returns a deterministic date string in YYYY-MM-DD format based on Asia/Jakarta timezone.
 */
export function getJakartaDateString(date: Date = new Date()): string {
	return date.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/**
 * Utility to render text with clickable links.
 */
export function renderTextWithLinks(text: string) {
	if (!text) return null;

	const parts = text.split(URL_REGEX);

	return parts.map((part, i) => {
		if (part.match(URL_REGEX)) {
			let rawUrl = part;
			let trailing = "";

			// Strip trailing punctuation attached to URLs in prose (e.g., period, comma, closing paren)
			const match = rawUrl.match(/^(.*?)([.,;:!?)\]>]+)$/);
			if (match) {
				rawUrl = match[1];
				trailing = match[2];
			}

			const href = rawUrl.startsWith("www.") ? `https://${rawUrl}` : rawUrl;

			// Enhancement: Shorten visual URL but keep full href
			let displayUrl = rawUrl.replace(/^https?:\/\//, "").replace(/^www\./, "");
			if (displayUrl.length > 30) {
				displayUrl = `${displayUrl.substring(0, 27)}...`;
			}

			return (
				<span key={i} className="inline">
					<a
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						onDoubleClick={(e) => e.stopPropagation()}
						className="text-blue-600 hover:text-blue-700 underline underline-offset-4 font-bold break-all inline-flex items-center gap-1 group/link bg-blue-50 px-1.5 rounded-md transition-colors"
						title={rawUrl} // Full URL on hover
					>
						{displayUrl}
						<ExternalLink className="w-3 h-3 opacity-40 group-hover/link:opacity-100 transition-opacity" />
					</a>
					{trailing}
				</span>
			);
		}
		return part;
	});
}

/**
 * Calculate completion percentage for a list of tasks.
 * Excludes cancelled tasks from calculation.
 */
export function calculateProgress(tasks: Task[]): number {
	if (!tasks || tasks.length === 0) return 0;

	const activeTasks = tasks.filter((t) => (t.status || "todo") !== "cancelled");
	if (activeTasks.length === 0) return 0;

	const completedCount = activeTasks.filter(
		(task) => task.status === "done",
	).length;
	return Math.round((completedCount / activeTasks.length) * 100);
}
