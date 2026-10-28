import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/trade-book-5m/route";
import * as authActions from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

describe("POST /api/admin/trade-book-5m", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 401 Unauthorized if user is not admin", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(false);

		const req = new Request("http://localhost/api/admin/trade-book-5m", {
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

		const req = new Request("http://localhost/api/admin/trade-book-5m", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "http://insecure.com",
				token: "",
				symbol: "INVALID_TICKER_SYMBOL_TOO_LONG",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(400);
	});

	it("forwards request upstream to /order-trade/trade-book/chart with Bearer auth and query params", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fakeResponse = {
			message: "Success",
			data: {
				book_total: {
					total_lot: "1000",
					buy_lot: "600",
					sell_lot: "400",
					buy_percentage: "60.0",
					sell_percentage: "40.0",
				},
				prices: [],
				net_values: [],
				big_money_net_values: [],
				buy: [],
				sell: [],
				from: "2025-09-27",
				to: "2025-10-27",
			},
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => JSON.stringify(fakeResponse),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/trade-book-5m", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
				period: "DATE_PICKER_PERIOD_LAST_1_MONTH",
				timeInterval: "5m",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.book_total.total_lot).toBe("1000");

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [calledUrl, options] = fetchMock.mock.calls[0];
		expect(calledUrl).toContain(
			"https://api.broker.co.id/order-trade/trade-book/chart",
		);
		expect(calledUrl).toContain("symbol=DOOH");
		expect(calledUrl).toContain("time_interval=5m");
		expect(calledUrl).toContain("period=DATE_PICKER_PERIOD_LAST_1_MONTH");
		expect(options.headers.authorization).toBe("Bearer valid-jwt-token");
	});

	it("returns 429 when upstream returns 429", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			headers: new Headers({ "retry-after": "60" }),
			text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/trade-book-5m", {
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
		expect(json.retryAfterSeconds).toBe(60);
	});
});
