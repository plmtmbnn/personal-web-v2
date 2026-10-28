import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/historical-trade/route";
import * as authActions from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

describe("POST /api/admin/historical-trade", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 401 Unauthorized if user is not admin", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(false);

		const req = new Request("http://localhost/api/admin/historical-trade", {
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

		const req = new Request("http://localhost/api/admin/historical-trade", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "http://not-https.com",
				token: "",
				symbol: "INVALID_TICKER_TOO_LONG",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("forwards request upstream with Bearer auth and returns response", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fakeResponse = {
			message: "Success",
			data: {
				result: [
					{
						date: "2026-10-27",
						close: 100,
						change: 0,
						value: 1000,
						volume: 10,
						frequency: 1,
						foreign_buy: 0,
						foreign_sell: 0,
						net_foreign: 0,
						open: 100,
						high: 100,
						low: 100,
						average: 100,
						change_percentage: 0,
					},
				],
				paginate: { next_page: "" },
			},
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => JSON.stringify(fakeResponse),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/historical-trade", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
				period: "HS_PERIOD_DAILY",
				startDate: "2025-10-27",
				endDate: "2026-10-27",
				limit: 50,
				page: 1,
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.result).toHaveLength(1);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [calledUrl, options] = fetchMock.mock.calls[0];
		expect(calledUrl).toContain(
			"https://api.broker.co.id/company-price-feed/historical/summary/DOOH",
		);
		expect(calledUrl).toContain("period=HS_PERIOD_DAILY");
		expect(calledUrl).toContain("start_date=2025-10-27");
		expect(calledUrl).toContain("end_date=2026-10-27");
		expect(calledUrl).toContain("limit=50");
		expect(calledUrl).toContain("page=1");
		expect(options.headers.authorization).toBe("Bearer valid-jwt-token");
	});

	it("returns 429 when upstream returns 429", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			headers: new Headers({ "retry-after": "30" }),
			text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/historical-trade", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
				startDate: "2025-10-27",
				endDate: "2026-10-27",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(429);
		const json = await res.json();
		expect(json.retryAfterSeconds).toBe(30);
	});
});
