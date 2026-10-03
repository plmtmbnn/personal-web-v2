import type {
	CryptoGlobalSnapshot,
	MarketQuote,
	MacroSeries,
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

export type RegimeKey =
	| "expansion"
	| "speculative_decoupling"
	| "defensive_rotation"
	| "capitulation";

export interface MarketRegime {
	key: RegimeKey;
	title: string;
	/** Short stance label for header chips (e.g. "Risk-On"). */
	stance: string;
	headline: string;
	diagnosis: string;
	tone: Tone;
	riskAppetite: number;
	divergence: number;
	playbook: {
		favored: string[];
		risks: string[];
		posture: string;
	};
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

/* ─────────────────────────────────────────────────────────────
   Page aggregate
   ───────────────────────────────────────────────────────────── */

export type SourceKey = "cnn" | "cryptoFng" | "quotes" | "coingecko" | "fred";

export interface SourceStatus {
	ok: boolean;
	label: string;
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
	};
	sources: Record<SourceKey, SourceStatus>;
	fetchedAt: string;
}

/* ─────────────────────────────────────────────────────────────
   Advanced Playbook Engine Types
   ───────────────────────────────────────────────────────────── */

export type AssetStance = "Overweight" | "Neutral" | "Underweight";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface PlaybookRecommendation {
	assetClass: string;
	stance: AssetStance;
	summary: string;
	pros: string[];
	cons: string[];
	action: string;
	invalidation: string;
	confidence: ConfidenceLevel;
}

export interface AllocationPosture {
	equities: number; // percentage
	crypto: number; // percentage
	gold: number; // percentage
	cashBonds: number; // percentage
}

export type TimeframeStatus = "Favorable" | "Selective" | "Avoid" | "Hold";

export interface TimeframeGuideline {
	id: "scalping" | "swing" | "investment";
	style: string;
	status: TimeframeStatus;
	reason: string;
}

export interface EconomySummarySection {
	headline: string;
	keynotes: string[];
	tone: Tone;
}

export interface EconomySummary {
	macro: EconomySummarySection;
	micro: EconomySummarySection;
}

export interface SectorGuidance {
	overweight: string[];
	underweight: string[];
	neutral: string[];
	narrative: string;
}

export interface EngineOutput {
	regime: MarketRegime;
	recommendations: PlaybookRecommendation[];
	allocation: AllocationPosture;
	timeframes: TimeframeGuideline[];
	economySummary: EconomySummary;
	sectorRotation: SectorGuidance;
}
