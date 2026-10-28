export interface Detail {
	code: string;
	type: string;
	amount: number;
}

export interface DistributeTo {
	code: string;
	type: string;
	amount: number;
}

export interface TopBrokerBuy {
	detail: Detail;
	distribute_to: DistributeTo[];
}

export interface TopBrokerSell {
	detail: Detail;
	distribute_to: DistributeTo[];
}

export interface ByVolume {
	top_broker_buy: TopBrokerBuy[];
	top_broker_sell: TopBrokerSell[];
}

export interface ByValue {
	top_broker_buy: TopBrokerBuy[];
	top_broker_sell: TopBrokerSell[];
}

export interface BrokerDistributionData {
	date_info: string;
	by_value: ByValue;
	by_volume: ByVolume;
	start_date: string;
	end_date: string;
}

export interface BrokerDistributionResponse {
	message: string;
	data: BrokerDistributionData;
}

export const PERIOD_OPTIONS = [
	{ value: "TB_PERIOD_LAST_1_MONTH", label: "Last 1 Month" },
	{ value: "TB_PERIOD_LAST_3_MONTHS", label: "Last 3 Months (Default)" },
	{ value: "TB_PERIOD_LAST_6_MONTHS", label: "Last 6 Months" },
	{ value: "TB_PERIOD_LAST_1_YEAR", label: "Last 1 Year" },
] as const;

export type BrokerDistributionPeriod = (typeof PERIOD_OPTIONS)[number]["value"];

export const DATA_TYPE_OPTIONS = [
	{
		value: "BROKER_DISTRIBUTION_DATA_TYPE_VOLUME",
		label: "Volume (Shares / Lots)",
	},
	{
		value: "BROKER_DISTRIBUTION_DATA_TYPE_VALUE",
		label: "Value (Turnover in IDR)",
	},
] as const;

export type BrokerDistributionDataType =
	(typeof DATA_TYPE_OPTIONS)[number]["value"];

export interface BrokerDistributionSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	period: BrokerDistributionPeriod;
	dataType: BrokerDistributionDataType;
	date: string;
	marketBoard: string;
	investorType: string;
	actionMode: "visualize" | "json";
}

export const DEFAULT_BROKER_DISTRIBUTION_SETTINGS: BrokerDistributionSettings =
	{
		baseUrl: "",
		token: "",
		symbol: "",
		period: "TB_PERIOD_LAST_3_MONTHS",
		dataType: "BROKER_DISTRIBUTION_DATA_TYPE_VOLUME",
		date: "",
		marketBoard: "MARKET_TYPE_REGULER",
		investorType: "INVESTOR_TYPE_ALL",
		actionMode: "visualize",
	};
