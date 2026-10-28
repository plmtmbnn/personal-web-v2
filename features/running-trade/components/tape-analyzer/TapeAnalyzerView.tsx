"use client";

import {
	Activity,
	AlertCircle,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Compass,
	Download,
	Eye,
	EyeOff,
	KeyRound,
	LineChart,
	Loader2,
	ScanSearch,
	Search,
	Server,
	Settings2,
	UploadCloud,
	XCircle,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildZipBlob, toUint8Array } from "@/lib/shared/zip";
import { buildCsv, collectRunningTrades } from "../../lib/collect";
import {
	getSessionAnalysis,
	getSessionTradeBook,
	getSessionTrades,
	hasSessionData,
	setSessionAnalysis,
	setSessionTradeBook,
	setSessionTrades,
} from "../../lib/session-cache";
import {
	executeTapeAnalysis,
	fetchTradeBookData,
	readTapeAnalyzerSettings,
	saveTapeAnalyzerSettings,
} from "../../lib/tape-analyzer";
import type { RunningTrade } from "../../types";
import {
	type BlockMode,
	DEFAULT_TAPE_ANALYZER_SETTINGS,
	type TapeAnalyzerResponse,
	type TapeAnalyzerSettings,
} from "../../types/tape-analyzer";
import ActionBanner from "./ActionBanner";
import ArchetypesCard from "./ArchetypesCard";
import MicrostructureGrid from "./MicrostructureGrid";
import PlaybookSetupsCard from "./PlaybookSetupsCard";

const inputClass =
	"w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus-visible:border-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/15";
const labelClass =
	"block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5";

interface StockOption {
	StockCode: string;
	StockName: string;
}

type IngestMode = "live" | "upload";

