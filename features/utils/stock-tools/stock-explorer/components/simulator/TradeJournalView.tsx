"use client";

import { useState, useMemo } from "react";
import type { StockPickWithMetrics, ClosedTradesFilter } from "../../types";
import {
	filterClosedTrades,
	calculateClosedTradesSummary,
} from "../../stockpicks";
import { ClosedTradesTelemetryStrip } from "./ClosedTradesTelemetryStrip";
import { JournalFilterToolbar } from "./JournalFilterToolbar";
import { ThesisAttributionCards } from "./ThesisAttributionCards";
import { ClosedTradesTable } from "./ClosedTradesTable";

interface TradeJournalViewProps {
	closedTrades: StockPickWithMetrics[];
	onReopenTrade: (id: string) => void;
	onDeleteTrade: (id: string) => void;
	onViewStockDetail?: (stockCode: string) => void;
}

const INITIAL_FILTER: ClosedTradesFilter = {
	search: "",
	thesis: "all",
	exitReason: "all",
	horizon: "all",
	outcome: "all",
	sortBy: "exit_date_desc",
};

export function TradeJournalView({
	closedTrades,
	onReopenTrade,
	onDeleteTrade,
	onViewStockDetail,
}: TradeJournalViewProps) {
	const [filter, setFilter] = useState<ClosedTradesFilter>(INITIAL_FILTER);

	const filteredTrades = useMemo(() => {
		return filterClosedTrades(closedTrades, filter);
	}, [closedTrades, filter]);

	const summary = useMemo(() => {
		return calculateClosedTradesSummary(filteredTrades);
	}, [filteredTrades]);

	const hasActiveFilters =
		filter.search !== "" ||
		filter.thesis !== "all" ||
		filter.exitReason !== "all" ||
		filter.horizon !== "all" ||
		filter.outcome !== "all";

	const handleResetFilter = () => {
		setFilter(INITIAL_FILTER);
	};

	const handleExportJson = () => {
		const dataStr =
			"data:text/json;charset=utf-8," +
			encodeURIComponent(JSON.stringify(filteredTrades, null, 2));
		const downloadAnchor = document.createElement("a");
		downloadAnchor.setAttribute("href", dataStr);
		downloadAnchor.setAttribute(
			"download",
			`idx_trade_journal_${new Date().toISOString().split("T")[0]}.json`,
		);
		document.body.appendChild(downloadAnchor);
		downloadAnchor.click();
		downloadAnchor.remove();
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-300">
			{/* 1. Closed Trades 4-Tier Telemetry Strip */}
			<ClosedTradesTelemetryStrip summary={summary} />

			{/* 2. Filter & Search Toolbar */}
			<JournalFilterToolbar
				filter={filter}
				onFilterChange={setFilter}
				onResetFilter={handleResetFilter}
				onExportJson={handleExportJson}
				hasActiveFilters={hasActiveFilters}
				totalResults={filteredTrades.length}
			/>

			{/* 3. Alpha Attribution & Discipline Cards */}
			<ThesisAttributionCards summary={summary} />

			{/* 4. Historical Closed Trades Table */}
			<ClosedTradesTable
				trades={filteredTrades}
				onReopenTrade={onReopenTrade}
				onDeleteTrade={onDeleteTrade}
				onViewStockDetail={onViewStockDetail}
			/>
		</div>
	);
}
