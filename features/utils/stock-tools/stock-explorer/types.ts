export interface IDXStock {
	No: number;
	IDStockSummary: number;
	Date: string;
	StockCode: string;
	StockName: string;
	Remarks: string;
	Previous: number;
	OpenPrice: number;
	FirstTrade: number;
	High: number;
	Low: number;
	Close: number;
	Change: number;
	Volume: number;
	Value: number;
	Frequency: number;
	IndexIndividual: number;
	Offer: number;
	OfferVolume: number;
	Bid: number;
	BidVolume: number;
	ListedShares: number;
	TradebleShares: number;
	WeightForIndex: number;
	ForeignSell: number;
	ForeignBuy: number;
	DelistingDate: string;
	NonRegularVolume: number;
	NonRegularValue: number;
	NonRegularFrequency: number;
	persen: number | null;
	percentage: number | null;
}

export type Sector =
	| "Banking"
	| "Technology"
	| "Energy"
	| "Healthcare"
	| "Infrastructure"
	| "Consumer"
	| "Property"
	| "Transportation"
	| "Basic Materials"
	| "Industrials"
	| "Unknown";

export interface FundamentalData {
	Revenue: number;
	NetIncome: number;
	EPS: number;
	ROE: number;
	ROA: number;
	DER: number;
	PE: number;
	PBV: number;
}

export type OpportunityCategory =
	| "Strong Buy"
	| "Momentum"
	| "Breakout"
	| "Value"
	| "Blue Chip"
	| "Foreign Accumulation"
	| "Bandar Accumulation"
	| "ARB Reversal"
	| "Watchlist"
	| "Weak Trend";

export type TurnoverTier = "Illiquid" | "Low" | "Mid" | "High" | "Mega";
export type AutoRejectionStatus =
	| "ARA"
	| "Near ARA"
	| "ARB"
	| "Near ARB"
	| "Normal";

export interface ProcessedStock extends IDXStock {
	ForeignNet: number;
	ForeignNetVol: number;
	ChangePct: number;
	MarketCap: number;
	IsHighVolume: boolean;
	Sector: Sector;
	CompositeScore: number;
	Opportunity: OpportunityCategory;
	Fundamentals: FundamentalData;
	// Technical signals
	Trend: "Up" | "Down" | "Sideways";
	// Indonesian Microstructure & Bandarmology Telemetry
	TurnoverTier: TurnoverTier;
	BidOfferPressure: number; // 0-100%
	AvgValuePerTx: number; // IDR per transaction (Whale proxy)
	NegoRatio: number; // 0-100% (Non-regular crossing share)
	ARALimitPrice: number;
	ARBLimitPrice: number;
	ARARisk: AutoRejectionStatus;
}

export interface MarketHealth {
	marketReturn: number;
	avgReturn: number;
	sentimentScore: number;
	sentimentLabel: string;
	netForeign: number;
	netForeignValue: number;
	netForeignVolume: number;
	totalForeignBuy: number;
	totalForeignSell: number;
	totalVolume: number;
	totalValue: number;
	advancers: number;
	decliners: number;
	unchanged: number;
}

export type SortKey = keyof ProcessedStock;

export interface SortConfig {
	key: SortKey;
	direction: "asc" | "desc" | null;
}

export interface ScoreWeights {
	price: number;
	volume: number;
	foreign: number;
	liquidity: number;
	volatility: number;
}

// -------------------------------------------------------------
// Stockpick Simulator & Paper Portfolio Tracker Types
// -------------------------------------------------------------

export type StockPickThesis =
	| "Compass Core Tranche"
	| "Foreign Flow Surge"
	| "Bandar Accumulation"
	| "Value Accumulation"
	| "Breakout Momentum"
	| "ARB Reversal"
	| "Swing Speculation"
	| "Custom";

