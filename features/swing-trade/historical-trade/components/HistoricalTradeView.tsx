"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	History,
	Loader2,
	Play,
	Search,
	Square,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	buildCsv,
	collectHistoricalTrades,
	MAX_PAGES,
	RateLimitError,
	type StopReason,
} from "../lib/collect";
import {
	DEFAULT_SETTINGS,
	type HistoricalTradeResponse,
	type HistoricalTradeResult,
	type HistoricalTradeSettings,
} from "../types";
import { useMarketCredentials } from "../../credentials/hooks/useMarketCredentials";

const STORAGE_KEY = "historical-trade:settings";
const RUNNING_TRADE_STORAGE_KEY = "running-trade:settings";

const inputClass =
	"w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/15";
const labelClass =
	"block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

interface StockOption {
	StockCode: string;
	StockName: string;
}

function readSettings(): HistoricalTradeSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
		}
		// Pre-fill Base URL and Token from running-trade:settings on first load if available
		const runningTradeRaw = localStorage.getItem(RUNNING_TRADE_STORAGE_KEY);
		if (runningTradeRaw) {
			const parsed = JSON.parse(runningTradeRaw);
			return {
				...DEFAULT_SETTINGS,
				baseUrl: parsed.baseUrl || "",
				token: parsed.token || "",
			};
		}
		return DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

