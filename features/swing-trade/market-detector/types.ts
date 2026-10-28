export interface TopDetectorTier {
	accdist: string;
	amount: number;
	percent: number;
	vol: number;
}

export interface BandarDetector {
	average: number;
	avg: TopDetectorTier;
	avg5: TopDetectorTier;
	broker_accdist: string;
	number_broker_buysell: number;
	top1: TopDetectorTier;
	top3: TopDetectorTier;
	top5: TopDetectorTier;
	top10: TopDetectorTier;
	total_buyer: number;
	total_seller: number;
	value: number;
	volume: number;
}

export interface BrokersBuy {
	blot: string;
	blotv: string;
	bval: string;
	bvalv: string;
	netbs_broker_code: string;
	netbs_buy_avg_price: string;
	netbs_date: string;
	netbs_stock_code: string;
	type: string;
	freq: string;
}

export interface BrokersSell {
	slot: string;
	slotv: string;
	sval: string;
	svalv: string;
	netbs_broker_code: string;
	netbs_sell_avg_price: string;
	netbs_date: string;
	netbs_stock_code: string;
	type: string;
	freq: string;
}

export interface BrokerSummary {
	brokers_buy: BrokersBuy[];
	brokers_sell: BrokersSell[];
	symbol: string;
}

export interface MarketDetectorData {
	bandar_detector: BandarDetector;
	broker_summary: BrokerSummary;
	from: string;
	to: string;
}

export interface MarketDetectorResponse {
	message: string;
	data: MarketDetectorData;
}

export const PERIOD_OPTIONS = [
	{ value: "BROKER_SUMMARY_PERIOD_LAST_1_MONTH", label: "Last 1 Month" },
	{
		value: "BROKER_SUMMARY_PERIOD_LAST_3_MONTHS",
		label: "Last 3 Months (Default)",
	},
	{ value: "BROKER_SUMMARY_PERIOD_LAST_6_MONTHS", label: "Last 6 Months" },
	{ value: "BROKER_SUMMARY_PERIOD_LAST_1_YEAR", label: "Last 1 Year" },
] as const;

export type MarketDetectorPeriod = (typeof PERIOD_OPTIONS)[number]["value"];

export interface MarketDetectorSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	period: MarketDetectorPeriod;
	marketBoard: string;
	investorType: string;
	transactionType: string;
	limit: number;
	actionMode: "visualize" | "json";
}

export const DEFAULT_MARKET_DETECTOR_SETTINGS: MarketDetectorSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	period: "BROKER_SUMMARY_PERIOD_LAST_3_MONTHS",
	marketBoard: "MARKET_BOARD_REGULER",
	investorType: "INVESTOR_TYPE_ALL",
	transactionType: "TRANSACTION_TYPE_NET",
	limit: 25,
	actionMode: "visualize",
};
