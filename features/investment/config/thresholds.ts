/**
 * Centralized Investment & Risk Thresholds.
 * Used across the engine, regime scorers, permissions matrix, and alerts.
 */

export interface InvestmentThresholds {
	// Global Liquidity
	dxy: {
		strong: number;
		neutral: number;
		weak: number;
		overnightRallyPct: number;
	};
	us10y: {
		stress: number;
		neutral: number;
	};
	hySpread: {
		healthy: number;
		stress: number;
	};
	vix: {
		calm: number;
		elevated: number;
		panic: number;
	};

	// Indonesia / IHSG
	ihsg: {
		correctionDrawdownPct: number;
		bearDrawdownPct: number;
		overnightSelloffPct: number;
	};
	usdIdr: {
		overnightSurgePct: number;
	};

	// Crypto
	crypto: {
		overnightShockPct: number;
		fundingOverheated: number;
		fundingHeavilyNegative: number;
		stablecoinExpansionPct: number;
		stablecoinContractionPct: number;
		altcoinBtcDominanceMax: number;
		mvrv: {
			accumulation: number;
			overheat: number;
			extremeOverheat: number;
		};
	};

	// Macro Liquidity & Policy Indicators
	macro: {
		m2YoY: {
			contraction: number;
			expansion: number;
		};
		cpiYoY: {
			benign: number;
			sticky: number;
		};
		biRate: {
			restrictive: number;
			neutral: number;
		};
	};

	// Scoring & Coverage
	scoring: {
		riskOnMin: number;
		selectiveMin: number;
		defensiveMin: number;
		minCoverageFull: number;
		minCoveragePartial: number;
	};
}

export const DEFAULT_THRESHOLDS: InvestmentThresholds = {
	dxy: {
		strong: 104.5,
		neutral: 101.5,
		weak: 100.0,
		overnightRallyPct: 0.7,
	},
	us10y: {
		stress: 4.5,
		neutral: 3.8,
	},
	hySpread: {
		healthy: 3.8,
		stress: 5.0,
	},
	vix: {
		calm: 16.0,
		elevated: 22.0,
		panic: 28.0,
	},
	macro: {
		m2YoY: {
			contraction: 0.0,
			expansion: 4.0,
		},
		cpiYoY: {
			benign: 2.5,
			sticky: 3.5,
		},
		biRate: {
			restrictive: 6.0,
			neutral: 5.5,
		},
	},
	ihsg: {
		correctionDrawdownPct: 10.0,
		bearDrawdownPct: 20.0,
		overnightSelloffPct: -1.5,
	},
	usdIdr: {
		overnightSurgePct: 0.6,
	},
	crypto: {
		overnightShockPct: 5.0,
		fundingOverheated: 0.03, // 0.03% per 8h
		fundingHeavilyNegative: -0.02,
		stablecoinExpansionPct: 1.5,
		stablecoinContractionPct: -1.0,
		altcoinBtcDominanceMax: 54.0,
		mvrv: {
			accumulation: 1.0,
			overheat: 3.2,
			extremeOverheat: 3.7,
		},
	},
	scoring: {
		riskOnMin: 65,
		selectiveMin: 45,
		defensiveMin: 30,
		minCoverageFull: 0.7,
		minCoveragePartial: 0.5,
	},
};
