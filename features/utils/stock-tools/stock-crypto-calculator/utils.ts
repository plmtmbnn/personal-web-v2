import type {
	AssetType,
	BudgetOptimizerResult,
	ConsolidatedStats,
	CurrencyCode,
	ExitLevel,
	FeeConfig,
	PresetScenario,
	ScenarioPoint,
	StopLevel,
	StockUnit,
	TargetOptimizerResult,
	Tranche,
	TrancheStat,
} from "./types";

export const DEFAULT_FEE_CONFIG: Record<AssetType, FeeConfig> = {
	stock: {
		enabled: false,
		buyFeePercent: 0.15, // Standard Indonesian broker buy fee
		sellFeePercent: 0.25, // Standard Indonesian broker sell fee + levy
	},
	crypto: {
		enabled: false,
		buyFeePercent: 0.1, // Standard crypto spot taker fee
		sellFeePercent: 0.1,
	},
};

export function formatCurrency(
	value: number,
	currency: CurrencyCode,
	maxFractionDigits?: number,
): string {
	if (!Number.isFinite(value) || Number.isNaN(value)) return "—";

	if (currency === "IDR") {
		const isWhole = Math.abs(value - Math.round(value)) < 0.01;
		const decimals =
			maxFractionDigits !== undefined ? maxFractionDigits : isWhole ? 0 : 2;
		return new Intl.NumberFormat("id-ID", {
			style: "currency",
			currency: "IDR",
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value);
	}

	const isWhole = Math.abs(value - Math.round(value)) < 0.01;
	const decimals =
		maxFractionDigits !== undefined
			? maxFractionDigits
			: value > 0 && value < 1
				? 4
				: isWhole
					? 0
					: 2;

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

export function formatQuantity(
	value: number,
	assetType: AssetType,
	stockUnit?: StockUnit,
): string {
	if (!Number.isFinite(value) || Number.isNaN(value)) return "0";

	if (assetType === "stock") {
		return new Intl.NumberFormat("id-ID", {
			maximumFractionDigits: stockUnit === "lots" ? 0 : 2,
		}).format(value);
	}

	// Crypto: display up to 6 decimals, trim trailing zeros
	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: value >= 100 ? 2 : 6,
	}).format(value);
}

export function formatPercent(value: number, includeSign = true): string {
	if (!Number.isFinite(value) || Number.isNaN(value)) return "0.00%";
	const prefix = includeSign && value > 0 ? "+" : "";
	return `${prefix}${value.toFixed(2)}%`;
}

