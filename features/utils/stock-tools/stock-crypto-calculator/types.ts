export type AssetType = "stock" | "crypto";
export type StockUnit = "lots" | "shares";
export type CurrencyCode = "IDR" | "USD";

export interface Tranche {
	id: string;
	label: string;
	price: string;
	quantity: string;
}

export interface FeeConfig {
	enabled: boolean;
	buyFeePercent: number;
	sellFeePercent: number;
}

export interface TrancheStat {
	id: string;
	label: string;
	price: number;
	rawQuantity: number;
	normalizedUnits: number;
	grossCapital: number;
	buyFee: number;
	totalCapital: number;
	capitalWeight: number;
	unitWeight: number;
}

export interface ConsolidatedStats {
	totalUnits: number;
	totalLots: number;
	totalGrossCapital: number;
	totalBuyFees: number;
	totalNetCapital: number;
	grossAverage: number;
	netAverage: number;
	breakevenPrice: number;
	tranches: TrancheStat[];
	initialTrancheAvg: number;
	avgDeltaAmount: number;
	avgDeltaPercent: number;
}

export type OptimizerMode = "target" | "budget";

export interface TargetOptimizerResult {
	feasible: boolean;
	reason?: string;
	requiredUnits: number;
	requiredLots: number;
	requiredCapital: number;
	resultingUnits: number;
	resultingLots: number;
	resultingNetCapital: number;
	resultingAverage: number;
}

export interface BudgetOptimizerResult {
	acquiredUnits: number;
	acquiredLots: number;
	capitalUsed: number;
	residualBudget: number;
	newTotalUnits: number;
	newTotalLots: number;
	newTotalCapital: number;
	newAverage: number;
	averageReductionAmount: number;
	averageReductionPercent: number;
}

export interface ExitLevel {
	percent: number;
	targetPrice: number;
	grossProceeds: number;
	sellFee: number;
	netProceeds: number;
	netProfit: number;
	netRoiPercent: number;
}

export interface StopLevel {
	percent: number;
	stopPrice: number;
	netProceeds: number;
	capitalAtRisk: number;
	riskPercent: number;
}

export interface ScenarioPoint {
	percentDelta: number;
	price: number;
	priceFormatted: string;
	marketValue: number;
	unrealizedPl: number;
	plPercent: number;
}

export interface PresetScenario {
	name: string;
	description: string;
	assetType: AssetType;
	currency: CurrencyCode;
	stockUnit?: StockUnit;
	tranches: { label: string; price: string; quantity: string }[];
	marketPrice?: string;
	targetAvg?: string;
	budget?: string;
}
