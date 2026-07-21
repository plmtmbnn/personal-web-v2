"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { ProcessedStock, SortConfig, SortKey } from "../types";

interface StockTableProps {
	stocks: ProcessedStock[];
	sortConfig: SortConfig;
	onSort: (key: SortKey) => void;
	hasMore: boolean;
	onLoadMore: () => void;
}

const SortableHeader = ({
	label,
	sortKey,
	sortConfig,
	onSort,
}: {
	label: string;
	sortKey: SortKey;
	sortConfig: SortConfig;
	onSort: (key: SortKey) => void;
}) => {
	const isSorted = sortConfig.key === sortKey;
	const isAsc = sortConfig.direction === "asc";

	return (
		<th
			className="p-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500"
			aria-sort={isSorted ? (isAsc ? "ascending" : "descending") : "none"}
		>
			<button
				onClick={() => onSort(sortKey)}
				className="flex items-center gap-1 hover:text-stone-700 transition-colors"
				aria-label={`Sort by ${label}`}
			>
				{label}
				{isSorted ? (
					isAsc ? (
						<ArrowUp className="w-3 h-3" />
					) : (
						<ArrowDown className="w-3 h-3" />
					)
				) : (
					<ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
				)}
			</button>
		</th>
	);
};

const StockRow = ({ stock }: { stock: ProcessedStock }) => {
	const reduceMotion = useReducedMotion();
	const isGainer = stock.ChangePct > 0;
	const isLoser = stock.ChangePct < 0;
	const _isNeutral = stock.ChangePct === 0;
	const isHighVolume = stock.IsHighVolume;

	return (
		<motion.tr
			initial={reduceMotion ? false : { opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
			className="border-t border-stone-100 hover:bg-stone-50 transition-colors"
		>
			<td className="p-3 text-xs font-mono font-bold text-stone-800">
				{stock.StockCode}
			</td>
			<td className="p-3 text-xs text-stone-600">{stock.StockName}</td>
			<td className="p-3 text-xs font-mono text-right">
				{stock.Close.toLocaleString()}
			</td>
			<td
				className={`p-3 text-xs font-mono text-right ${
					isGainer
						? "text-emerald-600"
						: isLoser
							? "text-rose-600"
							: "text-stone-500"
				}`}
			>
				{isGainer && "+"}
				{stock.Change.toLocaleString()}
			</td>
			<td
				className={`p-3 text-xs font-mono text-right ${
					isGainer
						? "text-emerald-600"
						: isLoser
							? "text-rose-600"
							: "text-stone-500"
				}`}
			>
				{isGainer && "+"}
				{stock.ChangePct.toFixed(2)}%
			</td>
			<td className="p-3 text-xs font-mono text-right">
				{stock.Volume.toLocaleString()}
			</td>
			<td className="p-3 text-xs font-mono text-right">
				{stock.ForeignNet > 0 ? "+" : ""}
				{stock.ForeignNet.toLocaleString()}
			</td>
			<td className="p-3 text-xs font-mono text-right">
				{stock.Value.toLocaleString()}
			</td>
			<td className="p-3 text-xs text-right">
				{isHighVolume && <span className="text-amber-500">●</span>}
			</td>
		</motion.tr>
	);
};

const StockTable = ({
	stocks,
	sortConfig,
	onSort,
	hasMore,
	onLoadMore,
}: StockTableProps) => {
	return (
		<div className="overflow-x-auto">
			<table className="w-full">
				<thead className="bg-stone-50">
					<tr className="group">
						<SortableHeader
							label="Symbol"
							sortKey="StockCode"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
							Name
						</th>
						<SortableHeader
							label="Price"
							sortKey="Close"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<SortableHeader
							label="Change"
							sortKey="Change"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<SortableHeader
							label="Change %"
							sortKey="ChangePct"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<SortableHeader
							label="Volume"
							sortKey="Volume"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<SortableHeader
							label="Foreign Net"
							sortKey="ForeignNet"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<SortableHeader
							label="Value"
							sortKey="Value"
							sortConfig={sortConfig}
							onSort={onSort}
						/>
						<th className="p-3 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
							High Vol
						</th>
					</tr>
				</thead>
				<tbody>
					{stocks.map((stock) => (
						<StockRow key={stock.StockCode} stock={stock} />
					))}
				</tbody>
			</table>
			{hasMore && (
				<div className="p-4 text-center">
					<button
						onClick={onLoadMore}
						className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition-colors"
					>
						Load More
					</button>
				</div>
			)}
		</div>
	);
};

export default StockTable;
