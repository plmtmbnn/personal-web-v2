export interface CapitalBucket {
	id: string;
	title: string;
	sharePct: number;
	badge: string;
	purpose: string;
	instruments: string[];
	rules: string[];
}

export interface RiskRule {
	id: string;
	number: number;
	title: string;
	subtitle: string;
	description: string;
	tag: "SURVIVAL" | "DISCIPLINE" | "EXECUTION" | "CAPITAL";
}

export interface CircuitBreaker {
	drawdown: string;
	action: string;
	protocol: string;
}

export interface PreTradeCheck {
	id: string;
	question: string;
	mandate: string;
}

export const CAPITAL_BUCKETS: CapitalBucket[] = [
	{
		id: "emergency",
		title: "Emergency Reserve",
		sharePct: 0, // Excluded from investable capital
		badge: "6-Month Living Expenses",
		purpose:
			"Non-negotiable cash cushion. Untouchable for any investment or trade.",
		instruments: ["High-yield bank savings", "Instant liquid deposits"],
		rules: [
			"Never counted as trading or investment capital.",
			"Eliminates panic-selling during life emergencies.",
		],
	},
	{
		id: "safe",
		title: "Safe Yield & Capital Preservation",
		sharePct: 40,
		badge: "Preservation Anchor",
		purpose:
			"Protects baseline wealth from drawdowns while generating predictable real yield.",
		instruments: [
			"Retail SBN (ORI, SBR, ST)",
			"Bank Deposits (Deposito)",
			"Physical Gold (LM Antam)",
		],
		rules: [
			"Never reallocated into speculative trading setups.",
			"Provides dry powder for generational capitulation tranches.",
		],
	},
	{
		id: "longterm",
		title: "Long-Term Strategic Core",
		sharePct: 45,
		badge: "Compounding Engine",
		purpose:
			"Disciplined accumulation of wide-moat, dividend-yielding blue-chips and digital gold.",
		instruments: [
			"IHSG Big Banks (BBCA, BMRI, BBNI)",
			"Defensive Leaders (ICBP, ASII, TLKM)",
			"Bitcoin & Ethereum majors spot only",
		],
		rules: [
			"Steady DCA or tranche buying only near technical support.",
			"Maximum single stock allocation: 10% of core bucket.",
		],
	},
	{
		id: "trading",
		title: "Tactical Trading & Swing",
		sharePct: 15,
		badge: "Active Risk Cap",
		purpose: "High-focus tactical swings strictly gated by regime permissions.",
		instruments: [
			"Liquid LQ45 swing setups",
			"Breakout re-tests above 200D MA",
		],
		rules: [
			"Hard maximum loss per trade: 0.5% - 1.0% of trading bucket.",
			"Zero futures, zero margin, zero leverage.",
		],
	},
];

export const RISK_RULES: RiskRule[] = [
	{
		id: "survival-first",
		number: 1,
		title: "Survival is the Ultimate Alpha",
		subtitle: "Max loss 0.5% - 1.0% per trade",
		description:
			"Size every position so that hitting your stop-loss costs at most 1% of trading capital. If you don't know your stop before entering, you have no trade.",
		tag: "SURVIVAL",
	},
	{
		id: "no-averaging-down",
		number: 2,
		title: "Never Average Down on a Losing Trade",
		subtitle: "Cut early, protect capital",
		description:
			"Averaging down turns an error into a portfolio disaster. Only planned long-term core tranches may accumulate lower, never tactical swing trades.",
		tag: "DISCIPLINE",
	},
	{
		id: "respect-regime",
		number: 3,
		title: "Respect the Macro & Market Regime",
		subtitle: "Do not fight the liquidity trend",
		description:
			"When the engine signals 'Defensive' or 'Stress', active trading is closed. Cash is an active position that preserves mental clarity and dry powder.",
		tag: "EXECUTION",
	},
	{
		id: "trend-filter",
		number: 4,
		title: "Respect the 200-Day Moving Average",
		subtitle: "Trade with the primary trend",
		description:
			"No new swing long positions when an asset trades below its 200-day moving average. The probability of support failure multiplies in downtrends.",
		tag: "DISCIPLINE",
	},
	{
		id: "profit-discipline",
		number: 5,
		title: "Mechanical Profit Taking at +2R",
		subtitle: "Pay yourself and derisk",
		description:
			"When your trade reaches 2× your initial dollar risk (+2R), take 30-50% off the table and move your stop to breakeven. Never let a green trade become a big loss.",
		tag: "CAPITAL",
	},
	{
		id: "concentration-cap",
		number: 6,
		title: "Strict Position & Altcoin Caps",
		subtitle: "Avoid catastrophic single-asset blowups",
		description:
			"Never hold more than 10% in any single IHSG stock. Total altcoins strictly capped at <= 3% of net wealth, held only during confirmed alt-season conditions.",
		tag: "CAPITAL",
	},
];

