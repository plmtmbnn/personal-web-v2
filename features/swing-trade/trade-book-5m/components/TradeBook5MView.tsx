"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	FileJson,
	KeyRound,
	LineChart,
	Loader2,
	Search,
	Server,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	readTradeBook5MSettings,
	saveTradeBook5MSettings,
} from "../lib/storage";
import {
	DEFAULT_TRADE_BOOK_5M_SETTINGS,
	TRADE_BOOK_5M_PERIODS,
	type TradeBook5MData,
	type TradeBook5MPeriod,
	type TradeBook5MResponse,
	type TradeBook5MSettings,
} from "../types";
import { useMarketCredentials } from "../../credentials/hooks/useMarketCredentials";
import TradeBook5MCharts from "./TradeBook5MCharts";
import TradeBook5MSummary from "./TradeBook5MSummary";

const inputClass =
	"w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/15";
const labelClass =
	"block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

interface StockOption {
	StockCode: string;
	StockName: string;
}

function triggerJsonDownload(data: unknown, symbol: string) {
	const d = new Date();
	const p = (n: number) => String(n).padStart(2, "0");
	const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json;charset=utf-8",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `trade-book-5m_${symbol.toUpperCase()}_${stamp}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export default function TradeBook5MView() {
	const { credentials, saveCredentials } = useMarketCredentials();
	const [settings, setSettings] = useState<TradeBook5MSettings>(
		DEFAULT_TRADE_BOOK_5M_SETTINGS,
	);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [visualizedData, setVisualizedData] = useState<TradeBook5MData | null>(
		null,
	);
	const [downloadedStats, setDownloadedStats] = useState<{
		symbol: string;
		from: string;
		to: string;
		totalLot: string;
		buyValue: string;
		sellValue: string;
	} | null>(null);

	useEffect(() => {
		setSettings(readTradeBook5MSettings());
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
			saveTradeBook5MSettings(settings);
		}
	}, [settings, hydrated]);

	const update = <K extends keyof TradeBook5MSettings>(
		key: K,
		value: TradeBook5MSettings[K],
	) => setSettings((s) => ({ ...s, [key]: value }));

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
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim());

	const handleExecute = useCallback(async () => {
		if (!ready || loading) return;

		setLoading(true);
		setError(null);
		setDownloadedStats(null);

		if (
			(settings.baseUrl && settings.baseUrl !== credentials?.baseUrl) ||
			(settings.token && settings.token !== credentials?.token)
		) {
			saveCredentials({ baseUrl: effectiveBaseUrl, token: effectiveToken });
		}

		try {
			const res = await fetch("/api/admin/trade-book-5m", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					baseUrl: effectiveBaseUrl,
					token: effectiveToken,
					symbol: settings.symbol.trim(),
					period: settings.period,
					timeInterval: settings.timeInterval,
				}),
			});

			const json = (await res.json().catch(() => null)) as
				| (TradeBook5MResponse & { error?: string })
				| null;

			if (!res.ok) {
				throw new Error(json?.error ?? `Request failed (${res.status})`);
			}

			if (!json?.data?.book_total) {
				throw new Error("No trade book data returned from upstream");
			}

			if (settings.actionMode === "json") {
				triggerJsonDownload(json, settings.symbol);
				setDownloadedStats({
					symbol: settings.symbol.toUpperCase(),
					from: json.data.from || "N/A",
					to: json.data.to || "N/A",
					totalLot: json.data.book_total.total_lot || "0",
					buyValue: json.data.book_total.buy_value || "Rp 0",
					sellValue: json.data.book_total.sell_value || "Rp 0",
				});
				setVisualizedData(null);
			} else {
				setVisualizedData(json.data);
			}
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Failed to retrieve trade book";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, [ready, loading, settings]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Breadcrumb & Title Card */}
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
							<span className="text-slate-900 font-bold">Trade Book 5M</span>
						</div>

						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/70 flex items-center justify-center text-sky-600 shadow-2xs">
								<LineChart className="w-5 h-5" aria-hidden />
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								Trade Book 5M Chart &amp; Multi-Day Inspector
							</h1>
						</div>

						<p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed max-w-2xl">
							Inspect multi-day 5-minute aggregated order-trade book dynamics,
							volume accumulation, and institutional money flow.
						</p>
					</div>

					<span className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200/70 text-sky-700 text-xs font-mono font-bold">
						Swing Trade
					</span>
				</div>
			</div>

			{/* Connection Configuration Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200/70 shrink-0">
						<Server className="w-5 h-5 text-indigo-600" aria-hidden />
					</div>
					<div className="min-w-0">
						<h2 className="text-base font-bold text-slate-900">
							Shared API Connection
						</h2>
						<p className="text-xs text-slate-500">
							Persisted in Redis and synchronized across all Market & Swing
							Trade tools.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="tb5-base"
							className={`flex items-center justify-between ${labelClass}`}
						>
							<span>Base API URL</span>
							{credentials?.baseUrl && (
								<span className="text-[10px] font-semibold text-emerald-600 normal-case">
									Redis Synced
								</span>
							)}
						</label>
						<input
							id="tb5-base"
							type="url"
							inputMode="url"
							placeholder={credentials?.baseUrl || "https://api.example.com"}
							value={settings.baseUrl}
							onChange={(e) => update("baseUrl", e.target.value)}
							className={inputClass}
							disabled={loading}
						/>
					</div>

					<div>
						<label
							htmlFor="tb5-token"
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
							<KeyRound
								className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
								aria-hidden
							/>
							<input
								id="tb5-token"
								type={showToken ? "text" : "password"}
								placeholder={
									credentials?.token
										? "Configured in Redis"
										: "Paste upstream auth token"
								}
								value={settings.token}
								onChange={(e) => update("token", e.target.value)}
								className={`${inputClass} pl-10 pr-10 font-mono text-xs`}
								disabled={loading}
							/>
							<button
								type="button"
								onClick={() => setShowToken((v) => !v)}
								aria-label={showToken ? "Hide token" : "Show token"}
								className="w-11 h-11 flex items-center justify-center rounded-xl absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 transition-colors cursor-pointer"
							>
								{showToken ? (
									<EyeOff className="w-4 h-4" aria-hidden />
								) : (
									<Eye className="w-4 h-4" aria-hidden />
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Parameters & Output Mode Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
					{/* Symbol Autocomplete (4 cols) */}
					<div className="md:col-span-4 relative">
						<label htmlFor="tb5-symbol" className={labelClass}>
							Stock Ticker (IHSG)
						</label>
						<div className="relative">
							<Search
								className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
								aria-hidden
							/>
							<input
								id="tb5-symbol"
								type="text"
								role="combobox"
								aria-expanded={tickerOpen}
								aria-autocomplete="list"
								aria-controls="tb5m-ticker-suggestions"
								autoComplete="off"
								placeholder="e.g. DOOH, BBCA"
								value={settings.symbol}
								onFocus={() => setTickerOpen(true)}
								onChange={(e) => {
									update("symbol", e.target.value.toUpperCase());
									setTickerOpen(true);
								}}
								className={`${inputClass} pl-10 uppercase font-semibold`}
								disabled={loading}
							/>
						</div>

						{tickerOpen && suggestions.length > 0 && !loading && (
							<>
								<div
									role="presentation"
									aria-hidden="true"
									className="fixed inset-0 z-30"
									onClick={() => setTickerOpen(false)}
								/>
								<div
									id="tb5m-ticker-suggestions"
									role="listbox"
									aria-label="Stock suggestions"
									className="absolute z-40 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100"
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
											className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors min-h-11 cursor-pointer"
										>
											<span className="font-bold text-slate-900">
												{s.StockCode}
											</span>
											<span className="text-slate-500 truncate ml-2 max-w-[200px]">
												{s.StockName}
											</span>
										</button>
									))}
								</div>
							</>
						)}
					</div>

					{/* Period Selector (4 cols) */}
					<div className="md:col-span-4">
						<label htmlFor="tb5-period" className={labelClass}>
							Analysis Period
						</label>
						<select
							id="tb5-period"
							value={settings.period}
							onChange={(e) =>
								update("period", e.target.value as TradeBook5MPeriod)
							}
							className={inputClass}
							disabled={loading}
						>
							{TRADE_BOOK_5M_PERIODS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Execution Mode Segmented Toggle (4 cols) */}
					<div className="md:col-span-4">
						<span className={labelClass}>Action Output Mode</span>
						<div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60 min-h-11">
							<button
								type="button"
								onClick={() => update("actionMode", "visualize")}
								className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all px-3 py-2 min-h-[36px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
									settings.actionMode === "visualize"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
								disabled={loading}
							>
								<LineChart className="w-3.5 h-3.5" aria-hidden />
								<span>Visualize</span>
							</button>

							<button
								type="button"
								onClick={() => update("actionMode", "json")}
								className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all px-3 py-2 min-h-[36px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
									settings.actionMode === "json"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
								disabled={loading}
							>
								<FileJson className="w-3.5 h-3.5" aria-hidden />
								<span>Download</span>
							</button>
						</div>
					</div>
				</div>

				{/* Fixed Parameters Readout & Action Trigger */}
				<div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
						<span className="font-semibold text-slate-700">Fixed Specs:</span>
						<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200/60">
							time_interval=5m
						</span>
					</div>

					<button
						type="button"
						disabled={!ready || loading}
						onClick={handleExecute}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-11 cursor-pointer"
					>
						{loading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
								<span>Retrieving Trade Book 5M...</span>
							</>
						) : settings.actionMode === "json" ? (
							<>
								<Download className="w-4 h-4" aria-hidden />
								<span>Fetch &amp; Download JSON</span>
							</>
						) : (
							<>
								<LineChart className="w-4 h-4" aria-hidden />
								<span>Fetch &amp; Visualize</span>
							</>
						)}
					</button>
				</div>
			</div>

			{/* Error Feedback Card */}
			{error && (
				<div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-5 flex items-start gap-3">
					<AlertCircle
						className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
						aria-hidden
					/>
					<div className="space-y-1">
						<h3 className="text-sm font-bold text-rose-900">
							Failed to Retrieve Trade Book 5M
						</h3>
						<p className="text-xs text-rose-700 leading-relaxed">{error}</p>
					</div>
				</div>
			)}

			{/* JSON Download Success Confirmation Card */}
			{downloadedStats && (
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs space-y-3">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-700 shrink-0">
							<CheckCircle2 className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-bold text-slate-900">
								Trade Book 5M JSON Exported Successfully
							</h3>
							<p className="text-xs text-slate-500">
								File saved for {downloadedStats.symbol} ({downloadedStats.from}{" "}
								to {downloadedStats.to})
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
								Total Lot
							</span>
							<span className="text-base font-extrabold text-slate-900">
								{downloadedStats.totalLot}
							</span>
						</div>
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
								Buy Value
							</span>
							<span className="text-base font-extrabold text-slate-900 truncate block">
								{downloadedStats.buyValue}
							</span>
						</div>
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
								Sell Value
							</span>
							<span className="text-base font-extrabold text-slate-900 truncate block">
								{downloadedStats.sellValue}
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Visualization Results Section */}
			{visualizedData && (
				<div className="space-y-6">
					<TradeBook5MSummary
						total={visualizedData.book_total}
						from={visualizedData.from}
						to={visualizedData.to}
						date={visualizedData.date}
					/>
					<TradeBook5MCharts data={visualizedData} symbol={settings.symbol} />
				</div>
			)}
		</div>
	);
}
