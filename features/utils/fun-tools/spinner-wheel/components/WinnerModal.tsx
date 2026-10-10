"use client";

import { useMemo, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Trophy, Play, Trash2, X } from "lucide-react";
import type { WheelItem } from "../types";

// ─── Lightweight Confetti Animation ──────────────────────────────────────────

function Confetti() {
	const pieces = useMemo(
		() =>
			Array.from({ length: 40 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				color: ["#fbbf24", "#f43f5e", "#10b981", "#3b82f6", "#8b5cf6"][
					Math.floor(Math.random() * 5)
				],
				delay: Math.random() * 0.5,
				size: 6 + Math.random() * 6,
				duration: 2.2 + Math.random() * 1.2,
			})),
		[],
	);

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
			{pieces.map((p) => (
				<motion.div
					key={`confetti-${p.id}`}
					className="absolute rounded-xs shadow-2xs"
					style={{
						left: `${p.x}%`,
						top: "-2%",
						width: p.size,
						height: p.size,
						background: p.color,
					}}
					initial={{ y: 0, opacity: 1, rotate: 0 }}
					animate={{
						y: "105vh",
						opacity: [1, 1, 0],
						rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
						x: (Math.random() - 0.5) * 200,
					}}
					transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
				/>
			))}
		</div>
	);
}

// ─── Modal Dialog ────────────────────────────────────────────────────────────

interface WinnerModalProps {
	winner: WheelItem | null;
	onClose: () => void;
	onSpinAgain: () => void;
	onRemoveWinner: () => void;
}

export default function WinnerModal({
	winner,
	onClose,
	onSpinAgain,
	onRemoveWinner,
}: WinnerModalProps) {
	const reduceMotion = useReducedMotion();

	// Support Esc key to dismiss
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		if (winner) {
			window.addEventListener("keydown", handleKeyDown);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [winner, onClose]);

	return (
		<AnimatePresence>
			{winner && (
				<motion.div
					key="winner-modal-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
					onClick={onClose}
				>
					<Confetti />
					<motion.div
						key="winner-modal-card"
						initial={reduceMotion ? false : { scale: 0.9, y: 16 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.95, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
						className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 max-w-sm sm:max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
					>
						{/* Close Button */}
						<button
							type="button"
							onClick={onClose}
							className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
							aria-label="Close dialog"
						>
							<X className="w-4 h-4" />
						</button>

						{/* Trophy Anchor Squircle */}
						<div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
							<Trophy className="w-8 h-8 text-amber-500" />
						</div>

						{/* Winner Announcement Body */}
						<div className="space-y-2">
							<span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 font-mono">
								Winning Selection
							</span>
							<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug break-words">
								{winner.text}
							</h2>
							<div className="flex items-center justify-center gap-1.5 pt-1">
								<span
									className="w-2.5 h-2.5 rounded-full shadow-2xs"
									style={{ background: winner.color }}
								/>
								<span className="text-xs font-medium text-slate-500 font-mono">
									Selected by Wheel
								</span>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col gap-2 pt-2">
							<button
								type="button"
								onClick={() => {
									onClose();
									onSpinAgain();
								}}
								className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
							>
								<Play className="w-4 h-4 fill-current text-white" />
								<span>Spin Again</span>
							</button>
							<button
								type="button"
								onClick={() => {
									onRemoveWinner();
									onClose();
								}}
								className="w-full py-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
							>
								<Trash2 className="w-3.5 h-3.5 text-rose-600" />
								<span className="truncate">
									Remove &ldquo;{winner.text}&rdquo;
								</span>
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