export interface StockPick {
	id: string; // Unique UUID
	stockCode: string; // e.g. "BBCA"
	stockName: string;
	sector: Sector;
	buyPrice: number; // Simulated entry buying price in IDR
	quantityLots: number; // Simulated volume (1 lot = 100 shares)
	entryDate: string; // ISO format "YYYY-MM-DD"
	targetPrice?: number; // Optional take-profit target in IDR
	stopLossPrice?: number; // Optional stop-loss level in IDR
	thesis?: StockPickThesis;
	notes?: string; // Retrospective learning notes

	// Continuous Watermark Tracing
	highestPriceTraced: number; // Highest price recorded since entry date
	highestPriceDate?: string; // Date when peak was reached
	lowestPriceTraced: number; // Lowest price recorded since entry date
	lowestPriceDate?: string; // Date when trough was reached

	// Lifecycle
	status: "active" | "closed";
	closedPrice?: number;
	closedDate?: string;
	realizedPlPct?: number;
	realizedPlNominal?: number;
	exitReason?: StockPickExitReason;
	exitNotes?: string;
	createdAt: number; // Timestamp
	updatedAt: number; // Timestamp
}

export type StockPickExitReason =
	| "target_hit"
	| "stop_loss_hit"
	| "trailing_stop"
	| "thesis_invalidated"
	| "manual_profit"
	| "manual_cut";

export interface ClosePickPayload {
	exitPrice: number;
	exitReason: StockPickExitReason;
	exitNotes?: string;
	exitDate?: string;
}

export interface ClosedTradesFilter {
	search: string;
	thesis: StockPickThesis | "all";
	exitReason: StockPickExitReason | "all";
	horizon: "all" | "30d" | "90d" | "ytd";
	outcome: "all" | "win" | "loss";
	sortBy:
		| "exit_date_desc"
		| "exit_date_asc"
		| "pnl_desc"
		| "pnl_asc"
		| "duration_desc";
}

export interface ClosedTradesSummary {
	totalClosed: number;
	winningTrades: number;
	losingTrades: number;
	winRatePct: number;
	totalRealizedPlNominal: number;
	totalRealizedPlPct: number;
	profitFactor: number;
	avgHoldingDays: number;
	avgWinPct: number;
	avgLossPct: number;
	bestTrade?: { stockCode: string; plPct: number; nominal: number };
	worstTrade?: { stockCode: string; plPct: number; nominal: number };
	thesisBreakdown: Array<{
		thesis: StockPickThesis;
		count: number;
		winRate: number;
		totalPlNominal: number;
	}>;
	exitReasonBreakdown: Array<{
		reason: StockPickExitReason;
		count: number;
		winRate: number;
		totalPlNominal: number;
	}>;
}

export interface StockPickWithMetrics extends StockPick {
	// Live session matching from ProcessedStock
	currentPrice: number;
	dayChange: number;
	dayChangePct: number;
	dayHigh: number;
	dayLow: number;

	// Running P/L
	unrealizedPlPct: number; // ((currentPrice - buyPrice) / buyPrice) * 100
	unrealizedPlNominal: number; // (currentPrice - buyPrice) * quantityLots * 100
	simulatedOutlay: number; // buyPrice * quantityLots * 100
	currentMarketValue: number; // currentPrice * quantityLots * 100

	// Peak & Drawdown relative to Buy Price
	peakGainPct: number; // ((highestPriceTraced - buyPrice) / buyPrice) * 100
	maxDrawdownPct: number; // ((lowestPriceTraced - buyPrice) / buyPrice) * 100

	// Risk & Compass telemetry
	riskRewardRatio?: number; // (targetPrice - buyPrice) / (buyPrice - stopLossPrice)
	holdingDays: number;
	compositeScore?: number;
	opportunity?: OpportunityCategory;
	isCompassAligned?: boolean;
}

export interface SimulatorPortfolioSummary {
	totalPicks: number;
	activePicks: number;
	closedPicks: number;
	winningPicks: number;
	losingPicks: number;
	winRatePct: number;
	totalSimulatedCapital: number;
	totalCurrentValue: number;
	totalUnrealizedPlNominal: number;
	totalUnrealizedPlPct: number;
	bestPerformer?: { stockCode: string; plPct: number };
	worstPerformer?: { stockCode: string; plPct: number };
}
