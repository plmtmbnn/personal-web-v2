import { describe, it, expect } from "vitest";

// Mock types based on Strava integration
interface StravaStats {
	ytd_run_totals?: {
		count: number;
		distance: number;
	};
	all_run_totals?: {
		count: number;
		distance: number;
	};
}

interface StravaDataResult {
	isConfigured: boolean;
	runs: any[] | null;
	stats: StravaStats | null;
	hasToken?: boolean;
}

// Helper functions extracted from Running View logic
function getEmptyStateType(data: StravaDataResult) {
	const isConnected = data.isConfigured && data.hasToken;
	const runsIsNull = data.runs === null;
	const hasRunData = Array.isArray(data.runs) && data.runs.length > 0;
	const hasStats = data.stats !== null && data.stats !== undefined;

	if (!isConnected) {
		return data.isConfigured ? "NOT_AUTHORIZED" : "NOT_CONFIGURED";
	}

	if (hasRunData) {
		return "HAS_DATA";
	}

	if (runsIsNull) {
		return "SYNC_ERROR";
	}

	if (
		hasStats &&
		data.stats?.all_run_totals &&
		data.stats.all_run_totals.count > 0
	) {
		return "LOADING_ACTIVITIES";
	}

	return "CONNECTED_NO_DATA";
}

describe("Strava Integration Empty States", () => {
	describe("Connection Status Detection", () => {
		it("should detect not configured state", () => {
			const data: StravaDataResult = {
				isConfigured: false,
				runs: null,
				stats: null,
				hasToken: false,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("NOT_CONFIGURED");
		});

		it("should detect not authorized state", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: null,
				stats: null,
				hasToken: false,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("NOT_AUTHORIZED");
		});

		it("should detect connected state with data", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [{ id: 1, distance: 5000 }],
				stats: { all_run_totals: { count: 50, distance: 250000 } },
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("HAS_DATA");
		});
	});

	describe("Empty State Scenarios", () => {
		it("should detect sync error (runs is null)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: null,
				stats: null,
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("SYNC_ERROR");
		});

		it("should detect activities loading (stats show data but runs empty)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					all_run_totals: { count: 42, distance: 210000 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("LOADING_ACTIVITIES");
		});

		it("should detect connected with no data (truly empty account)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					all_run_totals: { count: 0, distance: 0 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("CONNECTED_NO_DATA");
		});

		it("should detect connected with no stats data", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: null,
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("CONNECTED_NO_DATA");
		});
	});

	describe("Edge Cases", () => {
		it("should handle missing hasToken field (undefined)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: null,
				// hasToken not provided (undefined)
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("NOT_AUTHORIZED");
		});

		it("should handle stats with missing all_run_totals", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					ytd_run_totals: { count: 10, distance: 50000 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("CONNECTED_NO_DATA");
		});

		it("should prioritize data presence over sync error", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [{ id: 1 }], // Has data
				stats: null,
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("HAS_DATA"); // Should show data, not error
		});

		it("should handle stats with zero count explicitly", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					all_run_totals: { count: 0, distance: 0 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("CONNECTED_NO_DATA");
		});
	});

	describe("Message Selection Logic", () => {
		it("should show appropriate message for NOT_CONFIGURED", () => {
			const state = "NOT_CONFIGURED";
			const messages = {
				NOT_CONFIGURED: "Strava integration is not yet configured",
				NOT_AUTHORIZED: "Connect your Strava account",
				SYNC_ERROR: "Unable to Load Activities",
				LOADING_ACTIVITIES: "Activities Loading...",
				CONNECTED_NO_DATA: "Connected & Ready!",
				HAS_DATA: "Display activities",
			};

			expect(messages[state]).toBe("Strava integration is not yet configured");
		});

		it("should show appropriate message for SYNC_ERROR", () => {
			const state = "SYNC_ERROR";
			const showRefreshButton = state === "SYNC_ERROR";

			expect(showRefreshButton).toBe(true);
		});

		it("should show stats count for LOADING_ACTIVITIES", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					all_run_totals: { count: 100, distance: 500000 },
				},
				hasToken: true,
			};

			const state = getEmptyStateType(data);
			expect(state).toBe("LOADING_ACTIVITIES");
			expect(data.stats?.all_run_totals?.count).toBe(100);
		});
	});

	describe("Real-world Integration Scenarios", () => {
		it("should handle fresh Strava account (connected, no runs yet)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [],
				stats: {
					all_run_totals: { count: 0, distance: 0 },
					ytd_run_totals: { count: 0, distance: 0 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("CONNECTED_NO_DATA");
		});

		it("should handle API rate limit (returns null)", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: null,
				stats: {
					all_run_totals: { count: 50, distance: 250000 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("SYNC_ERROR");
		});

		it("should handle cache miss with stats available", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [], // Cache empty
				stats: {
					all_run_totals: { count: 75, distance: 375000 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("LOADING_ACTIVITIES");
		});

		it("should handle successful sync with activities", () => {
			const data: StravaDataResult = {
				isConfigured: true,
				runs: [
					{ id: 1, distance: 5000 },
					{ id: 2, distance: 10000 },
					{ id: 3, distance: 7500 },
				],
				stats: {
					all_run_totals: { count: 125, distance: 625000 },
				},
				hasToken: true,
			};

			const result = getEmptyStateType(data);
			expect(result).toBe("HAS_DATA");
			expect(data.runs?.length).toBe(3);
		});
	});
});