function triggerDownload(
	filename: string,
	content: string | Blob | unknown,
	mimeType: string,
) {
	const blob =
		content instanceof Blob
			? content
			: new Blob(
					[
						typeof content === "string"
							? content
							: JSON.stringify(content, null, 2),
					],
					{ type: `${mimeType};charset=utf-8` },
				);
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export default function TapeAnalyzerView() {
	const [settings, setSettings] = useState<TapeAnalyzerSettings>(
		DEFAULT_TAPE_ANALYZER_SETTINGS,
	);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [ingestMode, setIngestMode] = useState<IngestMode>("live");
	const [showAdvanced, setShowAdvanced] = useState(false);

	// Processing States
	const [loading, setLoading] = useState(false);
	const [statusText, setStatusText] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [analysisResult, setAnalysisResult] =
		useState<TapeAnalyzerResponse | null>(null);

	// Manual File Upload states
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [jsonFile, setJsonFile] = useState<File | null>(null);

	// Feed Ingestion & Download States
	const [collectedData, setCollectedData] = useState<{
		trades: RunningTrade[] | null;
		tradeBook: unknown | null;
	}>({ trades: null, tradeBook: null });
	const [tradesProgress, setTradesProgress] = useState<{
		pages: number;
		rows: number;
	} | null>(null);
	const [feedProgress, setFeedProgress] = useState<{
		runningTrade: "idle" | "fetching" | "success" | "failed";
		tradeBook: "idle" | "fetching" | "success" | "failed";
		screener: "idle" | "fetching" | "success" | "failed";
	}>({
		runningTrade: "idle",
		tradeBook: "idle",
		screener: "idle",
	});
	const [isZipping, setIsZipping] = useState(false);

	const abortRef = useRef<AbortController | null>(null);

	useEffect(() => {
		setSettings(readTapeAnalyzerSettings());
		setHydrated(true);

		fetch("/api/utils/stock-data")
			.then((r) => r.json())
			.then((j: { data?: StockOption[] }) => setStocks(j.data ?? []))
			.catch(() => setStocks([]));
	}, []);

	useEffect(() => {
		if (hydrated) {
			saveTapeAnalyzerSettings(settings);
		}
	}, [settings, hydrated]);

	const update = <K extends keyof TapeAnalyzerSettings>(
		key: K,
		value: TapeAnalyzerSettings[K],
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

	const sessionStatus = useMemo(() => {
		if (!settings.symbol)
			return { hasTrades: false, hasTradeBook: false, hasAnalysis: false };
		return hasSessionData(settings.symbol);
	}, [settings.symbol]);

	const readyForLive =
		settings.baseUrl.trim().startsWith("https://") &&
		settings.token.trim() !== "" &&
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim());

	const readyForUpload =
		csvFile !== null &&
		jsonFile !== null &&
		/^[A-Za-z0-9]{1,10}$/.test(settings.symbol.trim());

	// Handler: Run Instant Cached Analysis
	const handleUseCached = useCallback(async () => {
		const sym = settings.symbol.trim().toUpperCase();
		const cachedTrades = getSessionTrades(sym);
		const cachedBook = getSessionTradeBook(sym);

		if (!cachedTrades || !cachedBook) {
			setError("Cached trade session data is incomplete. Run live fetch.");
			return;
		}

		setLoading(true);
		setError(null);
		setStatusText("Running screener engine on cached session data...");
		setCollectedData({
			trades: cachedTrades,
			tradeBook: cachedBook,
		});
		setFeedProgress({
			runningTrade: "success",
			tradeBook: "success",
			screener: "fetching",
		});

		try {
			const csvString = buildCsv(cachedTrades);
			const res = await executeTapeAnalysis({
				tradesCsv: csvString,
				tradeBookJson: cachedBook,
				ticker: sym,
				feeBuy: settings.feeBuy,
				feeSell: settings.feeSell,
				blockMode: settings.blockMode,
				apiEndpoint: settings.apiEndpoint,
			});

			setAnalysisResult(res);
			setSessionAnalysis(sym, res);
			setFeedProgress((p) => ({ ...p, screener: "success" }));
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Cached analysis request failed",
			);
			setFeedProgress((p) => ({ ...p, screener: "failed" }));
		} finally {
			setLoading(false);
			setStatusText(null);
		}
	}, [settings]);

	// Handler: Run Live Concurrent Fetch & Analyze
	const handleExecuteLive = useCallback(async () => {
		if (!readyForLive || loading) return;

		const ac = new AbortController();
		abortRef.current = ac;
		setLoading(true);
		setError(null);
		setAnalysisResult(null);
		setTradesProgress(null);
		setFeedProgress({
			runningTrade: "fetching",
			tradeBook: "fetching",
			screener: "idle",
		});

		const symbol = settings.symbol.trim().toUpperCase();

		try {
			setStatusText("Initializing parallel trade-book & tape streams...");

			// Concurrent fetch 1: Trade Book JSON
			const bookPromise = fetchTradeBookData({
				baseUrl: settings.baseUrl,
				token: settings.token,
				symbol,
				signal: ac.signal,
			});

			// Concurrent fetch 2: Running Trades pagination
			const fetchPage = async (tradeNumber?: string) => {
				const res = await fetch("/api/admin/running-trade", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						baseUrl: settings.baseUrl.trim(),
						token: settings.token.trim(),
						symbol,
						marketBoard: "BOARD_TYPE_REGULAR",
						minimumLot: 0,
						valueFrom: 0,
						limit: 1000,
						tradeNumber,
					}),
					signal: ac.signal,
				});

				const json = await res.json().catch(() => null);
				if (!res.ok) {
					throw new Error(json?.error ?? `Upstream error ${res.status}`);
				}
				return json?.data?.running_trade ?? [];
			};

			const tradesPromise = collectRunningTrades({
				fetchPage,
				signal: ac.signal,
				onProgress: (pages, rows) => {
					setTradesProgress({ pages, rows });
					setStatusText(
						`Collecting running trades... Page ${pages} (${rows.toLocaleString(
							"id-ID",
						)} ticks)`,
					);
				},
				onWait: (ms, reason) => {
					setStatusText(
						reason === "rate-limit"
							? `Rate limited by broker API. Backing off ${Math.ceil(
									ms / 1000,
								)}s...`
							: `Cooldown pause ${Math.ceil(ms / 1000)}s...`,
					);
				},
			});

			// Wait for both streams to conclude
			const [bookData, tradesCollectResult] = await Promise.all([
				bookPromise,
				tradesPromise,
			]);

			if (tradesCollectResult.trades.length === 0) {
				throw new Error("No running trades found for this ticker today");
			}

			// Store into session cache for instant future reuse
			setSessionTrades(symbol, tradesCollectResult.trades);
			setSessionTradeBook(symbol, bookData);
			setCollectedData({
				trades: tradesCollectResult.trades,
				tradeBook: bookData,
			});
			setFeedProgress((p) => ({
				...p,
				runningTrade: "success",
				tradeBook: "success",
				screener: "fetching",
			}));

			setStatusText("Building in-memory dataset & analyzing microstructure...");
			const csvString = buildCsv(tradesCollectResult.trades);

			const analysis = await executeTapeAnalysis({
				tradesCsv: csvString,
				tradeBookJson: bookData,
				ticker: symbol,
				feeBuy: settings.feeBuy,
				feeSell: settings.feeSell,
				blockMode: settings.blockMode,
				apiEndpoint: settings.apiEndpoint,
				signal: ac.signal,
			});

			setAnalysisResult(analysis);
			setSessionAnalysis(symbol, analysis);
			setFeedProgress((p) => ({ ...p, screener: "success" }));
		} catch (err) {
			if (ac.signal.aborted) {
				setError("Analysis operation cancelled.");
			} else {
				const msg =
					err instanceof Error ? err.message : "Tape reading analysis failed";
				setError(msg);
			}
			setFeedProgress((p) => ({
				...p,
				runningTrade: p.runningTrade === "fetching" ? "failed" : p.runningTrade,
				tradeBook: p.tradeBook === "fetching" ? "failed" : p.tradeBook,
				screener: p.screener === "fetching" ? "failed" : p.screener,
			}));
		} finally {
			setLoading(false);
			setStatusText(null);
		}
	}, [readyForLive, loading, settings]);

	// Handler: Run Analysis on Uploaded Files
	const handleExecuteUpload = useCallback(async () => {
		if (!csvFile || !jsonFile || loading) return;

		setLoading(true);
		setError(null);
		setFeedProgress({
			runningTrade: csvFile ? "success" : "idle",
			tradeBook: jsonFile ? "success" : "idle",
			screener: "fetching",
		});
		setStatusText(
			"Parsing uploaded files and dispatching to screener engine...",
		);

		try {
			const res = await executeTapeAnalysis({
				tradesCsv: csvFile,
				tradeBookJson: jsonFile,
				ticker: settings.symbol.trim().toUpperCase(),
				feeBuy: settings.feeBuy,
				feeSell: settings.feeSell,
				blockMode: settings.blockMode,
				apiEndpoint: settings.apiEndpoint,
			});

			setAnalysisResult(res);
			setFeedProgress((p) => ({ ...p, screener: "success" }));
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Analysis of uploaded files failed";
			setError(msg);
			setFeedProgress((p) => ({ ...p, screener: "failed" }));
		} finally {
			setLoading(false);
			setStatusText(null);
		}
	}, [csvFile, jsonFile, loading, settings]);

	const getFeedDownload = useCallback(
		(key: "runningTrade" | "tradeBook" | "screener") => {
			const sym = (settings.symbol.trim() || "STOCK").toUpperCase();
			const d = new Date();
			const p = (n: number) => String(n).padStart(2, "0");
			const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;

			switch (key) {
				case "runningTrade": {
					if (csvFile) {
						return {
							filename: `running-trade_${sym}_${stamp}.csv`,
							data: csvFile,
							mime: "text/csv",
						};
					}
					const trades = collectedData.trades || getSessionTrades(sym);
					if (trades && trades.length > 0) {
						return {
							filename: `running-trade_${sym}_${stamp}.csv`,
							data: buildCsv(trades),
							mime: "text/csv",
						};
					}
					return null;
				}
				case "tradeBook": {
					if (jsonFile) {
						return {
							filename: `trade-book_${sym}_${stamp}.json`,
							data: jsonFile,
							mime: "application/json",
						};
					}
					const book = collectedData.tradeBook || getSessionTradeBook(sym);
					if (book) {
						return {
							filename: `trade-book_${sym}_${stamp}.json`,
							data: book,
							mime: "application/json",
						};
					}
					return null;
				}
				case "screener": {
					const analysis = analysisResult || getSessionAnalysis(sym);
					if (!analysis) return null;
					return {
						filename: `tape-analysis_${sym}_${stamp}.json`,
						data: analysis,
						mime: "application/json",
					};
				}
			}
		},
		[settings.symbol, csvFile, jsonFile, collectedData, analysisResult],
	);

	const downloadFeedItem = (key: "runningTrade" | "tradeBook" | "screener") => {
		const item = getFeedDownload(key);
		if (!item) return;
		triggerDownload(item.filename, item.data, item.mime);
	};

	const availableFeeds = useMemo(() => {
		const keys: ("runningTrade" | "tradeBook" | "screener")[] = [
			"runningTrade",
			"tradeBook",
			"screener",
		];
		return keys.filter((k) => getFeedDownload(k) !== null);
	}, [getFeedDownload]);

	const downloadAllFeeds = async () => {
		const available = availableFeeds
			.map((k) => getFeedDownload(k))
			.filter((item): item is NonNullable<typeof item> => item !== null);

		if (available.length === 0) return;

		try {
			setIsZipping(true);
			const zipFiles = await Promise.all(
				available.map(async (item) => ({
					name: item.filename,
					data: await toUint8Array(item.data),
				})),
			);

			const sym = (settings.symbol.trim() || "STOCK").toUpperCase();
			const d = new Date();
			const p = (n: number) => String(n).padStart(2, "0");
			const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;

			const zipBlob = buildZipBlob(zipFiles);
			triggerDownload(
				`tape-feeds_${sym}_${stamp}.zip`,
				zipBlob,
				"application/zip",
			);
		} finally {
			setIsZipping(false);
		}
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Floating Control Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				{/* Header & Ingest Mode Selector */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
					<div>
						<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
							<ScanSearch className="w-5 h-5 text-slate-700" />
							Tape Reading & Microstructure Screener
						</h2>
						<p className="text-xs text-slate-500 mt-0.5">
							Direct BEI tape reading, order absorption, and intraday setup
							validation
						</p>
					</div>

					{/* Mode Switcher */}
					<div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start sm:self-auto">
						<button
							type="button"
							onClick={() => setIngestMode("live")}
							className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-11 flex items-center justify-center ${
								ingestMode === "live"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Live Auto-Fetch
						</button>
						<button
							type="button"
							onClick={() => setIngestMode("upload")}
							className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-11 flex items-center justify-center ${
								ingestMode === "upload"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							Upload Files
						</button>
					</div>
				</div>

				{/* Inputs Section */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4">
					{/* Ticker Search (4 cols) */}
					<div className="md:col-span-4 relative">
						<label htmlFor="tape-ticker-input" className={labelClass}>
							Stock Ticker
						</label>
						<div className="relative">
							<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none z-10" />
							<input
								id="tape-ticker-input"
								type="text"
								value={settings.symbol}
								onChange={(e) => {
									const val = e.target.value.toUpperCase();
									update("symbol", val);
									setTickerOpen(true);
								}}
								onFocus={() => setTickerOpen(true)}
								onBlur={() => setTimeout(() => setTickerOpen(false), 200)}
								placeholder="e.g. PTRO, BBRI"
								className={`${inputClass} pl-10 font-bold uppercase tracking-wider`}
								maxLength={10}
							/>
						</div>

						{/* Ticker Suggestions */}
						{tickerOpen && suggestions.length > 0 && (
							<div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-30 max-h-56 overflow-y-auto py-1">
								{suggestions.map((s) => (
									<button
										key={s.StockCode}
										type="button"
										onClick={() => {
											update("symbol", s.StockCode);
											setTickerOpen(false);
										}}
										className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-2 text-xs min-h-11"
									>
										<span className="font-bold text-slate-900 shrink-0">
											{s.StockCode}
										</span>
										<span className="text-slate-500 text-right break-words leading-tight">
											{s.StockName}
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Live Mode Inputs */}
					{ingestMode === "live" && (
						<>
							{/* Base URL (4 cols) */}
							<div className="md:col-span-4">
								<label htmlFor="tape-baseurl-input" className={labelClass}>
									Broker Base URL
								</label>
								<div className="relative">
									<Server className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none z-10" />
									<input
										id="tape-baseurl-input"
										type="text"
										value={settings.baseUrl}
										onChange={(e) => update("baseUrl", e.target.value)}
										placeholder="https://..."
										className={`${inputClass} pl-10 font-mono text-xs`}
									/>
								</div>
							</div>

							{/* Bearer Token (4 cols) */}
							<div className="md:col-span-4">
								<label htmlFor="tape-token-input" className={labelClass}>
									Bearer Token
								</label>
								<div className="relative">
									<KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none z-10" />
									<input
										id="tape-token-input"
										type={showToken ? "text" : "password"}
										value={settings.token}
										onChange={(e) => update("token", e.target.value)}
										placeholder="Paste token..."
										className={`${inputClass} pl-10 pr-10 font-mono text-xs`}
									/>
									<button
										type="button"
										onClick={() => setShowToken(!showToken)}
										className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
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
						</>
					)}

					{/* Upload Mode Inputs */}
					{ingestMode === "upload" && (
						<>
							{/* Running Trade CSV (4 cols) */}
							<div className="md:col-span-4">
								<label htmlFor="tape-csv-upload" className={labelClass}>
									Running Trade (CSV)
								</label>
								<div className="relative">
									<input
										id="tape-csv-upload"
										type="file"
										accept=".csv"
										onChange={(e) => {
											const f = e.target.files?.[0] ?? null;
											setCsvFile(f);
											// Auto detect ticker from filename if empty
											if (f && !settings.symbol) {
												const match = f.name.match(
													/running-trade_([A-Z0-9]+)/i,
												);
												if (match) update("symbol", match[1].toUpperCase());
											}
										}}
										className={`${inputClass} text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer`}
									/>
								</div>
							</div>

							{/* Trade Book JSON (4 cols) */}
							<div className="md:col-span-4">
								<label htmlFor="tape-json-upload" className={labelClass}>
									Trade Book (JSON)
								</label>
								<div className="relative">
									<input
										id="tape-json-upload"
										type="file"
										accept=".json"
										onChange={(e) => {
											const f = e.target.files?.[0] ?? null;
											setJsonFile(f);
											if (f && !settings.symbol) {
												const match = f.name.match(/trade-book_([A-Z0-9]+)/i);
												if (match) update("symbol", match[1].toUpperCase());
											}
										}}
										className={`${inputClass} text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer`}
									/>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Collapsible Execution & Fee Settings */}
				<div className="pt-2">
					<button
						type="button"
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-2 min-h-11"
					>
						<Settings2 className="w-4 h-4" />
						<span>Execution Fees & Block Threshold Settings</span>
						{showAdvanced ? (
							<ChevronUp className="w-4 h-4" />
						) : (
							<ChevronDown className="w-4 h-4" />
						)}
					</button>

					{showAdvanced && (
						<div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/70 grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div>
								<label htmlFor="fee-buy-input" className={labelClass}>
									Broker Fee Beli (%)
								</label>
								<input
									id="fee-buy-input"
									type="number"
									step="0.01"
									min="0"
									value={settings.feeBuy}
									onChange={(e) =>
										update("feeBuy", Number.parseFloat(e.target.value) || 0)
									}
									className={inputClass}
								/>
							</div>

							<div>
								<label htmlFor="fee-sell-input" className={labelClass}>
									Broker Fee Jual + Tax (%)
								</label>
								<input
									id="fee-sell-input"
									type="number"
									step="0.01"
									min="0"
									value={settings.feeSell}
									onChange={(e) =>
										update("feeSell", Number.parseFloat(e.target.value) || 0)
									}
									className={inputClass}
								/>
							</div>

							<div>
								<label htmlFor="block-mode-select" className={labelClass}>
									Block Threshold Mode
								</label>
								<select
									id="block-mode-select"
									value={settings.blockMode}
									onChange={(e) =>
										update("blockMode", e.target.value as BlockMode)
									}
									className={inputClass}
								>
									<option value="adaptive">Adaptive (~Rp 1B dinamis)</option>
									<option value="fixed">Fixed (50,000 lot)</option>
								</select>
							</div>
						</div>
					)}
				</div>

				{/* Primary Execution Actions */}
				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
					{/* Cache indicator pill */}
					<div>
						{sessionStatus.hasTrades && sessionStatus.hasTradeBook && (
							<button
								type="button"
								onClick={handleUseCached}
								disabled={loading}
								className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors min-h-11"
							>
								<Zap className="w-4 h-4 text-amber-600 shrink-0" />
								<span>Session Cache Available (Instant &lt;500ms)</span>
							</button>
						)}
					</div>

					{/* Submit buttons */}
					<div className="flex items-center gap-3 w-full sm:w-auto">
						{loading && (
							<button
								type="button"
								onClick={() => abortRef.current?.abort()}
								className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 bg-rose-50 text-xs font-bold hover:bg-rose-100 transition-colors min-h-11"
							>
								Cancel
							</button>
						)}

						{ingestMode === "live" ? (
							<button
								type="button"
								onClick={handleExecuteLive}
								disabled={!readyForLive || loading}
								className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 min-h-11 ${
									readyForLive && !loading
										? "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
										: "bg-slate-100 text-slate-400 cursor-not-allowed"
								}`}
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Analyzing Tape...</span>
									</>
								) : (
									<>
										<ScanSearch className="w-4 h-4" />
										<span>Analyze Tape</span>
									</>
								)}
							</button>
						) : (
							<button
								type="button"
								onClick={handleExecuteUpload}
								disabled={!readyForUpload || loading}
								className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 min-h-11 ${
									readyForUpload && !loading
										? "bg-slate-900 text-white hover:bg-slate-800 shadow-xs"
										: "bg-slate-100 text-slate-400 cursor-not-allowed"
								}`}
							>
								{loading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										<span>Analyzing Files...</span>
									</>
								) : (
									<>
										<UploadCloud className="w-4 h-4" />
										<span>Analyze Uploaded Files</span>
									</>
								)}
							</button>
						)}
					</div>
				</div>

				{/* Progress status notice */}
				{statusText && (
					<div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-700 font-medium">
						<Loader2 className="w-4 h-4 animate-spin text-slate-500 shrink-0" />
						<span>{statusText}</span>
					</div>
				)}

				{/* Error Notice */}
				{error && (
					<div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
						<AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
						<div className="space-y-0.5">
							<span className="font-bold block">Analysis Error</span>
							<p className="text-rose-700 font-medium">{error}</p>
						</div>
					</div>
				)}

				{/* Feed Ingestion & Download Status Card */}
				{(loading ||
					feedProgress.runningTrade !== "idle" ||
					feedProgress.screener !== "idle" ||
					availableFeeds.length > 0) && (
					<div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									Feed Ingestion &amp; Engine Status
								</span>
								{loading && (
									<span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
										<Loader2 className="w-3 h-3 animate-spin text-slate-600" />
										Streaming live streams
									</span>
								)}
							</div>
							{availableFeeds.length > 0 && !loading && (
								<button
									type="button"
									onClick={downloadAllFeeds}
									disabled={isZipping}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 shadow-2xs transition-all active:scale-95 cursor-pointer self-start sm:self-auto min-h-8 disabled:opacity-50"
									title="Download all available feeds in a single ZIP file"
								>
									{isZipping ? (
										<Loader2
											className="w-3.5 h-3.5 animate-spin text-slate-600"
											aria-hidden
										/>
									) : (
										<Download
											className="w-3.5 h-3.5 text-slate-600"
											aria-hidden
										/>
									)}
									<span>
										{isZipping ? "Zipping..." : "Download All (.ZIP)"}
									</span>
								</button>
							)}
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
							{/* 1. Running Trade */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<Activity className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Running Trade (CSV)
										{feedProgress.runningTrade === "fetching" &&
											tradesProgress && (
												<span className="ml-1 text-[11px] font-mono font-normal text-indigo-600">
													(p.{tradesProgress.pages},{" "}
													{tradesProgress.rows.toLocaleString("id-ID")} ticks)
												</span>
											)}
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("runningTrade") && !loading && (
										<button
											type="button"
											onClick={() => downloadFeedItem("runningTrade")}
											title="Download Running Trade (CSV)"
											aria-label="Download Running Trade (CSV)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{feedProgress.runningTrade === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{feedProgress.runningTrade === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{feedProgress.runningTrade === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{feedProgress.runningTrade === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* 2. Trade Book */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<LineChart className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Trade Book (JSON)
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("tradeBook") && !loading && (
										<button
											type="button"
											onClick={() => downloadFeedItem("tradeBook")}
											title="Download Trade Book (JSON)"
											aria-label="Download Trade Book (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{feedProgress.tradeBook === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{feedProgress.tradeBook === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{feedProgress.tradeBook === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{feedProgress.tradeBook === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* 3. FastAPI Engine */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<Compass className="w-4 h-4 text-slate-900 shrink-0" />
									<span className="font-bold text-slate-900 truncate">
										FastAPI Engine
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("screener") && !loading && (
										<button
											type="button"
											onClick={() => downloadFeedItem("screener")}
											title="Download Tape Screener Result (JSON)"
											aria-label="Download Tape Screener Result (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{feedProgress.screener === "fetching" && (
										<Loader2 className="w-4 h-4 text-slate-900 animate-spin shrink-0" />
									)}
									{feedProgress.screener === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{feedProgress.screener === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{feedProgress.screener === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Visualization Results */}
			{analysisResult ? (
				<div className="space-y-6 sm:space-y-8">
					<ActionBanner data={analysisResult} />
					<MicrostructureGrid data={analysisResult} />
					<ArchetypesCard archetypes={analysisResult.archetypes} />
					<PlaybookSetupsCard setups={analysisResult.setups} />
				</div>
			) : (
				!loading && (
					<div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-3 min-h-[320px]">
						<div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500">
							<ScanSearch className="w-6 h-6" />
						</div>
						<div className="space-y-1">
							<h3 className="text-base font-bold text-slate-900">
								No Tape Analysis Data
							</h3>
							<p className="text-xs text-slate-500 max-w-md">
								Enter a ticker with broker credentials to stream live tape data,
								or upload existing Running Trade and Trade Book files to run the
								BEI microstructure screener.
							</p>
						</div>
					</div>
				)
			)}
		</div>
	);
}
