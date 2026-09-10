import type { LfcFixture, TheSportsDbEvent } from "./types";

/**
 * Normalizes a raw TheSportsDB event into a clean LfcFixture domain model
 */
export function normalizeTheSportsDbFixture(
	event: TheSportsDbEvent,
): LfcFixture {
	const isHome = (event.strHomeTeam || "").toLowerCase().includes("liverpool");

	// Parse date safely
	let dateIso = "";
	if (event.strTimestamp) {
		const raw = event.strTimestamp.trim();
		dateIso = raw.endsWith("Z") || raw.includes("+") ? raw : `${raw}Z`;
	} else if (event.dateEvent) {
		const time = event.strTime || "15:00:00";
		dateIso = `${event.dateEvent}T${time}Z`;
	}

	// Validate date parsing
	const parsed = new Date(dateIso);
	if (Number.isNaN(parsed.getTime())) {
		dateIso = new Date().toISOString();
	}

	const stadium = event.strVenue?.trim() || (isHome ? "Anfield" : "TBC");

	return {
		id: String(event.idEvent),
		title: event.strEvent || `${event.strHomeTeam} vs ${event.strAwayTeam}`,
		date: dateIso,
		stadium,
		homeTeam: event.strHomeTeam || "Liverpool",
		awayTeam: event.strAwayTeam || "Opponent",
		homeTeamBadge: event.strHomeTeamBadge || undefined,
		awayTeamBadge: event.strAwayTeamBadge || undefined,
		competition: event.strLeague || "Premier League",
		competitionBadge: event.strLeagueBadge || undefined,
		season: event.strSeason || undefined,
		round: event.intRound ? `Round ${event.intRound}` : undefined,
		thumb: event.strThumb || undefined,
		banner: event.strBanner || undefined,
		poster: event.strPoster || undefined,
		isHome,
		status: event.strStatus || "NS",
	};
}

/**
 * Check if Liverpool is the home team
 */
export function isLiverpoolHome(homeTeamName = ""): boolean {
	const normalized = homeTeamName.toLowerCase().trim();
	return normalized.includes("liverpool");
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

	// Month key for grouping e.g. "2026-09"
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
 * Generate Google Calendar URL for an upcoming fixture
 */
export function createGoogleCalendarUrl(fixture: LfcFixture): string {
	const matchDate = new Date(fixture.date);
	if (Number.isNaN(matchDate.getTime())) return "#";

	// Standard 2-hour match window
	const endDate = new Date(matchDate.getTime() + 2 * 60 * 60 * 1000);

	const formatGCalDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, "");

	const text = encodeURIComponent(
		`${fixture.homeTeam} vs ${fixture.awayTeam} - ${fixture.competition || "Match"}`,
	);
	const dates = `${formatGCalDate(matchDate)}/${formatGCalDate(endDate)}`;
	const location = encodeURIComponent(
		`${fixture.stadium || "Stadium"}${fixture.isHome ? ", Liverpool, UK" : ""}`,
	);
	const details = encodeURIComponent(
		`Liverpool FC upcoming fixture: ${fixture.title}\nCompetition: ${fixture.competition}\nVenue: ${fixture.stadium}`,
	);

	return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&location=${location}&details=${details}`;
}

const DEFAULT_TTL_SECONDS = 86400; // 1 day fallback if no upcoming events

/**
 * Calculate TTL in seconds until strTimestamp + 1 day
 */
export function calculateFixtureTtlSeconds(
	matchIsoDate?: string,
	rawTimestamp?: string,
	nowMs: number = Date.now(),
): number {
	let matchTimeMs = 0;

	if (rawTimestamp) {
		const raw = rawTimestamp.trim();
		const iso =
			raw.endsWith("Z") || raw.includes("+")
				? raw
				: `${raw.replace(" ", "T")}Z`;
		const parsed = new Date(iso).getTime();
		if (!Number.isNaN(parsed)) {
			matchTimeMs = parsed;
		}
	}

	if (!matchTimeMs && matchIsoDate) {
		const parsed = new Date(matchIsoDate).getTime();
		if (!Number.isNaN(parsed)) {
			matchTimeMs = parsed;
		}
	}

	if (!matchTimeMs) {
		return DEFAULT_TTL_SECONDS;
	}

	const ONE_DAY_MS = 24 * 60 * 60 * 1000;
	const expireTimestamp = matchTimeMs + ONE_DAY_MS;
	const diffSeconds = Math.floor((expireTimestamp - nowMs) / 1000);

	// If match was in the past and already expired or expiring within seconds,
	// keep a 1-hour buffer so we don't spam the API on every request
	return diffSeconds > 0 ? diffSeconds : 3600;
}
