export interface Value {
	raw: string;
	formatted: string;
}

export interface PriceChartData {
	date: string;
	time: string;
	value: Value;
	datetime_label: string;
	open: Value | null;
	high: Value | null;
	low: Value | null;
}

export interface Chart {
	date: string;
	time: string;
	value: Value;
	datetime_label: string;
	open: null;
	high: null;
	low: null;
}

export interface Charts {
	broker_code: string;
	chart: Chart[];
}

export interface BrokerChartData {
	type: string;
	brokers: string[];
	charts: Charts[];
}

export interface RunningTradeChartData {
	from: string;
	to: string;
	data_last_updated: string;
	price_chart_data: PriceChartData[];
	broker_chart_data: BrokerChartData[];
	date_session_info: string;
}

export interface RunningTradeChartResponse {
	data: RunningTradeChartData;
	message: string;
}

export const RUNNING_TRADE_CHART_PERIODS = [
	{ value: "RT_PERIOD_LAST_1_MONTH", label: "Last 1 Month" },
	{
		value: "RT_PERIOD_LAST_3_MONTHS",
		label: "Last 3 Months (Default)",
	},
	{ value: "RT_PERIOD_LAST_6_MONTHS", label: "Last 6 Months" },
	{ value: "RT_PERIOD_LAST_1_YEAR", label: "Last 1 Year" },
] as const;

export type RunningTradeChartPeriod =
	(typeof RUNNING_TRADE_CHART_PERIODS)[number]["value"];

export interface RunningTradeChartSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	period: RunningTradeChartPeriod;
	investorType: string;
	marketBoard: string;
	actionMode: "visualize" | "json";
}

export const DEFAULT_RUNNING_TRADE_CHART_SETTINGS: RunningTradeChartSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	period: "RT_PERIOD_LAST_3_MONTHS",
	investorType: "INVESTOR_TYPE_ALL",
	marketBoard: "BOARD_TYPE_REGULAR",
	actionMode: "visualize",
};
