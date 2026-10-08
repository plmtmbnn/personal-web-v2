import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchBitcoinMvrv } from "../onchain";

describe("fetchBitcoinMvrv", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("successfully fetches MVRV ratio and returns latest data point", async () => {
		const mockResponse = {
			status: "ok",
			values: [
				{ x: 1791000000, y: 1.48 },
				{ x: 1791100000, y: 1.53 },
			],
		};

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await fetchBitcoinMvrv({ fresh: true, revalidate: 21600 });

		expect(result).toBe(1.53);
		expect(fetchMock).toHaveBeenCalledTimes(1);
		const requestedUrl = fetchMock.mock.calls[0][0] as string;
		expect(requestedUrl).toContain("metadata=false");
		expect(requestedUrl).toContain("cors=true");
	});

	it("falls back to secondary timeframe if first endpoint fails", async () => {
		const mockResponse = {
			status: "ok",
			values: [{ x: 1791200000, y: 1.62 }],
		};

		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: false,
				status: 404,
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});
		vi.stubGlobal("fetch", fetchMock);

		const result = await fetchBitcoinMvrv({ fresh: true, revalidate: 21600 });

		expect(result).toBe(1.62);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1][0]).toContain("timespan=30days");
	});

	it("returns null if all endpoints fail or return empty values", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ status: "ok", values: [] }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await fetchBitcoinMvrv({ fresh: true, revalidate: 21600 });

		expect(result).toBeNull();
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("returns null on fetch error / network exception", async () => {
		const fetchMock = vi.fn().mockRejectedValue(new Error("Network failure"));
		vi.stubGlobal("fetch", fetchMock);

		const result = await fetchBitcoinMvrv({ fresh: true, revalidate: 21600 });

		expect(result).toBeNull();
	});

	it("fetches live MVRV data from blockchain.info directly", async () => {
		vi.unstubAllGlobals();
		const result = await fetchBitcoinMvrv({ fresh: true, revalidate: 21600 });
		expect(result).not.toBeNull();
		expect(typeof result).toBe("number");
		expect(result!).toBeGreaterThan(0.5);
		expect(result!).toBeLessThan(10);
	});
});