export function calculateConsolidatedStats(
	tranches: Tranche[],
	assetType: AssetType,
	stockUnit: StockUnit,
	feeConfig: FeeConfig,
): ConsolidatedStats {
	const isLotMode = assetType === "stock" && stockUnit === "lots";
	const multiplier = isLotMode ? 100 : 1;

	let totalGrossCapital = 0;
	let totalBuyFees = 0;
	let totalUnits = 0;

	const trancheStats: TrancheStat[] = tranches.map((t) => {
		const price = Math.max(0, Number.parseFloat(t.price) || 0);
		const rawQty = Math.max(0, Number.parseFloat(t.quantity) || 0);
		const normalizedUnits = rawQty * multiplier;
		const grossCapital = price * normalizedUnits;
		const buyFee = feeConfig.enabled
			? grossCapital * (feeConfig.buyFeePercent / 100)
			: 0;
		const totalCapital = grossCapital + buyFee;

		totalGrossCapital += grossCapital;
		totalBuyFees += buyFee;
		totalUnits += normalizedUnits;

		return {
			id: t.id,
			label: t.label,
			price,
			rawQuantity: rawQty,
			normalizedUnits,
			grossCapital,
			buyFee,
			totalCapital,
			capitalWeight: 0,
			unitWeight: 0,
		};
	});

	const totalNetCapital = totalGrossCapital + totalBuyFees;

	for (const stat of trancheStats) {
		stat.capitalWeight =
			totalNetCapital > 0 ? (stat.totalCapital / totalNetCapital) * 100 : 0;
		stat.unitWeight =
			totalUnits > 0 ? (stat.normalizedUnits / totalUnits) * 100 : 0;
	}

	const grossAverage = totalUnits > 0 ? totalGrossCapital / totalUnits : 0;
	const netAverage = totalUnits > 0 ? totalNetCapital / totalUnits : 0;

	// Breakeven price recovers net capital including sell fee
	let breakevenPrice = grossAverage;
	if (feeConfig.enabled && totalUnits > 0) {
		const sellFeeMultiplier = 1 - feeConfig.sellFeePercent / 100;
		breakevenPrice =
			sellFeeMultiplier > 0
				? totalNetCapital / (totalUnits * sellFeeMultiplier)
				: netAverage;
	} else if (totalUnits > 0) {
		breakevenPrice = netAverage;
	}

	const initialTranche = trancheStats[0];
	const initialTrancheAvg = initialTranche ? initialTranche.price : 0;
	const avgDeltaAmount =
		initialTrancheAvg > 0 ? netAverage - initialTrancheAvg : 0;
	const avgDeltaPercent =
		initialTrancheAvg > 0 ? (avgDeltaAmount / initialTrancheAvg) * 100 : 0;

	return {
		totalUnits,
		totalLots: totalUnits / 100,
		totalGrossCapital,
		totalBuyFees,
		totalNetCapital,
		grossAverage,
		netAverage,
		breakevenPrice,
		tranches: trancheStats,
		initialTrancheAvg,
		avgDeltaAmount,
		avgDeltaPercent,
	};
}

export function calculateTargetOptimizer(
	stats: ConsolidatedStats,
	expectedBuyPrice: number,
	targetAveragePrice: number,
	assetType: AssetType,
	stockUnit: StockUnit,
	feeConfig: FeeConfig,
): TargetOptimizerResult {
	if (
		stats.totalUnits <= 0 ||
		expectedBuyPrice <= 0 ||
		targetAveragePrice <= 0
	) {
		return {
			feasible: false,
			reason:
				"Enter valid current holdings, expected buy price, and target average price.",
			requiredUnits: 0,
			requiredLots: 0,
			requiredCapital: 0,
			resultingUnits: 0,
			resultingLots: 0,
			resultingNetCapital: 0,
			resultingAverage: 0,
		};
	}

	const c0 = stats.totalNetCapital;
	const u0 = stats.totalUnits;
	const buyFeeMultiplier = feeConfig.enabled
		? 1 + feeConfig.buyFeePercent / 100
		: 1;
	const effectiveBuyPrice = expectedBuyPrice * buyFeeMultiplier;

	// Formula: (c0 + x * effectiveBuyPrice) / (u0 + x) = targetAvg
	// x * (effectiveBuyPrice - targetAvg) = targetAvg * u0 - c0
	const denominator = effectiveBuyPrice - targetAveragePrice;
	const numerator = targetAveragePrice * u0 - c0;

	if (Math.abs(denominator) < 1e-9) {
		return {
			feasible: false,
			reason:
				"Target average cannot match the effective buy price of the planned tranche.",
			requiredUnits: 0,
			requiredLots: 0,
			requiredCapital: 0,
			resultingUnits: 0,
			resultingLots: 0,
			resultingNetCapital: 0,
			resultingAverage: 0,
		};
	}

	const x = numerator / denominator;

	if (x <= 0) {
		if (
			targetAveragePrice < stats.netAverage &&
			expectedBuyPrice >= targetAveragePrice
		) {
			return {
				feasible: false,
				reason:
					"Target average is lower than current average, but your expected buy price is above the target. You must buy at a price lower than the target to average down.",
				requiredUnits: 0,
				requiredLots: 0,
				requiredCapital: 0,
				resultingUnits: 0,
				resultingLots: 0,
				resultingNetCapital: 0,
				resultingAverage: 0,
			};
		}
		if (
			targetAveragePrice > stats.netAverage &&
			expectedBuyPrice <= targetAveragePrice
		) {
			return {
				feasible: false,
				reason:
					"Target average is higher than current average, but your expected buy price is below the target. You cannot average up by buying cheaper.",
				requiredUnits: 0,
				requiredLots: 0,
				requiredCapital: 0,
				resultingUnits: 0,
				resultingLots: 0,
				resultingNetCapital: 0,
				resultingAverage: 0,
			};
		}
		return {
			feasible: false,
			reason:
				"Target average is already reached or unattainable with current parameters.",
			requiredUnits: 0,
			requiredLots: 0,
			requiredCapital: 0,
			resultingUnits: 0,
			resultingLots: 0,
			resultingNetCapital: 0,
			resultingAverage: 0,
		};
	}

	const isLotMode = assetType === "stock" && stockUnit === "lots";
	// In lot mode, round up to whole lot
	let requiredUnits = x;
	let requiredLots = x / 100;

	if (isLotMode) {
		requiredLots = Math.ceil(x / 100);
		requiredUnits = requiredLots * 100;
	} else if (assetType === "stock") {
		requiredUnits = Math.ceil(x);
		requiredLots = requiredUnits / 100;
	}

	const requiredCapital = requiredUnits * effectiveBuyPrice;
	const resultingUnits = u0 + requiredUnits;
	const resultingLots = resultingUnits / 100;
	const resultingNetCapital = c0 + requiredCapital;
	const resultingAverage = resultingNetCapital / resultingUnits;

	return {
		feasible: true,
		requiredUnits,
		requiredLots,
		requiredCapital,
		resultingUnits,
		resultingLots,
		resultingNetCapital,
		resultingAverage,
	};
}

