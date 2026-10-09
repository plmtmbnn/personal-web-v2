import type {
	CryptoGlobalSnapshot,
	MarketQuote,
	MacroSeries,
	PriceHistorySeries,
	CryptoFlowsSnapshot,
} from "@/services/market-data/types";

/* ─────────────────────────────────────────────────────────────
   CNN Fear & Greed payload
   ───────────────────────────────────────────────────────────── */

export interface CnnSeriesPoint {
	x: number;
	y: number;
	rating: string;
}

export interface CnnSubIndex {
	timestamp: number;
	score: number;
	rating: string;
	data: CnnSeriesPoint[];
}

export type FearAndGreedData = {
	fear_and_greed: {
		score: number;
		rating: string;
		timestamp: string;
		previous_close: number;
		previous_1_week: number;
		previous_1_month: number;
		previous_1_year: number;
	};
	fear_and_greed_historical: CnnSubIndex;
	market_momentum_sp500: CnnSubIndex;
	market_momentum_sp125: CnnSubIndex;
	stock_price_strength: CnnSubIndex;
	stock_price_breadth: CnnSubIndex;
	put_call_options: CnnSubIndex;
	market_volatility_vix: CnnSubIndex;
	market_volatility_vix_50: CnnSubIndex;
	junk_bond_demand: CnnSubIndex;
	safe_haven_demand: CnnSubIndex;
};

/* ─────────────────────────────────────────────────────────────
   Alternative.me Crypto Fear & Greed payload
   ───────────────────────────────────────────────────────────── */

export interface CryptoSentimentItem {
	value: string;
	value_classification: string;
	timestamp: string;
	time_until_update?: string;
}

export interface CryptoFearAndGreedResponse {
	name: string;
	data: CryptoSentimentItem[];
}

/* ─────────────────────────────────────────────────────────────
   Derived domain models
   ───────────────────────────────────────────────────────────── */

export type Tone = "positive" | "neutral" | "caution" | "negative";

export type FactorCategory =
	| "momentum"
	| "breadth"
	| "volatility"
	| "safe_haven";

export interface FactorItem {
	key: keyof FearAndGreedData;
	title: string;
	category: FactorCategory;
	data: CnnSubIndex;
}

export type TrendKey =
	| "near_high"
	| "uptrend"
	| "range"
	| "correction"
	| "bear";

export interface TrendTag {
	key: TrendKey;
	label: string;
	tone: Tone;
}

export interface RegionSummary {
	tone: Tone;
	verdict: string;
	narrative: string;
	advancers: number;
	decliners: number;
	avgChangePct: number | null;
	avgDrawdownPct: number | null;
	leaderId: string | null;
	laggardId: string | null;
}

export type SourceKey =
	| "cnn"
	| "cryptoFng"
	| "quotes"
	| "coingecko"
	| "fred"
	| "history"
	| "defillama"
	| "okx";

export interface SourceStatus {
	ok: boolean;
	label: string;
	stale?: boolean;
	asOf?: string;
}

export interface IhsgForeignFlowSnapshot {
	netBuySell1dIdr?: number | null; // e.g. -500_000_000_000 (net sell 500B IDR)
	netBuySell5dIdr?: number | null;
	streakDays?: number | null; // e.g. -3 for 3 consecutive days of net foreign selling
	asOf?: string;
}

export interface CryptoOnChainSnapshot {
	mvrvZScore?: number | null; // e.g. 1.8 (fair), > 4.0 (cycle top danger), < 0.1 (historical accumulation floor)
	nupl?: number | null; // Net Unrealized Profit/Loss (-1.0 to 1.0)
	asOf?: string;
	updatedAt?: number;
}

export interface InvestmentCompassData {
	sentiment: {
		traditional: FearAndGreedData | null;
		crypto: CryptoFearAndGreedResponse | null;
	};
	markets: {
		/** Quotes keyed by instrument id (see `data/instruments.ts`). */
		quotes: Record<string, MarketQuote>;
		cryptoGlobal: CryptoGlobalSnapshot | null;
		macro: Record<string, MacroSeries>;
		history?: Record<string, PriceHistorySeries | null>;
		cryptoFlows?: CryptoFlowsSnapshot | null;
		ihsgFlows?: IhsgForeignFlowSnapshot | null;
		cryptoOnChain?: CryptoOnChainSnapshot | null;
	};
	sources: Record<string, SourceStatus>;
	fetchedAt: string;
	engineOutput?: CompassOutput;
}

/* ─────────────────────────────────────────────────────────────
   V2 Decision Engine & Regime Models
   ───────────────────────────────────────────────────────────── */

export type RegimeState =
	| "risk_on"
	| "selective"
	| "defensive"
	| "stress"
	| "insufficient";

export interface RegimeFactor {
	key: string;
	label: string;
	valueStr: string;
	score: number; // 0 - 100
	weight: number;
	direction: "bullish" | "bearish" | "neutral";
	note: string;
	asOf?: string;
}

export interface MarketRegimeScore {
	id: "global" | "ihsg" | "crypto";
	title: string;
	marketName: string;
	state: RegimeState;
	score: number; // 0 - 100
	coverage: number; // 0.0 - 1.0
	headline: string;
	diagnosis: string;
	tone: Tone;
	factors: RegimeFactor[];
	contextFlags: string[];
	asymmetryZone?: {
		type: "accumulation" | "distribution";
		title: string;
		description: string;
	} | null;
}

export type ActionPermission =
	| "allowed"
	| "selective"
	| "not_allowed"
	| "paused";

export interface MarketPermissions {
	scalp: { status: ActionPermission; label: string; reason: string };
	swing: { status: ActionPermission; label: string; reason: string };
	dca: { status: ActionPermission; label: string; reason: string };
	maxExposure: string;
	riskPerTrade?: string;
}

export interface PermissionsMatrixData {
	ihsg: MarketPermissions;
	crypto: MarketPermissions;
	altcoins: MarketPermissions;
	ihsgSectorGates: string[];
	globalStressActive: boolean;
	summaryNotes: string[];
}

export interface CompassAlert {
	id: string;
	title: string;
	message: string;
	type: "danger" | "warning" | "positive";
	asOf?: string;
}

export interface CompassOutput {
	regimes: {
		global: MarketRegimeScore;
		ihsg: MarketRegimeScore;
		crypto: MarketRegimeScore;
	};
	permissions: PermissionsMatrixData;
	playbooks: {
		ihsg: import("./data/playbooks").MarketPlaybookScript;
		crypto: import("./data/playbooks").MarketPlaybookScript;
	};
	alerts: CompassAlert[];
	activeSeasonality: import("./data/seasonality").SeasonalityWindow[];
	upcomingEvents: import("./data/events").MacroCalendarEvent[];
	halvingCycle: {
		monthsElapsed: number;
		phase: string;
		description: string;
	};
}
