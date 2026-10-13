"use client";

import { useState, useEffect, useMemo } from "react";
import {
	X,
	Search,
	Compass,
	Calendar,
	Layers,
	FileText,
	ArrowRight,
} from "lucide-react";
import type {
	ProcessedStock,
	StockPick,
	StockPickThesis,
	Sector,
} from "../../types";
import { fmtIDRPrice } from "../../stockpicks";
import { getIdxPriceTick } from "../../utils";

interface StockpickModalProps {
	isOpen: boolean;
	onClose: () => void;
	pickToEdit?: StockPick | null;
	stockToSimulate?: ProcessedStock | null;
	availableStocks: ProcessedStock[];
	onSave: (data: {
		id?: string;
		stockCode: string;
		stockName: string;
		sector: Sector;
		buyPrice: number;
		quantityLots: number;
		entryDate: string;
		targetPrice?: number;
		stopLossPrice?: number;
		thesis?: StockPickThesis;
		notes?: string;
	}) => void;
}

const THESIS_OPTIONS: StockPickThesis[] = [
	"Compass Core Tranche",
	"Foreign Flow Surge",
	"Bandar Accumulation",
	"Value Accumulation",
	"Breakout Momentum",
	"ARB Reversal",
	"Swing Speculation",
	"Custom",
];