export function calculateBudgetOptimizer(
	stats: ConsolidatedStats,
	availableBudget: number,
	expectedBuyPrice: number,
	assetType: AssetType,
	stockUnit: StockUnit,
	feeConfig: FeeConfig,
): BudgetOptimizerResult {
	if (stats.totalUnits <= 0 || availableBudget <= 0 || expectedBuyPrice <= 0) {
		return {
			acquiredUnits: 0,
			acquiredLots: 0,
			capitalUsed: 0,
			residualBudget: availableBudget,
			newTotalUnits: stats.totalUnits,
			newTotalLots: stats.totalLots,
			newTotalCapital: stats.totalNetCapital,
			newAverage: stats.netAverage,
			averageReductionAmount: 0,
			averageReductionPercent: 0,
		};
	}

	const buyFeeMultiplier = feeConfig.enabled
		? 1 + feeConfig.buyFeePercent / 100
		: 1;
	const effectiveUnitCost = expectedBuyPrice * buyFeeMultiplier;

	const isLotMode = assetType === "stock" && stockUnit === "lots";
	let acquiredUnits = 0;
	let acquiredLots = 0;

	if (isLotMode) {
		const costPerLot = 100 * effectiveUnitCost;
		acquiredLots = Math.floor(availableBudget / costPerLot);
		acquiredUnits = acquiredLots * 100;
	} else if (assetType === "stock") {
		acquiredUnits = Math.floor(availableBudget / effectiveUnitCost);
		acquiredLots = acquiredUnits / 100;
	} else {
		// Crypto allows high fractional units
		acquiredUnits = availableBudget / effectiveUnitCost;
		acquiredLots = 0;
	}

	const capitalUsed = acquiredUnits * effectiveUnitCost;
	const residualBudget = Math.max(0, availableBudget - capitalUsed);
	const newTotalUnits = stats.totalUnits + acquiredUnits;
	const newTotalLots = newTotalUnits / 100;
	const newTotalCapital = stats.totalNetCapital + capitalUsed;
	const newAverage = newTotalUnits > 0 ? newTotalCapital / newTotalUnits : 0;
	const averageReductionAmount = stats.netAverage - newAverage;
	const averageReductionPercent =
		stats.netAverage > 0
			? (averageReductionAmount / stats.netAverage) * 100
			: 0;

	return {
		acquiredUnits,
		acquiredLots,
		capitalUsed,
		residualBudget,
		newTotalUnits,
		newTotalLots,
		newTotalCapital,
		newAverage,
		averageReductionAmount,
		averageReductionPercent,
	};
}

