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

/**
 * Calculates specific calendar milestone dates (e.g. 3rd Thursday, last Friday).
 */
function getNthWeekdayOfMonth(
	year: number,
	month: number, // 0-11
	dayOfWeek: number, // 0=Sun, 1=Mon, ..., 4=Thu, 5=Fri
	nth: number,
): Date {
	const firstDay = new Date(Date.UTC(year, month, 1));
	let dayDiff = dayOfWeek - firstDay.getUTCDay();
	if (dayDiff < 0) dayDiff += 7;
	const targetDay = 1 + dayDiff + (nth - 1) * 7;
	return new Date(Date.UTC(year, month, targetDay));
}

function getLastWeekdayOfMonth(
	year: number,
	month: number, // 0-11
	dayOfWeek: number, // 0=Sun, ..., 5=Fri
): Date {
	const lastDay = new Date(Date.UTC(year, month + 1, 0));
	let dayDiff = lastDay.getUTCDay() - dayOfWeek;
	if (dayDiff < 0) dayDiff += 7;
	const targetDay = lastDay.getUTCDate() - dayDiff;
	return new Date(Date.UTC(year, month, targetDay));
}

function toIsoDate(d: Date): string {
	return d.toISOString().split("T")[0];
}

/**
 * Algorithmic generator for recurring macroeconomic events across any calendar year.
 */
export function generateRecurrentEvents(
	startDate = new Date(),
	monthsAhead = 4,
): MacroCalendarEvent[] {
	const events: MacroCalendarEvent[] = [];
	const startYear = startDate.getUTCFullYear();
	const startMonth = startDate.getUTCMonth();

	for (let offset = 0; offset <= monthsAhead; offset++) {
		const targetDate = new Date(Date.UTC(startYear, startMonth + offset, 1));
		const y = targetDate.getUTCFullYear();
		const m = targetDate.getUTCMonth(); // 0-11
		const monthNum = m + 1;

		// 1. Bank Indonesia RDG (3rd Thursday of each month)
		const biRdgDate = getNthWeekdayOfMonth(y, m, 4, 3);
		events.push({
			id: `bi-rdg-${y}-${monthNum}`,
			date: toIsoDate(biRdgDate),
			title: "Bank Indonesia RDG Rate Decision",
			market: "ID",
			impact: "Critical",
			notes:
				"BI benchmark policy rate decision and Rupiah stability interventions directly impacting banking liquidity.",
		});

		// 2. US CPI Inflation Print (2nd Wednesday of each month)
		const usCpiDate = getNthWeekdayOfMonth(y, m, 3, 2);
		events.push({
			id: `us-cpi-${y}-${monthNum}`,
			date: toIsoDate(usCpiDate),
			title: "US CPI Inflation Print",
			market: "US",
			impact: "Critical",
			notes:
				"Headline and core inflation trends dictate Federal Reserve terminal rate trajectory and discount rates. Drives cross-asset volatility in Bitcoin and USD/IDR.",
		});

		// 3. Crypto Derivatives Monthly / Quarterly Expiry (Last Friday of each month)
		const cryptoExpiryDate = getLastWeekdayOfMonth(y, m, 5);
		const isQuarterly = [3, 6, 9, 12].includes(monthNum);
		events.push({
			id: `crypto-expiry-${y}-${monthNum}`,
			date: toIsoDate(cryptoExpiryDate),
			title: isQuarterly
				? "Quarterly Bitcoin & Crypto Mega Expiry"
				: "Monthly Crypto Derivatives Expiry",
			market: "Crypto",
			impact: isQuarterly ? "Critical" : "High",
			notes:
				"Deribit and CME options & futures settlement. Post-expiry volatility unwind historically triggers momentum continuation.",
		});

		// 4. FOMC Meetings (8 scheduled yearly meetings)
		const fomcMonths = [1, 3, 5, 6, 7, 9, 11, 12];
		if (fomcMonths.includes(monthNum)) {
			// Approximated near second/third Wednesday of scheduled FOMC months
			const fomcDate = getNthWeekdayOfMonth(y, m, 3, m === 0 ? 4 : 2);
			events.push({
				id: `fomc-${y}-${monthNum}`,
				date: toIsoDate(fomcDate),
				title: [3, 6, 9, 12].includes(monthNum)
					? "FOMC Rate Decision & Economic Projections (Dot Plot)"
					: "FOMC Rate Decision & Press Conference",
				market: "US",
				impact: "Critical",
				notes:
					"Federal Reserve interest rate policy, balance sheet runoff pacing, and economic projections.",
			});
		}

		// 5. MSCI Index Rebalance (End of Feb, May, Aug, Nov)
		if ([2, 5, 8, 11].includes(monthNum)) {
			const msciDate = new Date(Date.UTC(y, m + 1, 0)); // Last day of month
			events.push({
				id: `msci-${y}-${monthNum}`,
				date: toIsoDate(msciDate),
				title: [5, 11].includes(monthNum)
					? "MSCI Semi-Annual Index Rebalance"
					: "MSCI Quarterly Index Rebalance",
				market: "ID",
				impact: "High",
				notes:
					"Passive foreign institutional fund rebalancing flows in IDX constituents at market close.",
			});
		}

		// 6. Quarterly Window Dressing (Final trading sessions of Q1, Q2, Q3, Q4)
		if ([3, 6, 9, 12].includes(monthNum)) {
			const windowDressingDate = new Date(Date.UTC(y, m, 26));
			events.push({
				id: `window-dressing-${y}-${monthNum}`,
				date: toIsoDate(windowDressingDate),
				title: "IHSG Quarter-End Window Dressing",
				market: "ID",
				impact: "Medium",
				notes:
					"Institutional fund managers re-position balance sheets and NAVs, typically supporting LQ45 blue-chips.",
			});
		}

		// 7. Indonesian Big 4 Banks Earnings Reports (Jan, Apr, Jul, Oct)
		if ([1, 4, 7, 10].includes(monthNum)) {
			const earningsDate = new Date(Date.UTC(y, m, 23));
			events.push({
				id: `earnings-${y}-${monthNum}`,
				date: toIsoDate(earningsDate),
				title: "BBCA & Tier-1 Banks Quarterly Financial Results",
				market: "ID",
				impact: "High",
				notes:
					"Net interest margin (NIM), credit growth, and loan quality disclosures drive primary IDX institutional direction.",
			});
		}
	}

	return events;
}

