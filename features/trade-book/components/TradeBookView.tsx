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
import { readTradeBookSettings, saveTradeBookSettings } from "../lib/storage";
import {
	DEFAULT_TRADE_BOOK_SETTINGS,
	type TradeBookData,
	type TradeBookResponse,
	type TradeBookSettings,
} from "../types";
import { setSessionTradeBook } from "@/features/running-trade/lib/session-cache";
import TradeBookCharts from "./TradeBookCharts";
import TradeBookSummary from "./TradeBookSummary";

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
	a.download = `trade-book_${symbol.toUpperCase()}_${stamp}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export default function TradeBookView() {
	const [settings, setSettings] = useState<TradeBookSettings>(
		DEFAULT_TRADE_BOOK_SETTINGS,
	);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [visualizedData, setVisualizedData] = useState<TradeBookData | null>(
		null,
	);
	const [downloadedStats, setDownloadedStats] = useState<{
		symbol: string;
		date: string;
		totalLot: string;
		buyValue: string;
		sellValue: string;
	} | null>(null);

	useEffect(() => {
		setSettings(readTradeBookSettings());
		setHydrated(true);

		fetch("/api/utils/stock-data")
			.then((r) => r.json())
			.then((j: { data?: StockOption[] }) => setStocks(j.data ?? []))
			.catch(() => setStocks([]));
	}, []);

	useEffect(() => {
		if (hydrated) {
			saveTradeBookSettings(settings);
		}
	}, [settings, hydrated]);

	const update = <K extends keyof TradeBookSettings>(
		key: K,
		value: TradeBookSettings[K],
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

	const ready =
		settings.baseUrl.trim().startsWith("https://") &&
		settings.token.trim() !== "" &&
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim());

	const handleExecute = useCallback(async () => {
		if (!ready || loading) return;

		setLoading(true);
		setError(null);
		setDownloadedStats(null);

		try {
			const res = await fetch("/api/admin/trade-book", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					baseUrl: settings.baseUrl.trim(),
					token: settings.token.trim(),
					symbol: settings.symbol.trim(),
				}),
			});

			const json = (await res.json().catch(() => null)) as
				| (TradeBookResponse & { error?: string })
				| null;

			if (!res.ok) {
				throw new Error(json?.error ?? `Request failed (${res.status})`);
			}

			if (!json?.data) {
				throw new Error("No trade book data returned from upstream");
			}

			setSessionTradeBook(settings.symbol, json.data);

			if (settings.actionMode === "json") {
				triggerJsonDownload(json, settings.symbol);
				setDownloadedStats({
					symbol: settings.symbol.toUpperCase(),
					date: json.data.date || new Date().toISOString().slice(0, 10),
					totalLot: json.data.book_total?.total_lot || "0",
					buyValue: json.data.book_total?.buy_value || "Rp 0",
					sellValue: json.data.book_total?.sell_value || "Rp 0",
				});
				setVisualizedData(null);
			} else {
				setVisualizedData(json.data);
			}
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Failed to fetch trade book";
			setError(msg);
		} finally {
			setLoading(false);
		}
	}, [ready, loading, settings]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Breadcrumb & Title Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-2">
				<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
					<Link
						href="/admin"
						className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
					>
						Admin Dashboard
					</Link>
					<ChevronRight className="w-3 h-3 text-slate-400" aria-hidden />
					<span className="text-slate-900 font-bold">Trade Book</span>
				</div>
				<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
					Trade Book Chart & Inspector
				</h1>
				<p className="text-sm text-slate-500 max-w-xl leading-relaxed">
					Inspect 1-minute order-trade book dynamics, volume accumulation, and
					institutional money flow.
				</p>
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
							Persisted in localStorage and shared seamlessly with Running
							Trade.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="tb-base" className={labelClass}>
							Base API URL
						</label>
						<input
							id="tb-base"
							type="url"
							inputMode="url"
							placeholder="https://api.example.com"
							value={settings.baseUrl}
							onChange={(e) => update("baseUrl", e.target.value)}
							className={inputClass}
						/>
					</div>

					<div>
						<label htmlFor="tb-token" className={labelClass}>
							Bearer Token
						</label>
						<div className="relative">
							<KeyRound
								className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
								aria-hidden
							/>
							<input
								id="tb-token"
								type={showToken ? "text" : "password"}
								placeholder="Paste upstream auth token"
								value={settings.token}
								onChange={(e) => update("token", e.target.value)}
								className={`${inputClass} pl-10 pr-10 font-mono text-xs`}
							/>
							<button
								type="button"
								onClick={() => setShowToken((v) => !v)}
								aria-label={showToken ? "Hide token" : "Show token"}
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md"
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

			{/* Parameters & Mode Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
					{/* Symbol Autocomplete (7 cols) */}
					<div className="lg:col-span-7 relative">
						<label htmlFor="tb-symbol" className={labelClass}>
							Stock Ticker (IHSG)
						</label>
						<div className="relative">
							<Search
								className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
								aria-hidden
							/>
							<input
								id="tb-symbol"
								type="text"
								autoComplete="off"
								placeholder="e.g. BBCA, BBRI, KETR"
								value={settings.symbol}
								onFocus={() => setTickerOpen(true)}
								onChange={(e) => {
									update("symbol", e.target.value.toUpperCase());
									setTickerOpen(true);
								}}
								className={`${inputClass} pl-10 uppercase font-semibold`}
							/>
						</div>

						{tickerOpen && suggestions.length > 0 && (
							<div className="absolute z-30 left-0 right-0 mt-1.5 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg divide-y divide-slate-100">
								{suggestions.map((s) => (
									<button
										key={s.StockCode}
										type="button"
										onMouseDown={(e) => {
											e.preventDefault();
											update("symbol", s.StockCode);
											setTickerOpen(false);
										}}
										className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between transition-colors min-h-11"
									>
										<span className="font-bold text-slate-900">
											{s.StockCode}
										</span>
										<span className="text-slate-500 truncate ml-2 max-w-[220px]">
											{s.StockName}
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Execution Mode Segmented Toggle (5 cols) */}
					<div className="lg:col-span-5">
						<span className={labelClass}>Action Output Mode</span>
						<div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200/60 min-h-11">
							<button
								type="button"
								onClick={() => update("actionMode", "visualize")}
								className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all px-3 py-2 min-h-[36px] ${
									settings.actionMode === "visualize"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								<LineChart className="w-3.5 h-3.5" aria-hidden />
								Visualize in UI
							</button>

							<button
								type="button"
								onClick={() => update("actionMode", "json")}
								className={`flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all px-3 py-2 min-h-[36px] ${
									settings.actionMode === "json"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								<FileJson className="w-3.5 h-3.5" aria-hidden />
								Download JSON
							</button>
						</div>
					</div>
				</div>

				{/* Fixed Parameters Readout & Action Trigger */}
				<div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
						<span className="font-semibold text-slate-700">
							Fixed Query Specs:
						</span>
						<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200/60">
							interval=1m
						</span>
						<span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200/60">
							period=DATE_PICKER_PERIOD_LATEST
						</span>
					</div>

					<button
						type="button"
						disabled={!ready || loading}
						onClick={handleExecute}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-11 cursor-pointer"
					>
						{loading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
								<span>Retrieving Trade Book...</span>
							</>
						) : settings.actionMode === "json" ? (
							<>
								<Download className="w-4 h-4" aria-hidden />
								<span>Fetch & Download JSON</span>
							</>
						) : (
							<>
								<LineChart className="w-4 h-4" aria-hidden />
								<span>Fetch & Visualize</span>
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
							Failed to Retrieve Trade Book
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
								Trade Book JSON Exported Successfully
							</h3>
							<p className="text-xs text-slate-500">
								File downloaded to your browser for {downloadedStats.symbol} (
								{downloadedStats.date})
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
								Total Lot
							</span>
							<span className="text-base font-extrabold text-slate-900">
								{downloadedStats.totalLot}
							</span>
						</div>
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
								Buy Value
							</span>
							<span className="text-base font-extrabold text-slate-900 truncate block">
								{downloadedStats.buyValue}
							</span>
						</div>
						<div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
							<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
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
					<TradeBookSummary
						total={visualizedData.book_total}
						date={visualizedData.date}
					/>
					<TradeBookCharts data={visualizedData} symbol={settings.symbol} />
				</div>
			)}
		</div>
	);
}
