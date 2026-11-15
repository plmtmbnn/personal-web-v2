"use client";

import type { EntryRequest } from "../utils/paper-risk";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	type ReactNode,
} from "react";
import type {
	ProcessedStock,
	ScoreWeights,
	Sector,
	StockPick,
	StockPickWithMetrics,
	ClosePickPayload,
} from "../types";
import { DEFAULT_DEMO_PICKS, traceAndUpdateWatermarks } from "../stockpicks";
import {
	fetchCloudStockPicksAction,
	saveCloudStockPickAction,
	closeCloudStockPickAction,
	deleteCloudStockPickAction,
	syncCloudWatermarksAction,
} from "../actions/server-actions";

export const DEFAULT_WEIGHTS: ScoreWeights = {
	price: 25,
	volume: 25,
	foreign: 20,
	liquidity: 15,
	volatility: 15,
};

export const STRATEGY_PRESETS: {
	name: string;
	weights: ScoreWeights;
	description: string;
}[] = [
	{
		name: "Balanced Institutional",
		weights: DEFAULT_WEIGHTS,
		description:
			"Standard balanced multi-factor model for general IDX discovery",
	},
	{
		name: "Blue-Chip Foreign Flow",
		weights: {
			price: 15,
			volume: 15,
			foreign: 50,
			liquidity: 20,
			volatility: 0,
		},
		description:
			"Follow large-cap institutional foreign accumulation & smart money",
	},
	{
		name: "Bandar Accumulation",
		weights: {
			price: 10,
			volume: 40,
			foreign: 15,
			liquidity: 35,
			volatility: 0,
		},
		description:
			"Detect abnormal ticket sizes (Value/Tx) and bid book dominance",
	},
	{
		name: "Turnover Leaders (Scalp)",
		weights: {
			price: 25,
			volume: 35,
			foreign: 0,
			liquidity: 35,
			volatility: 5,
		},
		description:
			"High-velocity instruments with maximum daily turnover & trading frequency",
	},
	{
		name: "ARB Reversal Speculation",
		weights: {
			price: 35,
			volume: 25,
			foreign: 0,
			liquidity: 20,
			volatility: 20,
		},
		description:
			"Identify oversold bounce candidates testing Auto-Rejection limits",
	},
	{
		name: "Compass Defensive Blue-Chip",
		weights: {
			price: 15,
			volume: 10,
			foreign: 45,
			liquidity: 30,
			volatility: 0,
		},
		description:
			"Investment Compass defensive alignment: safe large-caps with strong institutional liquidity and foreign backing",
	},
	{
		name: "Compass Risk-On Momentum",
		weights: {
			price: 35,
			volume: 35,
			foreign: 10,
			liquidity: 15,
			volatility: 5,
		},
		description:
			"Investment Compass Risk-On alignment: high relative strength price momentum and turnover expansion",
	},
];

interface ScreenerContextType {
	// Workstation Tab Navigation
	workstationTab: "screener" | "simulator";
	setWorkstationTab: (tab: "screener" | "simulator") => void;
	simulatorSubTab: "active" | "journal";
	setSimulatorSubTab: (subTab: "active" | "journal") => void;

	// Inspector Drawer State
	selectedStock: ProcessedStock | null;
	setSelectedStock: (stock: ProcessedStock | null) => void;

	// Watchlist State
	watchlist: string[];
	toggleWatchlist: (code: string) => void;
	isWatchlisted: (code: string) => boolean;

