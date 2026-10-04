import type { InvestmentCompassData, CompassAlert } from "../../types";
import type { InvestmentThresholds } from "../../config/thresholds";

export function deriveAlerts(
	data: InvestmentCompassData,
	thresholds: InvestmentThresholds,
): CompassAlert[] {
	const alerts: CompassAlert[] = [];

	// 1. IHSG Domestic Sell-off Alert (checks both JKSE and IHSG keys)
	const ihsgQuote = data.markets.quotes.JKSE ?? data.markets.quotes.IHSG;
	if (
		ihsgQuote?.changePct != null &&
		ihsgQuote.changePct <= thresholds.ihsg.overnightSelloffPct
	) {
		alerts.push({
			id: "ihsg-selloff",
			title: "IHSG Domestic Sell-off",
			message: `Indonesia Composite dropped ${ihsgQuote.changePct.toFixed(2)}% today. Emerging market risk-off pressure.`,
			type: "danger",
			asOf: ihsgQuote.lastTime ?? undefined,
		});
	}

	// 2. USD/IDR Surge (Rupiah Pressure)
	const usdIdrQuote = data.markets.quotes.USDIDR;
	if (
		usdIdrQuote?.changePct != null &&
		usdIdrQuote.changePct >= thresholds.usdIdr.overnightSurgePct
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
	if (dxyQuote?.changePct != null && dxyQuote.changePct >= 0.7) {
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

	// 6. CNN Fear & Greed Rapid Shifts
	const fng = data.sentiment.traditional?.fear_and_greed;
	if (fng) {
		const delta = fng.score - fng.previous_close;
		if (delta <= -15) {
			alerts.push({
				id: "sentiment-plunge",
				title: "Traditional Sentiment Plunge",
				message: `CNN Fear & Greed dropped ${Math.abs(delta)} points overnight to ${fng.score}/100.`,
				type: "danger",
			});
		} else if (delta >= 15) {
			alerts.push({
				id: "sentiment-surge",
				title: "Traditional Sentiment Surge",
				message: `CNN Fear & Greed jumped +${delta} points overnight to ${fng.score}/100.`,
				type: "positive",
			});
		}
	}

	return alerts;
}
