export interface HistoricalTradeResult {
	date: string;
	close: number;
	change: number;
	value: number;
	volume: number;
	frequency: number;
	foreign_buy: number;
	foreign_sell: number;
	net_foreign: number;
	open: number;
	high: number;
	low: number;
	average: number;
	change_percentage: number;
}

export interface HistoricalTradePaginate {
	next_page: string;
}

export interface HistoricalTradeData {
	result: HistoricalTradeResult[];
	paginate: HistoricalTradePaginate;
}

export interface HistoricalTradeResponse {
	message: string;
	data: HistoricalTradeData;
}

export interface HistoricalTradeFilters {
	symbol: string;
	period: string;
	startDate: string;
	endDate: string;
	limit: number;
}

export interface HistoricalTradeSettings extends HistoricalTradeFilters {
	baseUrl: string;
	token: string;
}

export const CSV_COLUMNS = [
	"date",
	"close",
	"change",
	"value",
	"volume",
	"frequency",
	"foreign_buy",
	"foreign_sell",
	"net_foreign",
	"open",
	"high",
	"low",
	"average",
	"change_percentage",
] as const;

export function getDefaultDateRange(): { startDate: string; endDate: string } {
	const now = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

	const past = new Date(now);
	past.setFullYear(now.getFullYear() - 1);
	const startDate = `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`;

	return { startDate, endDate };
}

const defaultRange = getDefaultDateRange();

export const DEFAULT_SETTINGS: HistoricalTradeSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	period: "HS_PERIOD_DAILY",
	startDate: defaultRange.startDate,
	endDate: defaultRange.endDate,
	limit: 50,
};
