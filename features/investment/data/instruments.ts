/**
 * Instrument registry for the Investment Compass.
 * Curated specifically for IHSG, Crypto, and vital regional transmission anchors.
 * Each instrument resolves via CNBC first, then Yahoo as fallback.
 */

export type InstrumentGroup =
	| "us"
	| "asia"
	| "fx"
	| "rates"
	| "crypto"
	| "sector"
	| "commodity";

export type ValueFormat = "index" | "usd" | "fx" | "yield";

export interface Instrument {
	id: string;
	cnbc?: string;
	yahoo?: string;
	label: string;
	/** One-line context on why this instrument matters. */
	detail: string;
	group: InstrumentGroup;
	format: ValueFormat;
	decimals?: number;
	/** Country / market tag shown beside the label. */
	market?: string;
	/** True when a rising value is a headwind for risk assets (VIX, DXY, yields). */
	inverse?: boolean;
}

export const IHSG_ID = "JKSE";

export const INSTRUMENTS: readonly Instrument[] = [
	// ── United States (Overnight Transmission) ────────────────────
	{
		id: "SPX",
		cnbc: ".SPX",
		yahoo: "^GSPC",
		label: "S&P 500",
		detail: "US broad market benchmark & global risk appetite",
		group: "us",
		format: "index",
		market: "US",
	},
	{
		id: "IXIC",
		cnbc: ".IXIC",
		yahoo: "^IXIC",
		label: "Nasdaq Composite",
		detail: "Tech & growth bellwether, risk beta proxy",
		group: "us",
		format: "index",
		market: "US",
	},

	// ── Asia Pacific (Regional Contagion Anchors) ─────────────────
	{
		id: "JKSE",
		yahoo: "^JKSE",
		label: "IHSG",
		detail: "Indonesia composite, home market",
		group: "asia",
		format: "index",
		market: "ID",
	},
	{
		id: "HSI",
		cnbc: ".HSI",
		yahoo: "^HSI",
		label: "Hang Seng",
		detail: "Hong Kong & China contagion proxy",
		group: "asia",
		format: "index",
		market: "HK",
	},
	{
		id: "N225",
		cnbc: ".N225",
		yahoo: "^N225",
		label: "Nikkei 225",
		detail: "Japan export & Asian session leader",
		group: "asia",
		format: "index",
		market: "JP",
	},

	// ── Currencies & FX ───────────────────────────────────────────
	{
		id: "DXY",
		cnbc: ".DXY",
		yahoo: "DX-Y.NYB",
		label: "US Dollar Index",
		detail: "Global liquidity & dollar strength proxy",
		group: "fx",
		format: "index",
		inverse: true,
	},
	{
		id: "USDIDR",
		cnbc: "USDIDR=",
		yahoo: "IDR=X",
		label: "USD / IDR",
		detail: "Bank Indonesia exchange rate & capital outflow driver",
		group: "fx",
		format: "fx",
		inverse: true,
	},
	{
		id: "USDJPY",
		cnbc: "JPY=",
		yahoo: "JPY=X",
		label: "USD / JPY",
		detail: "Yen carry-trade unwinding barometer & global risk proxy",
		group: "fx",
		format: "fx",
		decimals: 2,
		market: "JP",
	},

	// ── Treasury & Volatility Fear Gauges ──────────────────────────
	{
		id: "US10Y",
		cnbc: "US10Y",
		yahoo: "^TNX",
		label: "10Y Treasury Yield",
		detail: "Global benchmark discount rate",
		group: "rates",
		format: "yield",
		decimals: 2,
		inverse: true,
	},
	{
		id: "VIX",
		cnbc: ".VIX",
		yahoo: "^VIX",
		label: "CBOE VIX",
		detail: "Equity market fear & implied volatility gauge",
		group: "rates",
		format: "index",
		decimals: 2,
		inverse: true,
	},

	// ── Cryptocurrencies ──────────────────────────────────────────
	{
		id: "BTC",
		cnbc: "BTC.CB=",
		yahoo: "BTC-USD",
		label: "Bitcoin",
		detail: "Digital reserve asset & liquidity leader",
		group: "crypto",
		format: "usd",
		decimals: 0,
	},
	{
		id: "ETH",
		cnbc: "ETH.CB=",
		yahoo: "ETH-USD",
		label: "Ethereum",
		detail: "Smart-contract platform leader",
		group: "crypto",
		format: "usd",
		decimals: 0,
	},

	// ── Sector Bellwethers (IDX) ──────────────────────────────────
	{
		id: "BBCA.JK",
		yahoo: "BBCA.JK",
		label: "Bank Central Asia",
		detail: "Financials bellwether (LQ45 anchor)",
		group: "sector",
		format: "fx",
		market: "ID",
	},
	{
		id: "ADRO.JK",
		yahoo: "ADRO.JK",
		label: "Adaro Energy",
		detail: "Energy & coal bellwether",
		group: "sector",
		format: "fx",
		market: "ID",
	},
	{
		id: "ICBP.JK",
		yahoo: "ICBP.JK",
		label: "Indofood CBP",
		detail: "Consumer staples & defensive domestic play",
		group: "sector",
		format: "fx",
		market: "ID",
	},
	{
		id: "ANTM.JK",
		yahoo: "ANTM.JK",
		label: "Aneka Tambang",
		detail: "Mining & basic materials rotation bellwether",
		group: "sector",
		format: "fx",
		market: "ID",
	},
	{
		id: "TLKM.JK",
		yahoo: "TLKM.JK",
		label: "Telkom Indonesia",
		detail: "Telecommunications & digital infrastructure bellwether",
		group: "sector",
		format: "fx",
		market: "ID",
	},
	{
		id: "ASII.JK",
		yahoo: "ASII.JK",
		label: "Astra International",
		detail: "Industrial, automotive & consumer spending bellwether",
		group: "sector",
		format: "fx",
		market: "ID",
	},

	// ── Global Commodities ────────────────────────────────────────
	{
		id: "OIL_BRENT",
		cnbc: "@LCO.1",
		yahoo: "BZ=F",
		label: "Brent Crude",
		detail: "Global energy cost & Indonesian trade balance driver",
		group: "commodity",
		format: "usd",
		decimals: 2,
	},
	{
		id: "GOLD",
		cnbc: "@GC.1",
		yahoo: "GC=F",
		label: "Gold Spot",
		detail: "Global safe haven & sovereign reserve debasement hedge",
		group: "commodity",
		format: "usd",
		decimals: 2,
	},
	{
		id: "COPPER",
		cnbc: "@HG.1",
		yahoo: "HG=F",
		label: "Copper",
		detail: "Dr. Copper - global industrial activity & demand barometer",
		group: "commodity",
		format: "usd",
		decimals: 3,
	},
];

export const INSTRUMENT_BY_ID: Readonly<Record<string, Instrument>> =
	Object.fromEntries(INSTRUMENTS.map((inst) => [inst.id, inst]));

export function instrumentsByGroup(group: InstrumentGroup): Instrument[] {
	return INSTRUMENTS.filter((inst) => inst.group === group);
}
