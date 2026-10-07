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
