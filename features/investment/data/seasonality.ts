export interface SeasonalityWindow {
	id: string;
	title: string;
	market: "ID" | "Crypto";
	months: number[]; // 1-12
	status: "Bullish Tendency" | "Defensive / Consolidation" | "Event Driven";
	description: string;
	tacticalPlay: string;
}

export const SEASONALITY_WINDOWS: SeasonalityWindow[] = [
	{
		id: "ihsg-dividends",
		title: "Big Dividend Season (Musim Dividen)",
		market: "ID",
		months: [3, 4, 5], // Mar, Apr, May
		status: "Event Driven",
		description:
			"Blue chips (BBRI, BMRI, BBNI, BBCA, ASII, ADRO, PTBA) report FY earnings and announce annual dividend yields.",
		tacticalPlay:
			"Accumulate high-yield leaders before cum-date. Beware of massive ex-date dividend traps on cyclical commodity miners.",
	},
	{
		id: "ihsg-sell-in-may",
		title: "Post-Dividend Summer Lull",
		market: "ID",
		months: [6, 7, 8],
		status: "Defensive / Consolidation",
		description:
			"Volume typically dries up as domestic institutional managers lock in H1 performance and foreign participation thins.",
		tacticalPlay:
			"Reduce trade frequency. Accumulate quality pullbacks near the 200-day moving average. Avoid illiquid second-liners.",
	},
	{
		id: "ihsg-window-dressing",
		title: "Year-End Window Dressing",
		market: "ID",
		months: [11, 12],
		status: "Bullish Tendency",
		description:
			"Fund managers optimize year-end balance sheets and NAVs. Historically IHSG posts positive returns in December ~80% of years.",
		tacticalPlay:
			"Ride index heavyweight momentum with trailing stops. Take partial profits into strength before the final session.",
	},
	{
		id: "crypto-q4-liquidity",
		title: "Crypto Q4 Liquidity Expansion",
		market: "Crypto",
		months: [10, 11, 12],
		status: "Bullish Tendency",
		description:
			"Historically, Q4 provides the strongest quarterly returns for Bitcoin, especially in post-halving years.",
		tacticalPlay:
			"Hold core BTC/ETH positions above 200D MA. Maintain trailing stop-losses to protect against sudden leverage flush-outs.",
	},
];

/**
 * Gets currently active seasonal windows based on current month.
 */
export function getActiveSeasonality(now = new Date()): SeasonalityWindow[] {
	const currentMonth = now.getMonth() + 1; // 1-12
	return SEASONALITY_WINDOWS.filter((w) => w.months.includes(currentMonth));
}
