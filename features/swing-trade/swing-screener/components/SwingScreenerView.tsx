"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
	Activity,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Compass,
	Download,
	Eye,
	EyeOff,
	FileCode,
	FileText,
	GitFork,
	History,
	LineChart,
	Loader2,
	Radar,
	RefreshCw,
	Search,
	Settings,
	UploadCloud,
	XCircle,
} from "lucide-react";
import type {
	FeedCollectionProgress,
	RiskFlags,
	SwingScreenerResponse,
	SwingScreenerSettings,
} from "../types";
import {
	DEFAULT_FEED_PROGRESS,
	DEFAULT_SWING_SCREENER_SETTINGS,
} from "../types";
import {
	readSwingScreenerSettings,
	saveSwingScreenerSettings,
} from "../lib/storage";
import { buildZipBlob, toUint8Array } from "../lib/zip";
import {
	executeSwingAnalysis,
	fetchBrokerDistributionFeed,
	fetchHistoricalFeed,
	fetchMarketDetectorFeed,
	fetchRunningTradeChartFeed,
	fetchTradeBookFeed,
	type FeedPayloads,
} from "../lib/collector";
import { useMarketCredentials } from "../../credentials/hooks/useMarketCredentials";
import ActionTradePlanBanner from "./ActionTradePlanBanner";
import LayerScoresCard from "./LayerScoresCard";
import DeepDiveWorkstation from "./DeepDiveWorkstation";

interface StockOption {
	StockCode: string;
	StockName: string;
}

interface UploadedFiles {
	historical: File | null;
	tradeBook: File | null;
	marketDetector: File | null;
	runningTradeChart: File | null;
	brokerDistribution: File | null;
}