export function calculateExitLadder(
	stats: ConsolidatedStats,
	feeConfig: FeeConfig,
	customTargetPercent?: number,
): ExitLevel[] {
	if (stats.totalUnits <= 0 || stats.netAverage <= 0) return [];

	const percentages = [5, 10, 15, 20, 30, 50];
	if (customTargetPercent && !percentages.includes(customTargetPercent)) {
		percentages.push(customTargetPercent);
		percentages.sort((a, b) => a - b);
	}

	const sellFeeMultiplier = feeConfig.enabled
		? feeConfig.sellFeePercent / 100
		: 0;

	return percentages.map((percent) => {
		const targetPrice = stats.netAverage * (1 + percent / 100);
		const grossProceeds = stats.totalUnits * targetPrice;
		const sellFee = grossProceeds * sellFeeMultiplier;
		const netProceeds = grossProceeds - sellFee;
		const netProfit = netProceeds - stats.totalNetCapital;
		const netRoiPercent =
			stats.totalNetCapital > 0
				? (netProfit / stats.totalNetCapital) * 100
				: percent;

		return {
			percent,
			targetPrice,
			grossProceeds,
			sellFee,
			netProceeds,
			netProfit,
			netRoiPercent,
		};
	});
}

export function calculateStopLossLadder(
	stats: ConsolidatedStats,
	feeConfig: FeeConfig,
	customStopPercent?: number,
): StopLevel[] {
	if (stats.totalUnits <= 0 || stats.netAverage <= 0) return [];

	const percentages = [3, 5, 8, 10, 15];
	if (customStopPercent && !percentages.includes(customStopPercent)) {
		percentages.push(customStopPercent);
		percentages.sort((a, b) => a - b);
	}

	const sellFeeMultiplier = feeConfig.enabled
		? feeConfig.sellFeePercent / 100
		: 0;

	return percentages.map((percent) => {
		const stopPrice = stats.netAverage * (1 - percent / 100);
		const grossProceeds = stats.totalUnits * stopPrice;
		const sellFee = grossProceeds * sellFeeMultiplier;
		const netProceeds = grossProceeds - sellFee;
		const capitalAtRisk = Math.max(0, stats.totalNetCapital - netProceeds);
		const riskPercent =
			stats.totalNetCapital > 0
				? (capitalAtRisk / stats.totalNetCapital) * 100
				: percent;

		return {
			percent,
			stopPrice,
			netProceeds,
			capitalAtRisk,
			riskPercent,
		};
	});
}

export function calculateScenarioPoints(
	stats: ConsolidatedStats,
	currency: CurrencyCode,
	marketPriceOverride?: number,
): ScenarioPoint[] {
	if (stats.totalUnits <= 0) return [];

	const basePrice =
		marketPriceOverride && marketPriceOverride > 0
			? marketPriceOverride
			: stats.netAverage > 0
				? stats.netAverage
				: 1000;

	const steps = [-30, -20, -10, -5, 0, 5, 10, 20, 30, 50];

	return steps.map((pct) => {
		const price = basePrice * (1 + pct / 100);
		const marketValue = stats.totalUnits * price;
		const unrealizedPl = marketValue - stats.totalNetCapital;
		const plPercent =
			stats.totalNetCapital > 0
				? (unrealizedPl / stats.totalNetCapital) * 100
				: pct;

		return {
			percentDelta: pct,
			price,
			priceFormatted: formatCurrency(price, currency, 0),
			marketValue,
			unrealizedPl,
			plPercent,
		};
	});
}

