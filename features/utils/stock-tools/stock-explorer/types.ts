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
	| "🔥 Strong Buy"
	| "🚀 Momentum"
	| "📈 Breakout"
	| "💰 Value"
	| "🏦 Blue Chip"
	| "🌍 Foreign Accumulation"
	| "⚠ Watchlist"
	| "❌ Weak Trend";

export interface ProcessedStock extends IDXStock {
	ForeignNet: number;
	ChangePct: number;
	IsHighVolume: boolean;
	Sector: Sector;
	CompositeScore: number;
	Opportunity: OpportunityCategory;
	Fundamentals: FundamentalData;
	// Technical signals
	Trend: "Up" | "Down" | "Sideways";
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
