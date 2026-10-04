"use client";

import { useState } from "react";
import { Plus, X, Users, Trash2 } from "lucide-react";
import type { PlayerDraft } from "../types";

interface BenchPanelProps {
	bench: PlayerDraft[];
	onAddBenchPlayer: (player: PlayerDraft) => void;
	onRemoveBenchPlayer: (playerId: string) => void;
	onClearAll: () => void;
}

export default function BenchPanel({
	bench,
	onAddBenchPlayer,
	onRemoveBenchPlayer,
	onClearAll,
}: BenchPanelProps) {
	const [isAddingBench, setIsAddingBench] = useState(false);
	const [benchName, setBenchName] = useState("");
	const [benchNumber, setBenchNumber] = useState(12);
	const [benchRole, setBenchRole] = useState<"GK" | "DF" | "MF" | "FW">("MF");

	const handleAddCustomBench = (e: React.FormEvent) => {
		e.preventDefault();
		if (!benchName.trim()) return;

		onAddBenchPlayer({
			id: `bench-${Date.now()}`,
			name: benchName.trim(),
			number: Number(benchNumber) || 12,
			role: benchRole,
			avatarBg: "#475569",
		});

		setBenchName("");
		setIsAddingBench(false);
	};

	return (
		<div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
			{/* Header: Squad Operations & Bench */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
						<Users className="w-4 h-4" />
					</div>
					<div>
						<h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
							Squad Operations & Bench
						</h3>
						<p className="text-xs text-slate-500 font-medium">
							Substitutes bench ({bench.length}/7) & line-up tools
						</p>
					</div>
				</div>

				{/* Quick Actions (Clear) */}
				<div className="flex items-center gap-1.5 flex-wrap">
					<button
						type="button"
						onClick={onClearAll}
						className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
						title="Clear all starting players"
					>
						<Trash2 className="w-3 h-3 text-rose-500" />
						Clear All
					</button>
				</div>
			</div>

			{/* Substitutes Grid */}
			<div className="space-y-3">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
					{bench.map((player) => (
						<div
							key={player.id}
							className="relative group flex items-center justify-between p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all shadow-2xs"
						>
							<div className="flex items-center gap-2 min-w-0">
								<span className="w-6 h-6 rounded-full bg-slate-800 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
									{player.number}
								</span>
								<div className="min-w-0">
									<p className="text-xs font-bold text-slate-900 truncate">
										{player.name}
									</p>
									<p className="text-[10px] text-slate-500">{player.role}</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() => onRemoveBenchPlayer(player.id)}
								className="text-slate-400 hover:text-rose-600 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
								aria-label={`Remove ${player.name}`}
							>
								<X className="w-3.5 h-3.5" />
							</button>
						</div>
					))}

					{/* Add Substitute Button (up to 7) */}
					{bench.length < 7 && !isAddingBench && (
						<button
							type="button"
							onClick={() => setIsAddingBench(true)}
							className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-500 text-xs font-bold transition-all cursor-pointer active:scale-95"
						>
							<Plus className="w-3.5 h-3.5" />
							Add Substitute
						</button>
					)}
				</div>

				{/* Quick Form to Add Bench Player */}
				{isAddingBench && (
					<form
						onSubmit={handleAddCustomBench}
						className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-slate-700">
								Add Substitute Player
							</span>
							<button
								type="button"
								onClick={() => setIsAddingBench(false)}
								className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
							>
								Cancel
							</button>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
							<input
								type="text"
								required
								value={benchName}
								onChange={(e) => setBenchName(e.target.value)}
								placeholder="Player name..."
								className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
							<input
								type="number"
								min={1}
								max={99}
								value={benchNumber}
								onChange={(e) => setBenchNumber(Number(e.target.value))}
								placeholder="Number..."
								className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							/>
							<select
								value={benchRole}
								onChange={(e) =>
									setBenchRole(e.target.value as "GK" | "DF" | "MF" | "FW")
								}
								className="w-full bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
							>
								<option value="GK">GK</option>
								<option value="DF">DF</option>
								<option value="MF">MF</option>
								<option value="FW">FW</option>
							</select>
						</div>

						<button
							type="submit"
							className="w-full py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-colors"
						>
							Add to Bench
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