export default function StockpickModal({
	isOpen,
	onClose,
	pickToEdit,
	stockToSimulate,
	availableStocks,
	onSave,
}: StockpickModalProps) {
	const [tickerQuery, setTickerQuery] = useState("");
	const [selectedStock, setSelectedStock] = useState<ProcessedStock | null>(
		null,
	);
	const [buyPrice, setBuyPrice] = useState<number>(0);
	const [quantityLots, setQuantityLots] = useState<number>(10);
	const [entryDate, setEntryDate] = useState<string>("");
	const [targetPrice, setTargetPrice] = useState<string>("");
	const [stopLossPrice, setStopLossPrice] = useState<string>("");
	const [thesis, setThesis] = useState<StockPickThesis>("Compass Core Tranche");
	const [notes, setNotes] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	// Synchronize initial state when modal opens
	useEffect(() => {
		if (!isOpen) return;

		setError(null);
		const today = new Date().toISOString().split("T")[0];

		if (pickToEdit) {
			setTickerQuery(pickToEdit.stockCode || "");
			const matched = availableStocks.find(
				(s) =>
					s.StockCode.toUpperCase() ===
					(pickToEdit.stockCode || "").toUpperCase(),
			);
			setSelectedStock(matched || null);
			setBuyPrice(pickToEdit.buyPrice);
			setQuantityLots(pickToEdit.quantityLots || 10);
			setEntryDate(pickToEdit.entryDate || today);
			setTargetPrice(
				pickToEdit.targetPrice ? String(pickToEdit.targetPrice) : "",
			);
			setStopLossPrice(
				pickToEdit.stopLossPrice ? String(pickToEdit.stopLossPrice) : "",
			);
			setThesis(pickToEdit.thesis || "Compass Core Tranche");
			setNotes(pickToEdit.notes || "");
		} else if (stockToSimulate) {
			setTickerQuery(stockToSimulate.StockCode);
			setSelectedStock(stockToSimulate);
			setBuyPrice(stockToSimulate.Close || stockToSimulate.Previous || 1000);
			setQuantityLots(10);
			setEntryDate(today);
			setTargetPrice("");
			setStopLossPrice("");
			setThesis(
				stockToSimulate.Opportunity === "Foreign Accumulation"
					? "Foreign Flow Surge"
					: stockToSimulate.Opportunity === "Bandar Accumulation"
						? "Bandar Accumulation"
						: stockToSimulate.Opportunity === "Breakout"
							? "Breakout Momentum"
							: stockToSimulate.Opportunity === "Value"
								? "Value Accumulation"
								: "Compass Core Tranche",
			);
			setNotes("");
		} else {
			setTickerQuery("");
			setSelectedStock(null);
			setBuyPrice(0);
			setQuantityLots(10);
			setEntryDate(today);
			setTargetPrice("");
			setStopLossPrice("");
			setThesis("Compass Core Tranche");
			setNotes("");
		}
	}, [isOpen, pickToEdit, stockToSimulate, availableStocks]);

	// Filter available stocks matching query
	const searchResults = useMemo(() => {
		const q = tickerQuery.trim().toUpperCase();
		if (!q || selectedStock?.StockCode === q) return [];
		return availableStocks
			.filter(
				(s) =>
					s.StockCode.toUpperCase().includes(q) ||
					s.StockName.toUpperCase().includes(q),
			)
			.slice(0, 6);
	}, [tickerQuery, availableStocks, selectedStock]);

	if (!isOpen) return null;

	const handleSelectStock = (stock: ProcessedStock) => {
		setSelectedStock(stock);
		setTickerQuery(stock.StockCode);
		if (!buyPrice || buyPrice === 0) {
			setBuyPrice(stock.Close || stock.Previous || 1000);
		}
	};

	const handleStepPrice = (direction: "up" | "down") => {
		const tick = getIdxPriceTick(buyPrice || 1000);
		if (direction === "up") {
			setBuyPrice((prev) => prev + tick);
		} else {
			setBuyPrice((prev) => Math.max(1, prev - tick));
		}
	};

	// Calculations for preview
	const numTarget = Number(targetPrice);
	const numStop = Number(stopLossPrice);
	const simulatedOutlay = buyPrice * quantityLots * 100;

	let previewRrr: number | null = null;
	if (numTarget > buyPrice && numStop < buyPrice && buyPrice > 0) {
		const reward = numTarget - buyPrice;
		const risk = buyPrice - numStop;
		if (risk > 0) {
			previewRrr = Number((reward / risk).toFixed(2));
		}
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const finalCode = selectedStock
			? selectedStock.StockCode
			: tickerQuery.trim().toUpperCase();

		if (!finalCode) {
			setError("Please select or enter a valid stock ticker symbol");
			return;
		}

		if (!buyPrice || buyPrice <= 0) {
			setError("Entry buying price must be greater than Rp 0");
			return;
		}

		if (!quantityLots || quantityLots < 1) {
			setError("Quantity must be at least 1 lot (100 shares)");
			return;
		}

		onSave({
			id: pickToEdit?.id,
			stockCode: finalCode,
			stockName: selectedStock ? selectedStock.StockName : `${finalCode} Tbk`,
			sector: selectedStock ? selectedStock.Sector : "Unknown",
			buyPrice: Math.round(buyPrice),
			quantityLots: Math.round(quantityLots),
			entryDate: entryDate || new Date().toISOString().split("T")[0],
			targetPrice: numTarget > 0 ? Math.round(numTarget) : undefined,
			stopLossPrice: numStop > 0 ? Math.round(numStop) : undefined,
			thesis,
			notes: notes.trim() || undefined,
		});

		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden my-8"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
					<div>
						<h3 className="text-lg font-bold text-slate-900">
							{pickToEdit
								? `Edit Pick • ${pickToEdit.stockCode}`
								: "Simulate New Stockpick"}
						</h3>
						<p className="text-xs font-medium text-slate-500 mt-0.5">
							{pickToEdit
								? "Update simulated entry price, lots, or target levels"
								: "Test your stock picking acumen and entry level based on Investment Compass research"}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Modal Form Body */}
				<form onSubmit={handleSubmit} className="p-6 space-y-5">
					{error && (
						<div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
							{error}
						</div>
					)}

					{/* 1. Ticker Selection */}
					{!pickToEdit && (
						<div className="space-y-1.5 relative">
							<label
								htmlFor="modal-ticker-input"
								className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
							>
								<Search className="w-3.5 h-3.5 text-slate-400" />
								<span>Stock Ticker</span>
							</label>
							<div className="relative">
								<input
									id="modal-ticker-input"
									type="text"
									placeholder="Search ticker (e.g. BBCA, ADRO, TLKM)..."
									value={tickerQuery}
									onChange={(e) => {
										setTickerQuery(e.target.value);
										if (selectedStock) setSelectedStock(null);
									}}
									className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 uppercase placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
								/>
							</div>

							{/* Autocomplete dropdown */}
							{searchResults.length > 0 && (
								<div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-slate-100">
									{searchResults.map((stock) => (
										<button
											key={stock.StockCode}
											type="button"
											onClick={() => handleSelectStock(stock)}
											className="w-full p-3 text-left hover:bg-indigo-50/60 transition-colors flex items-center justify-between cursor-pointer"
										>
											<div>
												<span className="font-mono font-bold text-slate-900">
													{stock.StockCode}
												</span>
												<span className="text-xs text-slate-500 ml-2">
													{stock.StockName}
												</span>
											</div>
											<span className="text-xs font-mono font-bold text-slate-700">
												{fmtIDRPrice(stock.Close)}
											</span>
										</button>
									))}
								</div>
							)}

							{selectedStock && (
								<div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
									<span className="font-bold text-slate-700">
										{selectedStock.StockName}
									</span>
									<span className="text-slate-500 font-mono">
										Live: {fmtIDRPrice(selectedStock.Close)}
									</span>
								</div>
							)}
						</div>
					)}

					{/* 2. Entry Price & Lots Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Buying Price */}
						<div className="space-y-1.5">
							<div className="flex items-center justify-between">
								<label
									htmlFor="modal-buyprice-input"
									className="text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Entry Price (Rp)
								</label>
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => handleStepPrice("down")}
										className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer"
										title="Decrease by 1 BEI tick"
									>
										-
									</button>
									<button
										type="button"
										onClick={() => handleStepPrice("up")}
										className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center cursor-pointer"
										title="Increase by 1 BEI tick"
									>
										+
									</button>
								</div>
							</div>
							<input
								id="modal-buyprice-input"
								type="number"
								min="1"
								step="1"
								value={buyPrice || ""}
								onChange={(e) => setBuyPrice(Number(e.target.value))}
								placeholder="e.g. 9800"
								className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Quantity Lots */}
						<div className="space-y-1.5">
							<label
								htmlFor="modal-lots-input"
								className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
							>
								<Layers className="w-3.5 h-3.5 text-slate-400" />
								<span>Quantity (Lots)</span>
							</label>
							<input
								id="modal-lots-input"
								type="number"
								min="1"
								step="1"
								value={quantityLots || ""}
								onChange={(e) => setQuantityLots(Number(e.target.value))}
								placeholder="e.g. 10"
								className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
								required
							/>
							<p className="text-[10px] text-slate-400">
								{(quantityLots * 100).toLocaleString("id-ID")} shares • Outlay:{" "}
								{fmtIDRPrice(simulatedOutlay)}
							</p>
						</div>
					</div>

					{/* 3. Entry Date & Strategy Thesis */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Entry Date */}
						<div className="space-y-1.5">
							<label
								htmlFor="modal-date-input"
								className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
							>
								<Calendar className="w-3.5 h-3.5 text-slate-400" />
								<span>Entry Date</span>
							</label>
							<input
								id="modal-date-input"
								type="date"
								value={entryDate}
								onChange={(e) => setEntryDate(e.target.value)}
								className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
								required
							/>
						</div>

						{/* Strategy Thesis */}
						<div className="space-y-1.5">
							<label
								htmlFor="modal-thesis-select"
								className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
							>
								<Compass className="w-3.5 h-3.5 text-slate-400" />
								<span>Research Thesis</span>
							</label>
							<select
								id="modal-thesis-select"
								value={thesis}
								onChange={(e) => setThesis(e.target.value as StockPickThesis)}
								className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
							>
								{THESIS_OPTIONS.map((opt) => (
									<option key={opt} value={opt}>
										{opt}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* 4. Target Price & Stop Loss (Optional Risk:Reward Planning) */}
					<div className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-3">
						<div className="flex items-center justify-between text-xs">
							<span className="font-bold text-slate-700">
								Target &amp; Capital Protection (Optional)
							</span>
							{previewRrr && (
								<span className="font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px]">
									RRR {previewRrr}:1
								</span>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="modal-target-input"
									className="text-[10px] font-bold uppercase text-slate-500 block mb-1"
								>
									Take-Profit Target
								</label>
								<input
									id="modal-target-input"
									type="number"
									min="1"
									value={targetPrice}
									onChange={(e) => setTargetPrice(e.target.value)}
									placeholder="e.g. 11000"
									className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label
									htmlFor="modal-stop-input"
									className="text-[10px] font-bold uppercase text-slate-500 block mb-1"
								>
									Stop-Loss Floor
								</label>
								<input
									id="modal-stop-input"
									type="number"
									min="1"
									value={stopLossPrice}
									onChange={(e) => setStopLossPrice(e.target.value)}
									placeholder="e.g. 9400"
									className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
							</div>
						</div>
					</div>

					{/* 5. Notes */}
					<div className="space-y-1.5">
						<label
							htmlFor="modal-notes-input"
							className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
						>
							<FileText className="w-3.5 h-3.5 text-slate-400" />
							<span>Entry Notes &amp; Learning Thesis</span>
						</label>
						<textarea
							id="modal-notes-input"
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="e.g. Entry based on IHSG selective regime and 5-day foreign accumulation streak..."
							className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
						/>
					</div>

					{/* Modal Footer Actions */}
					<div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
						>
							<span>{pickToEdit ? "Update Pick" : "Save Simulated Pick"}</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
