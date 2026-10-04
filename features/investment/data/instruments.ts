/**
 * Instrument registry for the Investment Compass.
 * Each instrument resolves via CNBC first, then Yahoo as fallback.
 */

export type InstrumentGroup =
	| "us"
	| "europe"
	| "asia"
	| "commodity"
	| "fx"
	| "rates"
	| "crypto"
	| "sector";

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
	// ── United States ────────────────────────────────────────────
	{
		id: "SPX",
		cnbc: ".SPX",
		yahoo: "^GSPC",
		label: "S&P 500",
		detail: "US large-cap benchmark",
		group: "us",
		format: "index",
		market: "US",
	},
	{
		id: "IXIC",
		cnbc: ".IXIC",
		yahoo: "^IXIC",
		label: "Nasdaq Composite",
		detail: "Tech & growth bellwether",
		group: "us",
		format: "index",
		market: "US",
	},
	{
		id: "DJI",
		cnbc: ".DJI",
		yahoo: "^DJI",
		label: "Dow Jones",
		detail: "30 US blue chips",
		group: "us",
		format: "index",
		market: "US",
	},
	{
		id: "RUT",
		cnbc: ".RUT",
		yahoo: "^RUT",
		label: "Russell 2000",
		detail: "Small caps · domestic risk appetite",
		group: "us",
		format: "index",
		market: "US",
	},

	// ── Europe ───────────────────────────────────────────────────
	{
		id: "STOXX50E",
		cnbc: ".STOXX50E",
		yahoo: "^STOXX50E",
		label: "Euro STOXX 50",
		detail: "Eurozone blue chips",
		group: "europe",
		format: "index",
		market: "EU",
	},
	{
		id: "GDAXI",
		cnbc: ".GDAXI",
		yahoo: "^GDAXI",
		label: "DAX 40",
		detail: "Germany · industrial & export cycle",
		group: "europe",
		format: "index",
		market: "DE",
	},
	{
		id: "FTSE",
		cnbc: ".FTSE",
		yahoo: "^FTSE",
		label: "FTSE 100",
		detail: "UK · energy, miners & defensives",
		group: "europe",
		format: "index",
		market: "UK",
	},
	{
		id: "FCHI",
		cnbc: ".FCHI",
		yahoo: "^FCHI",
		label: "CAC 40",
		detail: "France · luxury & consumer",
		group: "europe",
		format: "index",
		market: "FR",
	},

	// ── Asia Pacific ─────────────────────────────────────────────
	{
		id: "JKSE",
		yahoo: "^JKSE",
		label: "IHSG",
		detail: "Indonesia composite · home market",
		group: "asia",
		format: "index",
		market: "ID",
	},
	{
		id: "N225",
		cnbc: ".N225",
		yahoo: "^N225",
		label: "Nikkei 225",
		detail: "Japan · yen-sensitive exporters",
		group: "asia",
		format: "index",
		market: "JP",
	},
	{
		id: "HSI",
		cnbc: ".HSI",
		yahoo: "^HSI",
		label: "Hang Seng",
		detail: "Hong Kong · China tech proxy",
		group: "asia",
		format: "index",
		market: "HK",
	},
	{
		id: "SSEC",
		cnbc: ".SSEC",
		yahoo: "000001.SS",
		label: "Shanghai Composite",
		detail: "Mainland China A-shares",
		group: "asia",
		format: "index",
		market: "CN",
	},
	{
		id: "KS11",
		cnbc: ".KS11",
		yahoo: "^KS11",
		label: "KOSPI",
		detail: "Korea · semiconductor cycle",
		group: "asia",
		format: "index",
		market: "KR",
	},
	{
		id: "NSEI",
		cnbc: ".NSEI",
		yahoo: "^NSEI",
		label: "Nifty 50",
		detail: "India · structural growth",
		group: "asia",
		format: "index",
		market: "IN",
	},
	{
		id: "STI",
		cnbc: ".STI",
		yahoo: "^STI",
		label: "Straits Times",
		detail: "Singapore · banks & REITs",
		group: "asia",
		format: "index",
		market: "SG",
	},

	// ── Commodities ──────────────────────────────────────────────
	{
		id: "GOLD",
		cnbc: "@GC.1",
		yahoo: "GC=F",
		label: "Gold",
		detail: "Safe haven · real-yield & USD sensitive",
		group: "commodity",
		format: "usd",
		decimals: 1,
	},
	{
		id: "SILVER",
		cnbc: "@SI.1",
		yahoo: "SI=F",
		label: "Silver",
		detail: "Precious + industrial hybrid",
		group: "commodity",
		format: "usd",
		decimals: 2,
	},
	{
		id: "WTI",
		cnbc: "@CL.1",
		yahoo: "CL=F",
		label: "WTI Crude",
		detail: "US oil · inflation input",
		group: "commodity",
		format: "usd",
		decimals: 2,
	},
	{
		id: "BRENT",
		cnbc: "@LCO.1",
		yahoo: "BZ=F",
		label: "Brent Crude",
		detail: "Global oil benchmark",
		group: "commodity",
		format: "usd",
		decimals: 2,
	},
	{
		id: "NATGAS",
		cnbc: "@NG.1",
		yahoo: "NG=F",
		label: "Natural Gas",
		detail: "Energy & utilities cost driver",
		group: "commodity",
		format: "usd",
		decimals: 3,
	},
	{
		id: "COPPER",
		cnbc: "@HG.1",
		yahoo: "HG=F",
		label: "Copper",
		detail: "Global growth proxy",
		group: "commodity",
		format: "usd",
		decimals: 3,
	},

	// ── FX ───────────────────────────────────────────────────────
	{
		id: "DXY",
		cnbc: ".DXY",
		yahoo: "DX-Y.NYB",
		label: "US Dollar Index",
		detail: "Strong USD tightens global liquidity",
		group: "fx",
		format: "index",
		decimals: 2,
		inverse: true,
	},
	{
		id: "USDIDR",
		cnbc: "IDR=",
		yahoo: "IDR=X",
		label: "USD/IDR",
		detail: "Rising = weaker rupiah",
		group: "fx",
		format: "fx",
		decimals: 0,
		inverse: true,
	},
	{
		id: "USDJPY",
		cnbc: "JPY=",
		yahoo: "JPY=X",
		label: "USD/JPY",
		detail: "Carry-trade & BoJ policy gauge",
		group: "fx",
		format: "fx",
		decimals: 2,
	},
	{
		id: "EURUSD",
		cnbc: "EUR=",
		yahoo: "EURUSD=X",
		label: "EUR/USD",
		detail: "ECB vs Fed policy spread",
		group: "fx",
		format: "fx",
		decimals: 4,
	},

	// ── Rates & Risk ─────────────────────────────────────────────
	{
		id: "US10Y",
		cnbc: "US10Y",
		yahoo: "^TNX",
		label: "US 10Y Yield",
		detail: "Discount rate for global assets",
		group: "rates",
		format: "yield",
		decimals: 3,
		inverse: true,
	},
	{
		id: "US2Y",
		cnbc: "US2Y",
		label: "US 2Y Yield",
		detail: "Fed policy expectations",
		group: "rates",
		format: "yield",
		decimals: 3,
		inverse: true,
	},
	{
		id: "VIX",
		cnbc: ".VIX",
		yahoo: "^VIX",
		label: "VIX",
		detail: "Expected S&P 500 volatility (fear gauge)",
		group: "rates",
		format: "index",
		decimals: 2,
		inverse: true,
	},

	// ── Crypto ───────────────────────────────────────────────────
	{
		id: "BTC",
		cnbc: "BTC.CM=",
		yahoo: "BTC-USD",
		label: "Bitcoin",
		detail: "Digital store of value · liquidity barometer",
		group: "crypto",
		format: "usd",
		decimals: 0,
	},
	{
		id: "ETH",
		cnbc: "ETH.CM=",
		yahoo: "ETH-USD",
		label: "Ethereum",
		detail: "Smart-contract platform leader",
		group: "crypto",
		format: "usd",
		decimals: 0,
	},
	{
		id: "SOL",
		cnbc: "SOL.CM=",
		yahoo: "SOL-USD",
		label: "Solana",
		detail: "High-beta L1 · speculative appetite",
		group: "crypto",
		format: "usd",
		decimals: 2,
	},

	// ── US Sectors (SPDR ETFs) ───────────────────────────────────
	{
		id: "XLK",
		cnbc: "XLK",
		yahoo: "XLK",
		label: "Technology",
		detail: "Software & Hardware",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLF",
		cnbc: "XLF",
		yahoo: "XLF",
		label: "Financials",
		detail: "Banks & Institutions",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLV",
		cnbc: "XLV",
		yahoo: "XLV",
		label: "Health Care",
		detail: "Pharma & MedTech",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLY",
		cnbc: "XLY",
		yahoo: "XLY",
		label: "Cons. Discretionary",
		detail: "Retail & Autos",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLP",
		cnbc: "XLP",
		yahoo: "XLP",
		label: "Cons. Staples",
		detail: "Food & Beverage",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLE",
		cnbc: "XLE",
		yahoo: "XLE",
		label: "Energy",
		detail: "Oil & Gas",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLI",
		cnbc: "XLI",
		yahoo: "XLI",
		label: "Industrials",
		detail: "Manufacturing & Defense",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLB",
		cnbc: "XLB",
		yahoo: "XLB",
		label: "Materials",
		detail: "Chemicals & Mining",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLU",
		cnbc: "XLU",
		yahoo: "XLU",
		label: "Utilities",
		detail: "Power & Water",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLRE",
		cnbc: "XLRE",
		yahoo: "XLRE",
		label: "Real Estate",
		detail: "REITs",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
	{
		id: "XLC",
		cnbc: "XLC",
		yahoo: "XLC",
		label: "Communication",
		detail: "Media & Telco",
		group: "sector",
		format: "usd",
		decimals: 2,
	},
];

export const INSTRUMENT_BY_ID: Readonly<Record<string, Instrument>> =
	Object.fromEntries(INSTRUMENTS.map((inst) => [inst.id, inst]));

export function instrumentsByGroup(group: InstrumentGroup): Instrument[] {
	return INSTRUMENTS.filter((inst) => inst.group === group);
}
