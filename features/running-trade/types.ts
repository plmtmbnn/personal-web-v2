export interface RunningTradeValue {
	raw: number;
	formatted: string;
}

export interface RunningTrade {
	id: string;
	time: string;
	action: string;
	code: string;
	price: string;
	change: string;
	lot: string;
	is_broker_exists: boolean;
	buyer: string;
	seller: string;
	trade_number: string;
	buyer_type: string;
	seller_type: string;
	market_board: string;
	buy_order_number: string;
	sell_order_number: string;
	group_order_number: string;
	value: RunningTradeValue;
}

export interface RunningTradeData {
	is_open_market: boolean;
	running_trade: RunningTrade[];
	is_show_bs: boolean;
	break_time_left_seconds: number;
	date: string;
}

export interface RunningTradeResponse {
	message: string;
	data: RunningTradeData;
}

export const MARKET_BOARDS = [
	"BOARD_TYPE_REGULAR",
	"BOARD_TYPE_NEGOTIATION",
] as const;

export type MarketBoard = (typeof MARKET_BOARDS)[number];

export interface RunningTradeFilters {
	symbol: string;
	marketBoard: MarketBoard;
	minimumLot: number;
	valueFrom: number;
	limit: number;
}

export interface RunningTradeSettings extends RunningTradeFilters {
	baseUrl: string;
	token: string;
}

export const DEFAULT_SETTINGS: RunningTradeSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	marketBoard: "BOARD_TYPE_REGULAR",
	minimumLot: 1,
	valueFrom: 1,
	limit: 100,
};
