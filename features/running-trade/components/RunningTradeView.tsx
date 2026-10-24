"use client";

import {
	AlertCircle,
	ArrowRightLeft,
	CheckCircle2,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	KeyRound,
	Loader2,
	Search,
	Server,
	Square,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	buildCsv,
	collectRunningTrades,
	MAX_PAGES,
	RateLimitError,
} from "../lib/collect";
import type { CollectResult } from "../lib/collect";
import {
	DEFAULT_SETTINGS,
	MARKET_BOARDS,
	type RunningTrade,
	type RunningTradeResponse,
	type RunningTradeSettings,
} from "../types";

const STORAGE_KEY = "running-trade:settings";

const inputClass =
	"w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/15";
const labelClass =
	"block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

interface StockOption {
	StockCode: string;
	StockName: string;
}

function readSettings(): RunningTradeSettings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

function downloadCsv(trades: RunningTrade[], symbol: string) {
	const d = new Date();
	const p = (n: number) => String(n).padStart(2, "0");
	const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
	const url = URL.createObjectURL(
		new Blob([buildCsv(trades)], { type: "text/csv;charset=utf-8" }),
	);
	const a = document.createElement("a");
	a.href = url;
	a.download = `running-trade_${symbol.toUpperCase()}_${stamp}.csv`;
	a.click();
	URL.revokeObjectURL(url);
}

const STOP_MESSAGES: Record<CollectResult["stopReason"], string> = {
	empty: "Finished. The API returned an empty page.",
	caught_up:
		"Caught up to live market. Retrieved all trades up to the present moment.",
	cap: `Stopped at the ${MAX_PAGES}-page safety cap. Raise the limit or narrow the filters to get the rest.`,
	cancelled: "Cancelled.",
	error: "Stopped by an error.",
	stalled:
		"Stopped because trade_number did not advance. The API may be ignoring the cursor.",
};

