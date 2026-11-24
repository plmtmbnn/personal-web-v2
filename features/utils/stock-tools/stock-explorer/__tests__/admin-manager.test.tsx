import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("../components/dashboard/ResearchSyncStatus", () => ({
	ResearchSyncStatus: () => null,
}));

import StockImportAdmin from "../components/AdminStockExplorerView";

afterEach(() => vi.unstubAllGlobals());

const stock = {
	StockCode: "BBCA",
	StockName: "Bank Central Asia",
	Date: "2026-11-24",
	Close: 10000,
	Volume: 1000,
	Value: 10000000,
	ForeignBuy: 100,
	ForeignSell: 50,
};

describe("Stock Explorer Manager import flow", () => {
	it("keeps samples read-only and confirms replacement of a stored dataset", async () => {
		const fetcher = vi.fn(async (_url: string, options?: RequestInit) => {
			if (options?.method === "POST")
				return Response.json({ message: "Imported stock data." });
			return Response.json({
				available: true,
				count: 1,
				lastDate: "2026-11-24",
				state: "active",
				ttlSeconds: 3600,
			});
		});
		vi.stubGlobal("fetch", fetcher);
		render(<StockImportAdmin />);
		await screen.findByText("Active Cache");

		fireEvent.click(screen.getByRole("button", { name: "Sample Banks" }));
		const editor = screen.getByRole("textbox", { name: /Stock summary JSON/ });
		expect(editor).toHaveProperty("readOnly", true);
		expect(
			screen.getByRole("button", { name: "Import to Redis" }),
		).toHaveProperty("disabled", true);
		expect(fetcher).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole("button", { name: "Clear" }));
		fireEvent.change(editor, {
			target: { value: JSON.stringify({ data: [stock] }) },
		});
		expect(screen.getByRole("button", { name: "Sample Banks" })).toHaveProperty(
			"disabled",
			true,
		);
		fireEvent.click(screen.getByRole("button", { name: "Import to Redis" }));
		expect(fetcher).toHaveBeenCalledTimes(1);
		fireEvent.click(
			await screen.findByRole("button", { name: "Replace Registry" }),
		);
		await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(3));
		expect(fetcher).toHaveBeenCalledWith(
			"/api/admin/import-stock",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("shows validation errors and reports a failed live sync", async () => {
		const fetcher = vi.fn(async (_url: string, options?: RequestInit) => {
			if (options?.method === "POST")
				return Response.json(
					{ success: false, error: "IDX service unavailable" },
					{ status: 503 },
				);
			return Response.json({
				available: false,
				count: 0,
				lastDate: null,
				state: "empty",
				ttlSeconds: null,
			});
		});
		vi.stubGlobal("fetch", fetcher);
		render(<StockImportAdmin />);
		await screen.findByText("No Cache / Expired");
		fireEvent.click(screen.getByRole("button", { name: "Sync Live" }));
		await screen.findByText("IDX service unavailable");

		fireEvent.change(
			screen.getByRole("textbox", { name: /Stock summary JSON/ }),
			{
				target: { value: "{" },
			},
		);
		expect(screen.getByText("Invalid JSON syntax.")).toHaveProperty(
			"id",
			"stock-import-error",
		);
		expect(fetcher).toHaveBeenCalledTimes(2);
	});
});
