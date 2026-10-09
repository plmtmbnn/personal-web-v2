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
import { PLAYBOOK_SCRIPTS } from "../../data/playbooks";
import { getActiveSeasonality } from "../../data/seasonality";
import { getUpcomingEvents } from "../../data/events";
import { getHalvingCyclePhase, realizedVol, sma } from "../indicators";

export function computeCompass(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds = DEFAULT_THRESHOLDS,
): CompassOutput {
	// 1. Score Global Macro Liquidity
	const globalRegime = scoreGlobalLiquidity(data, thresholds);

	// 2. Score IHSG (takes global score as carry-in weight)
	const ihsgRegime = scoreIhsg(data, thresholds, globalRegime);

	// 3. Score Crypto (takes global score as carry-in weight)
	const cryptoRegime = scoreCrypto(data, thresholds, globalRegime);

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
	const btcDominance = data.markets.cryptoGlobal?.btcDominance ?? 55;

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
		},
	);

	// 6. Actionable Playbook Scripts
	const ihsgScript =
		PLAYBOOK_SCRIPTS.IHSG[ihsgRegime.state] ?? PLAYBOOK_SCRIPTS.IHSG.defensive;
	const cryptoScript =
		PLAYBOOK_SCRIPTS.Crypto[cryptoRegime.state] ??
		PLAYBOOK_SCRIPTS.Crypto.defensive;

	// 7. Delta and Volatility Alerts
	const alerts = deriveAlerts(data, thresholds);

	// 8. Static & Cycle Context
	const activeSeasonality = getActiveSeasonality();
	const upcomingEvents = getUpcomingEvents(6);
	const halvingCycle = getHalvingCyclePhase();

	return {
		regimes: {
			global: globalRegime,
			ihsg: ihsgRegime,
			crypto: cryptoRegime,
		},
		permissions,
		playbooks: {
			ihsg: ihsgScript,
			crypto: cryptoScript,
		},
		alerts,
		activeSeasonality,
		upcomingEvents,
		halvingCycle,
	};
}

export * from "./global";
export * from "./ihsg";
export * from "./crypto";
export * from "./permissions";
export * from "./alerts";
export * from "./states";
