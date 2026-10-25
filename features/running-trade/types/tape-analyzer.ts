export interface ScreenerAction {
	key: string;
	label: string;
	icon?: string;
}

export interface ScreenerOhlc {
	o: number;
	h: number;
	l: number;
	c: number;
	last: number;
	prev_close: number;
	ara: number;
	arb: number;
}

export interface ScreenerOrb {
	high: number;
	low: number;
	status: string;
	up_t: string | null;
	dn_t: string | null;
}

export interface ScreenerLevels {
	vwap: number;
	vpoc: number;
	val: number;
	vah: number;
	orb: ScreenerOrb;
}

export interface ScreenerRecent {
	minutes: number;
	n: number;
	delta: number;
	buy_pct: number;
	price_chg: number;
	p_from: number;
	p_to: number;
	speed: number;
	near_high: boolean;
	near_low: boolean;
	bear_div: boolean;
	bull_div: boolean;
	gap_min: number;
}

export interface ScreenerBmRecent {
	buy: number;
	sell: number;
	net: number;
}

export interface ScreenerZeroAskLow {
	level: number;
	lot: number;
	buy: number;
	sell: number;
	buy_ratio: number;
	is_zero: boolean;
	is_near_zero: boolean;
	recovered: boolean;
	recovery_high: number;
	last_t: string;
	last_s: number;
	first_s: number;
	held_min: number;
}

export interface ScreenerBmDivergence {
	bm_buy: number;
	bm_sell: number;
	bmrt_buy: number;
	bmrt_sell: number;
	bm_bull: boolean;
	bmrt_bull: boolean;
	divergent: boolean;
	false_bull: boolean;
	false_bear: boolean;
}

export interface ScreenerArchetype {
	name: string;
	score: number;
}

export interface ScreenerSetupParams {
	status: string;
	actionable: boolean;
	entry_zone: string;
	cut_loss: string;
	tp1: string;
	tp2: string;
	rrr: string;
	rr_gross?: number;
	rr_net?: number;
	entry_lo?: number;
	entry_hi?: number;
	sl?: number;
	tp1_px?: number;
	max_holding: string;
	trigger_rule: string;
}

export interface ScreenerSetup {
	id: number;
	name: string;
	score: number;
	met: [string, string][];
	pending: [string, string][];
	params: ScreenerSetupParams;
}

export interface TapeAnalyzerResponse {
	ticker: string;
	date: string;
	snapshot_time: string;
	is_live: boolean;
	action: ScreenerAction;
	ohlc: ScreenerOhlc;
	volume: number;
	turnover: number;
	levels: ScreenerLevels;
	block_lot: number;
	tick: number;
	recent: ScreenerRecent;
	bm_recent: ScreenerBmRecent;
	zero_ask_low: ScreenerZeroAskLow;
	bm_divergence: ScreenerBmDivergence;
	archetypes: ScreenerArchetype[];
	setups: ScreenerSetup[];
}

export type BlockMode = "adaptive" | "fixed";

export interface TapeAnalyzerSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	feeBuy: number;
	feeSell: number;
	blockMode: BlockMode;
	apiEndpoint: string;
}

export const DEFAULT_TAPE_ANALYZER_SETTINGS: TapeAnalyzerSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	feeBuy: 0.15,
	feeSell: 0.25,
	blockMode: "adaptive",
	apiEndpoint: "https://peoel-screener-py.vercel.app/api/v1/analyze",
};
