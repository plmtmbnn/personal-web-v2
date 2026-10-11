"use client";

import { useState, useEffect } from "react";
import {
	X,
	CheckCircle2,
	Target,
	AlertOctagon,
	ShieldAlert,
	ArrowUpRight,
	ArrowDownRight,
	FileText,
} from "lucide-react";
import type {
	StockPickWithMetrics,
	StockPickExitReason,
	ClosePickPayload,
} from "../../types";
import { fmtIDRPrice, fmtSignedPct } from "../../stockpicks";

interface CloseStockpickModalProps {
	isOpen: boolean;
	onClose: () => void;
	pick: StockPickWithMetrics | null;
	onConfirmClose: (id: string, payload: ClosePickPayload) => void;
}

const EXIT_REASONS: Array<{
	value: StockPickExitReason;
	label: string;
	desc: string;
	icon: React.ElementType;
}> = [
	{
		value: "target_hit",
		label: "Target Hit",
		desc: "Reached planned take-profit level",
		icon: Target,
	},
	{
		value: "trailing_stop",
		label: "Trailing Stop",
		desc: "Protected peak gains as momentum slowed",
		icon: CheckCircle2,
	},
	{
		value: "manual_profit",
		label: "Discretionary Profit",
		desc: "Early profit capture before target",
		icon: ArrowUpRight,
	},
	{
		value: "stop_loss_hit",
		label: "Stop Loss Hit",
		desc: "Strictly executed risk floor",
		icon: AlertOctagon,
	},
	{
		value: "thesis_invalidated",
		label: "Thesis Invalidated",
		desc: "Catalyst failed, fundamentals broke, or regime turned",
		icon: ShieldAlert,
	},
	{
		value: "manual_cut",
		label: "Discretionary Cut",
		desc: "Closed early to free capital or reduce exposure",
		icon: ArrowDownRight,
	},
];