export function generateShareablePlan(
	stats: ConsolidatedStats,
	assetType: AssetType,
	stockUnit: StockUnit,
	currency: CurrencyCode,
	feeConfig: FeeConfig,
): string {
	const unitLabel =
		assetType === "stock" && stockUnit === "lots"
			? `${formatQuantity(stats.totalLots, "stock", "lots")} Lots (${formatQuantity(stats.totalUnits, "stock", "shares")} shares)`
			: `${formatQuantity(stats.totalUnits, assetType)} units`;

	const header = `==================================================\nASSET AVERAGING STRATEGY REPORT\n==================================================\nAsset Type: ${assetType.toUpperCase()} | Currency: ${currency}\nUnit Standard: ${assetType === "stock" ? (stockUnit === "lots" ? "Lots (100 shares/lot)" : "Individual Shares") : "Standard Decimal Units"}\nTransaction Fees: ${feeConfig.enabled ? `Enabled (Buy: ${feeConfig.buyFeePercent}% / Sell: ${feeConfig.sellFeePercent}%)` : "Excluded"}\n\n`;

	const summary = `PORTFOLIO CONSOLIDATION:\nTotal Capital Outlay: ${formatCurrency(stats.totalNetCapital, currency)}\nTotal Volume: ${unitLabel}\nConsolidated Average Cost: ${formatCurrency(stats.netAverage, currency)}\nBreakeven Threshold: ${formatCurrency(stats.breakevenPrice, currency)}\n\n`;

	const tranches = `TRANCHE ACCUMULATION BREAKDOWN:\n${stats.tranches
		.map((t, idx) => {
			const qtyStr =
				assetType === "stock" && stockUnit === "lots"
					? `${formatQuantity(t.rawQuantity, "stock", "lots")} Lots`
					: `${formatQuantity(t.rawQuantity, assetType)} units`;
			return `[${idx + 1}] ${t.label}: ${qtyStr} @ ${formatCurrency(t.price, currency)} = ${formatCurrency(t.totalCapital, currency)} (${t.capitalWeight.toFixed(1)}% allocation)`;
		})
		.join("\n")}\n\n`;

	const footer = `==================================================\nCompiled via Polma Tambunan Asset Averaging Calculator`;

	return header + summary + tranches + footer;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
	{
		name: "IDX Bluechip Dip",
		description: "BBCA/BBRI 2-step accumulation on market pullback",
		assetType: "stock",
		currency: "IDR",
		stockUnit: "lots",
		tranches: [
			{ label: "Initial Entry", price: "9500", quantity: "50" },
			{ label: "Dip Add-on", price: "8800", quantity: "75" },
		],
		marketPrice: "9000",
		targetAvg: "9100",
	},
	{
		name: "Crypto 3-Step DCA",
		description: "Bitcoin multi-tranche staged accumulation ladder",
		assetType: "crypto",
		currency: "USD",
		tranches: [
			{ label: "Tranche 1 (Entry)", price: "68000", quantity: "0.25" },
			{ label: "Tranche 2 (Dip 1)", price: "62500", quantity: "0.50" },
			{ label: "Tranche 3 (Dip 2)", price: "57000", quantity: "0.75" },
		],
		marketPrice: "64000",
		targetAvg: "60500",
	},
	{
		name: "Martingale Pyramid",
		description: "Exponential size scaling at deeper support levels",
		assetType: "stock",
		currency: "IDR",
		stockUnit: "lots",
		tranches: [
			{ label: "Tranche 1 (Pilot)", price: "4200", quantity: "20" },
			{ label: "Tranche 2 (Support 1)", price: "3800", quantity: "40" },
			{ label: "Tranche 3 (Support 2)", price: "3400", quantity: "80" },
		],
		marketPrice: "3650",
		targetAvg: "3600",
	},
	{
		name: "Momentum Add-On",
		description: "Averaging up on confirmed structural breakout",
		assetType: "stock",
		currency: "IDR",
		stockUnit: "lots",
		tranches: [
			{ label: "Base Position", price: "1250", quantity: "200" },
			{ label: "Breakout Expansion", price: "1550", quantity: "100" },
		],
		marketPrice: "1620",
		targetAvg: "1400",
	},
];