export const CIRCUIT_BREAKERS: CircuitBreaker[] = [
	{
		drawdown: "-5% Trading Drawdown in 30 Days",
		action: "Cut Position Sizes by 50%",
		protocol:
			"Halve your maximum risk to 0.5% per trade. Stick strictly to top liquid blue-chips. Re-calibrate your mental state.",
	},
	{
		drawdown: "-10% Trading Drawdown in 30 Days",
		action: "Mandatory 14-Day Trading Pause",
		protocol:
			"Liquidate all open swing positions. Move 100% of trading bucket to cash. No market orders for two weeks.",
	},
	{
		drawdown: "-15% Trading Drawdown in 90 Days",
		action: "Freeze Trading Bucket for the Quarter",
		protocol:
			"Active trading is terminated. Re-route all monthly savings to Safe Assets (SBN/Deposits) and disciplined blue-chip DCA only.",
	},
];

export const HARD_BANS: string[] = [
	"Zero Crypto Futures, Perpetual Contracts, or Margin Trading.",
	"Zero Margin Accounts or borrowed capital for Indonesian Equities.",
	"Zero trading in 'Papan Pemantauan Khusus' (Full Call Auction) or UMA-flagged stocks.",
	"Zero FOMO buying into extended parabolic runs (> 20% above the 50-day moving average).",
	"Zero trading based on social media tips, Telegram groups, or hype influencers.",
];

export const PRE_TRADE_CHECKLIST: PreTradeCheck[] = [
	{
		id: "regime-check",
		question: "Does the current Regime allow this trade style?",
		mandate: "Permissions matrix must show 'Allowed' for your timeframe.",
	},
	{
		id: "trend-check",
		question: "Is the asset trading above its 200-Day / 50-Day MA?",
		mandate: "Never initiate swing longs against primary downtrends.",
	},
	{
		id: "stop-check",
		question: "Is the exact Stop-Loss level defined before entry?",
		mandate:
			"Based on technical support or swing low, not arbitrary dollar amounts.",
	},
	{
		id: "sizing-check",
		question: "Is the loss at the stop strictly <= 1% of trading capital?",
		mandate:
			"Position size must be mathematically calculated before placing the order.",
	},
	{
		id: "fomo-check",
		question: "Am I buying a pullback, not a green candle extension?",
		mandate: "Asset must not have surged more than 3 consecutive sessions.",
	},
];

export const RECOVERY_MATH_TABLE = [
	{ loss: "-10%", gainRequired: "+11.1%", difficulty: "Normal compounding" },
	{ loss: "-20%", gainRequired: "+25.0%", difficulty: "Moderate discipline" },
	{ loss: "-30%", gainRequired: "+42.9%", difficulty: "Patient execution" },
	{
		loss: "-50%",
		gainRequired: "+100.0%",
		difficulty: "Doubling capital required",
	},
	{
		loss: "-80%",
		gainRequired: "+400.0%",
		difficulty: "Extreme recovery — preservation mandatory",
	},
	{
		loss: "-90%",
		gainRequired: "+900.0%",
		difficulty: "Virtually impossible without fresh capital",
	},
];