export default function RunningTradeView() {
	const [settings, setSettings] =
		useState<RunningTradeSettings>(DEFAULT_SETTINGS);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [running, setRunning] = useState(false);
	const [isLiveMarket, setIsLiveMarket] = useState(false);
	const [progress, setProgress] = useState({ pages: 0, rows: 0 });
	const [waitNote, setWaitNote] = useState<string | null>(null);
	const [result, setResult] = useState<CollectResult | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setSettings(readSettings());
		setHydrated(true);
		fetch("/api/utils/stock-data")
			.then((r) => r.json())
			.then((j: { data?: StockOption[] }) => setStocks(j.data ?? []))
			.catch(() => setStocks([]));
	}, []);

	useEffect(() => {
		if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	}, [settings, hydrated]);

	const update = <K extends keyof RunningTradeSettings>(
		key: K,
		value: RunningTradeSettings[K],
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
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim()) &&
		settings.limit >= 1 &&
		settings.minimumLot >= 0 &&
		settings.valueFrom >= 0;

	const run = useCallback(async () => {
		const ac = new AbortController();
		abortRef.current = ac;
		setRunning(true);
		setIsLiveMarket(false);
		setResult(null);
		setProgress({ pages: 0, rows: 0 });

		const fetchPage = async (tradeNumber?: string) => {
			const res = await fetch("/api/admin/running-trade", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					baseUrl: settings.baseUrl.trim(),
					token: settings.token.trim(),
					symbol: settings.symbol.trim(),
					marketBoard: settings.marketBoard,
					minimumLot: settings.minimumLot,
					valueFrom: settings.valueFrom,
					limit: settings.limit,
					tradeNumber,
				}),
				signal: ac.signal,
			});
			const json = (await res.json().catch(() => null)) as
				| (Partial<RunningTradeResponse> & { error?: string })
				| null;
			if (res.status === 429) {
				const seconds = (json as { retryAfterSeconds?: number } | null)
					?.retryAfterSeconds;
				// Capped so a hostile or odd Retry-After cannot stall the run for hours.
				throw new RateLimitError(
					json?.error ?? "Too Many Requests",
					seconds ? Math.min(seconds, 120) * 1000 : undefined,
				);
			}
			if (!res.ok)
				throw new Error(json?.error ?? `Request failed (${res.status})`);
			const marketOpen = Boolean(json?.data?.is_open_market);
			if (marketOpen) setIsLiveMarket(true);
			return {
				trades: json?.data?.running_trade ?? [],
				isOpenMarket: marketOpen,
			};
		};

		const out = await collectRunningTrades({
			fetchPage,
			signal: ac.signal,
			onProgress: (pages, rows) => {
				setWaitNote(null);
				setProgress({ pages, rows });
			},
			onWait: (ms, reason) =>
				setWaitNote(
					`${reason === "pause" ? "Short pause to stay under the rate limit" : "Rate limited by the API, retrying"} in ${Math.round(ms / 1000)}s`,
				),
		});

		setResult(out);
		setWaitNote(null);
		setRunning(false);
		abortRef.current = null;
		// A clean finish downloads automatically; partial runs wait for the user.
		if (
			(out.stopReason === "empty" || out.stopReason === "caught_up") &&
			out.trades.length > 0
		) {
			downloadCsv(out.trades, settings.symbol);
		}
	}, [settings]);

	const isError = result?.stopReason === "error";
	const hasRows = (result?.trades.length ?? 0) > 0;

	return (
		<div className="space-y-6 sm:space-y-8">
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-2">
				<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
					<Link
						href="/admin"
						className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
					>
						Admin Dashboard
					</Link>
					<ChevronRight className="w-3 h-3 text-slate-400" aria-hidden />
					<span className="text-slate-900 font-bold">Running Trade</span>
				</div>
				<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
					Running Trade Retriever
				</h1>
				<p className="text-sm text-slate-500 max-w-xl leading-relaxed">
					Pull every running trade for one ticker by following trade_number,
					then download the result as CSV.
				</p>
			</div>

			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200/70 shrink-0">
						<Server className="w-5 h-5 text-indigo-600" aria-hidden />
					</div>
					<div className="min-w-0">
						<h2 className="text-base font-bold text-slate-900">Connection</h2>
						<p className="text-xs text-slate-500">
							Saved in this browser's localStorage and prefilled next time.
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="rt-base" className={labelClass}>
							Base API URL
						</label>
						<input
							id="rt-base"
							type="url"
							inputMode="url"
							autoComplete="off"
							spellCheck={false}
							placeholder="https://api.example.com"
							value={settings.baseUrl}
							onChange={(e) => update("baseUrl", e.target.value)}
							className={inputClass}
						/>
					</div>
					<div>
						<label htmlFor="rt-token" className={labelClass}>
							Bearer token
						</label>
						<div className="relative">
							<KeyRound
								className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10"
								aria-hidden
							/>
							<input
								id="rt-token"
								type={showToken ? "text" : "password"}
								autoComplete="off"
								spellCheck={false}
								value={settings.token}
								onChange={(e) => update("token", e.target.value)}
								className={`${inputClass} pl-10 pr-12`}
							/>
							<button
								type="button"
								onClick={() => setShowToken((v) => !v)}
								aria-label={showToken ? "Hide token" : "Show token"}
								aria-pressed={showToken}
								className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
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

			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/70 shrink-0">
						<ArrowRightLeft className="w-5 h-5 text-emerald-600" aria-hidden />
					</div>
					<h2 className="text-base font-bold text-slate-900">Filters</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<label htmlFor="rt-symbol" className={labelClass}>
							Ticker
						</label>
						<Search
							className="pointer-events-none absolute left-3.5 bottom-[15px] w-4 h-4 text-slate-400 z-10"
							aria-hidden
						/>
						<input
							id="rt-symbol"
							role="combobox"
							aria-expanded={tickerOpen && suggestions.length > 0}
							aria-controls="rt-symbol-list"
							aria-autocomplete="list"
							autoComplete="off"
							spellCheck={false}
							placeholder="DAAZ"
							value={settings.symbol}
							onChange={(e) => {
								update("symbol", e.target.value.toUpperCase());
								setTickerOpen(true);
							}}
							onFocus={() => setTickerOpen(true)}
							onBlur={() => setTickerOpen(false)}
							onKeyDown={(e) => e.key === "Escape" && setTickerOpen(false)}
							className={`${inputClass} pl-10 font-mono uppercase`}
						/>
						{tickerOpen && suggestions.length > 0 && (
							<div
								id="rt-symbol-list"
								role="listbox"
								className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
							>
								{suggestions.map((s) => (
									<button
										key={s.StockCode}
										type="button"
										role="option"
										aria-selected={s.StockCode === settings.symbol}
										// mousedown fires before the input blur that would close the list
										onMouseDown={(e) => {
											e.preventDefault();
											update("symbol", s.StockCode);
											setTickerOpen(false);
										}}
										className="w-full min-h-11 flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-slate-50 cursor-pointer"
									>
										<span className="font-mono text-sm font-bold text-slate-900 shrink-0">
											{s.StockCode}
										</span>
										<span className="text-xs text-slate-500 truncate">
											{s.StockName}
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					<div>
						<label htmlFor="rt-board" className={labelClass}>
							Market board
						</label>
						<select
							id="rt-board"
							value={settings.marketBoard}
							onChange={(e) =>
								update(
									"marketBoard",
									e.target.value as RunningTradeSettings["marketBoard"],
								)
							}
							className={`${inputClass} cursor-pointer`}
						>
							{MARKET_BOARDS.map((b) => (
								<option key={b} value={b}>
									{b}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:col-span-2">
						<div>
							<label htmlFor="rt-lot" className={labelClass}>
								Minimum lot
							</label>
							<input
								id="rt-lot"
								type="number"
								inputMode="numeric"
								min={0}
								value={settings.minimumLot}
								onChange={(e) => update("minimumLot", Number(e.target.value))}
								className={inputClass}
							/>
						</div>
						<div>
							<label htmlFor="rt-value" className={labelClass}>
								Value from
							</label>
							<input
								id="rt-value"
								type="number"
								inputMode="numeric"
								min={0}
								value={settings.valueFrom}
								onChange={(e) => update("valueFrom", Number(e.target.value))}
								className={inputClass}
							/>
						</div>
						<div>
							<label htmlFor="rt-limit" className={labelClass}>
								Page size (limit)
							</label>
							<input
								id="rt-limit"
								type="number"
								inputMode="numeric"
								min={1}
								max={1000}
								value={settings.limit}
								onChange={(e) => update("limit", Number(e.target.value))}
								className={inputClass}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-5 border-t border-slate-100">
					{running ? (
						<button
							type="button"
							onClick={() => abortRef.current?.abort()}
							className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30"
						>
							<Square className="w-4 h-4" aria-hidden />
							Cancel
						</button>
					) : (
						<button
							type="button"
							onClick={run}
							disabled={!ready}
							className="inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2"
						>
							<Download className="w-4 h-4" aria-hidden />
							Retrieve and download CSV
						</button>
					)}
					{!ready && !running && (
						<p className="text-xs text-slate-500">
							Needs an https base URL, a token, and a ticker.
						</p>
					)}
				</div>
			</div>

			<div aria-live="polite" aria-busy={running}>
				{running && (
					<div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
						<div className="flex items-center gap-4">
							<Loader2
								className="w-5 h-5 text-slate-900 animate-spin shrink-0"
								aria-hidden
							/>
							<p className="text-sm text-slate-700">
								<span className="font-mono font-bold">{progress.pages}</span>{" "}
								pages,{" "}
								<span className="font-mono font-bold">
									{progress.rows.toLocaleString()}
								</span>{" "}
								rows collected
								{waitNote && (
									<span className="block text-xs text-amber-700 mt-0.5">
										{waitNote}
									</span>
								)}
							</p>
						</div>
						{isLiveMarket && (
							<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
								Market Open
							</span>
						)}
					</div>
				)}

				{result && !running && (
					<div
						className={`rounded-3xl p-6 border shadow-xs space-y-4 ${
							isError
								? "bg-rose-50 border-rose-200/80"
								: "bg-white border-slate-200/80"
						}`}
					>
						<div className="flex items-start gap-3">
							{isError ? (
								<AlertCircle
									className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
									aria-hidden
								/>
							) : (
								<CheckCircle2
									className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"
									aria-hidden
								/>
							)}
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-sm font-bold text-slate-900">
										{STOP_MESSAGES[result.stopReason]}
									</p>
									{result.isOpenMarket && (
										<span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
											Market Open
										</span>
									)}
								</div>
								{result.error && (
									<p className="text-sm text-rose-700 break-words">
										{result.error}
									</p>
								)}
								<p className="text-xs text-slate-500">
									{result.trades.length.toLocaleString()} rows across{" "}
									{result.pages} pages.
									{result.stopReason === "empty" && !hasRows
										? result.isOpenMarket
											? " Market is open, but no trades matched these filters today so far."
											: " Nothing matched these filters, so no file was created."
										: ""}
								</p>
							</div>
						</div>

						{hasRows && (
							<button
								type="button"
								onClick={() => downloadCsv(result.trades, settings.symbol)}
								className="inline-flex items-center gap-2 min-h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2"
							>
								<Download className="w-4 h-4" aria-hidden />
								{result.stopReason === "empty" ||
								result.stopReason === "caught_up"
									? "Download again"
									: "Download partial CSV"}
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
