import type { LfcFixtureResponse, Sizes } from "./types";

/**
 * Get the highest quality available image URL from the sizes object
 */
export function getBestImageUrl(sizes?: Sizes): string | undefined {
	if (!sizes) return undefined;
	return (
		sizes.xl?.url ||
		sizes.lg?.url ||
		sizes.md?.url ||
		sizes.sm?.url ||
		sizes.xs?.url ||
		undefined
	);
}

/**
 * Check if Liverpool is the home team
 */
export function isLiverpoolHome(homeTeamName = ""): boolean {
	const normalized = homeTeamName.toLowerCase().trim();
	return normalized.includes("liverpool");
}

export type MatchOutcome = "win" | "draw" | "loss" | "unknown";

/**
 * Determine the outcome of a played match from Liverpool FC perspective
 */
export function getMatchOutcome(fixture: LfcFixtureResponse): {
	outcome: MatchOutcome;
	label: string;
	lfcScore?: number;
	opponentScore?: number;
} {
	const { matchData } = fixture;
	const score = matchData?.result?.score;
	if (
		!score ||
		typeof score.home !== "number" ||
		typeof score.away !== "number"
	) {
		return { outcome: "unknown", label: "Played" };
	}

	const isHome = isLiverpoolHome(matchData.homeTeam);
	const lfcScore = isHome ? score.home : score.away;
	const oppScore = isHome ? score.away : score.home;

	if (lfcScore > oppScore) {
		return { outcome: "win", label: "WIN", lfcScore, opponentScore: oppScore };
	}
	if (lfcScore === oppScore) {
		return {
			outcome: "draw",
			label: "DRAW",
			lfcScore,
			opponentScore: oppScore,
		};
	}
	return { outcome: "loss", label: "LOSS", lfcScore, opponentScore: oppScore };
}

/**
 * Format match ISO date string into readable local representations
 */
export function formatMatchDate(isoString: string) {
	if (!isoString) {
		return {
			formattedDate: "TBC",
			formattedTime: "TBC",
			relativeTime: "Date TBC",
			isToday: false,
			isTomorrow: false,
			monthKey: "Unknown",
			monthName: "Matches",
			fullDateTime: "TBC",
		};
	}

	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) {
		return {
			formattedDate: "TBC",
			formattedTime: "TBC",
			relativeTime: "Date TBC",
			isToday: false,
			isTomorrow: false,
			monthKey: "Unknown",
			monthName: "Matches",
			fullDateTime: "TBC",
		};
	}

	const now = new Date();
	const diffMs = date.getTime() - now.getTime();
	const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

	const isToday =
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear();

	const tomorrow = new Date(now);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const isTomorrow =
		date.getDate() === tomorrow.getDate() &&
		date.getMonth() === tomorrow.getMonth() &&
		date.getFullYear() === tomorrow.getFullYear();

	let relativeTime = "";
	if (diffMs < 0) {
		const pastDays = Math.abs(diffDays);
		if (pastDays === 0) relativeTime = "Today";
		else if (pastDays === 1) relativeTime = "Yesterday";
		else if (pastDays < 7) relativeTime = `${pastDays} days ago`;
		else if (pastDays < 30) {
			const weeks = Math.round(pastDays / 7);
			relativeTime = `${weeks}w ago`;
		} else {
			const months = Math.round(pastDays / 30);
			relativeTime = `${months}mo ago`;
		}
	} else if (isToday) {
		relativeTime = "Today";
	} else if (isTomorrow) {
		relativeTime = "Tomorrow";
	} else if (diffDays <= 7) {
		relativeTime = `In ${diffDays} days`;
	} else if (diffDays <= 30) {
		const weeks = Math.round(diffDays / 7);
		relativeTime = `In ${weeks} week${weeks > 1 ? "s" : ""}`;
	} else {
		const months = Math.round(diffDays / 30);
		relativeTime = `In ${months} month${months > 1 ? "s" : ""}`;
	}

	const formattedDate = date.toLocaleDateString("en-GB", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric",
	});

	const formattedTime = date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});

	const fullDateTime = `${formattedDate} • ${formattedTime}`;

	// Month key for grouping e.g. "2026-08"
	const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
	const monthName = date.toLocaleDateString("en-GB", {
		month: "long",
		year: "numeric",
	});

	return {
		formattedDate,
		formattedTime,
		relativeTime,
		isToday,
		isTomorrow,
		monthKey,
		monthName,
		fullDateTime,
	};
}

/**
 * Compute countdown metrics to a target date
 */
export function getCountdown(targetIsoDate: string) {
	const target = new Date(targetIsoDate).getTime();
	const now = Date.now();
	const distance = target - now;

	if (distance <= 0 || Number.isNaN(distance)) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			isPassed: true,
		};
	}

	const days = Math.floor(distance / (1000 * 60 * 60 * 24));
	const hours = Math.floor(
		(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
	);
	const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((distance % (1000 * 60)) / 1000);

	return {
		days,
		hours,
		minutes,
		seconds,
		isPassed: false,
	};
}

/**
 * Generate Google Calendar URL for a fixture
 */
export function createGoogleCalendarUrl(fixture: LfcFixtureResponse): string {
	const { matchData, title } = fixture;
	const matchDate = new Date(matchData.date);
	if (Number.isNaN(matchDate.getTime())) return "#";

	// 2 hours match window
	const endDate = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

	const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

	const text = encodeURIComponent(
		`${matchData.homeTeam} vs ${matchData.awayTeam} - ${matchData.competition?.displayName || "Match"}`,
	);
	const dates = `${formatGCalDate(matchDate)}/${formatGCalDate(endDate)}`;
	const location = encodeURIComponent(
		`${matchData.stadium || "Stadium"}, ${isLiverpoolHome(matchData.homeTeam) ? "Liverpool, UK" : ""}`,
	);
	const details = encodeURIComponent(
		`Liverpool FC fixture: ${title}\nCompetition: ${matchData.competition?.displayName || "Football"}\nVenue: ${matchData.stadium}`,
	);

	return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${location}&details=${details}`;
}
