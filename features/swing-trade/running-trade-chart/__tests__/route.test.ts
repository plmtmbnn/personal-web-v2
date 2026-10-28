import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/admin/running-trade-chart/route";
import * as authActions from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
	checkAdmin: vi.fn(),
}));

describe("POST /api/admin/running-trade-chart", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("returns 401 Unauthorized if user is not admin", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(false);

		const req = new Request("http://localhost/api/admin/running-trade-chart", {
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

		const req = new Request("http://localhost/api/admin/running-trade-chart", {
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

	it("forwards request upstream to /order-trade/running-trade/chart/[SYMBOL] with Bearer auth and query params", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fakeResponse = {
			message: "Success",
			data: {
				from: "2025-07-27",
				to: "2025-10-27",
				data_last_updated: "2025-10-27 16:00:00",
				date_session_info: "Continuous Session",
				price_chart_data: [
					{
						date: "2025-10-27",
						time: "10:00:00",
						datetime_label: "2025-10-27 10:00:00",
						value: { raw: "120", formatted: "120" },
						open: null,
						high: null,
						low: null,
					},
				],
				broker_chart_data: [
					{
						type: "NET",
						brokers: ["YP", "PD"],
						charts: [
							{
								broker_code: "YP",
								chart: [
									{
										date: "2025-10-27",
										time: "10:00:00",
										datetime_label: "2025-10-27 10:00:00",
										value: { raw: "150000000", formatted: "150M" },
										open: null,
										high: null,
										low: null,
									},
								],
							},
						],
					},
				],
			},
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			text: async () => JSON.stringify(fakeResponse),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/running-trade-chart", {
			method: "POST",
			body: JSON.stringify({
				baseUrl: "https://api.broker.co.id",
				token: "valid-jwt-token",
				symbol: "DOOH",
				period: "RT_PERIOD_LAST_3_MONTHS",
				investorType: "INVESTOR_TYPE_ALL",
				marketBoard: "BOARD_TYPE_REGULAR",
			}),
		});

		const res = await POST(req);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.data.price_chart_data).toHaveLength(1);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const [calledUrl, options] = fetchMock.mock.calls[0];
		expect(calledUrl).toContain(
			"https://api.broker.co.id/order-trade/running-trade/chart/DOOH",
		);
		expect(calledUrl).toContain("period=RT_PERIOD_LAST_3_MONTHS");
		expect(calledUrl).toContain("investor_type=INVESTOR_TYPE_ALL");
		expect(calledUrl).toContain("market_board=BOARD_TYPE_REGULAR");
		expect(options.headers.authorization).toBe("Bearer valid-jwt-token");
	});

	it("returns 429 when upstream returns 429", async () => {
		vi.spyOn(authActions, "checkAdmin").mockResolvedValue(true);

		const fetchMock = vi.fn().mockResolvedValue({
			ok: false,
			status: 429,
			headers: new Headers({ "retry-after": "45" }),
			text: async () => JSON.stringify({ message: "Rate limit exceeded" }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const req = new Request("http://localhost/api/admin/running-trade-chart", {
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