	// Stockpick Simulator State & Actions (Supabase Cloud Source of Truth)
	stockPicks: StockPick[];
	isPicksLoading: boolean;
	cloudSyncError: string | null;
	refreshPicksFromCloud: () => Promise<void>;
	addStockPick: (
		data: Omit<
			StockPick,
			| "id"
			| "createdAt"
			| "updatedAt"
			| "highestPriceTraced"
			| "lowestPriceTraced"
			| "status"
		> & {
			highestPriceTraced?: number;
			lowestPriceTraced?: number;
		},
		request: EntryRequest,
	) => Promise<string | null>;
	updateStockPick: (
		id: string,
		updates: Partial<StockPick>,
		request: EntryRequest,
	) => Promise<string | null>;
	removeStockPick: (id: string) => void;
	closeStockPick: (id: string, exitPrice?: number) => void;
	closeStockPickWithDetails: (
		id: string,
		payload: ClosePickPayload,
	) => Promise<string | null>;
	reopenStockPick: (id: string) => void;
	resetPickWatermarks: (id: string, currentPrice?: number) => void;
	resetToDemoPicks: () => void;
	exportPicksToJson: () => string;
	importPicksFromJson: (jsonStr: string) => boolean;

	// Simulator Modal State
	isPickModalOpen: boolean;
	setIsPickModalOpen: (open: boolean) => void;
	pickToEdit: StockPick | null;
	stockToSimulate: ProcessedStock | null;
	openAddPickModal: (stock?: ProcessedStock | null) => void;
	openEditPickModal: (pick: StockPick) => void;
	closePickModal: () => void;

	// Close Position Modal State
	isCloseModalOpen: boolean;
	pickToClose: StockPickWithMetrics | null;
	openClosePickModal: (pick: StockPickWithMetrics) => void;
	closeClosePickModal: () => void;

	// Live market sync for watermarks
	syncMarketDataWatermarks: (marketStocks: ProcessedStock[]) => void;

	// Factor Scoring Weights State
	weights: ScoreWeights;
	setWeights: (weights: ScoreWeights) => void;
	handleWeightChange: (key: keyof ScoreWeights, val: number) => void;
	applyPreset: (preset: ScoreWeights) => void;
	applyCompassRegime: (
		regimeState: "risk_on" | "selective" | "defensive" | "stress",
	) => void;
	resetWeights: () => void;
	activePresetName: string;
	isScorerExpanded: boolean;
	setIsScorerExpanded: (
		expanded: boolean | ((prev: boolean) => boolean),
	) => void;

	// Global Filters & Search State
	minScore: number;
	setMinScore: (score: number) => void;
	minTurnover: number;
	setMinTurnover: (turnover: number) => void;
	selectedSector: Sector | "ALL";
	setSelectedSector: (sector: Sector | "ALL") => void;
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	resetFilters: () => void;

	// Simulated Portfolio Account Equity (IDR) for Position Sizing & Bucket Caps
	accountEquityIdr: number;
	setAccountEquityIdr: (equity: number) => void;
}

const ScreenerContext = createContext<ScreenerContextType | null>(null);

