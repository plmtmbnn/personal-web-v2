import { createAdminClient } from "@/lib/core/supabase-server";
import { getInvestmentCompass } from "@/features/investment/actions";
import { notificationDispatcher } from "./dispatcher";
import { TelegramChannel } from "./channels/telegram";
import { BrowserChannel } from "./channels/browser";
import { remoteConfigService } from "@/services/config/remote-config";
import {
	getCriticalPreAlerts,
	getWeekdayDistance,
	getJakartaDateString,
} from "@/features/investment/data/events";

/**
 * Task Reminder Cron Job.
 * Fetches today's incomplete tasks and dispatches notifications.
 */
export async function runTaskReminders() {
	console.log("[Cron] Starting task reminders...");

	// 1. Fetch Remote Config
	const enableTelegram = await remoteConfigService.getConfigValue(
		"enable_telegram_notifications",
	);
	const enableBrowser = await remoteConfigService.getConfigValue(
		"enable_browser_notifications",
	);

	// 2. Initialize Channels (Pluggable & Condition-based)
	if (enableTelegram) {
		notificationDispatcher.registerChannel(new TelegramChannel());
	} else {
		console.log("[Cron] Telegram notifications disabled via Remote Config.");
	}

	if (enableBrowser) {
		notificationDispatcher.registerChannel(new BrowserChannel());
	} else {
		console.log("[Cron] Browser notifications disabled via Remote Config.");
	}

	// 3. Fetch Tasks from Supabase (Service Role to bypass RLS)
	const supabase = await createAdminClient();
	const todayStr = new Date().toISOString().split("T")[0];

	const { data: tasks, error } = await supabase
		.from("tasks")
		.select("id, title, due_date, reschedule_count, priority")
		.neq("status", "done")
		.neq("status", "cancelled")
		.eq("due_date", todayStr);

	if (error) {
		console.error("[Cron] Error fetching tasks:", error);
		return;
	}

	if (!tasks || tasks.length === 0) {
		console.log("[Cron] No pending tasks for today.");
		return;
	}

	console.log(`[Cron] Found ${tasks.length} tasks. Aggregating...`);

	// 4. Aggregate tasks into a single summary
	const taskList = tasks
		.map((task) => {
			const rescheduleText =
				task.reschedule_count > 0 ? ` (🔄 ${task.reschedule_count})` : "";
			return `- ${task.title}${rescheduleText}`;
		})
		.join("\n");

	const payload = {
		title: "Daily Task Reminders",
		body: `You have ${tasks.length} objectives pending for today:\n\n${taskList}`,
		data: {
			dueDate: todayStr,
		},
	};

	await notificationDispatcher.dispatch(payload);

	console.log("[Cron] Task reminders complete.");
}

/**
 * Market Regime Alerts Cron Job.
 * Fetches the Investment Compass and dispatches a rich, high-signal summary to Telegram.
 */
