import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SwingShortlist from "../components/dashboard/SwingShortlist";
import type { SwingScanResponse } from "../utils/idx-research";

vi.mock("recharts", () => ({
	ResponsiveContainer: () => null,
	Line: () => null,
	LineChart: () => null,
	ReferenceLine: () => null,
	Tooltip: () => null,
	XAxis: () => null,
	YAxis: () => null,
}));

const scan: SwingScanResponse = {
	closeSession: "2026-11-23",
	openingSession: "2026-11-24",
	reason: null,
	candidates: [
		{
			symbol: "TEST",
			close: 1010,
			pivot: 1000,
			entryLow: 1005,
			entryHigh: 1020,
			stop: 980,
			target: 1150,
			resistance: 1155,
			resistanceSession: "2026-10-02",
			breakoutVolume: 1.8,
			medianTurnover: 6_350_000_000,
			netRAtClose: 2.85,
			netRAtCap: 2.14,
			chart: [{ session: "2026-11-23", close: 1010 }],
		},
	],
};

describe("Opening shortlist", () => {
	it("shows executable levels and discloses the evidence from either layout", () => {
		render(<SwingShortlist scan={scan} />);
		const table = within(screen.getByRole("table"));
		const card = within(screen.getByRole("list"));
		expect(table.getByText("Rp 1.005 to Rp 1.020")).toBeTruthy();
		expect(table.getByText("2.14R")).toBeTruthy();
		const desktop = table.getByRole("button", { name: /TEST/ });
		fireEvent.click(desktop);
		expect(desktop.getAttribute("aria-expanded")).toBe("true");
		expect(table.getByText("20-session median turnover")).toBeTruthy();
		const mobile = card.getByRole("button", { name: /TEST/ });
		fireEvent.click(mobile);
		expect(mobile.getAttribute("aria-expanded")).toBe("true");
		expect(card.getByText("Rp 6.350.000.000")).toBeTruthy();
		expect(desktop.getAttribute("aria-expanded")).toBe("false");
	});

	it("shows why a scan is blocked and distinguishes a valid empty result", () => {
		const { rerender } = render(
			<SwingShortlist
				scan={{
					...scan,
					candidates: [],
					reason: "Waiting for Compass permission.",
				}}
			/>,
		);
		expect(screen.getByRole("status").textContent).toBe(
			"Waiting for Compass permission.",
		);
		rerender(<SwingShortlist scan={{ ...scan, candidates: [] }} />);
		expect(screen.getByRole("status").textContent).toBe(
			"No qualifying breakouts",
		);
	});
});