export function CloseStockpickModal({
	isOpen,
	onClose,
	pick,
	onConfirmClose,
}: CloseStockpickModalProps) {
	const [exitPrice, setExitPrice] = useState<number>(0);
	const [exitReason, setExitReason] =
		useState<StockPickExitReason>("target_hit");
	const [exitNotes, setExitNotes] = useState<string>("");

	useEffect(() => {
		if (pick) {
			const initialExit =
				pick.currentPrice > 0 ? pick.currentPrice : pick.buyPrice;
			setExitPrice(initialExit);
			setExitNotes("");

			// Auto-suggest reason based on targets
			if (pick.targetPrice && initialExit >= pick.targetPrice) {
				setExitReason("target_hit");
			} else if (pick.stopLossPrice && initialExit <= pick.stopLossPrice) {
				setExitReason("stop_loss_hit");
			} else if (initialExit >= pick.buyPrice) {
				setExitReason("manual_profit");
			} else {
				setExitReason("manual_cut");
			}
		}
	}, [pick]);

	if (!isOpen || !pick) return null;

	const totalShares = (pick.quantityLots || 1) * 100;
	const realizedPnlNominal = (exitPrice - pick.buyPrice) * totalShares;
	const realizedPnlPct =
		pick.buyPrice > 0 ? ((exitPrice - pick.buyPrice) / pick.buyPrice) * 100 : 0;
	const isProfitable = realizedPnlNominal >= 0;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (exitPrice <= 0) return;

		onConfirmClose(pick.id, {
			exitPrice,
			exitReason,
			exitNotes: exitNotes.trim() || undefined,
			exitDate: new Date().toISOString().split("T")[0],
		});
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
			<div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
				{/* Modal Header */}
				<div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
					<div>
						<div className="flex items-center gap-2">
							<span className="font-mono font-bold text-lg text-slate-900">
								{pick.stockCode}
							</span>
							<span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
								{pick.sector}
							</span>
						</div>
						<p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
							{pick.stockName} • Close & Journal Position
						</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
						aria-label="Close modal"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Modal Content */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 overflow-y-auto p-6 space-y-5"
				>
					{/* Result Preview Strip */}
					<div
						className={`p-4 rounded-2xl border transition-colors ${
							isProfitable
								? "bg-emerald-50/70 border-emerald-200/70"
								: "bg-rose-50/70 border-rose-200/70"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-xs font-semibold text-slate-600">
								Simulated Realized Outcome
							</span>
							<span
								className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
									isProfitable
										? "bg-emerald-100 text-emerald-800"
										: "bg-rose-100 text-rose-800"
								}`}
							>
								{fmtSignedPct(realizedPnlPct)}
							</span>
						</div>

						<div className="flex items-baseline justify-between">
							<span
								className={`text-2xl font-bold font-mono tracking-tight ${
									isProfitable ? "text-emerald-700" : "text-rose-700"
								}`}
							>
								{realizedPnlNominal >= 0 ? "+" : ""}
								{fmtIDRPrice(realizedPnlNominal)}
							</span>
							<span className="text-xs text-slate-500 font-medium">
								{pick.quantityLots} Lots ({totalShares.toLocaleString("id-ID")}{" "}
								Shares)
							</span>
						</div>

						{/* Watermark Reflection */}
						<div className="mt-3 pt-3 border-t border-slate-200/50 grid grid-cols-3 gap-2 text-center text-xs">
							<div>
								<span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
									Entry Price
								</span>
								<span className="font-mono font-semibold text-slate-700">
									{fmtIDRPrice(pick.buyPrice)}
								</span>
							</div>
							<div>
								<span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
									Peak Excursion
								</span>
								<span className="font-mono font-semibold text-emerald-600">
									{fmtSignedPct(pick.peakGainPct)}
								</span>
							</div>
							<div>
								<span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
									Max Drawdown
								</span>
								<span className="font-mono font-semibold text-rose-600">
									{fmtSignedPct(pick.maxDrawdownPct)}
								</span>
							</div>
						</div>
					</div>

					{/* Exit Price Input */}
					<div>
						<label
							htmlFor="close-exit-price"
							className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
						>
							Exit Realization Price (IDR)
						</label>
						<div className="relative">
							<span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
								Rp
							</span>
							<input
								id="close-exit-price"
								type="number"
								min="1"
								step="1"
								value={exitPrice || ""}
								onChange={(e) => setExitPrice(Number(e.target.value) || 0)}
								className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
								required
							/>
						</div>
						<p className="text-[11px] text-slate-400 mt-1">
							Defaulted to latest session quote. Adjust if you simulated an
							earlier or limit fill.
						</p>
					</div>

					{/* Exit Reason Radio Group */}
					<div>
						<span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
							Execution & Discipline Reason
						</span>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{EXIT_REASONS.map((r) => {
								const Icon = r.icon;
								const isSelected = exitReason === r.value;
								return (
									<button
										key={r.value}
										type="button"
										onClick={() => setExitReason(r.value)}
										className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
											isSelected
												? "bg-slate-900 text-white border-slate-900 shadow-xs"
												: "bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700"
										}`}
									>
										<Icon
											className={`w-4 h-4 shrink-0 mt-0.5 ${
												isSelected ? "text-white" : "text-slate-400"
											}`}
										/>
										<div>
											<span className="block text-xs font-bold leading-tight">
												{r.label}
											</span>
											<span
												className={`block text-[10px] mt-0.5 line-clamp-1 ${
													isSelected ? "text-slate-300" : "text-slate-400"
												}`}
											>
												{r.desc}
											</span>
										</div>
									</button>
								);
							})}
						</div>
					</div>

					{/* Reflection Notes */}
					<div>
						<label
							htmlFor="close-exit-notes"
							className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
						>
							Post-Trade Reflection & Retrospective Notes
						</label>
						<div className="relative">
							<FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
							<textarea
								id="close-exit-notes"
								rows={3}
								value={exitNotes}
								onChange={(e) => setExitNotes(e.target.value)}
								placeholder="What did you learn? Did you stick to your initial Investment Compass thesis? Did emotional friction occur?"
								className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all resize-none"
							/>
						</div>
					</div>

					{/* Modal Actions */}
					<div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
						>
							Cancel
						</button>
						<button
							type="submit"
							className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
								isProfitable
									? "bg-emerald-600 hover:bg-emerald-700 text-white"
									: "bg-slate-900 hover:bg-slate-800 text-white"
							}`}
						>
							Confirm Close Position
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
