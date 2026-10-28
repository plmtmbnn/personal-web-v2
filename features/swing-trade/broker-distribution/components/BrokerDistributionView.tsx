"use client";

import {
	AlertCircle,
	CheckCircle2,
	ChevronRight,
	Download,
	Eye,
	EyeOff,
	FileJson,
	GitFork,
	KeyRound,
	Loader2,
	Search,
	Server,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	readBrokerDistributionSettings,
	saveBrokerDistributionSettings,
} from "../lib/storage";
import {
	type BrokerDistributionData,
	type BrokerDistributionDataType,
	type BrokerDistributionPeriod,
	type BrokerDistributionResponse,
	type BrokerDistributionSettings,
	DATA_TYPE_OPTIONS,
	DEFAULT_BROKER_DISTRIBUTION_SETTINGS,
	PERIOD_OPTIONS,
} from "../types";
import { useMarketCredentials } from "../../credentials/hooks/useMarketCredentials";
import BrokerDistributionCards from "./BrokerDistributionCards";

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
	a.download = `broker-distribution_${symbol.toUpperCase()}_${stamp}.json`;
	a.click();
	URL.revokeObjectURL(url);
}

export default function BrokerDistributionView() {
	const { credentials, saveCredentials } = useMarketCredentials();
	const [settings, setSettings] = useState<BrokerDistributionSettings>(
		DEFAULT_BROKER_DISTRIBUTION_SETTINGS,
	);
	const [hydrated, setHydrated] = useState(false);
	const [showToken, setShowToken] = useState(false);
	const [stocks, setStocks] = useState<StockOption[]>([]);
	const [tickerOpen, setTickerOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [visualizedData, setVisualizedData] =
		useState<BrokerDistributionData | null>(null);
	const [activeDimension, setActiveDimension] = useState<"volume" | "value">(
		"volume",
	);
	const [downloadedStats, setDownloadedStats] = useState<{
		symbol: string;
		dateInfo: string;
		startDate: string;
		endDate: string;
		totalBuyers: number;
		totalSellers: number;
	} | null>(null);

	useEffect(() => {
		setSettings(readBrokerDistributionSettings());
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
			saveBrokerDistributionSettings(settings);
		}
	}, [settings, hydrated]);

	const update = <K extends keyof BrokerDistributionSettings>(
		key: K,
		value: BrokerDistributionSettings[K],
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

		if (
			(settings.baseUrl && settings.baseUrl !== credentials?.baseUrl) ||
			(settings.token && settings.token !== credentials?.token)
		) {
			saveCredentials({ baseUrl: effectiveBaseUrl, token: effectiveToken });
		}

		try {
			const res = await fetch("/api/admin/broker-distribution", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					baseUrl: effectiveBaseUrl,
					token: effectiveToken,
					symbol: settings.symbol.trim().toUpperCase(),
					period: settings.period,
					dataType: settings.dataType,
					date: settings.date.trim(),
					investorType: settings.investorType,
					marketBoard: settings.marketBoard,
				}),
			});

			const json: BrokerDistributionResponse | { error?: string } =
				await res.json();
			if (!res.ok) {
				const errMsg =
					"error" in json && json.error
						? json.error
						: `Request failed with status ${res.status}`;
				setError(errMsg);
				return;
			}

			const payload = json as BrokerDistributionResponse;
			if (!payload.data) {
				setError("Received empty data payload from server");
				return;
			}

			if (settings.actionMode === "json") {
				triggerJsonDownload(payload, settings.symbol);
				const vol = payload.data.by_volume;
				setDownloadedStats({
					symbol: settings.symbol.toUpperCase(),
					dateInfo: payload.data.date_info ?? "-",
					startDate: payload.data.start_date ?? "-",
					endDate: payload.data.end_date ?? "-",
					totalBuyers: vol?.top_broker_buy?.length ?? 0,
					totalSellers: vol?.top_broker_sell?.length ?? 0,
				});
				setVisualizedData(null);
			} else {
				setVisualizedData(payload.data);
				// Set default active dimension based on requested data type
				if (settings.dataType === "BROKER_DISTRIBUTION_DATA_TYPE_VALUE") {
					setActiveDimension("value");
				} else {
					setActiveDimension("volume");
				}
				setDownloadedStats(null);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Network error occurred");
		} finally {
			setLoading(false);
		}
	}, [ready, loading, settings]);

	// Extract active buyer and seller data based on selected dimension
	const currentBuyers = useMemo(() => {
		if (!visualizedData) return [];
		if (activeDimension === "value") {
			return (
				visualizedData.by_value?.top_broker_buy ??
				visualizedData.by_volume?.top_broker_buy ??
				[]
			);
		}
		return (
			visualizedData.by_volume?.top_broker_buy ??
			visualizedData.by_value?.top_broker_buy ??
			[]
		);
	}, [visualizedData, activeDimension]);

	const currentSellers = useMemo(() => {
		if (!visualizedData) return [];
		if (activeDimension === "value") {
			return (
				visualizedData.by_value?.top_broker_sell ??
				visualizedData.by_volume?.top_broker_sell ??
				[]
			);
		}
		return (
			visualizedData.by_volume?.top_broker_sell ??
			visualizedData.by_value?.top_broker_sell ??
			[]
		);
	}, [visualizedData, activeDimension]);

	return (
		<div className="space-y-6 sm:space-y-8">
			{/* Clean Header */}
			<div className="space-y-2">
				<div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
					<Link
						href="/admin"
						className="hover:text-slate-900 transition-colors"
					>
						Admin
					</Link>
					<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
					<Link
						href="/admin/swing-trade"
						className="hover:text-slate-900 transition-colors"
					>
						Swing Trade Hub
					</Link>
					<ChevronRight className="w-3.5 h-3.5 text-slate-400" />
					<span className="text-slate-900">Broker Distribution</span>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
							<GitFork
								className="w-7 h-7 text-slate-900 shrink-0"
								aria-hidden
							/>
							<span>Broker Distribution</span>
						</h1>
						<p className="text-sm text-slate-600 mt-1 max-w-2xl">
							Analyze bilateral broker counterparty networks, tracking which
							accumulators absorbed stock and where distributing brokers
							offloaded inventory.
						</p>
					</div>

					{visualizedData && (
						<button
							type="button"
							onClick={() =>
								triggerJsonDownload(visualizedData, settings.symbol)
							}
							className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs shrink-0 self-start sm:self-center cursor-pointer min-h-11"
						>
							<Download className="w-4 h-4" aria-hidden />
							<span>Export JSON</span>
						</button>
					)}
				</div>
			</div>

			{/* Form Configuration Card */}
			<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Base URL */}
					<div>
						<label
							htmlFor="bd-base-url"
							className={`flex items-center justify-between ${labelClass}`}
						>
							<span>Upstream Base URL</span>
							{credentials?.baseUrl && (
								<span className="text-[10px] font-semibold text-emerald-600 normal-case">
									Redis Synced
								</span>
							)}
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<Server className="w-4 h-4" aria-hidden />
							</div>
							<input
								id="bd-base-url"
								type="url"
								value={settings.baseUrl}
								onChange={(e) => update("baseUrl", e.target.value)}
								placeholder={
									credentials?.baseUrl ||
									"https://api.your-exchange-provider.com"
								}
								className={`${inputClass} pl-10`}
								autoComplete="off"
								spellCheck={false}
							/>
						</div>
					</div>

					{/* Bearer Token */}
					<div>
						<label
							htmlFor="bd-token"
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
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<KeyRound className="w-4 h-4" aria-hidden />
							</div>
							<input
								id="bd-token"
								type={showToken ? "text" : "password"}
								value={settings.token}
								onChange={(e) => update("token", e.target.value)}
								placeholder={
									credentials?.token
										? "Configured in Redis"
										: "Paste upstream authorization token"
								}
								className={`${inputClass} pl-10 pr-11 font-mono text-xs`}
								autoComplete="off"
								spellCheck={false}
							/>
							<button
								type="button"
								onClick={() => setShowToken(!showToken)}
								className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer min-h-11"
								aria-label={showToken ? "Hide token" : "Show token"}
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

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Symbol Search Combobox */}
					<div className="relative">
						<label htmlFor="bd-symbol" className={labelClass}>
							Ticker Symbol
						</label>
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
								<Search className="w-4 h-4" aria-hidden />
							</div>
							<input
								id="bd-symbol"
								type="text"
								value={settings.symbol}
								onChange={(e) => {
									update("symbol", e.target.value.toUpperCase());
									setTickerOpen(true);
								}}
								onFocus={() => setTickerOpen(true)}
								onBlur={() => setTimeout(() => setTickerOpen(false), 200)}
								placeholder="e.g. DOOH"
								className={`${inputClass} pl-10 uppercase font-mono font-bold`}
								maxLength={10}
								role="combobox"
								aria-expanded={tickerOpen && suggestions.length > 0}
								aria-controls="bd-ticker-suggestions"
								aria-autocomplete="list"
							/>
						</div>

						{/* Combobox Dropdown */}
						{tickerOpen && suggestions.length > 0 && (
							<div
								id="bd-ticker-suggestions"
								role="listbox"
								className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-slate-100"
							>
								{suggestions.map((s) => (
									<button
										key={s.StockCode}
										type="button"
										role="option"
										aria-selected={settings.symbol === s.StockCode}
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => {
											update("symbol", s.StockCode);
											setTickerOpen(false);
										}}
										className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer"
									>
										<span className="font-mono font-bold text-slate-900">
											{s.StockCode}
										</span>
										<span className="text-slate-500 truncate max-w-[180px]">
											{s.StockName}
										</span>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Period Preset */}
					<div>
						<label htmlFor="bd-period" className={labelClass}>
							Summary Period
						</label>
						<select
							id="bd-period"
							value={settings.period}
							onChange={(e) =>
								update("period", e.target.value as BrokerDistributionPeriod)
							}
							className={inputClass}
						>
							{PERIOD_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Data Type Selector */}
					<div>
						<label htmlFor="bd-data-type" className={labelClass}>
							Data Metric
						</label>
						<select
							id="bd-data-type"
							value={settings.dataType}
							onChange={(e) =>
								update("dataType", e.target.value as BrokerDistributionDataType)
							}
							className={inputClass}
						>
							{DATA_TYPE_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>

					{/* Specific Date (Optional) */}
					<div>
						<label htmlFor="bd-date" className={labelClass}>
							Trading Date (Optional)
						</label>
						<input
							id="bd-date"
							type="text"
							value={settings.date}
							onChange={(e) => update("date", e.target.value)}
							placeholder="YYYY-MM-DD (latest)"
							className={inputClass}
						/>
					</div>
				</div>

				{/* Bottom Action Row */}
				<div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					{/* Action Mode Radio Segment */}
					<div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 self-start sm:self-auto">
						<button
							type="button"
							onClick={() => update("actionMode", "visualize")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-11 cursor-pointer ${
								settings.actionMode === "visualize"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<GitFork className="w-3.5 h-3.5" aria-hidden />
							<span>Visualize</span>
						</button>
						<button
							type="button"
							onClick={() => update("actionMode", "json")}
							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-11 cursor-pointer ${
								settings.actionMode === "json"
									? "bg-white text-slate-900 shadow-xs"
									: "text-slate-600 hover:text-slate-900"
							}`}
						>
							<FileJson className="w-3.5 h-3.5" aria-hidden />
							<span>Download JSON</span>
						</button>
					</div>

					{/* Execute Button */}
					<button
						type="button"
						onClick={handleExecute}
						disabled={!ready || loading}
						className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer min-h-11"
					>
						{loading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin" aria-hidden />
								<span>Fetching Distribution...</span>
							</>
						) : settings.actionMode === "json" ? (
							<>
								<Download className="w-4 h-4" aria-hidden />
								<span>Fetch &amp; Download JSON</span>
							</>
						) : (
							<>
								<GitFork className="w-4 h-4" aria-hidden />
								<span>Analyze Distribution</span>
							</>
						)}
					</button>
				</div>
			</div>

			{/* Error Alert */}
			{error && (
				<div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5">
					<AlertCircle
						className="w-4 h-4 text-rose-600 shrink-0 mt-0.5"
						aria-hidden
					/>
					<div>
						<span className="font-bold">Error retrieving distribution:</span>{" "}
						{error}
					</div>
				</div>
			)}

			{/* JSON Download Success Confirmation Card */}
			{downloadedStats && (
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0">
							<CheckCircle2 className="w-5 h-5" aria-hidden />
						</div>
						<div>
							<h3 className="text-base font-extrabold text-slate-900">
								JSON File Downloaded Successfully
							</h3>
							<p className="text-xs text-slate-500">
								Saved payload for {downloadedStats.symbol} (
								{downloadedStats.startDate} to {downloadedStats.endDate})
							</p>
						</div>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
						<div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
							<span className="block text-slate-500 font-medium">Symbol</span>
							<span className="font-mono font-bold text-slate-900">
								{downloadedStats.symbol}
							</span>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
							<span className="block text-slate-500 font-medium">
								Session Info
							</span>
							<span className="font-mono font-bold text-slate-900 truncate block">
								{downloadedStats.dateInfo}
							</span>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
							<span className="block text-slate-500 font-medium">
								Top Buyers
							</span>
							<span className="font-mono font-bold text-emerald-600">
								{downloadedStats.totalBuyers} Brokers
							</span>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
							<span className="block text-slate-500 font-medium">
								Top Sellers
							</span>
							<span className="font-mono font-bold text-rose-600">
								{downloadedStats.totalSellers} Brokers
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Visualized Distribution Data */}
			{visualizedData && (
				<div className="space-y-6">
					{/* Header Telemetry Bar & Dimension Switch */}
					<div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
							<span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold">
								{settings.symbol.toUpperCase()}
							</span>
							<span className="text-slate-500">
								{visualizedData.start_date || "-"} &rarr;{" "}
								{visualizedData.end_date || "-"}
							</span>
							{visualizedData.date_info && (
								<span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-sans text-[11px]">
									{visualizedData.date_info}
								</span>
							)}
						</div>

						{/* Dimension Toggle (Volume Lots vs Value IDR) */}
						<div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/70 self-start sm:self-center">
							<button
								type="button"
								onClick={() => setActiveDimension("volume")}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-11 cursor-pointer ${
									activeDimension === "volume"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								By Volume (Lots)
							</button>
							<button
								type="button"
								onClick={() => setActiveDimension("value")}
								className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-h-11 cursor-pointer ${
									activeDimension === "value"
										? "bg-white text-slate-900 shadow-xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								By Value (IDR)
							</button>
						</div>
					</div>

					{/* Dual-column Cards */}
					<BrokerDistributionCards
						buyers={currentBuyers}
						sellers={currentSellers}
						dimension={activeDimension}
					/>
				</div>
			)}
		</div>
	);
}