export async function runRegimeAlerts() {
	console.log("[Cron] Starting regime alerts...");

	// 1. Fetch Remote Config
	const enableTelegram = await remoteConfigService.getConfigValue(
		"enable_telegram_notifications",
	);

	if (enableTelegram) {
		notificationDispatcher.registerChannel(new TelegramChannel());
	} else {
		console.log("[Cron] Telegram notifications disabled via Remote Config.");
		return; // No point fetching if notifications are disabled
	}

	// 2. Fetch the Engine Output
	const compass = await getInvestmentCompass(true); // force refresh
	const engine = compass.engineOutput;

	if (!engine) {
		console.error("[Cron] Engine output missing.");
		return;
	}

	// 3. Helper Functions for HTML escaping & formatting
	const escapeHtml = (text: string): string =>
		text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

	const formatRegimeLine = (label: string, state: string, score: number) => {
		let icon = "⚪";
		let stateLabel = state.toUpperCase().replace("_", " ");
		if (state === "risk_on") {
			icon = "🟢";
			stateLabel = "Risk-On";
		} else if (state === "selective") {
			icon = "🟡";
			stateLabel = "Selective";
		} else if (state === "defensive") {
			icon = "🟠";
			stateLabel = "Defensive";
		} else if (state === "stress") {
			icon = "🔴";
			stateLabel = "Stress";
		}
		return `${icon} <b>${label}</b>: ${score}/100 • <i>${stateLabel}</i>`;
	};

	const formatQuoteLine = (
		label: string,
		priceStr: string,
		changePct: number | null | undefined,
	) => {
		let changeStr = "";
		if (changePct != null) {
			const sign = changePct >= 0 ? "+" : "";
			changeStr = ` <code>(${sign}${changePct.toFixed(2)}%)</code>`;
		}
		return `• <b>${label}</b>: ${priceStr}${changeStr}`;
	};

	// 4. Timestamp header in Jakarta Time (WIB)
	const now = new Date();
	const dateHeader = `${now.toLocaleDateString("en-GB", {
		timeZone: "Asia/Jakarta",
		day: "2-digit",
		month: "short",
		year: "numeric",
	})} • ${now.toLocaleTimeString("en-GB", {
		timeZone: "Asia/Jakarta",
		hour: "2-digit",
		minute: "2-digit",
	})} WIB`;

	// 5. Benchmark Telemetry Quotes
	const ihsgQ = compass.markets.quotes.JKSE ?? compass.markets.quotes.IHSG;
	const usdIdrQ = compass.markets.quotes.USDIDR;
	const btcQ = compass.markets.quotes.BTC;
	const spxQ = compass.markets.quotes.SPX;
	const vixQ = compass.markets.quotes.VIX;

	const quotesLines: string[] = [];
	if (ihsgQ?.last) {
		quotesLines.push(
			formatQuoteLine(
				"IHSG",
				ihsgQ.last.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}),
				ihsgQ.changePct,
			),
		);
	}
	if (usdIdrQ?.last) {
		quotesLines.push(
			formatQuoteLine(
				"USD/IDR",
				`Rp ${Math.round(usdIdrQ.last).toLocaleString("id-ID")}`,
				usdIdrQ.changePct,
			),
		);
	}
	if (btcQ?.last) {
		quotesLines.push(
			formatQuoteLine(
				"Bitcoin",
				`$${Math.round(btcQ.last).toLocaleString("en-US")}`,
				btcQ.changePct,
			),
		);
	}
	if (spxQ?.last) {
		quotesLines.push(
			formatQuoteLine(
				"S&amp;P 500",
				spxQ.last.toLocaleString("en-US", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}),
				spxQ.changePct,
			),
		);
	}
	if (vixQ?.last) {
		quotesLines.push(
			formatQuoteLine("VIX", vixQ.last.toFixed(2), vixQ.changePct),
		);
	}

	// 6. Sentiment & Liquidity
	const sentimentLines: string[] = [];
	const cnnScore = compass.sentiment.traditional?.fear_and_greed?.score;
	const cnnRating = compass.sentiment.traditional?.fear_and_greed?.rating;
	if (cnnScore != null) {
		sentimentLines.push(
			`• <b>CNN Fear &amp; Greed</b>: ${cnnScore}/100 (${escapeHtml(cnnRating ?? "Neutral")})`,
		);
	}

	const cryptoFng = compass.sentiment.crypto?.data?.[0];
	if (cryptoFng?.value) {
		sentimentLines.push(
			`• <b>Crypto Fear &amp; Greed</b>: ${cryptoFng.value}/100 (${escapeHtml(cryptoFng.value_classification ?? "Neutral")})`,
		);
	}

	const flows = compass.markets.ihsgFlows;
	if (flows?.streakDays != null) {
		const streak = flows.streakDays;
		const streakText =
			streak > 0
				? `${streak}D Inflow Streak`
				: streak < 0
					? `${Math.abs(streak)}D Outflow Streak`
					: "Neutral Flow";
		const netVal = flows.netBuySell1dIdr;
		const netB = netVal != null ? Math.round(netVal / 1_000_000_000) : null;
		const netStr =
			netB != null
				? netB >= 0
					? `+Rp ${netB.toLocaleString("id-ID")}B`
					: `-Rp ${Math.abs(netB).toLocaleString("id-ID")}B`
				: "";
		sentimentLines.push(
			`• <b>IDX Foreign Flow</b>: ${netStr ? `${netStr} • ` : ""}${streakText}`,
		);
	}

	// 7. Tactical Permissions & Gating
	const perms = engine.permissions;
	const altStatus = perms.altcoins.swing.status;
	const altIcon =
		altStatus === "allowed" ? "🟢" : altStatus === "selective" ? "🟡" : "🔴";
	const altLabel =
		altStatus === "allowed"
			? "UNLOCKED"
			: altStatus === "selective"
				? "SELECTIVE"
				: "LOCKED OUT";

	const tacticalLines: string[] = [
		`• <b>IHSG</b>: ${escapeHtml(perms.ihsg.riskPerTrade ?? perms.ihsg.maxExposure)}`,
		`• <b>Crypto</b>: ${escapeHtml(perms.crypto.riskPerTrade ?? perms.crypto.maxExposure)}`,
		`• <b>Altcoins Gate</b>: ${altIcon} ${altLabel} (${escapeHtml(perms.altcoins.swing.label)})`,
		"• <b>Safe Bucket</b>: 40% Core Preservation Anchor",
	];

	// 8. Active Alerts (Top 3)
	const alertLines: string[] = [];
	if (engine.alerts && engine.alerts.length > 0) {
		for (const alert of engine.alerts.slice(0, 3)) {
			const icon =
				alert.type === "danger" ? "🚨" : alert.type === "warning" ? "⚠️" : "ℹ️";
			alertLines.push(
				`• ${icon} <b>${escapeHtml(alert.title)}</b>: ${escapeHtml(alert.message)}`,
			);
		}
	}

	// 9. Soft Pre-Alert for Critical Catalysts (H-3 Weekday Window)
	const criticalPreAlerts = getCriticalPreAlerts(engine.upcomingEvents, now);
	const preAlertLines: string[] = [];
	if (criticalPreAlerts.length > 0) {
		for (const pa of criticalPreAlerts) {
			preAlertLines.push(
				`• <b>${escapeHtml(pa.event.title)}</b> <code>[${pa.badgeText}]</code>\n  <i>${escapeHtml(pa.marketImpact)}</i>`,
			);
		}
	}

	// 10. Upcoming Catalysts (Next 7 Days)
	const upcomingLines: string[] = [];
	if (engine.upcomingEvents && engine.upcomingEvents.length > 0) {
		const todayIso = getJakartaDateString(now);
		const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
		const nextWeekIso = getJakartaDateString(nextWeek);

		const nearEvents = engine.upcomingEvents
			.filter((e) => e.date >= todayIso && e.date <= nextWeekIso)
			.slice(0, 3);

		for (const ev of nearEvents) {
			const dist = getWeekdayDistance(ev.date, todayIso);
			const distTag =
				dist !== null ? (dist === 0 ? " [Today]" : ` [H-${dist}d]`) : "";
			const impactIcon = ev.impact === "Critical" ? "🔥" : "📌";
			upcomingLines.push(
				`• ${impactIcon} <b>${ev.date}</b>${distTag}: ${escapeHtml(ev.title)} (${ev.market})`,
			);
		}
	}

	// 11. Assemble Rich Message Body
	const sections: string[] = [
		`<i>${dateHeader}</i>`,
		"",
		"<b>MARKET REGIMES &amp; SCORES</b>",
		formatRegimeLine(
			"Global Macro",
			engine.regimes.global.state,
			engine.regimes.global.score,
		),
		formatRegimeLine(
			"IHSG (IDX)",
			engine.regimes.ihsg.state,
			engine.regimes.ihsg.score,
		),
		formatRegimeLine(
			"Crypto Majors",
			engine.regimes.crypto.state,
			engine.regimes.crypto.score,
		),
	];

	if (quotesLines.length > 0) {
		sections.push("", "<b>BENCHMARK TELEMETRY</b>", ...quotesLines);
	}

	if (sentimentLines.length > 0) {
		sections.push("", "<b>SENTIMENT &amp; LIQUIDITY</b>", ...sentimentLines);
	}

	sections.push(
		"",
		"<b>TACTICAL PERMISSIONS &amp; GATING</b>",
		...tacticalLines,
	);

	if (alertLines.length > 0) {
		sections.push("", "<b>ACTIVE ALERTS</b>", ...alertLines);
	}

	if (preAlertLines.length > 0) {
		sections.push(
			"",
			"⚠️ <b>CRITICAL CATALYST PRE-ALERT (H-3 WEEKDAY)</b>",
			...preAlertLines,
		);
	}

	if (upcomingLines.length > 0) {
		sections.push("", "<b>UPCOMING CATALYSTS</b>", ...upcomingLines);
	}

	sections.push(
		"",
		`<b>Executive Posture</b>: ${escapeHtml(engine.regimes.global.headline)}`,
	);

	const payload = {
		title: "Investment Compass • Daily Briefing",
		body: sections.join("\n"),
	};

	await notificationDispatcher.dispatch(payload);
	console.log("[Cron] Regime alerts complete.");
}
