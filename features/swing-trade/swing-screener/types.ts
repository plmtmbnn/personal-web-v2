export interface LayerScore {
	score: number;
	base_weight: number;
	effective_weight_pct: number;
}

export interface LayerScores {
	layer1_price: LayerScore;
	layer2_orderflow: LayerScore;
	layer3_bandar: LayerScore;
	layer4_trajectory: LayerScore;
	layer5_network: LayerScore;
}

export interface SwingAction {
	key:
		| "STRONG_BUY"
		| "BUY_ON_WEAKNESS"
		| "WAIT_FOR_TRIGGER"
		| "AVOID"
		| "AVOID_DISTRIBUTION"
		| string;
	label: string;
	conviction: string;
	best_setup: string;
}

export interface TradePlan {
	status: string;
	strategy: string;
	entry_zone: string;
	entry_low: number;
	entry_high: number;
	entry_ref: number;
	sl: number;
	sl_pct_net: number;
	tp1: number;
	tp1_pct_net: number;
	tp2: number;
	tp2_pct_net: number;
	rr_tp1_net: number;
	rr_tp2_net: number;
	rr_net: number;
	holding_horizon: string;
	trigger_rule: string;
}

export interface OHLC {
	open: number;
	high: number;
	low: number;
	close: number;
	average_vwap: number;
	prev_close: number;
	change: number;
	change_pct: number;
	volume_lot: number;
	value_idr: number;
	frequency: number;
	tick: number;
	ara_limit_pct: number;
	arb_7_floor: number;
}

export interface MovingAverages {
	ma10: number;
	ma20: number;
	ma50: number;
	ma200: number;
	close_vs_ma20_pct: number;
	close_vs_ma50_pct: number;
	close_vs_ma200_pct: number;
}

export interface TrendVCP {
	trend_regime: string;
	atr14: number;
	atr_pct: number;
	range_5d_pct: number;
	range_20d_pct: number;
	vcp_ratio: number;
	is_vcp: boolean;
	vol_dryup_ratio: number;
	red_vol_ratio: number;
	quiet_vol_ratio: number;
	is_vol_dryup: boolean;
	vol_breakout_ratio: number;
	is_breakout_10d: boolean;
	median_val_20d: number;
	avg_val_20d: number;
	avg_val_5d: number;
	avg_lot_20d: number;
	avg_lot_5d: number;
}

export interface Levels {
	daily_vwap: number;
	avwap_swing_low: number;
	vpoc_10d: number;
	val_10d: number;
	vah_10d: number;
	vpoc_20d: number;
	val_20d: number;
	vah_20d: number;
	vpoc_60d: number;
	va_migration: string;
	swing_low_22d: number;
	swing_low_date: string;
	swing_high_22d: number;
	swing_high_date: string;
	high_10d: number;
	low_10d: number;
}

export interface OrderFlowWindow {
	days: number;
	overall_net_val: number;
	overall_net_lot: number;
	haka_buy_pct: number;
	bm_net_val: number;
	bm_net_lot: number;
	bm_buy_pct: number;
	bm_pos_days: number;
	bm_rt_net_val: number;
	bm_rt_net_lot: number;
	retail_net_val: number;
	retail_net_lot: number;
	plir: number;
}

export interface AnchoredOrderFlow {
	anchor_date: string;
	days_since_low: number;
	avwap_swing_low: number;
	bm_net_val_since_low: number;
	bm_rt_net_val_since_low: number;
	red_day_bm_absorption_10d: number;
	red_day_absorption_days_10d: number;
}

export interface OrderFlowData {
	available: boolean;
	score: number;
	window_1d: OrderFlowWindow;
	window_5d: OrderFlowWindow;
	window_10d: OrderFlowWindow;
	anchored_from_swing_low: AnchoredOrderFlow;
	execution_regime: string;
	paint_the_tape_trap: boolean;
}

export interface TopBuyerItem {
	code: string;
	type: string;
	net_lot: number;
	gross_lot: number;
	net_val: number;
	gross_val: number;
	freq: number;
	lot_per_trade: number;
	val_per_trade: number;
	conviction_ratio: number;
	avg_price: number;
	close_vs_avg_pct: number;
	behavior: string;
	is_trapped_legacy: boolean;
}

