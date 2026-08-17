import { describe, expect, it } from "vitest";
import {
	isLiverpoolHome,
	getMatchOutcome,
	formatMatchDate,
	getCountdown,
	createGoogleCalendarUrl,
} from "../utils";
import type { LfcFixtureResponse } from "../types";

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

	describe("getMatchOutcome", () => {
		it("should correctly identify Home WIN", () => {
			const mockFixture = {
				matchData: {
					homeTeam: "Liverpool",
					awayTeam: "Sunderland",
					result: {
						score: { home: 4, away: 2 },
					},
				},
			} as LfcFixtureResponse;

			const outcome = getMatchOutcome(mockFixture);
			expect(outcome.outcome).toBe("win");
			expect(outcome.label).toBe("WIN");
			expect(outcome.lfcScore).toBe(4);
			expect(outcome.opponentScore).toBe(2);
		});

		it("should correctly identify Away WIN", () => {
			const mockFixture = {
				matchData: {
					homeTeam: "Chelsea",
					awayTeam: "Liverpool",
					result: {
						score: { home: 1, away: 3 },
					},
				},
			} as LfcFixtureResponse;

			const outcome = getMatchOutcome(mockFixture);
			expect(outcome.outcome).toBe("win");
			expect(outcome.lfcScore).toBe(3);
			expect(outcome.opponentScore).toBe(1);
		});

		it("should correctly identify DRAW", () => {
			const mockFixture = {
				matchData: {
					homeTeam: "Liverpool",
					awayTeam: "Como 1907",
					result: {
						score: { home: 0, away: 0 },
					},
				},
			} as LfcFixtureResponse;

			const outcome = getMatchOutcome(mockFixture);
			expect(outcome.outcome).toBe("draw");
			expect(outcome.label).toBe("DRAW");
		});

		it("should correctly identify LOSS", () => {
			const mockFixture = {
				matchData: {
					homeTeam: "Liverpool",
					awayTeam: "Leeds",
					result: {
						score: { home: 2, away: 4 },
					},
				},
			} as LfcFixtureResponse;

			const outcome = getMatchOutcome(mockFixture);
			expect(outcome.outcome).toBe("loss");
			expect(outcome.label).toBe("LOSS");
		});
	});

	describe("formatMatchDate", () => {
		it("should handle valid ISO date", () => {
			const info = formatMatchDate("2026-08-23T15:30:00+00:00");
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
			const mockFixture = {
				title: "Newcastle vs Liverpool",
				matchData: {
					date: "2026-08-23T15:30:00+00:00",
					homeTeam: "Newcastle",
					awayTeam: "Liverpool",
					stadium: "St. James' Park",
					competition: { displayName: "Premier League" },
				},
			} as unknown as LfcFixtureResponse;

			const url = createGoogleCalendarUrl(mockFixture);
			expect(url).toContain("calendar.google.com");
			expect(url).toContain("Newcastle");
			expect(url).toContain("Liverpool");
		});
	});
});