/**
 * Returns the current date formatted as YYYY-MM-DD in the Asia/Jakarta timezone.
 */
export function getJakartaDateString(d: Date = new Date()): string {
	return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

/**
 * Calculates the number of weekdays (business days: Mon-Fri) remaining until targetDateStr.
 * Returns null if targetDate is in the past (before baseDate).
 * Returns 0 if targetDate is today.
 * Returns 1 if targetDate is tomorrow (or next business day if today is Friday).
 */
export function getWeekdayDistance(
	targetDateStr: string,
	baseDateStr?: string,
): number | null {
	const todayStr = baseDateStr ?? getJakartaDateString();
	if (targetDateStr < todayStr) return null;
	if (targetDateStr === todayStr) return 0;

	const [ty, tm, td] = targetDateStr.split("-").map(Number);
	const [by, bm, bd] = todayStr.split("-").map(Number);

	const target = new Date(Date.UTC(ty, tm - 1, td));
	const cur = new Date(Date.UTC(by, bm - 1, bd));

	let weekdays = 0;
	while (cur.getTime() < target.getTime()) {
		cur.setUTCDate(cur.getUTCDate() + 1);
		const day = cur.getUTCDay();
		if (day !== 0 && day !== 6) {
			weekdays++;
		}
	}

	return weekdays;
}

export interface CriticalPreAlert {
	event: MacroCalendarEvent;
	weekdaysLeft: number; // 0, 1, 2, or 3
	urgency: "imminent" | "upcoming";
	badgeText: string;
	headline: string;
	marketImpact: string;
}

/**
 * Identifies Critical macro events approaching within H-3 weekdays (0 to 3 business days).
 * Specifically targets catalysts that move IHSG and Crypto assets.
 */
export function getCriticalPreAlerts(
	events?: MacroCalendarEvent[],
	baseDate = new Date(),
): CriticalPreAlert[] {
	const allEvents = events ?? getUpcomingEvents(10, undefined, baseDate);
	const todayStr = getJakartaDateString(baseDate);

	const preAlerts: CriticalPreAlert[] = [];

	for (const ev of allEvents) {
		if (ev.impact !== "Critical") continue;

		const weekdays = getWeekdayDistance(ev.date, todayStr);
		if (weekdays === null || weekdays > 3) continue;

		// Explain how it specifically impacts IHSG and Crypto
		let marketImpact = "";
		if (ev.market === "ID") {
			marketImpact =
				"Direct impact on Bank Indonesia policy rates, Rupiah FX intervention, and domestic banking liquidity. High volatility risk for IHSG LQ45 blue chips.";
		} else if (ev.market === "Crypto") {
			marketImpact =
				"Major crypto options & futures settlement. Pre-expiry volatility compression typically followed by high momentum expansion across Bitcoin and digital assets.";
		} else if (ev.market === "US" || ev.market === "Global") {
			marketImpact =
				"Benchmark interest rate & inflation expectations shift. Directly drives US Dollar (DXY) momentum, foreign institutional capital flow on IDX, and Bitcoin macro valuation.";
		}

		const badgeText =
			weekdays === 0
				? "H-0 (Today)"
				: `H-${weekdays} Weekday${weekdays > 1 ? "s" : ""}`;

		preAlerts.push({
			event: ev,
			weekdaysLeft: weekdays,
			urgency: weekdays <= 1 ? "imminent" : "upcoming",
			badgeText,
			headline: `${badgeText} Pre-Alert: ${ev.title}`,
			marketImpact,
		});
	}

	return preAlerts.sort((a, b) => a.weekdaysLeft - b.weekdaysLeft);
}

/**
 * Filter upcoming events from today onwards, sorted chronologically.
 * Dynamically generated so events perpetually exist across all years.
 */
export function getUpcomingEvents(
	limit = 6,
	marketFilter?: MarketTarget,
	now = new Date(),
): MacroCalendarEvent[] {
	const todayStr = getJakartaDateString(now);
	const events = generateRecurrentEvents(now, 5);

	return events
		.filter((ev) => {
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
