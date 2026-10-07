"use client";

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
import type { ProcessedStock, ScoreWeights, Sector } from "../types";

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
];

interface ScreenerContextType {
	// Inspector Drawer State
	selectedStock: ProcessedStock | null;
	setSelectedStock: (stock: ProcessedStock | null) => void;

	// Watchlist State
	watchlist: string[];
	toggleWatchlist: (code: string) => void;
	isWatchlisted: (code: string) => boolean;

	// Factor Scoring Weights State
	weights: ScoreWeights;
	setWeights: (weights: ScoreWeights) => void;
	handleWeightChange: (key: keyof ScoreWeights, val: number) => void;
	applyPreset: (preset: ScoreWeights) => void;
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
}

const ScreenerContext = createContext<ScreenerContextType | null>(null);

export function ScreenerProvider({ children }: { children: ReactNode }) {
	const [selectedStock, setSelectedStock] = useState<ProcessedStock | null>(
		null,
	);
	const [watchlist, setWatchlist] = useState<string[]>([]);
	const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
	const [isScorerExpanded, setIsScorerExpanded] = useState(false);

	// Filters
	const [minScore, setMinScoreState] = useState<number>(0);
	const [minTurnover, setMinTurnoverState] = useState<number>(0);
	const [selectedSector, setSelectedSectorState] = useState<Sector | "ALL">(
		"ALL",
	);
	const [searchQuery, setSearchQueryState] = useState<string>("");

	// Load stored weights and watchlist from localStorage + URL params on mount
	useEffect(() => {
		if (typeof window === "undefined") return;

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

		// Sync initial URL search parameters
		try {
			const params = new URLSearchParams(window.location.search);
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
	}, []);

	const syncUrlTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// URL Sync helper (debounced to avoid thrashing history state)
	const syncUrl = useCallback(
		(
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
		};
	}, []);

	const setMinScore = useCallback(
		(score: number) => {
			setMinScoreState(score);
			syncUrl(score, minTurnover, selectedSector, searchQuery);
		},
		[minTurnover, selectedSector, searchQuery, syncUrl],
	);

	const setMinTurnover = useCallback(
		(turnover: number) => {
			setMinTurnoverState(turnover);
			syncUrl(minScore, turnover, selectedSector, searchQuery);
		},
		[minScore, selectedSector, searchQuery, syncUrl],
	);

	const setSelectedSector = useCallback(
		(sector: Sector | "ALL") => {
			setSelectedSectorState(sector);
			syncUrl(minScore, minTurnover, sector, searchQuery);
		},
		[minScore, minTurnover, searchQuery, syncUrl],
	);

	const setSearchQuery = useCallback(
		(query: string) => {
			setSearchQueryState(query);
			syncUrl(minScore, minTurnover, selectedSector, query);
		},
		[minScore, minTurnover, selectedSector, syncUrl],
	);

	const resetFilters = useCallback(() => {
		setMinScoreState(0);
		setMinTurnoverState(0);
		setSelectedSectorState("ALL");
		setSearchQueryState("");
		syncUrl(0, 0, "ALL", "");
	}, [syncUrl]);

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

	const applyPreset = useCallback((preset: ScoreWeights) => {
		setWeights(preset);
		try {
			localStorage.setItem("idx:weights", JSON.stringify(preset));
		} catch (_e) {}
	}, []);

	const resetWeights = useCallback(() => {
		setWeights(DEFAULT_WEIGHTS);
		setMinScoreState(0);
		setMinTurnoverState(0);
		syncUrl(0, 0, selectedSector, searchQuery);
		try {
			localStorage.setItem("idx:weights", JSON.stringify(DEFAULT_WEIGHTS));
		} catch (_e) {}
	}, [selectedSector, searchQuery, syncUrl]);

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
			selectedStock,
			setSelectedStock,
			watchlist,
			toggleWatchlist,
			isWatchlisted,
			weights,
			setWeights,
			handleWeightChange,
			applyPreset,
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
		}),
		[
			selectedStock,
			watchlist,
			toggleWatchlist,
			isWatchlisted,
			weights,
			handleWeightChange,
			applyPreset,
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
