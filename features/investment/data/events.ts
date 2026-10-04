export type MarketTarget = "Global" | "US" | "ID" | "Crypto";
export type EventImpact = "Critical" | "High" | "Medium";

export interface MacroCalendarEvent {
	id: string;
	date: string; // ISO date string "YYYY-MM-DD"
	title: string;
	market: MarketTarget;
	impact: EventImpact;
	notes: string;
}

export const MACRO_EVENTS: MacroCalendarEvent[] = [
	{
		id: "fomc-oct-2026",
		date: "2026-10-28",
		title: "FOMC Rate Decision",
		market: "US",
		impact: "Critical",
		notes:
			"Fed policy stance, terminal rate guidance, and balance sheet runoff pacing.",
	},
	{
		id: "us-cpi-nov-2026",
		date: "2026-11-12",
		title: "US CPI Inflation Print",
		market: "US",
		impact: "High",
		notes:
			"Core services and supercore inflation trajectory dictates rate cut timing.",
	},
	{
		id: "bi-rdg-nov-2026",
		date: "2026-11-19",
		title: "Bank Indonesia RDG Rate Decision",
		market: "ID",
		impact: "Critical",
		notes:
			"BI Rate decision and Rupiah stability measures directly impacting IHSG big banks.",
	},
	{
		id: "msci-nov-2026",
		date: "2026-11-30",
		title: "MSCI Semi-Annual Index Rebalance",
		market: "ID",
		impact: "High",
		notes:
			"Large passive rebalancing flow in IHSG constituents at market close.",
	},
	{
		id: "fomc-dec-2026",
		date: "2026-12-09",
		title: "FOMC Rate Decision & Summary of Economic Projections",
		market: "US",
		impact: "Critical",
		notes:
			"Updated Dot Plot, GDP forecasts, and forward interest rate projections.",
	},
	{
		id: "bi-rdg-dec-2026",
		date: "2026-12-17",
		title: "Bank Indonesia Year-End RDG",
		market: "ID",
		impact: "High",
		notes:
			"Year-end domestic liquidity positioning and banking reserve requirements.",
	},
	{
		id: "window-dressing-dec-2026",
		date: "2026-12-28",
		title: "IHSG Year-End Window Dressing Window",
		market: "ID",
		impact: "Medium",
		notes:
			"Institutional fund NAV maintenance typically supporting LQ45 blue-chips.",
	},
];

/**
 * Filter upcoming events from today onwards, sorted chronologically.
 */
export function getUpcomingEvents(
	limit = 6,
	marketFilter?: MarketTarget,
	now = new Date(),
): MacroCalendarEvent[] {
	const todayStr = now.toISOString().split("T")[0];

	return MACRO_EVENTS.filter((ev) => {
		if (ev.date < todayStr) return false;
		if (
			marketFilter &&
			marketFilter !== "Global" &&
			ev.market !== marketFilter
		) {
			return false;
		}
		return true;
	})
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, limit);
}
