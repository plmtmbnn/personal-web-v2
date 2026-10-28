export interface Lot {
	raw: string;
	formatted: string;
}

export interface Value {
	raw: string;
	formatted: string;
}

export interface Frequency {
	raw: string;
	formatted: string;
}

export interface HistoricalRaw {
	buy_lot_raw: string;
	sell_lot_raw: string;
	buy_value_raw: number;
	sell_value_raw: number;
}

export interface NetPerMinPercentage {
	buy: string;
	sell: string;
	buy_value: string;
	sell_value: string;
	historical_raw: HistoricalRaw;
	intraday_raw: null;
}

export interface BigMoneyRtTotal {
	percentage: null;
	net_per_min_percentage: NetPerMinPercentage;
	pre_lot: string;
	post_lot: string;
	pre_frequency: string;
	post_frequency: string;
}

export interface BookTotal {
	buy_frequency: string;
	sell_frequency: string;
	buy_lot: string;
	sell_lot: string;
	buy_percentage: string;
	sell_percentage: string;
	total_frequency: string;
	total_lot: string;
	pre_lot: string;
	post_lot: string;
	pre_frequency: string;
	post_frequency: string;
	buy_value_percentage: string;
	sell_value_percentage: string;
	buy_value: string;
	sell_value: string;
	big_money_buy_percentage: string;
	big_money_sell_percentage: string;
	big_money_buy_value_percentage: string;
	big_money_sell_value_percentage: string;
	overall_net_per_min_percentage: NetPerMinPercentage;
	big_money_net_per_min_percentage: NetPerMinPercentage;
	big_money_pre_lot: string;
	big_money_post_lot: string;
	big_money_pre_frequency: string;
	big_money_post_frequency: string;
	buy_value_raw: number;
	sell_value_raw: number;
	big_money_rt: BigMoneyRtTotal;
}

export interface Prices {
	frequency: null;
	lot: null;
	time: string;
	value: Value;
	date: string;
}

export interface NetValues {
	frequency: null;
	lot: null;
	time: string;
	value: Value;
	date: string;
}

export interface NetValuesVolume {
	frequency: null;
	lot: Lot;
	time: string;
	value: null;
	date: string;
}

export interface TradeBookPoint {
	frequency: Frequency;
	lot: Lot;
	time: string;
	value: Value;
	date: string;
}

export interface BigMoneyRtData {
	buy: TradeBookPoint[];
	sell: TradeBookPoint[];
	net_values: NetValues[];
	net_values_volume: NetValuesVolume[];
	pre_post: null;
}

export interface TradeBook5MData {
	buy: TradeBookPoint[];
	sell: TradeBookPoint[];
	pre_post: null;
	is_show_pre_post: boolean;
	is_fca_stock: boolean;
	prices: Prices[];
	net_values: NetValues[];
	date: string;
	book_total: BookTotal;
	big_money_net_values: NetValues[];
	net_values_volume: NetValuesVolume[];
	big_money_net_values_volume: NetValuesVolume[];
	big_money_buy: TradeBookPoint[];
	big_money_sell: TradeBookPoint[];
	big_money_pre_post: null;
	from: string;
	to: string;
	first_available_date: string;
	big_money_rt: BigMoneyRtData;
}

export interface TradeBook5MResponse {
	message: string;
	data: TradeBook5MData;
}

export const TRADE_BOOK_5M_PERIODS = [
	{ value: "DATE_PICKER_PERIOD_LAST_1_WEEK", label: "Last 1 Week" },
	{
		value: "DATE_PICKER_PERIOD_LAST_1_MONTH",
		label: "Last 1 Month (Default)",
	},
	{ value: "DATE_PICKER_PERIOD_LAST_3_MONTHS", label: "Last 3 Months" },
] as const;

export type TradeBook5MPeriod = (typeof TRADE_BOOK_5M_PERIODS)[number]["value"];

export interface TradeBook5MSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	timeInterval: string;
	period: TradeBook5MPeriod;
	actionMode: "visualize" | "json";
}

export const DEFAULT_TRADE_BOOK_5M_SETTINGS: TradeBook5MSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	timeInterval: "5m",
	period: "DATE_PICKER_PERIOD_LAST_1_MONTH",
	actionMode: "visualize",
};
