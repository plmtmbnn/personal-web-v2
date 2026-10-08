/**
 * Technical, cycle, and statistical indicators used by the Investment Compass engine.
 * Pure functions designed for deterministic testing.
 */

export interface PricePointLike {
	c: number;
	t?: number;
}

/**
 * Simple Moving Average (SMA) of close prices over the last N periods.
 */
export function sma(points: PricePointLike[], period: number): number | null {
	if (!points || points.length < period || period <= 0) return null;
	const slice = points.slice(points.length - period);
	const sum = slice.reduce((acc, p) => acc + p.c, 0);
	return sum / period;
}

/**
 * Percentage distance from current price to a moving average.
 * Positive = price above MA, negative = price below MA.
 */
export function distancePct(price: number, ma: number | null): number | null {
	if (ma == null || ma <= 0) return null;
	return ((price - ma) / ma) * 100;
}

/**
 * Calculates percentage slope of an SMA over a lookback window.
 * Positive = MA is sloping upwards, negative = sloping downwards.
 */
export function maSlopePct(
	points: PricePointLike[],
	period: number,
	lookback = 10,
): number | null {
	if (
		!points ||
		points.length < period + lookback ||
		period <= 0 ||
		lookback <= 0
	) {
		return null;
	}
	const currentMa = sma(points, period);
	const pastMa = sma(points.slice(0, points.length - lookback), period);

	if (currentMa == null || pastMa == null || pastMa <= 0) return null;
	return ((currentMa - pastMa) / pastMa) * 100;
}

/**
 * Percentage drawdown from the 52-week high.
 * Returns a negative number (e.g. -12.4% for a 12.4% drop) or 0.
 */
export function drawdownFromHigh(
	currentPrice: number | null,
	high52w: number | null,
): number | null {
	if (
		currentPrice == null ||
		high52w == null ||
		high52w <= 0 ||
		currentPrice <= 0
	) {
		return null;
	}
	if (currentPrice >= high52w) return 0;
	return ((currentPrice - high52w) / high52w) * 100;
}

/**
 * Calculates annualized realized volatility based on daily percentage returns.
 */
export function realizedVol(
	points: PricePointLike[],
	lookback = 30,
	tradingDays = 252,
): number | null {
	if (!points || points.length < lookback + 1 || lookback <= 1) return null;

	const recent = points.slice(points.length - (lookback + 1));
	const returns: number[] = [];

	for (let i = 1; i < recent.length; i++) {
		const prev = recent[i - 1].c;
		const curr = recent[i].c;
		if (prev > 0 && curr > 0) {
			returns.push(Math.log(curr / prev));
		}
	}

	if (returns.length < lookback - 2) return null;

	const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
	const variance =
		returns.reduce((acc, r) => acc + (r - mean) ** 2, 0) / (returns.length - 1);
	const stdDev = Math.sqrt(variance);

	// Annualize
	return stdDev * Math.sqrt(tradingDays) * 100;
}

/**
 * Relative Strength Index (RSI 14).
 */
export function rsi(points: PricePointLike[], period = 14): number | null {
	if (!points || points.length < period + 1) return null;

	let gains = 0;
	let losses = 0;

	// Initial SMA of gains and losses
	for (let i = 1; i <= period; i++) {
		const change = points[i].c - points[i - 1].c;
		if (change > 0) gains += change;
		else losses += Math.abs(change);
	}

	let avgGain = gains / period;
	let avgLoss = losses / period;

	// Smoothed averages (Wilder's method)
	for (let i = period + 1; i < points.length; i++) {
		const change = points[i].c - points[i - 1].c;
		const gain = change > 0 ? change : 0;
		const loss = change < 0 ? Math.abs(change) : 0;

		avgGain = (avgGain * (period - 1) + gain) / period;
		avgLoss = (avgLoss * (period - 1) + loss) / period;
	}

	if (avgLoss === 0) return 100;
	const rs = avgGain / avgLoss;
	return 100 - 100 / (1 + rs);
}

/**
 * Sahm Rule Recession Indicator:
 * Triggers when the 3-month moving average of the national unemployment rate (U3)
 * rises by 0.50 percentage points or more relative to the minimum 3-month average
 * during the previous 12 months.
 */
export function sahmRule(unrateSeries: Array<{ value: number }>): {
	triggered: boolean;
	value: number | null;
	current3m: number | null;
	minPrior12m: number | null;
} {
	if (!unrateSeries || unrateSeries.length < 15) {
		return {
			triggered: false,
			value: null,
			current3m: null,
			minPrior12m: null,
		};
	}

	// Calculate 3-month moving average for each point from index 2 onwards
	const threeMonthAverages: number[] = [];
	for (let i = 2; i < unrateSeries.length; i++) {
		const avg =
			(unrateSeries[i].value +
				unrateSeries[i - 1].value +
				unrateSeries[i - 2].value) /
			3;
		threeMonthAverages.push(avg);
	}

	const current3m = threeMonthAverages[threeMonthAverages.length - 1];
	// Prior 12 months of 3-month averages (excluding the current one)
	const priorAverages = threeMonthAverages.slice(
		Math.max(0, threeMonthAverages.length - 13),
		threeMonthAverages.length - 1,
	);

	if (priorAverages.length < 6) {
		return {
			triggered: false,
			value: null,
			current3m: null,
			minPrior12m: null,
		};
	}

	const minPrior12m = Math.min(...priorAverages);
	const diff = current3m - minPrior12m;

	return {
		triggered: diff >= 0.5,
		value: Number(diff.toFixed(2)),
		current3m: Number(current3m.toFixed(2)),
		minPrior12m: Number(minPrior12m.toFixed(2)),
	};
}

/**
 * Calculates elapsed months since the Bitcoin halving (April 20, 2024).
 * Returns phase interpretation according to historical 4-year cycle patterns.
 */
export function getHalvingCyclePhase(now = new Date()): {
	monthsElapsed: number;
	phase: string;
	description: string;
} {
	const halvingDate = new Date("2024-04-20T00:00:00Z");
	const diffTime = now.getTime() - halvingDate.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
	const monthsElapsed = Math.floor(diffDays / 30.4375);

	let phase = "Early Post-Halving Accumulation";
	let description = "Re-accumulation zone following supply issuance reduction.";

	if (monthsElapsed >= 6 && monthsElapsed < 18) {
		phase = "Parabolic / Euphoria Window";
		description =
			"Historically the strongest momentum phase of the 4-year cycle.";
	} else if (monthsElapsed >= 18 && monthsElapsed < 30) {
		phase = "Late-Cycle Distribution & Correction";
		description =
			"Historical cycle peak window and subsequent macro liquidity pullback.";
	} else if (monthsElapsed >= 30) {
		phase = "Bear Market Floor & Reset";
		description =
			"Cyclical bottoming process approaching the next 200-week moving average.";
	}

	return {
		monthsElapsed,
		phase,
		description,
	};
}

/**
 * Checks if short-term volatility (14d) is significantly higher than baseline volatility (90d).
 * Returns true if 14d Vol > 1.5x 90d Vol.
 */
export function checkVolatilityExpansion(points: PricePointLike[]): {
	isExpanded: boolean;
	shortVol: number | null;
	baselineVol: number | null;
} {
	const shortVol = realizedVol(points, 14);
	const baselineVol = realizedVol(points, 90);

	if (shortVol != null && baselineVol != null && baselineVol > 0) {
		const isExpanded = shortVol > baselineVol * 1.5;
		return { isExpanded, shortVol, baselineVol };
	}

	return { isExpanded: false, shortVol, baselineVol };
}
