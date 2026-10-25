export interface Value {
	raw: string | number;
	formatted: string;
}

export interface Lot {
	raw: string;
	formatted: string;
}

export interface Frequency {
	raw: string;
	formatted: string;
}

export interface Buy {
	frequency: Frequency;
	lot: Lot;
	time: string;
	value: Value;
	date: string;
}

export interface Sell {
	frequency: Frequency;
	lot: Lot;
	time: string;
	value: Value;
	date: string;
}

export interface PrePost {
	frequency: null | Frequency;
	lot: null | Lot;
	time: string;
	value: null | Value;
	date: string;
}

export interface Prices {
	frequency: null | Frequency;
	lot: null | Lot;
	time: string;
	value: Value;
	date: string;
}

export interface NetValues {
	frequency: null | Frequency;
	lot: null | Lot;
	time: string;
	value: Value;
	date: string;
}

export interface NetValuesVolume {
	frequency: null | Frequency;
	lot: Lot;
	time: string;
	value: null | Value;
	date: string;
}

export interface BigMoneyBuy {
	frequency: Frequency;
	lot: Lot;
	time: string;
	value: Value;
	date: string;
}

export interface BigMoneySell {
	frequency: Frequency;
	lot: Lot;
	time: string;
	value: Value;
	date: string;
}

export interface BigMoneyPrePost {
	frequency: null | Frequency;
	lot: null | Lot;
	time: string;
	value: null | Value;
	date: string;
}

export interface BigMoneyNetValues {
	frequency: null | Frequency;
	lot: null | Lot;
	time: string;
	value: Value;
	date: string;
}

export interface BigMoneyNetValuesVolume {
	frequency: null | Frequency;
	lot: Lot;
	time: string;
	value: null | Value;
	date: string;
}

export interface IntradayRaw {
	buy_lot_raw: string;
	sell_lot_raw: string;
	buy_value_raw: number;
	sell_value_raw: number;
}

export interface Percentage {
	buy: string;
	sell: string;
	buy_value: string;
	sell_value: string;
	historical_raw: null | unknown;
	intraday_raw: null | IntradayRaw;
}

export interface NetPerMinPercentage {
	buy: string;
	sell: string;
	buy_value: string;
	sell_value: string;
	historical_raw: null | unknown;
	intraday_raw: IntradayRaw;
}

export interface BigMoneyRtTotal {
	percentage: Percentage;
	net_per_min_percentage: NetPerMinPercentage;
	pre_lot: string;
	post_lot: string;
	pre_frequency: string;
	post_frequency: string;
}

export interface OverallNetPerMinPercentage {
	buy: string;
	sell: string;
	buy_value: string;
	sell_value: string;
	historical_raw: null | unknown;
	intraday_raw: IntradayRaw;
}

export interface BigMoneyNetPerMinPercentage {
	buy: string;
	sell: string;
	buy_value: string;
	sell_value: string;
	historical_raw: null | unknown;
	intraday_raw: IntradayRaw;
}

export interface BigMoneyRt {
	buy: Buy[];
	sell: Sell[];
	net_values: NetValues[];
	net_values_volume: NetValuesVolume[];
	pre_post: PrePost;
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
	overall_net_per_min_percentage: OverallNetPerMinPercentage;
	big_money_net_per_min_percentage: BigMoneyNetPerMinPercentage;
	big_money_pre_lot: string;
	big_money_post_lot: string;
	big_money_pre_frequency: string;
	big_money_post_frequency: string;
	buy_value_raw: number;
	sell_value_raw: number;
	big_money_rt: BigMoneyRtTotal;
}

export interface TradeBookData {
	buy: Buy[];
	sell: Sell[];
	pre_post: PrePost;
	is_show_pre_post: boolean;
	is_fca_stock: boolean;
	prices: Prices[];
	net_values: NetValues[];
	date: string;
	book_total: BookTotal;
	big_money_net_values: BigMoneyNetValues[];
	net_values_volume: NetValuesVolume[];
	big_money_net_values_volume: BigMoneyNetValuesVolume[];
	big_money_buy: BigMoneyBuy[];
	big_money_sell: BigMoneySell[];
	big_money_pre_post: BigMoneyPrePost;
	from: string;
	to: string;
	first_available_date: string;
	big_money_rt: BigMoneyRt;
}

export interface TradeBookResponse {
	message: string;
	data: TradeBookData;
}

export type TradeBookActionMode = "visualize" | "json";

export interface TradeBookSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	actionMode: TradeBookActionMode;
}

export const DEFAULT_TRADE_BOOK_SETTINGS: TradeBookSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	actionMode: "visualize",
};
