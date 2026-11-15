import { describe, expect, it } from "vitest";
import {
	completedIdxSession,
	idxEvidence,
	marketEvidence,
	sessionDate,
} from "../provenance";

describe("market provenance", () => {
	const now = "2026-11-15T10:00:00.000Z";
	it("cannot refresh an old observation by reading it again", () => {
		const result = marketEvidence(
			"Provider",
			"backup",
			"2026-11-01",
			now,
			2,
			now,
		);
		expect(result).toMatchObject({
			status: "stale",
			origin: "backup",
			asOf: "2026-11-01T00:00:00.000Z",
			retrievedAt: now,
		});
		expect(marketEvidence("Provider", "cache", undefined, now, 2).status).toBe(
			"missing",
		);
		expect(
			marketEvidence("Provider", "live", "2026-11-16", now, 2).status,
		).toBe("invalid");
	});

	it("checks completed sessions, weekends, and exchange holidays", () => {
		expect(sessionDate("2026-02-30")).toBeNull();
		expect(completedIdxSession("2026-11-15", now)).toBeNull();
		expect(
			completedIdxSession("2026-11-13", "2026-11-13T09:15:00Z"),
		).toBeNull();
		expect(idxEvidence("2026-11-13", now, "cache").status).toBe("current");
		expect(idxEvidence("2026-11-12", now, "backup").status).toBe("stale");
		expect(idxEvidence("2026-11-13", now, "static").status).toBe("stale");
		expect(
			completedIdxSession("2026-12-24", "2026-12-26T12:00:00Z"),
		).toBeNull();
		expect(
			idxEvidence("2026-12-23", "2026-12-27T12:00:00Z", "cache").status,
		).toBe("current");
	});
});