export default function SwingScreenerView() {
	const { credentials, saveCredentials } = useMarketCredentials();
	const [settings, setSettings] = useState<SwingScreenerSettings>(
		DEFAULT_SWING_SCREENER_SETTINGS,
	);
	const [showToken, setShowToken] = useState(false);
	const [showAdvanced, setShowAdvanced] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [isZipping, setIsZipping] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [progress, setProgress] = useState<FeedCollectionProgress>(
		DEFAULT_FEED_PROGRESS,
	);
	const [result, setResult] = useState<SwingScreenerResponse | null>(null);
	const [histProgress, setHistProgress] = useState<{
		pages: number;
		rows: number;
	} | null>(null);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);

	const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({
		historical: null,
		tradeBook: null,
		marketDetector: null,
		runningTradeChart: null,
		brokerDistribution: null,
	});
	const [collectedPayloads, setCollectedPayloads] =
		useState<FeedPayloads | null>(null);

	const abortControllerRef = useRef<AbortController | null>(null);

	// Load persisted settings and stock list on mount
	useEffect(() => {
		const saved = readSwingScreenerSettings();
		setSettings(saved);
		fetch("/api/utils/stock-data")
			.then((r) => r.json())
			.then((j: { data?: StockOption[] }) => setStocks(j.data ?? []))
			.catch(() => setStocks([]));
	}, []);

	// Pre-fill credentials from Redis once loaded
	useEffect(() => {
		if (credentials?.baseUrl || credentials?.token) {
			setSettings((prev) => ({
				...prev,
				baseUrl: prev.baseUrl || credentials.baseUrl || "",
				token: prev.token || credentials.token || "",
			}));
		}
	}, [credentials]);

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

	const handleSettingChange = <K extends keyof SwingScreenerSettings>(
		key: K,
		val: SwingScreenerSettings[K],
	) => {
		const updated = { ...settings, [key]: val };
		setSettings(updated);
		saveSwingScreenerSettings(updated);
	};

	const handleFileUpload = (key: keyof UploadedFiles, file: File | null) => {
		setUploadedFiles((prev) => ({ ...prev, [key]: file }));
	};

	const cancelAnalysis = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}
		setIsAnalyzing(false);
		setProgress(DEFAULT_FEED_PROGRESS);
	};

	const runAutoCollectAndAnalysis = async () => {
		const symbolUpper = settings.symbol.trim().toUpperCase();
		if (!symbolUpper) {
			setError("Please enter a stock ticker symbol (e.g. PWON, BBCA)");
			return;
		}

		const effectiveBaseUrl = (
			settings.baseUrl ||
			credentials?.baseUrl ||
			""
		).trim();
		const effectiveToken = (settings.token || credentials?.token || "").trim();

		if (!effectiveBaseUrl || !effectiveToken) {
			setError(
				"Base URL and Bearer Token are required for live auto-collect. Please configure Market API Credentials in Redis.",
			);
			return;
		}

		// Sync updated credentials to Redis if changed locally
		if (
			(settings.baseUrl && settings.baseUrl !== credentials?.baseUrl) ||
			(settings.token && settings.token !== credentials?.token)
		) {
			saveCredentials({ baseUrl: effectiveBaseUrl, token: effectiveToken });
		}

		setError(null);
		setIsAnalyzing(true);
		setResult(null);
		setProgress({
			historical: "fetching",
			tradeBook: "fetching",
			marketDetector: "fetching",
			runningTradeChart: "fetching",
			brokerDistribution: "fetching",
			screener: "idle",
		});

		setHistProgress(null);
		const ac = new AbortController();
		abortControllerRef.current = ac;
		const payloads: FeedPayloads = {};

		try {
			// Step 1: Collect feeds in parallel
			const [p1, p2, p3, p4, p5] = await Promise.allSettled([
				fetchHistoricalFeed(
					symbolUpper,
					effectiveBaseUrl,
					effectiveToken,
					ac.signal,
					(pages, rows) => setHistProgress({ pages, rows }),
				),
				fetchTradeBookFeed(
					symbolUpper,
					effectiveBaseUrl,
					effectiveToken,
					ac.signal,
				),
				fetchMarketDetectorFeed(
					symbolUpper,
					effectiveBaseUrl,
					effectiveToken,
					ac.signal,
				),
				fetchRunningTradeChartFeed(
					symbolUpper,
					effectiveBaseUrl,
					effectiveToken,
					ac.signal,
				),
				fetchBrokerDistributionFeed(
					symbolUpper,
					effectiveBaseUrl,
					effectiveToken,
					ac.signal,
				),
			]);

			if (ac.signal.aborted) return;

			// Handle required 1: Historical
			if (p1.status === "fulfilled") {
				payloads.historicalCsv = p1.value;
				setProgress((p) => ({ ...p, historical: "success" }));
			} else {
				setProgress((p) => ({ ...p, historical: "failed" }));
				throw new Error(
					`Required Historical Feed failed: ${p1.reason?.message ?? "Unknown error"}`,
				);
			}

			// Handle required 2: Trade Book 5M
			if (p2.status === "fulfilled") {
				payloads.tradeBookJson = p2.value;
				setProgress((p) => ({ ...p, tradeBook: "success" }));
			} else {
				setProgress((p) => ({ ...p, tradeBook: "failed" }));
				throw new Error(
					`Required Trade Book 5M Feed failed: ${p2.reason?.message ?? "Unknown error"}`,
				);
			}

			// Optional 3: Market Detector
			if (p3.status === "fulfilled") {
				payloads.marketDetectorJson = p3.value;
				setProgress((p) => ({ ...p, marketDetector: "success" }));
			} else {
				setProgress((p) => ({ ...p, marketDetector: "failed" }));
			}

			// Optional 4: Running Trade Chart
			if (p4.status === "fulfilled") {
				payloads.runningTradeChartJson = p4.value;
				setProgress((p) => ({ ...p, runningTradeChart: "success" }));
			} else {
				setProgress((p) => ({ ...p, runningTradeChart: "failed" }));
			}

			// Optional 5: Broker Distribution
			if (p5.status === "fulfilled") {
				payloads.brokerDistributionJson = p5.value;
				setProgress((p) => ({ ...p, brokerDistribution: "success" }));
			} else {
				setProgress((p) => ({ ...p, brokerDistribution: "failed" }));
			}

			setCollectedPayloads({ ...payloads });

			// Step 2: Hit FastAPI analyze-swing endpoint
			setProgress((p) => ({ ...p, screener: "fetching" }));

			const analysisRes = await executeSwingAnalysis({
				ticker: symbolUpper,
				feeBuy: settings.feeBuy,
				feeSell: settings.feeSell,
				apiEndpoint: settings.apiEndpoint.trim() || undefined,
				payloads,
				signal: ac.signal,
			});

			if (ac.signal.aborted) return;

			setProgress((p) => ({ ...p, screener: "success" }));
			setResult(analysisRes);
		} catch (err: unknown) {
			if (ac.signal.aborted) return;
			const msg = err instanceof Error ? err.message : "Swing analysis failed";
			setError(msg);
			setProgress((p) => ({ ...p, screener: "failed" }));
		} finally {
			setIsAnalyzing(false);
			abortControllerRef.current = null;
		}
	};

	const runManualUploadAnalysis = async () => {
		const symbolUpper = settings.symbol.trim().toUpperCase();
		if (!symbolUpper) {
			setError("Please enter a stock ticker symbol (e.g. PWON, BBCA)");
			return;
		}
		if (!uploadedFiles.historical) {
			setError(
				"Historical Trade CSV file is required (e.g. historical-trade_PWON.csv).",
			);
			return;
		}
		if (!uploadedFiles.tradeBook) {
			setError(
				"Trade Book 5M JSON file is required (e.g. trade-book-5m_PWON.json).",
			);
			return;
		}

		setError(null);
		setIsAnalyzing(true);
		setResult(null);
		setProgress({
			historical: "success",
			tradeBook: "success",
			marketDetector: uploadedFiles.marketDetector ? "success" : "idle",
			runningTradeChart: uploadedFiles.runningTradeChart ? "success" : "idle",
			brokerDistribution: uploadedFiles.brokerDistribution ? "success" : "idle",
			screener: "fetching",
		});

		const ac = new AbortController();
		abortControllerRef.current = ac;

		try {
			const payloads: FeedPayloads = {
				historicalCsv: uploadedFiles.historical,
				tradeBookJson: uploadedFiles.tradeBook,
				marketDetectorJson: uploadedFiles.marketDetector || undefined,
				runningTradeChartJson: uploadedFiles.runningTradeChart || undefined,
				brokerDistributionJson: uploadedFiles.brokerDistribution || undefined,
			};
			setCollectedPayloads({ ...payloads });

			const analysisRes = await executeSwingAnalysis({
				ticker: symbolUpper,
				feeBuy: settings.feeBuy,
				feeSell: settings.feeSell,
				apiEndpoint: settings.apiEndpoint.trim() || undefined,
				payloads,
				signal: ac.signal,
			});

			if (ac.signal.aborted) return;

			setProgress((p) => ({ ...p, screener: "success" }));
			setResult(analysisRes);
		} catch (err: unknown) {
			if (ac.signal.aborted) return;
			const msg = err instanceof Error ? err.message : "Swing analysis failed";
			setError(msg);
			setProgress((p) => ({ ...p, screener: "failed" }));
		} finally {
			setIsAnalyzing(false);
			abortControllerRef.current = null;
		}
	};

	const triggerDownload = (
		filename: string,
		content: string | Blob | unknown,
		mimeType: string,
	) => {
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
	};

	const getFeedDownload = useCallback(
		(
			key:
				| "historical"
				| "tradeBook"
				| "marketDetector"
				| "runningTradeChart"
				| "brokerDistribution"
				| "screener",
		) => {
			const sym = (settings.symbol.trim() || "STOCK").toUpperCase();
			const d = new Date();
			const p = (n: number) => String(n).padStart(2, "0");
			const stamp = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;

			switch (key) {
				case "historical": {
					const data =
						collectedPayloads?.historicalCsv || uploadedFiles.historical;
					if (!data) return null;
					return {
						filename: `historical-trade_${sym}_1Y_${stamp}.csv`,
						data,
						mime: "text/csv",
					};
				}
				case "tradeBook": {
					const data =
						collectedPayloads?.tradeBookJson || uploadedFiles.tradeBook;
					if (!data) return null;
					return {
						filename: `trade-book-5m_${sym}_${stamp}.json`,
						data,
						mime: "application/json",
					};
				}
				case "marketDetector": {
					const data =
						collectedPayloads?.marketDetectorJson ||
						uploadedFiles.marketDetector;
					if (!data) return null;
					return {
						filename: `market-detector_${sym}_${stamp}.json`,
						data,
						mime: "application/json",
					};
				}
				case "runningTradeChart": {
					const data =
						collectedPayloads?.runningTradeChartJson ||
						uploadedFiles.runningTradeChart;
					if (!data) return null;
					return {
						filename: `running-trade-chart_${sym}_${stamp}.json`,
						data,
						mime: "application/json",
					};
				}
				case "brokerDistribution": {
					const data =
						collectedPayloads?.brokerDistributionJson ||
						uploadedFiles.brokerDistribution;
					if (!data) return null;
					return {
						filename: `broker-distribution_${sym}_${stamp}.json`,
						data,
						mime: "application/json",
					};
				}
				case "screener": {
					if (!result) return null;
					return {
						filename: `swing-analysis_${result.ticker}_${result.date}.json`,
						data: result,
						mime: "application/json",
					};
				}
			}
		},
		[collectedPayloads, uploadedFiles, result, settings.symbol],
	);

	const downloadFeedItem = (
		key:
			| "historical"
			| "tradeBook"
			| "marketDetector"
			| "runningTradeChart"
			| "brokerDistribution"
			| "screener",
	) => {
		const item = getFeedDownload(key);
		if (!item) return;
		triggerDownload(item.filename, item.data, item.mime);
	};

	const downloadAllFeeds = async () => {
		const keys: (
			| "historical"
			| "tradeBook"
			| "marketDetector"
			| "runningTradeChart"
			| "brokerDistribution"
			| "screener"
		)[] = [
			"historical",
			"tradeBook",
			"marketDetector",
			"runningTradeChart",
			"brokerDistribution",
			"screener",
		];
		const available = keys
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
				`swing-feeds_${sym}_${stamp}.zip`,
				zipBlob,
				"application/zip",
			);
		} finally {
			setIsZipping(false);
		}
	};

	const availableFeeds = useMemo(() => {
		const keys: (
			| "historical"
			| "tradeBook"
			| "marketDetector"
			| "runningTradeChart"
			| "brokerDistribution"
			| "screener"
		)[] = [
			"historical",
			"tradeBook",
			"marketDetector",
			"runningTradeChart",
			"brokerDistribution",
			"screener",
		];
		return keys.filter((k) => getFeedDownload(k) !== null);
	}, [getFeedDownload]);

	const handleDownloadJson = () => {
		downloadFeedItem("screener");
	};

	const renderRiskFlagsBanner = (flags: RiskFlags) => {
		const activeBadges: { label: string; tone: "amber" | "red" }[] = [];
		if (flags.is_arb_today) {
			activeBadges.push({ label: "ARB Floor Today", tone: "red" });
		}
		if (flags.recent_arb_days_5d > 0) {
			activeBadges.push({
				label: `${flags.recent_arb_days_5d}d ARB Floor in 5D`,
				tone: "amber",
			});
		}
		if (flags.recent_suspension_10d) {
			activeBadges.push({ label: "Recent Suspension 10D", tone: "red" });
		}
		if (flags.blow_off_rejection_10d) {
			activeBadges.push({ label: "Blow-off Rejection 10D", tone: "amber" });
		}
		if (flags.zero_vol_days_10d > 0) {
			activeBadges.push({
				label: `${flags.zero_vol_days_10d} Zero-Vol Days in 10D`,
				tone: "amber",
			});
		}
		if (flags.illiquid) {
			activeBadges.push({ label: "Illiquid Volume", tone: "red" });
		}

		if (activeBadges.length === 0) return null;

		return (
			<div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-2">
				<div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider mr-2">
					<AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden />
					<span>Market Flags</span>
				</div>
				{activeBadges.map((b) => (
					<span
						key={b.label}
						className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
							b.tone === "red"
								? "bg-rose-100 text-rose-800 border border-rose-200"
								: "bg-amber-100 text-amber-900 border border-amber-200"
						}`}
					>
						{b.label}
					</span>
				))}
			</div>
		);
	};

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Header / Mode Switcher Floating Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shadow-xs">
							<Compass className="w-6 h-6" aria-hidden />
						</div>
						<div>
							<h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
								Swing Screener Engine
							</h2>
							<p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
								5-layer composite scoring & microstructure swing validation
							</p>
						</div>
					</div>

					{/* Segmented Mode Selector */}
					<div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 self-start md:self-auto">
						<button
							type="button"
							onClick={() => handleSettingChange("ingestMode", "live")}
							disabled={isAnalyzing}
							className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
								settings.ingestMode === "live"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<RefreshCw className="w-3.5 h-3.5" aria-hidden />
							<span>1-Click Auto-Collect</span>
						</button>
						<button
							type="button"
							onClick={() => handleSettingChange("ingestMode", "upload")}
							disabled={isAnalyzing}
							className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 ${
								settings.ingestMode === "upload"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<UploadCloud className="w-3.5 h-3.5" aria-hidden />
							<span>Manual Upload</span>
						</button>
					</div>
				</div>

				{/* Primary Configuration Form */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
					<div className="md:col-span-3 relative">
						<label
							htmlFor="symbol-input"
							className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
						>
							Ticker Symbol
						</label>
						<div className="relative">
							<input
								id="symbol-input"
								type="text"
								role="combobox"
								aria-expanded={tickerOpen}
								aria-autocomplete="list"
								aria-controls="screener-ticker-suggestions"
								value={settings.symbol}
								onChange={(e) => {
									handleSettingChange("symbol", e.target.value.toUpperCase());
									setTickerOpen(true);
								}}
								onFocus={() => setTickerOpen(true)}
								placeholder="e.g. PWON, BBCA"
								maxLength={10}
								disabled={isAnalyzing}
								className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all"
							/>
							<Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>

						{tickerOpen && suggestions.length > 0 && !isAnalyzing && (
							<>
								<div
									role="presentation"
									aria-hidden="true"
									className="fixed inset-0 z-30"
									onClick={() => setTickerOpen(false)}
								/>
								<div
									id="screener-ticker-suggestions"
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
												handleSettingChange("symbol", s.StockCode);
												setTickerOpen(false);
											}}
											className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors min-h-11 cursor-pointer"
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

					{settings.ingestMode === "live" && (
						<>
							<div className="md:col-span-4">
								<label
									htmlFor="base-url-input"
									className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
								>
									<span>Source Base URL</span>
									{credentials?.baseUrl && (
										<span className="text-[10px] font-semibold text-emerald-600 normal-case">
											Redis Synced
										</span>
									)}
								</label>
								<input
									id="base-url-input"
									type="text"
									value={settings.baseUrl}
									onChange={(e) =>
										handleSettingChange("baseUrl", e.target.value)
									}
									placeholder={credentials?.baseUrl || "https://api.source.com"}
									disabled={isAnalyzing}
									className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all font-mono"
								/>
							</div>

							<div className="md:col-span-5">
								<label
									htmlFor="token-input"
									className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
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
										onChange={(e) =>
											handleSettingChange("token", e.target.value)
										}
										placeholder={
											credentials?.token
												? "Configured in Redis"
												: "eyJhbGciOi..."
										}
										disabled={isAnalyzing}
										className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-500 transition-all"
									/>
									<button
										type="button"
										onClick={() => setShowToken(!showToken)}
										className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer rounded-r-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
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
				</div>

				{/* Advanced Settings Toggle */}
				<div className="pt-1">
					<button
						type="button"
						onClick={() => setShowAdvanced(!showAdvanced)}
						className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer min-h-11 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
					>
						<Settings className="w-3.5 h-3.5" aria-hidden />
						<span>
							{showAdvanced
								? "Hide Advanced Parameters"
								: "Advanced Parameters (Fees & API Endpoint)"}
						</span>
					</button>

					{showAdvanced && (
						<div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
							<div>
								<label
									htmlFor="fee-buy-input"
									className="block text-xs font-semibold text-slate-600 mb-1"
								>
									Buy Broker Fee (%)
								</label>
								<input
									id="fee-buy-input"
									type="number"
									step="0.01"
									value={settings.feeBuy}
									onChange={(e) =>
										handleSettingChange("feeBuy", Number(e.target.value))
									}
									className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
								/>
							</div>
							<div>
								<label
									htmlFor="fee-sell-input"
									className="block text-xs font-semibold text-slate-600 mb-1"
								>
									Sell Broker Fee / Tax (%)
								</label>
								<input
									id="fee-sell-input"
									type="number"
									step="0.01"
									value={settings.feeSell}
									onChange={(e) =>
										handleSettingChange("feeSell", Number(e.target.value))
									}
									className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
								/>
							</div>
							<div>
								<label
									htmlFor="api-endpoint-input"
									className="block text-xs font-semibold text-slate-600 mb-1"
								>
									Python FastAPI Endpoint
								</label>
								<input
									id="api-endpoint-input"
									type="text"
									value={settings.apiEndpoint}
									onChange={(e) =>
										handleSettingChange("apiEndpoint", e.target.value)
									}
									className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Manual File Upload Dropzones */}
				{settings.ingestMode === "upload" && (
					<div className="space-y-3 pt-2">
						<div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
							Upload Feed Artifacts
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{/* 1. Historical Trade CSV */}
							<div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2">
								<div className="flex items-center gap-2">
									<History className="w-4 h-4 text-slate-600" aria-hidden />
									<span className="text-xs font-bold text-slate-900">
										Historical CSV
									</span>
									<span className="ml-auto text-[10px] font-bold text-rose-600 uppercase">
										Required
									</span>
								</div>
								<label
									htmlFor="historical-file-upload"
									className="w-full cursor-pointer"
								>
									<input
										id="historical-file-upload"
										type="file"
										accept=".csv,text/csv"
										onChange={(e) =>
											handleFileUpload(
												"historical",
												e.target.files?.[0] ?? null,
											)
										}
										className="sr-only"
									/>
									<div className="w-full h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 hover:border-slate-400 transition-colors">
										<span className="truncate max-w-[180px]">
											{uploadedFiles.historical
												? uploadedFiles.historical.name
												: "Choose CSV..."}
										</span>
										<FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									</div>
								</label>
							</div>

							{/* 2. Trade Book 5M JSON */}
							<div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2">
								<div className="flex items-center gap-2">
									<LineChart className="w-4 h-4 text-slate-600" aria-hidden />
									<span className="text-xs font-bold text-slate-900">
										Trade Book 5M
									</span>
									<span className="ml-auto text-[10px] font-bold text-rose-600 uppercase">
										Required
									</span>
								</div>
								<label
									htmlFor="tradebook-file-upload"
									className="w-full cursor-pointer"
								>
									<input
										id="tradebook-file-upload"
										type="file"
										accept=".json,application/json"
										onChange={(e) =>
											handleFileUpload("tradeBook", e.target.files?.[0] ?? null)
										}
										className="sr-only"
									/>
									<div className="w-full h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 hover:border-slate-400 transition-colors">
										<span className="truncate max-w-[180px]">
											{uploadedFiles.tradeBook
												? uploadedFiles.tradeBook.name
												: "Choose JSON..."}
										</span>
										<FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									</div>
								</label>
							</div>

							{/* 3. Market Detector JSON */}
							<div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2">
								<div className="flex items-center gap-2">
									<Radar className="w-4 h-4 text-slate-600" aria-hidden />
									<span className="text-xs font-bold text-slate-900">
										Market Detector
									</span>
									<span className="ml-auto text-[10px] font-semibold text-slate-500 uppercase">
										Optional
									</span>
								</div>
								<label
									htmlFor="market-detector-upload"
									className="w-full cursor-pointer"
								>
									<input
										id="market-detector-upload"
										type="file"
										accept=".json,application/json"
										onChange={(e) =>
											handleFileUpload(
												"marketDetector",
												e.target.files?.[0] ?? null,
											)
										}
										className="sr-only"
									/>
									<div className="w-full h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 hover:border-slate-400 transition-colors">
										<span className="truncate max-w-[180px]">
											{uploadedFiles.marketDetector
												? uploadedFiles.marketDetector.name
												: "Choose JSON..."}
										</span>
										<FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									</div>
								</label>
							</div>

							{/* 4. Running Trade Chart JSON */}
							<div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2">
								<div className="flex items-center gap-2">
									<Activity className="w-4 h-4 text-slate-600" aria-hidden />
									<span className="text-xs font-bold text-slate-900">
										Running Trade Chart
									</span>
									<span className="ml-auto text-[10px] font-semibold text-slate-500 uppercase">
										Optional
									</span>
								</div>
								<label
									htmlFor="running-trade-upload"
									className="w-full cursor-pointer"
								>
									<input
										id="running-trade-upload"
										type="file"
										accept=".json,application/json"
										onChange={(e) =>
											handleFileUpload(
												"runningTradeChart",
												e.target.files?.[0] ?? null,
											)
										}
										className="sr-only"
									/>
									<div className="w-full h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 hover:border-slate-400 transition-colors">
										<span className="truncate max-w-[180px]">
											{uploadedFiles.runningTradeChart
												? uploadedFiles.runningTradeChart.name
												: "Choose JSON..."}
										</span>
										<FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									</div>
								</label>
							</div>

							{/* 5. Broker Distribution JSON */}
							<div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-2">
								<div className="flex items-center gap-2">
									<GitFork className="w-4 h-4 text-slate-600" aria-hidden />
									<span className="text-xs font-bold text-slate-900">
										Broker Distribution
									</span>
									<span className="ml-auto text-[10px] font-semibold text-slate-500 uppercase">
										Optional
									</span>
								</div>
								<label
									htmlFor="broker-dist-upload"
									className="w-full cursor-pointer"
								>
									<input
										id="broker-dist-upload"
										type="file"
										accept=".json,application/json"
										onChange={(e) =>
											handleFileUpload(
												"brokerDistribution",
												e.target.files?.[0] ?? null,
											)
										}
										className="sr-only"
									/>
									<div className="w-full h-10 px-3 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-between text-xs text-slate-600 hover:border-slate-400 transition-colors">
										<span className="truncate max-w-[180px]">
											{uploadedFiles.brokerDistribution
												? uploadedFiles.brokerDistribution.name
												: "Choose JSON..."}
										</span>
										<FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />
									</div>
								</label>
							</div>
						</div>
					</div>
				)}

				{/* Primary Trigger & Cancel Buttons */}
				<div className="flex items-center gap-3 pt-2">
					{settings.ingestMode === "live" ? (
						<button
							type="button"
							onClick={runAutoCollectAndAnalysis}
							disabled={isAnalyzing}
							className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
						>
							{isAnalyzing ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
									<span>Collecting Feeds & Analyzing...</span>
								</>
							) : (
								<>
									<Compass className="w-4 h-4" aria-hidden />
									<span>Collect 5 Feeds & Analyze Swing</span>
								</>
							)}
						</button>
					) : (
						<button
							type="button"
							onClick={runManualUploadAnalysis}
							disabled={isAnalyzing}
							className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
						>
							{isAnalyzing ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
									<span>Analyzing Uploaded Files...</span>
								</>
							) : (
								<>
									<Compass className="w-4 h-4" aria-hidden />
									<span>Analyze Uploaded Files</span>
								</>
							)}
						</button>
					)}

					{isAnalyzing && (
						<button
							type="button"
							onClick={cancelAnalysis}
							className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
						>
							<XCircle className="w-4 h-4 text-rose-500" aria-hidden />
							<span>Cancel</span>
						</button>
					)}
				</div>

				{/* Error Notice */}
				{error && (
					<div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-3">
						<AlertTriangle
							className="w-5 h-5 text-rose-600 shrink-0 mt-0.5"
							aria-hidden
						/>
						<div className="space-y-0.5">
							<div className="text-xs font-bold text-rose-900 uppercase tracking-wide">
								Collection or Analysis Error
							</div>
							<p className="text-xs font-medium text-rose-700">{error}</p>
						</div>
					</div>
				)}

				{/* Live Parallel Feed Progress Checklist */}
				{(isAnalyzing ||
					progress.historical !== "idle" ||
					progress.screener !== "idle" ||
					availableFeeds.length > 0) && (
					<div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
									Feed Ingestion &amp; Engine Status
								</span>
								{isAnalyzing && (
									<span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
										<Loader2 className="w-3 h-3 animate-spin text-slate-600" />
										Streaming parallel requests
									</span>
								)}
							</div>
							{availableFeeds.length > 0 && !isAnalyzing && (
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
										{isZipping ? "Zipping..." : `Download All (.ZIP)`}
									</span>
								</button>
							)}
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
							{/* Historical */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<History className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Historical Trade (1Y CSV)
										{progress.historical === "fetching" && histProgress && (
											<span className="ml-1 text-[11px] font-mono font-normal text-indigo-600">
												(p.{histProgress.pages}, {histProgress.rows} rows)
											</span>
										)}
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("historical") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("historical")}
											title="Download Historical Trade (1Y CSV)"
											aria-label="Download Historical Trade (1Y CSV)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.historical === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{progress.historical === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.historical === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{progress.historical === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* Trade Book 5M */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<LineChart className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Trade Book 5M (JSON)
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("tradeBook") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("tradeBook")}
											title="Download Trade Book 5M (JSON)"
											aria-label="Download Trade Book 5M (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.tradeBook === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{progress.tradeBook === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.tradeBook === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{progress.tradeBook === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* Market Detector */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<Radar className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Market Detector (JSON)
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("marketDetector") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("marketDetector")}
											title="Download Market Detector (JSON)"
											aria-label="Download Market Detector (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.marketDetector === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{progress.marketDetector === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.marketDetector === "failed" && (
										<span className="text-[10px] text-amber-700 font-bold">
											SKIPPED
										</span>
									)}
									{progress.marketDetector === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* Running Trade Chart */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<Activity className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Running Trade Chart (JSON)
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("runningTradeChart") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("runningTradeChart")}
											title="Download Running Trade Chart (JSON)"
											aria-label="Download Running Trade Chart (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.runningTradeChart === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{progress.runningTradeChart === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.runningTradeChart === "failed" && (
										<span className="text-[10px] text-amber-700 font-bold">
											SKIPPED
										</span>
									)}
									{progress.runningTradeChart === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* Broker Distribution */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<GitFork className="w-4 h-4 text-slate-600 shrink-0" />
									<span className="font-semibold text-slate-800 truncate">
										Broker Distribution (JSON)
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("brokerDistribution") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("brokerDistribution")}
											title="Download Broker Distribution (JSON)"
											aria-label="Download Broker Distribution (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.brokerDistribution === "fetching" && (
										<Loader2 className="w-4 h-4 text-indigo-600 animate-spin shrink-0" />
									)}
									{progress.brokerDistribution === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.brokerDistribution === "failed" && (
										<span className="text-[10px] text-amber-700 font-bold">
											SKIPPED
										</span>
									)}
									{progress.brokerDistribution === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											IDLE
										</span>
									)}
								</div>
							</div>

							{/* Screener Engine */}
							<div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2">
								<div className="flex items-center gap-2 min-w-0">
									<Compass className="w-4 h-4 text-slate-900 shrink-0" />
									<span className="font-bold text-slate-900 truncate">
										FastAPI Engine
									</span>
								</div>
								<div className="flex items-center gap-1.5 shrink-0">
									{getFeedDownload("screener") && !isAnalyzing && (
										<button
											type="button"
											onClick={() => downloadFeedItem("screener")}
											title="Download Screener Analysis Result (JSON)"
											aria-label="Download Screener Analysis Result (JSON)"
											className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
										>
											<Download className="w-3.5 h-3.5" />
										</button>
									)}
									{progress.screener === "fetching" && (
										<Loader2 className="w-4 h-4 text-slate-900 animate-spin shrink-0" />
									)}
									{progress.screener === "success" && (
										<CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
									)}
									{progress.screener === "failed" && (
										<XCircle className="w-4 h-4 text-rose-600 shrink-0" />
									)}
									{progress.screener === "idle" && (
										<span className="text-[10px] text-slate-500 font-bold">
											WAITING
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Results Section */}
			{result && (
				<div className="space-y-6 sm:space-y-8">
					{/* Result Header & Export Bar */}
					<div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-2xl font-black text-slate-900 tracking-tight">
								{result.ticker}
							</span>
							<span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
								{result.date}
							</span>
							<span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 flex items-center gap-1.5">
								<Clock className="w-3.5 h-3.5" aria-hidden />
								<span>{result.horizon}</span>
							</span>
							<span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
								{result.active_layers}/5 Active Layers
							</span>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleDownloadJson}
								className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer min-h-11 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
							>
								<Download className="w-4 h-4" aria-hidden />
								<span>Download Result JSON</span>
							</button>
						</div>
					</div>

					{/* Risk Flags Banner (if applicable) */}
					{renderRiskFlagsBanner(result.flags)}

					{/* Executive Action & Trade Plan Banner */}
					<ActionTradePlanBanner
						ticker={result.ticker}
						date={result.date}
						horizon={result.horizon}
						swingScore={result.swing_score}
						activeLayers={result.active_layers}
						action={result.action}
						tradePlan={result.trade_plan}
					/>

					{/* 5-Layer Composite Scoring Breakdown */}
					<LayerScoresCard
						layerScores={result.layer_scores}
						compositeScore={result.swing_score}
					/>

					{/* Deep Dive Workstation */}
					<DeepDiveWorkstation response={result} />
				</div>
			)}
		</div>
	);
}
