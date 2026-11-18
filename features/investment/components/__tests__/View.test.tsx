import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { refreshInvestmentCompass } from "../../server-actions";
import type { InvestmentCompassData } from "../../types";
import InvestmentCompassView from "../View";

vi.mock("../../server-actions", () => ({ refreshInvestmentCompass: vi.fn() }));
vi.mock("../../lib/engine/index", () => ({ computeCompass: () => null }));
vi.mock("../MarketDataHub", () => ({ default: () => null }));
vi.mock("../EventCalendar", () => ({ default: () => null }));

const data: InvestmentCompassData = {
	sentiment: { crypto: null },
	markets: { quotes: {}, macro: {}, cryptoGlobal: null },
	sources: { fred: { ok: true, label: "FRED Macro" } },
	fetchedAt: "2026-11-18T12:00:00Z",
};

afterEach(() => vi.restoreAllMocks());

describe("InvestmentCompassView", () => {
	it("focuses source details and returns focus to the trigger on Escape", () => {
		const { getByRole, queryByRole } = render(
			<InvestmentCompassView initialData={data} />,
		);
		const trigger = getByRole("button", { name: /Sources: Current/ });
		fireEvent.click(trigger);
		expect(getByRole("dialog", { name: "Data sources" })).toBeDefined();
		expect(document.activeElement).toBe(
			getByRole("button", { name: "Close data sources" }),
		);
		fireEvent.keyDown(window, { key: "Escape" });
		expect(queryByRole("dialog")).toBeNull();
		expect(document.activeElement).toBe(trigger);
		expect(trigger.getAttribute("aria-expanded")).toBe("false");
	});

	it("keeps loaded data after a failed refresh and allows retry", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		vi.mocked(refreshInvestmentCompass)
			.mockRejectedValueOnce(new Error("Provider timeout"))
			.mockResolvedValueOnce(data);
		const { getByRole, queryByRole, getByText } = render(
			<InvestmentCompassView initialData={data} />,
		);
		fireEvent.click(getByRole("button", { name: "Refresh market data" }));
		await waitFor(() =>
			expect(getByRole("alert").textContent).toContain(
				"Showing the last loaded data.",
			),
		);
		expect(getByText(/Updated 18\/11\/2026/)).toBeDefined();
		fireEvent.click(getByRole("button", { name: "Retry" }));
		await waitFor(() => expect(queryByRole("alert")).toBeNull());
		expect(refreshInvestmentCompass).toHaveBeenCalledTimes(2);
	});
});
