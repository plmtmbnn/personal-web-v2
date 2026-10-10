import { describe, expect, it } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import EventCalendar from "../EventCalendar";
import {
	getWeekdayDistance,
	getCriticalPreAlerts,
	type MacroCalendarEvent,
} from "../../data/events";

describe("EventCalendar Component", () => {
	it("renders calendar catalysts header and default active events", () => {
		const { container } = render(<EventCalendar />);

		expect(container.textContent).toContain("Upcoming Catalysts & Risk Events");
		expect(container.textContent).toContain("All Catalysts");
		expect(container.textContent).toContain("Indonesia (IDX)");
		expect(container.textContent).toContain("Crypto");
		expect(container.textContent).toContain("US & Fed");
	});

	it("filters events by market when filter pill is clicked", () => {
		const { getByText, container } = render(<EventCalendar />);

		const cryptoFilter = getByText("Crypto");
		fireEvent.click(cryptoFilter);

		// Component renders filtered list without crashing
		expect(container.textContent).toContain("Upcoming Catalysts & Risk Events");
	});

	it("calculates weekday distance correctly skipping weekends", () => {
		// Monday to Thursday = 3 weekdays
		expect(getWeekdayDistance("2026-10-15", "2026-10-12")).toBe(3);

		// Friday to Monday = 1 weekday
		expect(getWeekdayDistance("2026-10-19", "2026-10-16")).toBe(1);

		// Friday to Wednesday = 3 weekdays
		expect(getWeekdayDistance("2026-10-21", "2026-10-16")).toBe(3);

		// Same day = 0 weekdays
		expect(getWeekdayDistance("2026-10-15", "2026-10-15")).toBe(0);

		// Past date = null
		expect(getWeekdayDistance("2026-10-10", "2026-10-15")).toBeNull();
	});

	it("identifies Critical catalysts within H-3 weekday window", () => {
		const mockEvents: MacroCalendarEvent[] = [
			{
				id: "bi-rdg-test",
				date: "2026-10-15", // Thursday
				title: "Bank Indonesia RDG Rate Decision",
				market: "ID",
				impact: "Critical",
				notes: "BI rate decision.",
			},
			{
				id: "msci-test",
				date: "2026-10-15",
				title: "MSCI Rebalance",
				market: "ID",
				impact: "High", // High, not Critical
				notes: "Passive flow.",
			},
			{
				id: "future-fomc",
				date: "2026-10-29", // > 3 weekdays away
				title: "FOMC Meeting",
				market: "US",
				impact: "Critical",
				notes: "Fed rate.",
			},
		];

		// Base date: Monday Oct 12 (3 weekdays until Oct 15)
		const baseDate = new Date("2026-10-12T04:00:00Z");
		const preAlerts = getCriticalPreAlerts(mockEvents, baseDate);

		expect(preAlerts).toHaveLength(1);
		expect(preAlerts[0].event.id).toBe("bi-rdg-test");
		expect(preAlerts[0].weekdaysLeft).toBe(3);
		expect(preAlerts[0].badgeText).toBe("H-3 Weekdays");
		expect(preAlerts[0].marketImpact).toContain("IHSG");
	});
});