export function ScreenerProvider({ children }: { children: ReactNode }) {
	const [workstationTab, setWorkstationTabState] = useState<
		"screener" | "simulator"
	>("screener");
	const [simulatorSubTab, setSimulatorSubTab] = useState<"active" | "journal">(
		"active",
	);
	const [selectedStock, setSelectedStock] = useState<ProcessedStock | null>(
		null,
	);
	const [watchlist, setWatchlist] = useState<string[]>([]);
	const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
	const [isScorerExpanded, setIsScorerExpanded] = useState(false);

	// Stockpick Simulator State (retrieved exclusively from Supabase)
	const [stockPicks, setStockPicks] = useState<StockPick[]>([]);
	const [isPicksLoading, setIsPicksLoading] = useState<boolean>(true);
	const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
	const stockPicksRef = useRef<StockPick[]>(stockPicks);
	stockPicksRef.current = stockPicks;
	const cloudWatermarksSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [isPickModalOpen, setIsPickModalOpen] = useState(false);
	const [pickToEdit, setPickToEdit] = useState<StockPick | null>(null);
	const [stockToSimulate, setStockToSimulate] = useState<ProcessedStock | null>(
		null,
	);

	// Close Position Modal State
	const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
	const [pickToClose, setPickToClose] = useState<StockPickWithMetrics | null>(
		null,
	);

	// Filters (default minTurnover to Rp 1B out of the box to filter out illiquid saham tidur)
	const [minScore, setMinScoreState] = useState<number>(0);
	const [minTurnover, setMinTurnoverState] = useState<number>(1_000_000_000);
	const [selectedSector, setSelectedSectorState] = useState<Sector | "ALL">(
		"ALL",
	);
	const [searchQuery, setSearchQueryState] = useState<string>("");
	const [accountEquityIdr, setAccountEquityIdrState] =
		useState<number>(100_000_000);

	// Load stored weights and watchlist on mount + retrieve stockpicks from Supabase Cloud
	useEffect(() => {
		if (typeof window === "undefined") return;

		// Clean up any legacy localStorage entry
		try {
			localStorage.removeItem("idx:stockpicks:v1");
		} catch (_e) {}

		try {
			const storedWeights = localStorage.getItem("idx:weights");
			if (storedWeights) {
				setWeights(JSON.parse(storedWeights));
			}
		} catch (_e) {}

		try {
			const storedWatchlist = localStorage.getItem("idx:watchlist");
			if (storedWatchlist) {
				setWatchlist(JSON.parse(storedWatchlist));
			}
		} catch (_e) {}

		try {
			const storedEquity = localStorage.getItem("idx:equity");
			if (storedEquity && !Number.isNaN(Number(storedEquity))) {
				setAccountEquityIdrState(Math.max(1_000_000, Number(storedEquity)));
			}
		} catch (_e) {}

		// Primary source of truth: retrieve stockpicks directly from Supabase Cloud
		let isMounted = true;
		setIsPicksLoading(true);
		setCloudSyncError(null);

		fetchCloudStockPicksAction()
			.then((res) => {
				if (!isMounted) return;
				if (res.success && res.data) {
					stockPicksRef.current = res.data;
					setStockPicks(res.data);
				} else if (!res.success) {
					setCloudSyncError(
						res.error || "Failed to retrieve picks from Supabase",
					);
					stockPicksRef.current = [];
					setStockPicks([]);
				}
			})
			.catch((err) => {
				if (!isMounted) return;
				const msg =
					err instanceof Error ? err.message : "Database connection error";
				setCloudSyncError(msg);
				stockPicksRef.current = [];
				setStockPicks([]);
			})
			.finally(() => {
				if (isMounted) {
					setIsPicksLoading(false);
				}
			});

		// Sync initial URL search parameters
		try {
			const params = new URLSearchParams(window.location.search);
			const tabParam = params.get("tab");
			if (tabParam === "simulator" || tabParam === "screener") {
				setWorkstationTabState(tabParam);
			}
			const subParam = params.get("sub");
			if (subParam === "journal" || subParam === "active") {
				setSimulatorSubTab(subParam);
			}
			const scoreParam = params.get("minScore");
			if (scoreParam && !Number.isNaN(Number(scoreParam))) {
				setMinScoreState(Number(scoreParam));
			}
			const turnoverParam = params.get("minTurnover");
			if (turnoverParam && !Number.isNaN(Number(turnoverParam))) {
				setMinTurnoverState(Number(turnoverParam));
			}
			const sectorParam = params.get("sector");
			if (sectorParam) {
				setSelectedSectorState(sectorParam as Sector | "ALL");
			}
			const queryParam = params.get("q");
			if (queryParam) {
				setSearchQueryState(queryParam);
			}
		} catch (_e) {}

		return () => {
			isMounted = false;
		};
	}, []);

	const syncUrlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// URL Sync helper (debounced to avoid thrashing history state)
	const syncUrl = useCallback(
		(
			tab: "screener" | "simulator",
			score: number,
			turnover: number,
			sector: Sector | "ALL",
			query: string,
		) => {
			if (typeof window === "undefined") return;
			if (syncUrlTimeoutRef.current) {
				clearTimeout(syncUrlTimeoutRef.current);
			}
			syncUrlTimeoutRef.current = setTimeout(() => {
				try {
					const url = new URL(window.location.href);
					if (tab === "simulator") {
						url.searchParams.set("tab", "simulator");
					} else {
						url.searchParams.delete("tab");
					}

					if (score > 0) {
						url.searchParams.set("minScore", String(score));
					} else {
						url.searchParams.delete("minScore");
					}

					if (turnover > 0) {
						url.searchParams.set("minTurnover", String(turnover));
					} else {
						url.searchParams.delete("minTurnover");
					}

					if (sector && sector !== "ALL") {
						url.searchParams.set("sector", sector);
					} else {
						url.searchParams.delete("sector");
					}

					if (query.trim()) {
						url.searchParams.set("q", query.trim());
					} else {
						url.searchParams.delete("q");
					}

					window.history.replaceState(null, "", url.toString());
				} catch (_e) {}
			}, 300);
		},
		[],
	);

	useEffect(() => {
		return () => {
			if (syncUrlTimeoutRef.current) {
				clearTimeout(syncUrlTimeoutRef.current);
			}
			if (cloudWatermarksSyncTimeoutRef.current) {
				clearTimeout(cloudWatermarksSyncTimeoutRef.current);
			}
		};
	}, []);

	const setWorkstationTab = useCallback(
		(tab: "screener" | "simulator") => {
			setWorkstationTabState(tab);
			syncUrl(tab, minScore, minTurnover, selectedSector, searchQuery);
		},
		[minScore, minTurnover, selectedSector, searchQuery, syncUrl],
	);

	const setMinScore = useCallback(
		(score: number) => {
			setMinScoreState(score);
			syncUrl(workstationTab, score, minTurnover, selectedSector, searchQuery);
		},
		[workstationTab, minTurnover, selectedSector, searchQuery, syncUrl],
	);

	const setMinTurnover = useCallback(
		(turnover: number) => {
			setMinTurnoverState(turnover);
			syncUrl(workstationTab, minScore, turnover, selectedSector, searchQuery);
		},
		[workstationTab, minScore, selectedSector, searchQuery, syncUrl],
	);

	const setSelectedSector = useCallback(
		(sector: Sector | "ALL") => {
			setSelectedSectorState(sector);
			syncUrl(workstationTab, minScore, minTurnover, sector, searchQuery);
		},
		[workstationTab, minScore, minTurnover, searchQuery, syncUrl],
	);

	const setSearchQuery = useCallback(
		(query: string) => {
			setSearchQueryState(query);
			syncUrl(workstationTab, minScore, minTurnover, selectedSector, query);
		},
		[workstationTab, minScore, minTurnover, selectedSector, syncUrl],
	);

	const resetFilters = useCallback(() => {
		setMinScoreState(0);
		setMinTurnoverState(0);
		setSelectedSectorState("ALL");
		setSearchQueryState("");
		syncUrl(workstationTab, 0, 0, "ALL", "");
	}, [workstationTab, syncUrl]);

	// Watchlist persistence
	const toggleWatchlist = useCallback((code: string) => {
		setWatchlist((prev) => {
			const updated = prev.includes(code)
				? prev.filter((c) => c !== code)
				: [...prev, code];
			try {
				localStorage.setItem("idx:watchlist", JSON.stringify(updated));
			} catch (_e) {}
			return updated;
		});
	}, []);

	const isWatchlisted = useCallback(
		(code: string) => watchlist.includes(code),
		[watchlist],
	);
	// Stockpick simulator cloud persistence and mutation handlers
	const refreshPicksFromCloud = useCallback(async () => {
		setIsPicksLoading(true);
		setCloudSyncError(null);
		try {
			const res = await fetchCloudStockPicksAction();
			if (res.success && res.data) {
				stockPicksRef.current = res.data;
				setStockPicks(res.data);
			} else if (!res.success) {
				setCloudSyncError(
					res.error || "Failed to retrieve picks from Supabase",
				);
			}
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Database connection error";
			setCloudSyncError(msg);
		} finally {
			setIsPicksLoading(false);
		}
	}, []);

	const savePicks = useCallback((updated: StockPick[]) => {
		stockPicksRef.current = updated;
		setStockPicks(updated);
	}, []);

	const addStockPick = useCallback(
		async (
			data: Omit<
				StockPick,
				| "id"
				| "createdAt"
				| "updatedAt"
				| "highestPriceTraced"
				| "lowestPriceTraced"
				| "status"
			> & {
				highestPriceTraced?: number;
				lowestPriceTraced?: number;
			},
			request: EntryRequest,
		) => {
			const now = Date.now();
			const newId =
				typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
					? crypto.randomUUID()
					: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
							const r = (Math.random() * 16) | 0;
							const v = c === "x" ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						});
			const newPick: StockPick = {
				id: newId,
				stockCode: data.stockCode.toUpperCase().trim(),
				stockName: data.stockName,
				sector: data.sector,
				buyPrice: data.buyPrice,
				quantityLots: data.quantityLots || 10,
				entryDate: data.entryDate || new Date().toISOString().split("T")[0],
				targetPrice: data.targetPrice,
				stopLossPrice: data.stopLossPrice,
				thesis: data.thesis || "Compass Core Tranche",
				notes: data.notes,
				highestPriceTraced: data.highestPriceTraced || data.buyPrice,
				highestPriceDate:
					data.entryDate || new Date().toISOString().split("T")[0],
				lowestPriceTraced: data.lowestPriceTraced || data.buyPrice,
				lowestPriceDate:
					data.entryDate || new Date().toISOString().split("T")[0],
				status: "active",
				createdAt: now,
				updatedAt: now,
			};

			const result = await saveCloudStockPickAction(newPick, request);
			if (!result.success || !result.data)
				return result.error ?? "Paper entry could not be saved.";
			savePicks([
				result.data,
				...stockPicksRef.current.filter((pick) => pick.id !== newId),
			]);
			return null;
		},
		[savePicks],
	);

	const updateStockPick = useCallback(
		async (id: string, updates: Partial<StockPick>, request: EntryRequest) => {
			const previous = stockPicksRef.current.find((pick) => pick.id === id);
			if (!previous) return "Paper position not found.";
			const next = { ...previous, ...updates, updatedAt: Date.now() };
			next.highestPriceTraced = Math.max(
				next.highestPriceTraced,
				next.buyPrice,
			);
			next.lowestPriceTraced = Math.min(next.lowestPriceTraced, next.buyPrice);
			const result = await saveCloudStockPickAction(next, request);
			if (!result.success || !result.data)
				return result.error ?? "Paper position could not be saved.";
			savePicks(
				stockPicksRef.current.map((pick) =>
					pick.id === id ? result.data! : pick,
				),
			);
			return null;
		},
		[savePicks],
	);

	const removeStockPick = useCallback(
		(id: string) => {
			const updated = stockPicks.filter((p) => p.id !== id);
			savePicks(updated);
			deleteCloudStockPickAction(id)
				.then((res) => {
					if (!res.success && res.error) setCloudSyncError(res.error);
				})
				.catch((err) => {
					setCloudSyncError(err instanceof Error ? err.message : "Cloud error");
				});
		},
		[stockPicks, savePicks],
	);

	const closeStockPickWithDetails = useCallback(
		async (id: string, payload: ClosePickPayload) => {
			const targetPick = stockPicks.find((p) => p.id === id);
			if (!targetPick) return "Active paper position not found.";

			const totalShares = (targetPick.quantityLots || 1) * 100;
			const exitPrice = payload.exitPrice || targetPick.buyPrice;
			const realizedPlNominal = (exitPrice - targetPick.buyPrice) * totalShares;
			const realizedPlPct =
				targetPick.buyPrice > 0
					? ((exitPrice - targetPick.buyPrice) / targetPick.buyPrice) * 100
					: 0;

			const entryTs = targetPick.entryDate
				? new Date(targetPick.entryDate).getTime()
				: targetPick.createdAt;
			const exitDate =
				payload.exitDate || new Date().toISOString().split("T")[0];
			const exitTs = new Date(exitDate).getTime();
			const holdingDays = Math.max(
				0,
				Math.floor((exitTs - entryTs) / (1000 * 60 * 60 * 24)),
			);

			const peakGainPct =
				targetPick.buyPrice > 0
					? ((Math.max(
							targetPick.highestPriceTraced || targetPick.buyPrice,
							targetPick.buyPrice,
						) -
							targetPick.buyPrice) /
							targetPick.buyPrice) *
						100
					: 0;
			const maxDrawdownPct =
				targetPick.buyPrice > 0
					? ((Math.min(
							targetPick.lowestPriceTraced || targetPick.buyPrice,
							targetPick.buyPrice,
						) -
							targetPick.buyPrice) /
							targetPick.buyPrice) *
						100
					: 0;

			const result = await closeCloudStockPickAction(id, {
				...payload,
				exitPrice,
				exitDate,
				peakGainPct,
				maxDrawdownPct,
				holdingDays,
				realizedPlNominal,
				realizedPlPct,
			}).catch(() => ({
				success: false,
				error: "Failed to close paper position",
			}));
			if (!result.success) {
				setCloudSyncError(result.error ?? "Failed to close paper position");
				return result.error ?? "Failed to close paper position";
			}
			await refreshPicksFromCloud();
			return null;
		},
		[stockPicks, refreshPicksFromCloud],
	);

	const closeStockPick = useCallback(
		(id: string, exitPrice?: number) => {
			const pick = stockPicksRef.current.find((item) => item.id === id);
			if (!pick) return;
			const price = exitPrice ?? pick.buyPrice;
			void closeStockPickWithDetails(id, {
				exitPrice: price,
				exitReason: price >= pick.buyPrice ? "manual_profit" : "manual_cut",
			});
		},
		[closeStockPickWithDetails],
	);

	const reopenStockPick = useCallback(
		(id: string) => {
			const updated = stockPicks.map((pick) => {
				if (pick.id !== id) return pick;
				const reopened: StockPick = {
					...pick,
					status: "active",
					closedPrice: undefined,
					closedDate: undefined,
					exitReason: undefined,
					exitNotes: undefined,
					realizedPlNominal: undefined,
					realizedPlPct: undefined,
					updatedAt: Date.now(),
				};
				// Sync reopen with cloud
				saveCloudStockPickAction(reopened).catch(() => {});
				return reopened;
			});
			savePicks(updated);
		},
		[stockPicks, savePicks],
	);

	const resetPickWatermarks = useCallback(
		(id: string, currentPrice?: number) => {
			const updated = stockPicks.map((pick) => {
				if (pick.id !== id) return pick;
				const baseline = currentPrice || pick.buyPrice;
				return {
					...pick,
					highestPriceTraced: baseline,
					highestPriceDate: new Date().toISOString().split("T")[0],
					lowestPriceTraced: baseline,
					lowestPriceDate: new Date().toISOString().split("T")[0],
					updatedAt: Date.now(),
				};
			});
			savePicks(updated);
		},
		[stockPicks, savePicks],
	);

	const resetToDemoPicks = useCallback(async () => {
		let failure: string | undefined;
		for (const pick of DEFAULT_DEMO_PICKS) {
			const result = await saveCloudStockPickAction(
				pick,
				undefined,
				true,
			).catch(() => ({ success: false, error: "Demo import failed" }));
			if (!result.success) failure = result.error ?? "Demo import failed";
		}
		await refreshPicksFromCloud();
		if (failure) setCloudSyncError(failure);
	}, [refreshPicksFromCloud]);

	const exportPicksToJson = useCallback(
		() => JSON.stringify(stockPicks, null, 2),
		[stockPicks],
	);

	const importPicksFromJson = useCallback(
		(jsonStr: string): boolean => {
			try {
				const parsed = JSON.parse(jsonStr);
				if (!Array.isArray(parsed) || parsed.length === 0) return false;
				void (async () => {
					let failure: string | undefined;
					for (const pick of parsed) {
						const result = await saveCloudStockPickAction(
							pick,
							undefined,
							true,
						).catch(() => ({ success: false, error: "Import failed" }));
						if (!result.success) failure = result.error ?? "Import failed";
					}
					await refreshPicksFromCloud();
					if (failure) setCloudSyncError(failure);
				})();
				return true;
			} catch {
				return false;
			}
		},
		[refreshPicksFromCloud],
	);

	// Modal Controls
	const openAddPickModal = useCallback((stock?: ProcessedStock | null) => {
		setPickToEdit(null);
		setStockToSimulate(stock || null);
		setIsPickModalOpen(true);
	}, []);

	const openEditPickModal = useCallback((pick: StockPick) => {
		setStockToSimulate(null);
		setPickToEdit(pick);
		setIsPickModalOpen(true);
	}, []);

	const closePickModal = useCallback(() => {
		setIsPickModalOpen(false);
		setPickToEdit(null);
		setStockToSimulate(null);
	}, []);

	// Close Position Modal Controls
	const openClosePickModal = useCallback((pick: StockPickWithMetrics) => {
		setPickToClose(pick);
		setIsCloseModalOpen(true);
	}, []);

	const closeClosePickModal = useCallback(() => {
		setIsCloseModalOpen(false);
		setPickToClose(null);
	}, []);

	// Background watermark synchronization with incoming live quotes
	const syncMarketDataWatermarks = useCallback(
		(marketStocks: ProcessedStock[]) => {
			const currentPicks = stockPicksRef.current;
			if (
				!currentPicks ||
				currentPicks.length === 0 ||
				!marketStocks ||
				marketStocks.length === 0
			) {
				return;
			}
			const { updatedPicks, hasChanges } = traceAndUpdateWatermarks(
				currentPicks,
				marketStocks,
			);
			if (hasChanges) {
				savePicks(updatedPicks);

				// Debounce cloud sync and invoke out-of-band via setTimeout to decouple from React render cycles
				if (cloudWatermarksSyncTimeoutRef.current) {
					clearTimeout(cloudWatermarksSyncTimeoutRef.current);
				}
				cloudWatermarksSyncTimeoutRef.current = setTimeout(() => {
					const cloudUpdates = updatedPicks
						.filter((p) => p.status === "active")
						.map((p) => ({
							id: p.id,
							highestPriceTraced: p.highestPriceTraced,
							lowestPriceTraced: p.lowestPriceTraced,
							highestPriceDate: p.highestPriceDate,
							lowestPriceDate: p.lowestPriceDate,
						}));

					if (cloudUpdates.length > 0) {
						syncCloudWatermarksAction(cloudUpdates).catch(() => {});
					}
				}, 1200);
			}
		},
		[savePicks],
	);

	// Weights persistence & presets
	const handleWeightChange = useCallback(
		(key: keyof ScoreWeights, val: number) => {
			setWeights((prev) => {
				const updated = { ...prev, [key]: val };
				try {
					localStorage.setItem("idx:weights", JSON.stringify(updated));
				} catch (_e) {}
				return updated;
			});
		},
		[],
	);

	const setAccountEquityIdr = useCallback((equity: number) => {
		const valid = Math.max(1_000_000, Math.round(equity));
		setAccountEquityIdrState(valid);
		try {
			localStorage.setItem("idx:equity", String(valid));
		} catch (_e) {}
	}, []);

	const applyPreset = useCallback((preset: ScoreWeights) => {
		setWeights(preset);
		try {
			localStorage.setItem("idx:weights", JSON.stringify(preset));
		} catch (_e) {}
	}, []);

	const applyCompassRegime = useCallback(
		(regimeState: "risk_on" | "selective" | "defensive" | "stress") => {
			if (regimeState === "risk_on") {
				const preset = STRATEGY_PRESETS.find(
					(p) => p.name === "Compass Risk-On Momentum",
				);
				if (preset) applyPreset(preset.weights);
				setMinTurnoverState(1_000_000_000);
			} else if (regimeState === "defensive" || regimeState === "stress") {
				const preset = STRATEGY_PRESETS.find(
					(p) => p.name === "Compass Defensive Blue-Chip",
				);
				if (preset) applyPreset(preset.weights);
				setMinTurnoverState(5_000_000_000);
			} else {
				applyPreset(DEFAULT_WEIGHTS);
				setMinTurnoverState(1_000_000_000);
			}
		},
		[applyPreset],
	);

	const resetWeights = useCallback(() => {
		setWeights(DEFAULT_WEIGHTS);
		setMinScoreState(0);
		setMinTurnoverState(1_000_000_000);
		syncUrl(workstationTab, 0, 1_000_000_000, selectedSector, searchQuery);
		try {
			localStorage.setItem("idx:weights", JSON.stringify(DEFAULT_WEIGHTS));
		} catch (_e) {}
	}, [workstationTab, selectedSector, searchQuery, syncUrl]);

	const activePresetName = useMemo(() => {
		return (
			STRATEGY_PRESETS.find(
				(p) =>
					p.weights.price === weights.price &&
					p.weights.volume === weights.volume &&
					p.weights.foreign === weights.foreign &&
					p.weights.liquidity === weights.liquidity &&
					p.weights.volatility === weights.volatility,
			)?.name || "Custom Blend"
		);
	}, [weights]);

	const value = useMemo(
		() => ({
			workstationTab,
			setWorkstationTab,
			simulatorSubTab,
			setSimulatorSubTab,
			selectedStock,
			setSelectedStock,
			watchlist,
			toggleWatchlist,
			isWatchlisted,
			stockPicks,
			isPicksLoading,
			cloudSyncError,
			refreshPicksFromCloud,
			addStockPick,
			updateStockPick,
			removeStockPick,
			closeStockPick,
			closeStockPickWithDetails,
			reopenStockPick,
			resetPickWatermarks,
			resetToDemoPicks,
			exportPicksToJson,
			importPicksFromJson,
			isPickModalOpen,
			setIsPickModalOpen,
			pickToEdit,
			stockToSimulate,
			openAddPickModal,
			openEditPickModal,
			closePickModal,
			isCloseModalOpen,
			pickToClose,
			openClosePickModal,
			closeClosePickModal,
			syncMarketDataWatermarks,
			weights,
			setWeights,
			handleWeightChange,
			applyPreset,
			applyCompassRegime,
			resetWeights,
			activePresetName,
			isScorerExpanded,
			setIsScorerExpanded,
			minScore,
			setMinScore,
			minTurnover,
			setMinTurnover,
			selectedSector,
			setSelectedSector,
			searchQuery,
			setSearchQuery,
			resetFilters,
			accountEquityIdr,
			setAccountEquityIdr,
		}),
		[
			workstationTab,
			setWorkstationTab,
			simulatorSubTab,
			setSimulatorSubTab,
			selectedStock,
			setSelectedStock,
			watchlist,
			toggleWatchlist,
			isWatchlisted,
			stockPicks,
			isPicksLoading,
			cloudSyncError,
			refreshPicksFromCloud,
			addStockPick,
			updateStockPick,
			removeStockPick,
			closeStockPick,
			closeStockPickWithDetails,
			reopenStockPick,
			resetPickWatermarks,
			resetToDemoPicks,
			exportPicksToJson,
			importPicksFromJson,
			isPickModalOpen,
			setIsPickModalOpen,
			pickToEdit,
			stockToSimulate,
			openAddPickModal,
			openEditPickModal,
			closePickModal,
			isCloseModalOpen,
			pickToClose,
			openClosePickModal,
			closeClosePickModal,
			syncMarketDataWatermarks,
			weights,
			setWeights,
			handleWeightChange,
			applyPreset,
			applyCompassRegime,
			resetWeights,
			activePresetName,
			isScorerExpanded,
			minScore,
			setMinScore,
			minTurnover,
			setMinTurnover,
			selectedSector,
			setSelectedSector,
			searchQuery,
			setSearchQuery,
			resetFilters,
			accountEquityIdr,
			setAccountEquityIdr,
		],
	);

	return (
		<ScreenerContext.Provider value={value}>
			{children}
		</ScreenerContext.Provider>
	);
}

export function useScreener() {
	const context = useContext(ScreenerContext);
	if (!context) {
		throw new Error("useScreener must be used within a ScreenerProvider");
	}
	return context;
}
