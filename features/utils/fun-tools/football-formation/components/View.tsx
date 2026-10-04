"use client";

import { useState, useEffect, useMemo } from "react";
import { Trophy, RotateCcw, Sliders } from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import type {
	FormationDefinition,
	PitchSlot,
	PlayerDraft,
	TeamTactics,
} from "../types";
import { FORMATIONS } from "../constants";
import FootballPitch from "./FootballPitch";
import TacticalControls from "./TacticalControls";
import BenchPanel from "./BenchPanel";
import DraftPlayerModal from "./DraftPlayerModal";
import CustomFormationModal from "./CustomFormationModal";
import {
	downloadTacticsImage,
	copyTacticsToClipboard,
	exportTacticsToBlob,
} from "../utils/pitch-exporter";

const STORAGE_KEY = "football_formation_tactics_v1";
const CUSTOM_STORAGE_KEY = "football_custom_formations_v1";

export default function FootballFormationView() {
	// ── Tactical State ────────────────────────────────────────────────────────
	const [tactics, setTactics] = useState<TeamTactics>({
		teamName: "Polma XI",
		manager: "Polma Tambunan",
		formation: "4-3-3",
		theme: "classic-emerald",
		captainId: undefined,
	});

	const [customFormations, setCustomFormations] = useState<
		Record<string, FormationDefinition>
	>({});
	const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

	const [slots, setSlots] = useState<Record<string, PlayerDraft | null>>({});
	const [bench, setBench] = useState<PlayerDraft[]>([]);
	const [activeDraftSlot, setActiveDraftSlot] = useState<PitchSlot | null>(
		null,
	);
	const [isExporting, setIsExporting] = useState(false);
	const [isHydrated, setIsHydrated] = useState(false);

	const allFormations: Record<string, FormationDefinition> = useMemo(() => {
		return { ...FORMATIONS, ...customFormations };
	}, [customFormations]);

	const activeFormation =
		allFormations[tactics.formation] || FORMATIONS["4-3-3"];

	// ── LocalStorage Hydration & Persistence ──────────────────────────────────
	useEffect(() => {
		try {
			const savedCustom = localStorage.getItem(CUSTOM_STORAGE_KEY);
			if (savedCustom) {
				const parsedCustom = JSON.parse(savedCustom);
				if (parsedCustom && typeof parsedCustom === "object") {
					setCustomFormations(parsedCustom);
				}
			}

			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				const parsed = JSON.parse(saved);
				if (parsed.tactics) setTactics(parsed.tactics);
				if (parsed.slots) setSlots(parsed.slots);
				if (parsed.bench) setBench(parsed.bench);
			} else {
				// Initialize clean empty slots ready for manual draft
				const initialSlots: Record<string, PlayerDraft | null> = {};
				for (const slot of activeFormation.slots) {
					initialSlots[slot.id] = null;
				}
				setSlots(initialSlots);
			}
		} catch {
			// Fallback silent
		} finally {
			setIsHydrated(true);
		}
	}, []);

	useEffect(() => {
		if (!isHydrated) return;
		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({ tactics, slots, bench }),
			);
		} catch {
			// Ignore quota exceeded errors
		}
	}, [tactics, slots, bench, isHydrated]);

	// ── Telemetry & Metrics ───────────────────────────────────────────────────
	const draftedCount = useMemo(() => {
		return Object.values(slots).filter(Boolean).length;
	}, [slots]);

	// ── Handlers ──────────────────────────────────────────────────────────────
	const handleUpdateTactics = (updates: Partial<TeamTactics>) => {
		setTactics((prev) => ({ ...prev, ...updates }));
	};

	const handleSaveCustomFormation = (formation: FormationDefinition) => {
		setCustomFormations((prev) => {
			const next = { ...prev, [formation.id]: formation };
			try {
				localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
			} catch {
				// Ignore quota exceeded
			}
			return next;
		});

		// Switch to newly created custom formation
		setTactics((prev) => ({ ...prev, formation: formation.id }));
	};

	const handleDeleteCustomFormation = (formationId: string) => {
		setCustomFormations((prev) => {
			const next = { ...prev };
			delete next[formationId];
			try {
				localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(next));
			} catch {
				// Ignore quota exceeded
			}
			return next;
		});

		if (tactics.formation === formationId) {
			setTactics((prev) => ({ ...prev, formation: "4-3-3" }));
		}
	};

	const handleDraftPlayer = (player: PlayerDraft) => {
		if (!activeDraftSlot) return;
		setSlots((prev) => ({
			...prev,
			[activeDraftSlot.id]: player,
		}));

		// Default captain to first drafted player if none chosen
		if (!tactics.captainId) {
			setTactics((prev) => ({ ...prev, captainId: player.id }));
		}
	};

	const handleRemovePlayer = (slotId: string) => {
		setSlots((prev) => {
			const next = { ...prev };
			const removed = next[slotId];
			next[slotId] = null;
			if (removed && removed.id === tactics.captainId) {
				setTactics((t) => ({ ...t, captainId: undefined }));
			}
			return next;
		});
	};

	const handleToggleCaptain = (playerId: string) => {
		setTactics((prev) => ({
			...prev,
			captainId: prev.captainId === playerId ? undefined : playerId,
		}));
	};

	const handleSwapSlots = (slotId1: string, slotId2: string) => {
		setSlots((prev) => {
			const player1 = prev[slotId1] || null;
			const player2 = prev[slotId2] || null;
			return {
				...prev,
				[slotId1]: player2,
				[slotId2]: player1,
			};
		});
	};

	const handleClearAll = () => {
		const empty: Record<string, PlayerDraft | null> = {};
		for (const s of activeFormation.slots) {
			empty[s.id] = null;
		}
		setSlots(empty);
		setTactics((t) => ({ ...t, captainId: undefined }));
	};

	// ── Export Actions ────────────────────────────────────────────────────────
	const handleDownload = async () => {
		setIsExporting(true);
		try {
			await downloadTacticsImage(
				{
					tactics,
					formation: activeFormation,
					slots,
					bench,
					scale: 2,
				},
				`${tactics.teamName.toLowerCase().replace(/\s+/g, "-")}-formation.png`,
			);
		} finally {
			setIsExporting(false);
		}
	};

	const handleCopy = async (): Promise<boolean> => {
		setIsExporting(true);
		try {
			return await copyTacticsToClipboard({
				tactics,
				formation: activeFormation,
				slots,
				bench,
				scale: 2,
			});
		} finally {
			setIsExporting(false);
		}
	};

	const handleShare = async () => {
		if (typeof navigator === "undefined" || !navigator.share) return;
		setIsExporting(true);
		try {
			const blob = await exportTacticsToBlob({
				tactics,
				formation: activeFormation,
				slots,
				bench,
				scale: 2,
			});
			const file = new File(
				[blob],
				`${tactics.teamName.toLowerCase().replace(/\s+/g, "-")}.png`,
				{ type: "image/png" },
			);

			if (navigator.canShare?.({ files: [file] })) {
				await navigator.share({
					title: `${tactics.teamName} - Tactical Formation`,
					text: `Check out our matchday line-up (${tactics.formation}) managed by ${tactics.manager}!`,
					files: [file],
				});
			} else {
				await navigator.share({
					title: `${tactics.teamName} - Tactical Formation`,
					text: `Tactical setup: ${tactics.formation} managed by ${tactics.manager}.`,
					url: window.location.href,
				});
			}
		} catch {
			// User canceled or unsupported
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-6 sm:space-y-8">
				{/* ── Canonical 3-Tier Modern Floating Card Header ── */}
				<UtilHeader
					title="Football Formation & Draft Studio"
					description="Interactive tactical board to draft players, design matchday formations, organize substitutes, and export high-resolution squad sheets."
					category={{
						label: "Productivity & Lifestyle",
						sublabel: "tactical formation planner",
						color: "indigo",
					}}
					icon={Trophy}
					badges={
						<div className="flex items-center gap-1.5 flex-wrap">
							<span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold tracking-tight shadow-2xs">
								{draftedCount}/11 Drafted
							</span>
							<span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-bold font-mono">
								{tactics.formation}
							</span>
						</div>
					}
					actions={
						<div className="flex items-center justify-between w-full gap-2 flex-wrap">
							<div className="flex items-center gap-2 flex-wrap">
								<button
									type="button"
									onClick={() => setIsCustomModalOpen(true)}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
								>
									<Sliders className="w-3.5 h-3.5" />+ Custom Formation
								</button>
							</div>

							<button
								type="button"
								onClick={handleClearAll}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-rose-600 border border-slate-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
							>
								<RotateCcw className="w-3.5 h-3.5" />
								Reset Pitch
							</button>
						</div>
					}
				/>

				{/* ── Main Interactive Board Layout ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
					{/* Left Column: Interactive Pitch (Col 1-7) */}
					<div className="lg:col-span-7 space-y-4">
						<div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
							<div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
								<div>
									<h2 className="text-base font-extrabold text-slate-900 tracking-tight">
										{tactics.teamName || "Matchday Line-Up"}
									</h2>
									<p className="text-xs text-slate-500 font-medium">
										{tactics.formation} ({activeFormation.name})
									</p>
								</div>
								<div className="text-right">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
										Pitch Interaction
									</span>
									<span className="text-xs font-bold text-indigo-600">
										Click position to draft
									</span>
								</div>
							</div>

							<FootballPitch
								formation={activeFormation}
								slots={slots}
								tactics={tactics}
								onSelectSlot={(slot) => setActiveDraftSlot(slot)}
								onRemovePlayer={handleRemovePlayer}
								onToggleCaptain={handleToggleCaptain}
								onSwapSlots={handleSwapSlots}
							/>
						</div>
					</div>

					{/* Right Column: Tactical Settings & Bench (Col 8-12) */}
					<div className="lg:col-span-5 space-y-6">
						<TacticalControls
							tactics={tactics}
							formations={allFormations}
							onUpdateTactics={handleUpdateTactics}
							onOpenCustomModal={() => setIsCustomModalOpen(true)}
							onDeleteCustomFormation={handleDeleteCustomFormation}
							onDownload={handleDownload}
							onCopy={handleCopy}
							onShare={handleShare}
							isExporting={isExporting}
						/>

						<BenchPanel
							bench={bench}
							onAddBenchPlayer={(p) => setBench((prev) => [...prev, p])}
							onRemoveBenchPlayer={(id) =>
								setBench((prev) => prev.filter((p) => p.id !== id))
							}
							onClearAll={handleClearAll}
						/>
					</div>
				</div>
			</div>

			{/* ── Player Draft Modal ── */}
			<DraftPlayerModal
				isOpen={!!activeDraftSlot}
				slot={activeDraftSlot}
				currentPlayer={
					activeDraftSlot ? (slots[activeDraftSlot.id] ?? null) : null
				}
				onClose={() => setActiveDraftSlot(null)}
				onDraftPlayer={handleDraftPlayer}
				onRemovePlayer={() => {
					if (activeDraftSlot) handleRemovePlayer(activeDraftSlot.id);
				}}
			/>

			{/* ── Custom Formation Modal ── */}
			<CustomFormationModal
				isOpen={isCustomModalOpen}
				onClose={() => setIsCustomModalOpen(false)}
				onSaveFormation={handleSaveCustomFormation}
			/>
		</main>
	);
}
