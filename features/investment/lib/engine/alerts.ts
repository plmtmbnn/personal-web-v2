import type { InvestmentCompassData, CompassAlert } from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";

function isFreshQuote(
	lastTime?: string | null,
	referenceTime?: string | number,
	maxHours = 72,
): boolean {
	if (!lastTime) return true;
	try {
		const t = new Date(lastTime).getTime();
		if (Number.isNaN(t)) return true;
		const ref = referenceTime ? new Date(referenceTime).getTime() : Date.now();
		if (Number.isNaN(ref)) return true;
		return Math.abs(ref - t) <= maxHours * 3600 * 1000;
	} catch {
		return true;
	}
}

export function deriveAlerts(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds,
): CompassAlert[] {
	const alerts: CompassAlert[] = [];

	// 1. IHSG Domestic Sell-off Alert (checks both JKSE and IHSG keys)
	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	if (
		ihsgQuote?.changePct != null &&
		ihsgQuote.changePct <= thresholds.ihsg.overnightSelloffPct &&
		isFreshQuote(ihsgQuote.lastTime, data.fetchedAt)
	) {
		alerts.push({
			id: "ihsg-selloff",
			title: "IHSG Domestic Sell-off",
			message: `Indonesia Composite dropped ${ihsgQuote.changePct.toFixed(2)}% in the latest session. Emerging market risk-off pressure.`,
			type: "danger",
			asOf: ihsgQuote.lastTime ?? undefined,
		});
	}

	// 2. USD/IDR Surge (Rupiah Pressure)
	const usdIdrQuote = data.markets.quotes.USDIDR;
	if (
		usdIdrQuote?.changePct != null &&
		usdIdrQuote.changePct >= thresholds.usdIdr.overnightSurgePct &&
		isFreshQuote(usdIdrQuote.lastTime, data.fetchedAt)
	) {
		alerts.push({
			id: "usdidr-spike",
			title: "Rupiah Rapid Depreciation",
			message: `USD/IDR jumped +${usdIdrQuote.changePct.toFixed(2)}% to Rp ${Math.round(usdIdrQuote.last ?? 0).toLocaleString("id-ID")}. Domestic liquidity headwind.`,
			type: "danger",
			asOf: usdIdrQuote.lastTime ?? undefined,
		});
	}

	// 3. VIX Volatility Shock
	const vixQuote = data.markets.quotes.VIX;
	if (vixQuote?.changePct != null && vixQuote.changePct >= 10.0) {
		alerts.push({
			id: "vix-shock",
			title: "Volatility Shock",
			message: `CBOE VIX spiked +${vixQuote.changePct.toFixed(1)}% to ${vixQuote.last?.toFixed(1)}. Global equity risk repricing underway.`,
			type: "danger",
			asOf: vixQuote.lastTime ?? undefined,
		});
	} else if (vixQuote?.changePct != null && vixQuote.changePct <= -10.0) {
		alerts.push({
			id: "vix-crush",
			title: "Volatility Crush",
			message: `VIX compressed ${vixQuote.changePct.toFixed(1)}%. Orderly market pricing.`,
			type: "positive",
			asOf: vixQuote.lastTime ?? undefined,
		});
	}

	// 4. US Dollar Surge (DXY)
	const dxyQuote = data.markets.quotes.DXY;
	if (
		dxyQuote?.changePct != null &&
		dxyQuote.changePct >= (thresholds.dxy.overnightRallyPct ?? 0.7)
	) {
		alerts.push({
			id: "dxy-rally",
			title: "US Dollar Surge",
			message: `US Dollar Index (DXY) rallied +${dxyQuote.changePct.toFixed(2)}%. High cross-border liquidity pressure on Crypto and IDX.`,
			type: "warning",
			asOf: dxyQuote.lastTime ?? undefined,
		});
	}

	// 5. Bitcoin Major Overnight Move
	const btcQuote = data.markets.quotes.BTC;
	if (
		btcQuote?.changePct != null &&
		Math.abs(btcQuote.changePct) >= thresholds.crypto.overnightShockPct
	) {
		const isPump = btcQuote.changePct > 0;
		alerts.push({
			id: "btc-shock",
			title: isPump ? "Bitcoin Strong Momentum" : "Bitcoin Sharp Drawdown",
			message: `BTC ${isPump ? "surged +" : "dropped "}${btcQuote.changePct.toFixed(1)}% in the session ($${Math.round(btcQuote.last ?? 0).toLocaleString("en-US")}).`,
			type: isPump ? "positive" : "danger",
			asOf: btcQuote.lastTime ?? undefined,
		});
	}

	// 6. Systemic Regional & Global Contagion Alert
	const contagionAnchors = [
		{ name: "S&P 500", quote: data.markets.quotes.SPX },
		{ name: "Nasdaq", quote: data.markets.quotes.IXIC },
		{ name: "Hang Seng", quote: data.markets.quotes.HSI },
		{ name: "Nikkei 225", quote: data.markets.quotes.N225 },
	];

	const severeDrops = contagionAnchors.filter(
		(a) => a.quote?.changePct != null && a.quote.changePct <= -1.5,
	);

	if (
		severeDrops.length >= 2 ||
		severeDrops.some((a) => (a.quote?.changePct ?? 0) <= -2.5)
	) {
		const details = severeDrops
			.map((a) => `${a.name} (${a.quote?.changePct?.toFixed(1)}%)`)
			.join(", ");
		alerts.push({
			id: "systemic-contagion",
			title: "Systemic Contagion Alert",
			message: `Broad regional & global sell-off detected across ${details}. Elevated spillover pressure on IHSG and Crypto liquidity. Tighten stop-losses and avoid aggressive opening bids.`,
			type: "danger",
		});
	}

	// 7. US Large Cap Equities Shock
	const spxQuote = data.markets.quotes.SPX;
	if (spxQuote?.changePct != null && spxQuote.changePct <= -2.0) {
		alerts.push({
			id: "spx-selloff",
			title: "US Equities Sell-Off",
			message: `S&P 500 dropped ${spxQuote.changePct.toFixed(2)}% in the session. Global equity risk-off pressure.`,
			type: "danger",
			asOf: spxQuote.lastTime ?? undefined,
		});
	}

	// 8. Data Telemetry Stale / Offline Check
	if (data.sources) {
		const degraded = Object.entries(data.sources)
			.filter(([_, s]) => s.stale || !s.ok)
			.map(([_, s]) => s.label);
		if (degraded.length > 0) {
			alerts.push({
				id: "telemetry-degraded",
				title: "Data Stream Notice",
				message: `Operating on cached backup data for ${degraded.join(", ")}. Verify live broker prices before trading.`,
				type: "warning",
			});
		}
	}

	return alerts;
}
