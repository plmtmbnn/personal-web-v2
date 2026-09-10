import { describe, expect, it } from "vitest";
import {
	isLiverpoolHome,
	formatMatchDate,
	getCountdown,
	createGoogleCalendarUrl,
	normalizeTheSportsDbFixture,
	calculateFixtureTtlSeconds,
} from "../utils";
import type { LfcFixture, TheSportsDbEvent } from "../types";

describe("Liverpool FC Utilities", () => {
	describe("isLiverpoolHome", () => {
		it("should return true when Liverpool is home", () => {
			expect(isLiverpoolHome("Liverpool")).toBe(true);
			expect(isLiverpoolHome("Liverpool FC")).toBe(true);
			expect(isLiverpoolHome("liverpool")).toBe(true);
		});

		it("should return false when Liverpool is away", () => {
			expect(isLiverpoolHome("Newcastle")).toBe(false);
			expect(isLiverpoolHome("Arsenal")).toBe(false);
			expect(isLiverpoolHome("")).toBe(false);
		});
	});

	describe("formatMatchDate", () => {
		it("should handle valid ISO date", () => {
			const info = formatMatchDate("2026-08-23T15:30:00Z");
			expect(info.monthKey).toBe("2026-08");
			expect(info.formattedDate).toBeTruthy();
			expect(info.formattedTime).toBeTruthy();
		});

		it("should handle empty or invalid date string safely", () => {
			const emptyInfo = formatMatchDate("");
			expect(emptyInfo.formattedDate).toBe("TBC");
			expect(emptyInfo.monthKey).toBe("Unknown");

			const invalidInfo = formatMatchDate("invalid-date-string");
			expect(invalidInfo.formattedDate).toBe("TBC");
		});
	});

	describe("getCountdown", () => {
		it("should return positive numbers for future date", () => {
			const futureDate = new Date(
				Date.now() + 1000 * 60 * 60 * 48,
			).toISOString();
			const cd = getCountdown(futureDate);
			expect(cd.isPassed).toBe(false);
			expect(cd.days).toBeGreaterThanOrEqual(1);
		});

		it("should return isPassed true for past date", () => {
			const pastDate = new Date(Date.now() - 1000 * 60 * 60).toISOString();
			const cd = getCountdown(pastDate);
			expect(cd.isPassed).toBe(true);
			expect(cd.days).toBe(0);
		});
	});

	describe("createGoogleCalendarUrl", () => {
		it("should generate a valid Google Calendar URL", () => {
			const mockFixture: LfcFixture = {
				id: "12345",
				title: "Liverpool vs Fulham",
				date: "2026-09-12T14:00:00Z",
				homeTeam: "Liverpool",
				awayTeam: "Fulham",
				stadium: "Anfield",
				competition: "Premier League",
				isHome: true,
			};

			const url = createGoogleCalendarUrl(mockFixture);
			expect(url).toContain("calendar.google.com");
			expect(url).toContain("Liverpool");
			expect(url).toContain("Fulham");
			expect(url).toContain("Anfield");
		});
	});

	describe("normalizeTheSportsDbFixture", () => {
		it("should correctly normalize raw TheSportsDB event into LfcFixture", () => {
			const rawEvent: TheSportsDbEvent = {
				idEvent: "2494032",
				strEvent: "Liverpool vs Fulham",
				strLeague: "English Premier League",
				strLeagueBadge: "https://r2.thesportsdb.com/images/league.png",
				strSeason: "2026-2027",
				strHomeTeam: "Liverpool",
				strAwayTeam: "Fulham",
				intRound: "4",
				dateEvent: "2026-09-12",
				strTime: "14:00:00",
				strTimestamp: "2026-09-12T14:00:00",
				idHomeTeam: "133602",
				strHomeTeamBadge: "https://r2.thesportsdb.com/images/lfc.png",
				idAwayTeam: "133600",
				strAwayTeamBadge: "https://r2.thesportsdb.com/images/fulham.png",
				strVenue: "Anfield",
			};

			const fixture = normalizeTheSportsDbFixture(rawEvent);

			expect(fixture.id).toBe("2494032");
			expect(fixture.title).toBe("Liverpool vs Fulham");
			expect(fixture.homeTeam).toBe("Liverpool");
			expect(fixture.awayTeam).toBe("Fulham");
			expect(fixture.homeTeamBadge).toBe(
				"https://r2.thesportsdb.com/images/lfc.png",
			);
			expect(fixture.awayTeamBadge).toBe(
				"https://r2.thesportsdb.com/images/fulham.png",
			);
			expect(fixture.competition).toBe("English Premier League");
			expect(fixture.competitionBadge).toBe(
				"https://r2.thesportsdb.com/images/league.png",
			);
			expect(fixture.stadium).toBe("Anfield");
			expect(fixture.isHome).toBe(true);
			expect(fixture.round).toBe("Round 4");
			expect(fixture.date).toContain("2026-09-12");
		});
	});

	describe("calculateFixtureTtlSeconds", () => {
		it("should calculate TTL as strTimestamp + 1 day in seconds", () => {
			const now = new Date("2026-09-10T12:00:00Z").getTime();
			// Match is on 2026-09-12T14:00:00Z (2 days + 2 hours from now)
			// + 1 day = 2026-09-13T14:00:00Z (3 days + 2 hours from now)
			const strTimestamp = "2026-09-12 14:00:00";
			const ttl = calculateFixtureTtlSeconds(undefined, strTimestamp, now);

			const expectedSeconds = 3 * 24 * 3600 + 2 * 3600; // 3 days + 2 hours = 266400 seconds
			expect(ttl).toBe(expectedSeconds);
		});

		it("should use matchIsoDate if strTimestamp is missing", () => {
			const now = new Date("2026-09-10T12:00:00Z").getTime();
			const isoDate = "2026-09-11T12:00:00Z"; // 1 day from now
			// + 1 day = 2 days from now = 172800 seconds
			const ttl = calculateFixtureTtlSeconds(isoDate, undefined, now);

			expect(ttl).toBe(2 * 24 * 3600);
		});

		it("should fallback to 3600s if match date + 1 day is in the past", () => {
			const now = new Date("2026-09-10T12:00:00Z").getTime();
			const pastDate = "2026-09-01T12:00:00Z"; // 9 days ago
			const ttl = calculateFixtureTtlSeconds(pastDate, undefined, now);

			expect(ttl).toBe(3600);
		});

		it("should fallback to default 86400s if date is missing or invalid", () => {
			const ttl = calculateFixtureTtlSeconds(undefined, undefined);
			expect(ttl).toBe(86400);

			const invalidTtl = calculateFixtureTtlSeconds("invalid", "invalid");
			expect(invalidTtl).toBe(86400);
		});
	});
});
