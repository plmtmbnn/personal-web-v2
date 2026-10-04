"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, UserPlus, Trash2 } from "lucide-react";
import type { PitchSlot, PlayerDraft, PlayerPositionRole } from "../types";

interface DraftPlayerModalProps {
	isOpen: boolean;
	slot: PitchSlot | null;
	currentPlayer: PlayerDraft | null;
	onClose: () => void;
	onDraftPlayer: (player: PlayerDraft) => void;
	onRemovePlayer: () => void;
}

const JERSEY_COLORS = [
	{ hex: "#dc2626", label: "Red" },
	{ hex: "#2563eb", label: "Blue" },
	{ hex: "#059669", label: "Emerald" },
	{ hex: "#eab308", label: "Yellow" },
	{ hex: "#7c3aed", label: "Purple" },
	{ hex: "#0f172a", label: "Dark Slate" },
];

export default function DraftPlayerModal({
	isOpen,
	slot,
	currentPlayer,
	onClose,
	onDraftPlayer,
	onRemovePlayer,
}: DraftPlayerModalProps) {
	const reduceMotion = useReducedMotion();

	// Player form state
	const [name, setName] = useState("");
	const [number, setNumber] = useState<number>(10);
	const [role, setRole] = useState<PlayerPositionRole>("MF");
	const [club, setClub] = useState("");
	const [avatarBg, setAvatarBg] = useState("#2563eb");

	// Sync form state when slot or currentPlayer changes
	useEffect(() => {
		if (currentPlayer) {
			setName(currentPlayer.name);
			setNumber(currentPlayer.number);
			setRole(currentPlayer.role);
			setClub(currentPlayer.club || "");
			setAvatarBg(currentPlayer.avatarBg || "#2563eb");
		} else if (slot) {
			setName("");
			setNumber(slot.defaultNumber);
			setRole(slot.role);
			setClub("");
			setAvatarBg("#2563eb");
		}
	}, [slot, currentPlayer]);

	// Lock body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		const player: PlayerDraft = {
			id: currentPlayer?.id || `player-${Date.now()}`,
			name: name.trim(),
			number: Number(number) || 10,
			role: role,
			club: club.trim() || undefined,
			avatarBg: avatarBg,
		};

		onDraftPlayer(player);
		onClose();
	};

	if (!isOpen || !slot) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
				{/* Backdrop */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
				/>

				{/* Modal Container */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 16 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden z-10 my-auto"
				>
					{/* Modal Header */}
					<div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shadow-2xs">
								{slot.label}
							</div>
							<div>
								<h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
									{currentPlayer ? "Edit Position" : "Draft Player"}:{" "}
									{slot.label}
								</h3>
								<p className="text-xs text-slate-500 font-medium">
									Slot Role:{" "}
									<span className="font-bold text-slate-700">{slot.role}</span>{" "}
									• Default #{slot.defaultNumber}
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={onClose}
							className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
							aria-label="Close dialog"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Player Form */}
					<form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
						{/* Player Name */}
						<div>
							<label
								htmlFor="player-name"
								className="block text-xs font-bold text-slate-700 mb-1"
							>
								Player Name <span className="text-rose-500">*</span>
							</label>
							<input
								id="player-name"
								type="text"
								required
								autoFocus
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Steven Gerrard"
								className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
							/>
						</div>

						{/* Number & Role */}
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="player-number"
									className="block text-xs font-bold text-slate-700 mb-1"
								>
									Squad Number
								</label>
								<input
									id="player-number"
									type="number"
									min={1}
									max={99}
									value={number}
									onChange={(e) => setNumber(Number(e.target.value))}
									className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
								/>
							</div>

							<div>
								<label
									htmlFor="player-role"
									className="block text-xs font-bold text-slate-700 mb-1"
								>
									Position Role
								</label>
								<select
									id="player-role"
									value={role}
									onChange={(e) =>
										setRole(e.target.value as PlayerPositionRole)
									}
									className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 cursor-pointer"
								>
									<option value="GK">Goalkeeper (GK)</option>
									<option value="DF">Defender (DF)</option>
									<option value="MF">Midfielder (MF)</option>
									<option value="FW">Forward (FW)</option>
								</select>
							</div>
						</div>

						{/* Club / Team */}
						<div>
							<label
								htmlFor="player-club"
								className="block text-xs font-bold text-slate-700 mb-1"
							>
								Club or Team (Optional)
							</label>
							<input
								id="player-club"
								type="text"
								value={club}
								onChange={(e) => setClub(e.target.value)}
								placeholder="e.g. Liverpool FC"
								className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
							/>
						</div>

						{/* Jersey Color Accent */}
						<div>
							<p className="block text-xs font-bold text-slate-700 mb-2">
								Jersey Color Accent
							</p>
							<div className="flex items-center gap-2.5">
								{JERSEY_COLORS.map(({ hex, label }) => (
									<button
										key={hex}
										type="button"
										onClick={() => setAvatarBg(hex)}
										title={label}
										className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
											avatarBg === hex
												? "scale-115 border-slate-900 shadow-xs ring-2 ring-slate-900/20"
												: "border-transparent hover:scale-105"
										}`}
										style={{ backgroundColor: hex }}
										aria-label={label}
									/>
								))}
							</div>
						</div>

						{/* Submit button */}
						<button
							type="submit"
							className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-98 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
						>
							<UserPlus className="w-3.5 h-3.5" />
							{currentPlayer ? "Update Position" : "Assign to Position"}
						</button>
					</form>

					{/* Modal Footer with Clear Slot if player assigned */}
					{currentPlayer && (
						<div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
							<p className="text-xs text-slate-500 font-medium">
								Currently assigned:{" "}
								<span className="font-bold text-slate-900">
									{currentPlayer.name} (#{currentPlayer.number})
								</span>
							</p>
							<button
								type="button"
								onClick={() => {
									onRemovePlayer();
									onClose();
								}}
								className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
							>
								<Trash2 className="w-3 h-3 text-rose-500" />
								Clear Slot
							</button>
						</div>
					)}
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
