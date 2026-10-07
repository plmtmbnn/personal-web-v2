"use client";

import { useScreener } from "../context/ScreenerContext";

/**
 * Hook providing access to screener user preferences (weights, presets, watchlist).
 */
export function useScreenerPreferences() {
	const {
		watchlist,
		toggleWatchlist,
		isWatchlisted,
		weights,
		setWeights,
		handleWeightChange,
		applyPreset,
		resetWeights,
		activePresetName,
	} = useScreener();

	return {
		watchlist,
		toggleWatchlist,
		isWatchlisted,
		weights,
		setWeights,
		handleWeightChange,
		applyPreset,
		resetWeights,
		activePresetName,
	};
}
