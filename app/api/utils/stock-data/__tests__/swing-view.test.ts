import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getIdxPosture } from "@/features/investment/lib/idx-posture";
import type { ResearchSnapshot } from "@/features/utils/stock-tools/stock-explorer/utils/idx-research";
import { getStockDataSnapshot, redis } from "@/lib/core/redis";
import { readIdxResearch } from "@/services/market-data/idx-research-store";
import { GET } from "../route";

vi.mock("@/features/investment/actions", () => ({
	getCachedInvestmentCompass: vi.fn(async () => ({})),
}));
vi.mock("@/features/investment/lib/idx-posture", () => ({
	getIdxPosture: vi.fn(),
}));
vi.mock("@/lib/core/redis", () => ({
	CACHE_KEYS: { COMPASS_SNAPSHOT: (day: string) => `compass:${day}` },
	getStockDataSnapshot: vi.fn(),
	getTickerHistoryRingBuffer: vi.fn(),
	redis: { get: vi.fn() },
}));
vi.mock("@/services/market-data/idx-research-store", () => ({
	readIdxResearch: vi.fn(),
}));
vi.mock("@/services/market-data/idx-flows", () => ({
	syncIdxStockSummary: vi.fn(),
}));

const request = () =>
	GET(new NextRequest("http://localhost/api/utils/stock-data?view=swing"));
const research = {
	session: "2026-11-23",
	results: { TEST: { criteria: { history: "pass" } } },
	swingScan: { candidates: [{ symbol: "TEST" }], missingEvidence: 0 },
} as unknown as ResearchSnapshot;
const posture = {
	session: research.session,
	isTradingLocked: false,
	permissions: { swing: { status: "selective" } },
} as NonNullable<ReturnType<typeof getIdxPosture>>;

describe("IDX scanner data view", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-11-24T09:00:00+07:00"));
		vi.mocked(readIdxResearch).mockResolvedValue(research);
		vi.mocked(redis.get).mockResolvedValue({});
		vi.mocked(getIdxPosture).mockReturnValue(posture);
	});
	afterEach(() => vi.useRealTimers());

	it("serves the verified close during the next open without refreshing intraday quotes", async () => {
		const response = await request();
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(await response.json()).toEqual({
			closeSession: "2026-11-23",
			openingSession: "2026-11-24",
			candidates: [{ symbol: "TEST" }],
			reason: null,
		});
		expect(getStockDataSnapshot).not.toHaveBeenCalled();
		expect(redis.get).toHaveBeenCalledWith("compass:2026-11-23");
	});

	it("suppresses a stale scan and refuses stale or locked Compass permission", async () => {
		vi.mocked(getIdxPosture).mockReturnValue({
			...posture,
			session: "2026-11-20",
		});
		expect(await (await request()).json()).toMatchObject({
			candidates: [],
			reason: expect.stringContaining("Compass permission"),
		});
		vi.mocked(getIdxPosture).mockReturnValue({
			...posture,
			isTradingLocked: true,
		});
		expect(await (await request()).json()).toMatchObject({
			candidates: [],
			reason: "Compass has paused new swing entries.",
		});
		vi.setSystemTime(new Date("2026-11-24T16:31:00+07:00"));
		expect(await (await request()).json()).toMatchObject({
			candidates: [],
			openingSession: null,
			reason: expect.stringContaining("verified IDX close"),
		});
	});

	it("distinguishes an empty result from incomplete turnover evidence", async () => {
		vi.mocked(readIdxResearch).mockResolvedValue({
			...research,
			swingScan: { candidates: [], missingEvidence: 1 },
		});
		expect(await (await request()).json()).toMatchObject({
			candidates: [],
			reason: expect.stringContaining("verified turnover"),
		});
		vi.mocked(readIdxResearch).mockResolvedValue({
			...research,
			swingScan: { candidates: [], missingEvidence: 0 },
		});
		expect(await (await request()).json()).toMatchObject({
			candidates: [],
			reason: null,
		});
	});
});
