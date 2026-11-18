import { currentMarketInputs } from "../provenance";
import type { InvestmentCompassData, CompassOutput } from "../../types";
import {
	DEFAULT_THRESHOLDS,
	type InvestmentThresholds,
} from "../../config/thresholds";
import { scoreGlobalLiquidity } from "./global";
import { scoreIhsg } from "./ihsg";
import { scoreCrypto } from "./crypto";
import { derivePermissions } from "./permissions";
import { deriveAlerts } from "./alerts";
import { buildDynamicPlaybooks } from "../../data/playbooks";
import { getActiveSeasonality } from "../../data/seasonality";
import { getUpcomingEvents, getCriticalPreAlerts } from "../../data/events";
import { getHalvingCyclePhase, realizedVol, sma } from "../indicators";
import { enforceEvidence, MODEL_VERSION } from "./evidence";

export function computeCompass(
	input: InvestmentCompassData,
	thresholds: InvestmentThresholds = DEFAULT_THRESHOLDS,
): CompassOutput {
	const data = currentMarketInputs(input);
	// 1. Score Global Macro Liquidity
	const globalRegime = enforceEvidence(
		scoreGlobalLiquidity(data, thresholds),
		thresholds,
	);

	// 2. Score IHSG (takes global score as carry-in weight)
	const ihsgRegime = enforceEvidence(
		scoreIhsg(data, thresholds, globalRegime),
		thresholds,
		globalRegime,
	);

	// 3. Score Crypto (takes global score as carry-in weight)
	const cryptoRegime = enforceEvidence(
		scoreCrypto(data, thresholds, globalRegime),
		thresholds,
		globalRegime,
	);

	// 4. Calculate Realized Volatilities & Indicators for Gating
	const ihsgHistory =
		data.markets.history?.["^JKSE"]?.points ??
		data.markets.history?.JKSE?.points ??
		[];
	const btcHistory = data.markets.history?.["BTC-USD"]?.points ?? [];

	const ihsgVol = realizedVol(ihsgHistory, 30, 252);
	const btcVol = realizedVol(btcHistory, 30, 365);
	const btcPrice = data.markets.quotes.BTC?.last ?? null;
	const btcMa200 = sma(btcHistory, 200);
	const btcAbove200 =
		btcPrice != null && btcMa200 != null ? btcPrice >= btcMa200 : false;
	const btcDominance = data.markets.cryptoGlobal?.btcDominance ?? null;

	// 5. Derive Centralized Permissions Matrix
	const permissions = derivePermissions(
		globalRegime,
		ihsgRegime,
		cryptoRegime,
		thresholds,
		{
			ihsgRealizedVol: ihsgVol,
			btcRealizedVol: btcVol,
			btcDominance,
			btcAbove200Ma: btcAbove200,
			commodityQuotes: {
				oilBrentChangePct: data.markets.quotes.OIL_BRENT?.changePct ?? null,
				goldChangePct: data.markets.quotes.GOLD?.changePct ?? null,
				copperChangePct: data.markets.quotes.COPPER?.changePct ?? null,
			},
		},
	);
	for (const regime of [globalRegime, ihsgRegime, cryptoRegime]) {
		if (regime.missingFactors?.length)
			permissions.summaryNotes.push(
				`${regime.marketName}: missing ${regime.missingFactors.join(", ")}. Coverage ${Math.round(regime.coverage * 100)}%.`,
			);
		if (regime.state === "insufficient" && regime.id !== "global") {
			permissions[regime.id].dca = {
				status: "paused",
				label: "Paused",
				reason: regime.diagnosis,
			};
		}
	}

	// 6. Actionable Playbook Scripts (Interpolating live telemetry and effective states)
	const playbooks = buildDynamicPlaybooks(
		data,
		{
			global: globalRegime,
			ihsg: ihsgRegime,
			crypto: cryptoRegime,
		},
		permissions,
		thresholds,
	);

	// 7. Delta and Volatility Alerts
	const alerts = deriveAlerts(data, thresholds);

	// 8. Static & Cycle Context
	const activeSeasonality = getActiveSeasonality();
	const upcomingEvents = getUpcomingEvents(6);
	const criticalPreAlerts = getCriticalPreAlerts(upcomingEvents);
	const halvingCycle = getHalvingCyclePhase();

	return {
		modelVersion: MODEL_VERSION,
		evaluatedAt: input.fetchedAt,
		regimes: {
			global: globalRegime,
			ihsg: ihsgRegime,
			crypto: cryptoRegime,
		},
		permissions,
		playbooks,
		alerts,
		activeSeasonality,
		upcomingEvents,
		criticalPreAlerts,
		halvingCycle,
	};
}

export * from "./global";
export * from "./ihsg";
export * from "./crypto";
export * from "./permissions";
export * from "./alerts";
export * from "./states";
