import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/market-detector/route";
import * as authActions from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

describe("POST /api/admin/market-detector", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 401 Unauthorized if user is not admin", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(false);

		const req = new Request("http://localhost/api/admin/market-detector", {
			method: "POST",
			body: JSON.stringify({}),
		});

		const res = await POST(req);
		expect(res.status).toBe(401);
		const json = await res.json();
		expect(json.error).toBe("Unauthorized");
	});

	it("returns 400 Bad Request for invalid body parameters", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const req = new Request("http://localhost/api/admin/market-detector", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "http://insecure.com",
				token: "",
				symbol: "INVALID_SYMBOL_TOO_LONG",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("forwards request upstream to /marketdetectors with Bearer auth and query params", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fakeResponse = {
			message: "Success",
			data: {
				bandar_detector: {
					broker_accdist: "ACCUMULATION",
					total_buyer: 15,
					total_seller: 10,
					volume: 50000,
					value: 500000000,
					average: 100,
					number_broker_buysell: 25,
					top1: {
						accdist: "ACCUMULATION",
						amount: 1000,
						percent: 20,
						vol: 100,
					},
					top3: {
						accdist: "ACCUMULATION",
						amount: 2000,
						percent: 40,
						vol: 200,
					},
					top5: {
						accdist: "ACCUMULATION",
						amount: 3000,
						percent: 60,
						vol: 300,
					},
					top10: {
						accdist: "ACCUMULATION",
						amount: 4000,
						percent: 80,
						vol: 400,
					},
					avg: { accdist: "ACCUMULATION", amount: 500, percent: 10, vol: 50 },
					avg5: { accdist: "ACCUMULATION", amount: 600, percent: 12, vol: 60 },
				},
				broker_summary: {
					brokers_buy: [],
					brokers_sell: [],
					symbol: "DOOH",
				},
				from: "2025-07-27",
				to: "2025-10-27",
			},
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => JSON.stringify(fakeResponse),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/market-detector", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
				period: "BROKER_SUMMARY_PERIOD_LAST_3_MONTHS",
				marketBoard: "MARKET_BOARD_REGULER",
				investorType: "INVESTOR_TYPE_ALL",
				transactionType: "TRANSACTION_TYPE_NET",
				limit: 25,
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.bandar_detector.broker_accdist).toBe("ACCUMULATION");

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [calledUrl, options] = fetchMock.mock.calls[0];
		expect(calledUrl).toContain(
			"https://api.broker.co.id/marketdetectors/DOOH",
		);
		expect(calledUrl).toContain("period=BROKER_SUMMARY_PERIOD_LAST_3_MONTHS");
		expect(calledUrl).toContain("market_board=MARKET_BOARD_REGULER");
		expect(calledUrl).toContain("transaction_type=TRANSACTION_TYPE_NET");
		expect(calledUrl).toContain("investor_type=INVESTOR_TYPE_ALL");
		expect(calledUrl).toContain("limit=25");
		expect(options.headers.authorization).toBe("Bearer valid-jwt-token");
	});

	it("returns 429 when upstream returns 429 with retry-after header", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			headers: new Headers({ "retry-after": "45" }),
			text: async () => JSON.stringify({ message: "Too many requests" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/market-detector", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(429);
		const json = await res.json();
		expect(json.retryAfterSeconds).toBe(45);
	});
});