function downloadHistoricalCsv(
	results: HistoricalTradeResult[],
	symbol: string,
	startDate: string,
	endDate: string,
) {
	const startClean = startDate.replace(/-/g, "");
	const endClean = endDate.replace(/-/g, "");
	const csvText = buildCsv(results);
	const url = URL.createObjectURL(
		new Blob([csvText], { type: "text/csv;charset=utf-8" }),
	);
	const a = document.createElement("a");
	a.href = url;
	a.download = `historical-trade_${symbol.toUpperCase()}_${startClean}-${endClean}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

const STOP_MESSAGES: Record<StopReason, string> = {
	complete: "Finished. Retrieved all historical data pages.",
	empty: "Finished. The API returned no historical records.",
	cap: `Stopped at the ${MAX_PAGES}-page safety cap.`,
	cancelled: "Cancelled.",
	error: "Stopped by an error.",
	stalled: "Stopped because next_page did not advance.",
};

export default function HistoricalTradeView() {
	const { credentials, saveCredentials } = useMarketCredentials();
	const [settings, setSettings] =
		useState<HistoricalTradeSettings>(DEFAULT_SETTINGS);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [autoDownload, setAutoDownload] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [running, setRunning] = useState(false);
	const [progress, setProgress] = useState({ pages: 0, rows: 0 });
	const [waitNote, setWaitNote] = useState<string | null>(null);
	const [results, setResults] = useState<HistoricalTradeResult[] | null>(null);
	const [stopReason, setStopReason] = useState<StopReason | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setSettings(readSettings());
		setHydrated(true);
		fetch("/api/utils/stock-data")
			.then((r) => r.json())
			.then((j: { data?: StockOption[] }) => setStocks(j.data ?? []))
			.catch(() => setStocks([]));
	}, []);

	// Pre-fill credentials from Redis once available
	useEffect(() => {
		if (credentials?.baseUrl || credentials?.token) {
			setSettings((prev) => ({
				...prev,
				baseUrl: prev.baseUrl || credentials.baseUrl || "",
				token: prev.token || credentials.token || "",
			}));
		}
	}, [credentials]);

	useEffect(() => {
		if (hydrated) {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		}
	}, [settings, hydrated]);

	const update = <K extends keyof HistoricalTradeSettings>(
		key: K,
		value: HistoricalTradeSettings[K],
	) => setSettings((s) => ({ ...s, [key]: value }));

	const applyPreset = (preset: "1M" | "3M" | "6M" | "1Y" | "YTD") => {
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, "0");
		const endDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

		let past: Date;
		if (preset === "1M") {
			past = new Date(now);
			past.setMonth(now.getMonth() - 1);
		} else if (preset === "3M") {
			past = new Date(now);
			past.setMonth(now.getMonth() - 3);
		} else if (preset === "6M") {
			past = new Date(now);
			past.setMonth(now.getMonth() - 6);
		} else if (preset === "1Y") {
			past = new Date(now);
			past.setFullYear(now.getFullYear() - 1);
		} else {
			past = new Date(now.getFullYear(), 0, 1);
		}

		const startDate = `${past.getFullYear()}-${pad(past.getMonth() + 1)}-${pad(past.getDate())}`;
		setSettings((s) => ({ ...s, startDate, endDate }));
	};

	const suggestions = useMemo(() => {
		const q = settings.symbol.trim().toUpperCase();
		if (!q) return stocks.slice(0, 8);
		return stocks
			.filter(
				(s) =>
					s.StockCode?.toUpperCase().startsWith(q) ||
					s.StockName?.toUpperCase().includes(q),
			)
			.slice(0, 8);
	}, [stocks, settings.symbol]);

	const effectiveBaseUrl = (
		settings.baseUrl ||
		credentials?.baseUrl ||
		""
	).trim();
	const effectiveToken = (settings.token || credentials?.token || "").trim();

	const ready =
		effectiveBaseUrl.startsWith("https://") &&
		effectiveToken !== "" &&
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim()) &&
		settings.startDate.trim() !== "" &&
		settings.endDate.trim() !== "" &&
		settings.limit >= 1;

	const run = useCallback(async () => {
		const ac = new AbortController();
		abortRef.current = ac;
		setRunning(true);
		setResults(null);
		setStopReason(null);
		setErrorMessage(null);
		setProgress({ pages: 0, rows: 0 });

		if (
			(settings.baseUrl && settings.baseUrl !== credentials?.baseUrl) ||
			(settings.token && settings.token !== credentials?.token)
		) {
			saveCredentials({ baseUrl: effectiveBaseUrl, token: effectiveToken });
		}

		const fetchPage = async (
			page: number,
		): Promise<HistoricalTradeResponse> => {
			const res = await fetch("/api/admin/historical-trade", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					baseUrl: effectiveBaseUrl,
					token: effectiveToken,
					symbol: settings.symbol.trim(),
					period: settings.period,
					startDate: settings.startDate.trim(),
					endDate: settings.endDate.trim(),
					limit: settings.limit,
					page,
				}),
				signal: ac.signal,
			});

			const json = (await res.json().catch(() => null)) as
				| (Partial<HistoricalTradeResponse> & {
						error?: string;
						retryAfterSeconds?: number;
				  })
				| null;

			if (res.status === 429) {
				const seconds = json?.retryAfterSeconds;
				throw new RateLimitError(
					json?.error ?? "Too Many Requests",
					seconds ? Math.min(seconds, 60) * 1000 : undefined,
				);
			}

			if (!res.ok) {
				throw new Error(json?.error ?? `Request failed (${res.status})`);
			}

			return json as HistoricalTradeResponse;
		};

		try {
			const out = await collectHistoricalTrades({
				fetchPage,
				signal: ac.signal,
				onProgress: (pages, rows) => {
					setWaitNote(null);
					setProgress({ pages, rows });
				},
				onWait: (ms, reason) =>
					setWaitNote(
						reason === "rate-limit"
							? `Rate limit reached. Backing off for ${Math.round(ms / 1000)}s...`
							: `Pausing ${Math.round(ms / 1000)}s to avoid rate limits...`,
					),
			});

			setResults(out.results);
			setStopReason(out.stopReason);
			if (out.error) setErrorMessage(out.error);

			if (autoDownload && out.results.length > 0) {
				downloadHistoricalCsv(
					out.results,
					settings.symbol,
					settings.startDate,
					settings.endDate,
				);
			}
		} catch (e) {
			setStopReason("error");
			setErrorMessage(e instanceof Error ? e.message : "Collection failed");
		} finally {
			setRunning(false);
			abortRef.current = null;
		}
	}, [settings, autoDownload]);

	const cancel = () => {
		abortRef.current?.abort();
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Top Header Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
					<div className="space-y-1.5">
						<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
							<Link
								href="/admin"
								className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
							>
								Admin Console
							</Link>
							<ChevronRight className="w-3 h-3 text-slate-400" />
							<Link
								href="/admin/swing-trade"
								className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
							>
								Swing Trade
							</Link>
							<ChevronRight className="w-3 h-3 text-slate-400" />
							<span className="text-slate-900 font-bold">
								Historical Data Trade
							</span>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shadow-2xs">
								<History className="w-5 h-5" />
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Historical Data Trade
							</h1>
						</div>

						<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-2xl">
							Fetch daily OHLCV and net foreign flow historical summaries from
							the broker price feed API for swing trading backtests and
							quantitative analysis.
						</p>
					</div>

					<span className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-700 text-xs font-mono font-bold">
						Swing Trade
					</span>
				</div>
			</div>

			{/* Main Settings & Parameters Form Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
				<div className="space-y-4">
					<h2 className="text-base sm:text-lg font-bold text-slate-900">
						Upstream Feed Configuration
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Base URL */}
						<div>
							<label
								htmlFor="base-url-input"
								className={`flex items-center justify-between ${labelClass}`}
							>
								<span>Base URL</span>
								{credentials?.baseUrl && (
									<span className="text-[10px] font-semibold text-emerald-600 normal-case">
										Redis Synced
									</span>
								)}
							</label>
							<input
								id="base-url-input"
								type="url"
								value={settings.baseUrl}
								onChange={(e) => update("baseUrl", e.target.value)}
								placeholder={credentials?.baseUrl || "https://api.broker.co.id"}
								className={inputClass}
								disabled={running}
							/>
						</div>

						{/* Bearer Token */}
						<div>
							<label
								htmlFor="token-input"
								className={`flex items-center justify-between ${labelClass}`}
							>
								<span>Bearer Token</span>
								{credentials?.token && (
									<span className="text-[10px] font-semibold text-emerald-600 normal-case">
										Redis Synced
									</span>
								)}
							</label>
							<div className="relative">
								<input
									id="token-input"
									type={showToken ? "text" : "password"}
									value={settings.token}
									onChange={(e) => update("token", e.target.value)}
									placeholder={
										credentials?.token
											? "Configured in Redis"
											: "Paste API JWT Bearer token"
									}
									className={`${inputClass} pr-10 font-mono text-xs`}
									disabled={running}
								/>
								<button
									type="button"
									onClick={() => setShowToken((s) => !s)}
									className="w-11 h-11 flex items-center justify-center rounded-xl absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors cursor-pointer"
									aria-label={showToken ? "Hide token" : "Show token"}
								>
									{showToken ? (
										<EyeOff className="w-4 h-4" />
									) : (
										<Eye className="w-4 h-4" />
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="space-y-4 pt-4 border-t border-slate-100">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
						<h2 className="text-base sm:text-lg font-bold text-slate-900">
							Historical Query Parameters
						</h2>

						{/* Quick Preset Chips */}
						<div className="flex items-center gap-1.5 flex-wrap">
							<span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
								Range:
							</span>
							{(["1M", "3M", "6M", "1Y", "YTD"] as const).map((preset) => (
								<button
									key={preset}
									type="button"
									onClick={() => applyPreset(preset)}
									disabled={running}
									className="min-h-9 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 active:scale-95 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 cursor-pointer"
								>
									{preset}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{/* Stock Symbol Autocomplete */}
						<div className="relative">
							<label htmlFor="symbol-input" className={labelClass}>
								Stock Symbol
							</label>
							<div className="relative">
								<input
									id="symbol-input"
									type="text"
									role="combobox"
									aria-expanded={tickerOpen}
									aria-autocomplete="list"
									aria-controls="historical-ticker-suggestions"
									value={settings.symbol}
									onChange={(e) => {
										update("symbol", e.target.value.toUpperCase());
										setTickerOpen(true);
									}}
									onFocus={() => setTickerOpen(true)}
									placeholder="e.g. BBCA, DOOH"
									maxLength={10}
									className={`${inputClass} uppercase font-bold tracking-wider`}
									disabled={running}
								/>
								<Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
							</div>

							{tickerOpen && suggestions.length > 0 && !running && (
								<>
									<div
										role="presentation"
										aria-hidden="true"
										className="fixed inset-0 z-30"
										onClick={() => setTickerOpen(false)}
									/>
									<div
										id="historical-ticker-suggestions"
										role="listbox"
										aria-label="Stock suggestions"
										className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-40 max-h-56 overflow-y-auto py-1"
									>
										{suggestions.map((s) => (
											<button
												key={s.StockCode}
												type="button"
												role="option"
												aria-selected={settings.symbol === s.StockCode}
												onClick={() => {
													update("symbol", s.StockCode);
													setTickerOpen(false);
												}}
												className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors min-h-11"
											>
												<span className="font-bold text-slate-900">
													{s.StockCode}
												</span>
												<span className="text-slate-500 truncate max-w-[180px]">
													{s.StockName}
												</span>
											</button>
										))}
									</div>
								</>
							)}
						</div>

						{/* Start Date */}
						<div>
							<label htmlFor="start-date-input" className={labelClass}>
								Start Date
							</label>
							<input
								id="start-date-input"
								type="date"
								value={settings.startDate}
								onChange={(e) => update("startDate", e.target.value)}
								className={inputClass}
								disabled={running}
							/>
						</div>

						{/* End Date */}
						<div>
							<label htmlFor="end-date-input" className={labelClass}>
								End Date
							</label>
							<input
								id="end-date-input"
								type="date"
								value={settings.endDate}
								onChange={(e) => update("endDate", e.target.value)}
								className={inputClass}
								disabled={running}
							/>
						</div>

						{/* Limit */}
						<div>
							<label htmlFor="limit-input" className={labelClass}>
								Page Limit
							</label>
							<input
								id="limit-input"
								type="number"
								min={10}
								max={500}
								value={settings.limit}
								onChange={(e) =>
									update("limit", Math.max(1, Number(e.target.value)))
								}
								className={inputClass}
								disabled={running}
							/>
						</div>
					</div>
				</div>

				{/* Primary Trigger and Options Row */}
				<div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<label className="inline-flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={autoDownload}
							onChange={(e) => setAutoDownload(e.target.checked)}
							className="rounded border-slate-300 text-slate-900 focus:ring-slate-900/20"
							disabled={running}
						/>
						<span className="font-medium">
							Auto-download CSV immediately when finished
						</span>
					</label>

					<div className="flex items-center gap-3">
						{running ? (
							<button
								type="button"
								onClick={cancel}
								className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs uppercase tracking-wider transition-colors min-h-11 cursor-pointer"
							>
								<Square className="w-3.5 h-3.5 fill-current" />
								<span>Cancel Collection</span>
							</button>
						) : (
							<button
								type="button"
								onClick={run}
								disabled={!ready}
								className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-[background-color,transform] shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-h-11 cursor-pointer"
							>
								<Play className="w-4 h-4 fill-current" />
								<span>Fetch Historical Data</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Progress & Live Telemetry Card */}
			{running && (
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-3">
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
							<div>
								<span className="text-sm font-bold text-slate-900">
									Fetching historical pages for {settings.symbol}...
								</span>
								<p className="text-xs text-slate-500">
									Page {progress.pages} completed &bull; {progress.rows} records
									retrieved
								</p>
							</div>
						</div>

						<span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-mono font-bold">
							In Progress
						</span>
					</div>

					{waitNote && (
						<p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 p-2.5 rounded-xl">
							{waitNote}
						</p>
					)}
				</div>
			)}

			{/* Results Summary & Preview Card */}
			{results && (
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								{stopReason === "complete" ? (
									<CheckCircle2 className="w-5 h-5 text-emerald-600" />
								) : stopReason === "error" ? (
									<AlertCircle className="w-5 h-5 text-rose-600" />
								) : (
									<History className="w-5 h-5 text-slate-600" />
								)}
								<h3 className="text-lg font-extrabold text-slate-900">
									Collection Results: {settings.symbol}
								</h3>
							</div>

							<p className="text-xs text-slate-500">
								{stopReason
									? STOP_MESSAGES[stopReason]
									: "Collection complete."}{" "}
								{errorMessage && (
									<span className="text-rose-600 font-semibold">
										({errorMessage})
									</span>
								)}
							</p>
						</div>

						{results.length > 0 && (
							<button
								type="button"
								onClick={() =>
									downloadHistoricalCsv(
										results,
										settings.symbol,
										settings.startDate,
										settings.endDate,
									)
								}
								className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-[background-color,transform] shadow-sm active:scale-95 cursor-pointer"
							>
								<Download className="w-4 h-4" />
								<span>Download CSV ({results.length} Rows)</span>
							</button>
						)}
					</div>

					{/* Metric Telemetry Strip */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
							<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
								Total Records
							</span>
							<span className="text-xl font-mono font-extrabold text-slate-900">
								{results.length}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
							<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
								Pages Fetched
							</span>
							<span className="text-xl font-mono font-extrabold text-slate-900">
								{progress.pages}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
							<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
								Start Date
							</span>
							<span className="text-sm font-mono font-bold text-slate-900">
								{settings.startDate}
							</span>
						</div>

						<div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl">
							<span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
								End Date
							</span>
							<span className="text-sm font-mono font-bold text-slate-900">
								{settings.endDate}
							</span>
						</div>
					</div>

					{/* Data Preview Table */}
					{results.length > 0 && (
						<div className="space-y-3 pt-2">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									Data Preview (Chronological Order &bull; Showing first 15 of{" "}
									{results.length})
								</span>
								<span className="text-[11px] text-slate-400">
									Oldest to newest
								</span>
							</div>

							<div className="overflow-x-auto border border-slate-200 rounded-2xl">
								<table className="w-full text-xs text-left">
									<thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
										<tr>
											<th className="py-2.5 px-3">Date</th>
											<th className="py-2.5 px-3 text-right">Close</th>
											<th className="py-2.5 px-3 text-right">Change %</th>
											<th className="py-2.5 px-3 text-right">Volume</th>
											<th className="py-2.5 px-3 text-right">Value (IDR)</th>
											<th className="py-2.5 px-3 text-right">Net Foreign</th>
											<th className="py-2.5 px-3 text-right">High</th>
											<th className="py-2.5 px-3 text-right">Low</th>
											<th className="py-2.5 px-3 text-right">Average</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100 font-mono">
										{[...results]
											.sort((a, b) => a.date.localeCompare(b.date))
											.slice(0, 15)
											.map((r) => (
												<tr
													key={r.date}
													className="hover:bg-slate-50/70 transition-colors"
												>
													<td className="py-2 px-3 font-semibold text-slate-900">
														{r.date}
													</td>
													<td className="py-2 px-3 text-right font-bold text-slate-900">
														{r.close?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td
														className={`py-2 px-3 text-right font-bold ${
															r.change_percentage > 0
																? "text-emerald-600"
																: r.change_percentage < 0
																	? "text-rose-600"
																	: "text-slate-500"
														}`}
													>
														{r.change_percentage > 0 ? "+" : ""}
														{r.change_percentage?.toFixed(2)}%
													</td>
													<td className="py-2 px-3 text-right text-slate-600">
														{r.volume?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td className="py-2 px-3 text-right text-slate-600">
														Rp {r.value?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td
														className={`py-2 px-3 text-right font-bold ${
															r.net_foreign > 0
																? "text-emerald-600"
																: r.net_foreign < 0
																	? "text-rose-600"
																	: "text-slate-500"
														}`}
													>
														{r.net_foreign > 0 ? "+" : ""}
														{r.net_foreign?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td className="py-2 px-3 text-right text-slate-600">
														{r.high?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td className="py-2 px-3 text-right text-slate-600">
														{r.low?.toLocaleString("id-ID") ?? "-"}
													</td>
													<td className="py-2 px-3 text-right text-slate-600">
														{r.average?.toLocaleString("id-ID") ?? "-"}
													</td>
												</tr>
											))}
									</tbody>
								</table>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