export interface CostBasisMap {
	top3_buyer_avg_cost: number;
	inst_accumulator_avg_cost: number;
	active_inst_avg_cost: number;
	close_vs_inst_cost_pct: number;
	close_vs_active_cost_pct: number;
	overhead_supply_wall: number | null;
	top1_buyer_churn_trapped: boolean;
	top1_buyer_legacy_trapped: boolean;
	top3_all_churn_crowd: boolean;
	hc_buyer_count: number;
	active_hc_buyer_count: number;
	trapped_legacy_count: number;
	hc_buy_vs_sell_ratio: number;
}

export interface BandarStructure {
	available: boolean;
	score: number;
	period_from: string;
	period_to: string;
	bandar_summary: {
		broker_accdist: string;
		cycle_vwap: number;
		total_buyer: number;
		total_seller: number;
		top1_pct: number;
		top3_pct: number;
		top5_pct: number;
		avg5_pct: number;
	};
	cost_basis_map: CostBasisMap;
	top_buyers: TopBuyerItem[];
}

export interface BrokerTrajectorySignals {
	seller_exhaustion: boolean;
	exhausted_seller_codes: string[];
	active_multi_day_distribution: boolean;
	distributor_buyback: boolean;
	buyback_details: unknown[];
	retail_capitulation: boolean;
	capitulation_details: unknown[];
	fresh_dip_accumulation: boolean;
	fresh_dip_buyers: Array<{
		code: string;
		delta_1d_lot: number;
		delta_5d_lot: number;
	}>;
	sustained_inst_accumulation: boolean;
	sustained_inst_buyers: Array<{
		code: string;
		current_cum_lot: number;
		delta_10d_lot: number;
	}>;
}

export interface BrokerTrajectory {
	available: boolean;
	score: number;
	signals: BrokerTrajectorySignals;
}

export interface SelfMatchBreakdownItem {
	code: string;
	net_lot: number;
	gross_lot: number;
	self_match_lot: number;
	self_match_pct: number;
	self_match_vs_net_multiple: number;
	counterparty_count: number;
}

export interface BrokerNetwork {
	available: boolean;
	score: number;
	network_topology: string;
	weighted_self_match_pct: number;
	top1_self_match_vs_net_multiple: number;
	self_match_breakdown: SelfMatchBreakdownItem[];
}

export interface SetupParams {
	status: string;
	strategy: string;
	entry_zone: string;
	sl: number;
	tp1: number;
	tp2: number;
	rr_net: number;
}

export interface PlaybookSetup {
	id: number;
	name: string;
	category: string;
	score: number;
	params: SetupParams;
}

export interface RiskFlags {
	is_arb_today: boolean;
	recent_arb_days_5d: number;
	recent_suspension_10d: boolean;
	blow_off_rejection_10d: boolean;
	zero_vol_days_10d: number;
	zero_vol_days_40d: number;
	illiquid: boolean;
}

export interface SwingScreenerResponse {
	ticker: string;
	date: string;
	horizon: string;
	swing_score: number;
	active_layers: number;
	layer_scores: LayerScores;
	action: SwingAction;
	trade_plan: TradePlan;
	ohlc: OHLC;
	moving_averages: MovingAverages;
	trend_vcp: TrendVCP;
	levels: Levels;
	order_flow: OrderFlowData;
	bandar_structure: BandarStructure;
	broker_trajectory: BrokerTrajectory;
	broker_network: BrokerNetwork;
	setups: PlaybookSetup[];
	flags: RiskFlags;
}

export interface SwingScreenerSettings {
	baseUrl: string;
	token: string;
	symbol: string;
	feeBuy: number;
	feeSell: number;
	apiEndpoint: string;
	ingestMode: "live" | "upload";
}

export const DEFAULT_SWING_SCREENER_SETTINGS: SwingScreenerSettings = {
	baseUrl: "",
	token: "",
	symbol: "",
	feeBuy: 0.15,
	feeSell: 0.25,
	apiEndpoint: "https://peoel-screener-py.vercel.app/api/v1/analyze-swing",
	ingestMode: "live",
};

export type FeedStatus = "idle" | "fetching" | "success" | "failed";

export interface FeedCollectionProgress {
	historical: FeedStatus;
	tradeBook: FeedStatus;
	marketDetector: FeedStatus;
	runningTradeChart: FeedStatus;
	brokerDistribution: FeedStatus;
	screener: FeedStatus;
}

export const DEFAULT_FEED_PROGRESS: FeedCollectionProgress = {
	historical: "idle",
	tradeBook: "idle",
	marketDetector: "idle",
	runningTradeChart: "idle",
	brokerDistribution: "idle",
	screener: "idle",
};
