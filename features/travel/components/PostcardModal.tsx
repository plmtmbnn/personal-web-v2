"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	Copy,
	Check,
	Download,
	Loader2,
	Link2,
	RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";
import { usePostcardActions } from "../hooks/usePostcardActions";

/* ═══════════════════════════════════════════════════════════════════════
 * Animation presets
 * ═══════════════════════════════════════════════════════════════════ */

const SPRING_MODAL = { type: "spring" as const, stiffness: 320, damping: 28 };

/** Format visit date for display */
function formatVisitDate(visitedDate: string | undefined): string {
	if (!visitedDate) return "Pending";
	const [year, month] = visitedDate.split("-");
	const monthNames = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

/** Get 2-letter ISO country code for flag CDN */
function getCountryCode(country: string): string | null {
	const codes: Record<string, string> = {
		Indonesia: "id",
		Thailand: "th",
		Vietnam: "vn",
		Japan: "jp",
		"United Kingdom": "gb",
		Netherlands: "nl",
		Iceland: "is",
		China: "cn",
		Malaysia: "my",
		Singapore: "sg",
		France: "fr",
	};
	return codes[country] || null;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Main Modal
 * ═══════════════════════════════════════════════════════════════════ */

interface PostcardModalProps {
	destination: Destination | null;
	onClose: () => void;
}

export default function PostcardModal({
	destination,
	onClose,
}: PostcardModalProps) {
	const reduceMotion = useReducedMotion();
	const modalRef = useRef<HTMLDivElement>(null);
	const [side, setSide] = useState<"front" | "back">("front");

	const {
		handleCopy,
		handleDownload,
		handleCopyLink,
		isCopying,
		isDownloading,
		isCopied,
		isLinkCopied,
	} = usePostcardActions(destination);

	// ── Body scroll lock ──
	useEffect(() => {
		if (!destination) return;
		const orig = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		setSide("front"); // reset side when opening
		return () => {
			document.body.style.overflow = orig;
		};
	}, [destination]);

	// ── Escape key ──
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	// ── Focus trap ──
	const handleKeyDownTrap = useCallback((e: React.KeyboardEvent) => {
		if (e.key !== "Tab" || !modalRef.current) return;
		const focusable = modalRef.current.querySelectorAll<HTMLElement>(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
		);
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (e.shiftKey) {
			if (document.activeElement === first) {
				e.preventDefault();
				last.focus();
			}
		} else {
			if (document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		}
	}, []);

	if (!destination) return null;

	const isVisited = destination.isVisited;

	return (
		<AnimatePresence>
			<div
				className="fixed inset-0 z-[60] flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden"
				role="dialog"
				aria-modal="true"
				aria-labelledby="journal-title"
				ref={modalRef}
				onKeyDown={handleKeyDownTrap}
			>
				{/* Backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-black/80 backdrop-blur-sm"
				/>

				{/* Floating Close Button */}
				<motion.button
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ delay: 0.2 }}
					onClick={onClose}
					className="absolute top-4 right-4 sm:top-6 sm:right-6 z-[70] p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
					aria-label="Close postcard"
				>
					<X className="w-5 h-5" />
				</motion.button>

				{/* Main Postcard Wrapper (Full Height Mode) */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.93, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={reduceMotion ? undefined : { opacity: 0, scale: 0.93, y: 12 }}
					transition={SPRING_MODAL}
					className="relative w-full h-full max-w-6xl z-10 m-auto flex flex-col items-center justify-center gap-4 sm:gap-6 py-6"
					style={{ perspective: "2000px" }}
				>
					{/* Side Toggle */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex bg-white/10 p-1.5 rounded-full backdrop-blur-md gap-1 shrink-0"
					>
						<button
							type="button"
							onClick={() => setSide("front")}
							className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${side === "front" ? "bg-white text-slate-900 shadow-md scale-100" : "text-white hover:bg-white/20 scale-95"}`}
						>
							Front
						</button>
						<button
							type="button"
							onClick={() => setSide("back")}
							className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${side === "back" ? "bg-white text-slate-900 shadow-md scale-100" : "text-white hover:bg-white/20 scale-95"}`}
						>
							Back
						</button>
					</motion.div>

					{/* 1. The Postcard 3D Container Wrapper */}
					<div className="relative flex flex-col justify-center items-center w-full flex-1 min-h-0 py-1">
						<motion.div
							className="relative cursor-pointer group aspect-[8/5] w-full m-auto"
							style={{
								aspectRatio: "8/5",
								maxHeight: "min(52vh, 480px)",
								maxWidth: "min(100%, calc(min(52vh, 480px) * 1.6))",
								transformStyle: "preserve-3d",
							}}
							animate={{ rotateY: side === "front" ? 0 : 180 }}
							transition={{ type: "spring", stiffness: 220, damping: 25 }}
							onClick={() => setSide((s) => (s === "front" ? "back" : "front"))}
						>
							{/* FRONT FACE */}
							<div
								className="absolute inset-0 w-full h-full bg-[#FDFBF7] p-2.5 sm:p-[18px] rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50 flex flex-col"
								style={{
									backfaceVisibility: "hidden",
									WebkitBackfaceVisibility: "hidden",
								}}
							>
								{/* Inner photo card */}
								<div className="relative flex-1 rounded-sm sm:rounded-md overflow-hidden bg-slate-200">
									<Image
										src={destination.imageUrl
											.replace(/w=\d+/, "w=1600")
											.replace(/h=\d+/, "h=1000")}
										alt={`${destination.name}, ${destination.location}`}
										fill
										priority
										className={`object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02] ${
											!isVisited ? "grayscale contrast-105 brightness-95" : ""
										}`}
									/>

									{!isVisited && (
										<div className="absolute inset-0 bg-amber-900/10 mix-blend-multiply" />
									)}
								</div>
								{/* Caption bottom */}
								<div className="h-5 sm:h-[30px] flex justify-between items-end pb-0 sm:pb-1 px-1 text-slate-500 font-bold text-[7px] sm:text-[9px] tracking-widest uppercase select-none">
									<span>
										{destination.type === "domestic" ? "DOMESTIC" : "INTL"} —{" "}
										{destination.name}
									</span>
									<span>{destination.location}</span>
								</div>
							</div>

							{/* BACK FACE */}
							<div
								className="absolute inset-0 w-full h-full bg-[#FDFBF7] p-3 sm:p-8 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50 flex flex-row"
								style={{
									transform: "rotateY(180deg)",
									backfaceVisibility: "hidden",
									WebkitBackfaceVisibility: "hidden",
								}}
							>
								{/* Vertical Divider */}
								<div className="absolute top-4 sm:top-12 bottom-4 sm:bottom-12 left-1/2 w-px bg-black/15 -translate-x-1/2" />
								<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[4px] sm:text-[7px] font-bold text-black/30 tracking-[0.2em] whitespace-nowrap pointer-events-none select-none">
									C-C.CO <span className="mx-2">·</span> TRAVEL SERIES
								</div>

								{/* Left Pane (Handwriting) */}
								<div className="flex-1 pr-3 sm:pr-10 relative flex flex-col justify-start pt-1 sm:pt-4 overflow-hidden">
									<p
										className="text-[11px] sm:text-2xl md:text-3xl text-[#1c1917] leading-tight sm:leading-relaxed -rotate-1 select-none"
										style={{
											fontFamily: "var(--font-caveat), 'Caveat', cursive",
										}}
									>
										{formatVisitDate(destination.visitedDate)}
									</p>
									<p
										className="text-[9px] sm:text-base md:text-2xl text-[#1c1917] mt-1 sm:mt-4 leading-snug sm:leading-relaxed rotate-1 select-none line-clamp-3 sm:line-clamp-4"
										style={{
											fontFamily: "var(--font-caveat), 'Caveat', cursive",
										}}
									>
										{destination.description ||
											"What a lovely place. The views were breathtaking and I can't wait to visit again someday."}
									</p>
									<p
										className="text-[11px] sm:text-2xl md:text-3xl text-[#1c1917] mt-auto sm:mt-6 -rotate-2 select-none"
										style={{
											fontFamily: "var(--font-caveat), 'Caveat', cursive",
										}}
									>
										{AUTHOR.name}
									</p>
								</div>

								{/* Right Pane (Address & Stamp) */}
								<div className="flex-1 pl-3 sm:pl-10 relative flex flex-col">
									{/* Stamp area */}
									<div className="absolute top-0 sm:top-2 right-0 flex items-center justify-center">
										{/* Postmark overlapping stamp */}
										<div className="absolute -left-6 sm:-left-16 z-10 w-10 sm:w-28 h-10 sm:h-28 border-[1px] sm:border-[1.5px] border-slate-700/60 rounded-full flex items-center justify-center -rotate-12 opacity-80 pointer-events-none">
											<div className="w-6 sm:w-20 h-6 sm:h-20 border-[1px] sm:border-[1.5px] border-slate-700/60 rounded-full flex items-center justify-center">
												<span className="text-[3px] sm:text-[8px] font-bold text-slate-700/80 -mt-0.5 sm:-mt-3">
													POST OFF.
												</span>
											</div>
											{/* Wavy lines */}
											<svg
												className="absolute -right-6 sm:-right-16 top-1/2 -translate-y-1/2 w-8 sm:w-20 h-5 sm:h-10 opacity-70"
												viewBox="0 0 100 50"
											>
												<path
													d="M0 10 Q12.5 0 25 10 T50 10 T75 10"
													stroke="currentColor"
													fill="none"
													strokeWidth="1.5"
												/>
												<path
													d="M0 25 Q12.5 15 25 25 T50 25 T75 25"
													stroke="currentColor"
													fill="none"
													strokeWidth="1.5"
												/>
												<path
													d="M0 40 Q12.5 30 25 40 T50 40 T75 40"
													stroke="currentColor"
													fill="none"
													strokeWidth="1.5"
												/>
											</svg>
										</div>

										{/* The Stamp */}
										<div className="w-9 sm:w-24 h-[44px] sm:h-[110px] bg-[#EAE6DF] border border-slate-800 rotate-2 relative overflow-hidden stamp-edges flex flex-col items-center justify-center p-0.5 sm:p-2 shadow-sm">
											{getCountryCode(destination.country) ? (
												<img
													src={`https://flagcdn.com/w80/${getCountryCode(
														destination.country,
													)}.png`}
													alt={destination.country}
													className="w-5 sm:w-14 shadow-sm"
												/>
											) : (
												<span className="text-xs sm:text-3xl">🌍</span>
											)}
											<div className="absolute bottom-0.5 right-0.5 sm:bottom-2 sm:right-1.5 flex justify-between w-full px-0.5 sm:px-2 items-end">
												<span className="text-[3.5px] sm:text-[8px] font-bold text-slate-800 uppercase tracking-wider">
													{destination.country.substring(0, 3)}
												</span>
											</div>
										</div>
									</div>

									{/* Address Lines */}
									<div className="mt-auto mb-2 sm:mb-10 w-full flex flex-col gap-2.5 sm:gap-9 pt-8 sm:pt-12">
										<span className="text-[5px] sm:text-[9px] text-black/50 font-semibold absolute top-1/2 sm:top-[45%]">
											This space for address only
										</span>

										{[
											destination.name,
											destination.location,
											destination.country.toUpperCase(),
										].map((line, i) => (
											<div
												key={i}
												className="w-full border-b-[1px] sm:border-b-[1.5px] border-black/10 relative"
											>
												<span
													className="absolute bottom-0.5 sm:bottom-2 left-1.5 sm:left-4 text-[9px] sm:text-2xl md:text-3xl text-[#1c1917] -rotate-2 select-none truncate max-w-full"
													style={{
														fontFamily: "var(--font-caveat), 'Caveat', cursive",
													}}
												>
													{line}
												</span>
											</div>
										))}
										{/* Extra empty line */}
										<div className="w-full border-b-[1px] sm:border-b-[1.5px] border-black/10"></div>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Flip Hint */}
						<div className="mt-2.5 sm:mt-3 text-white/60 text-[11px] sm:text-xs flex items-center gap-1.5 bg-black/30 px-3.5 py-1 rounded-full backdrop-blur-sm pointer-events-none select-none shrink-0">
							<RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
							<span>Click card to flip</span>
						</div>
					</div>

					{/* 2. Floating Action Bar */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap justify-center shrink-0 px-2"
					>
						<button
							type="button"
							onClick={handleCopyLink}
							className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/90 hover:bg-white text-[#5C4033] text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
							title="Copy Share Link"
						>
							{isLinkCopied ? (
								<>
									<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 stroke-[3]" />
									<span className="text-emerald-700">Link Copied!</span>
								</>
							) : (
								<>
									<Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2703E]" />
									<span>Copy Link</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={() => handleDownload(side)}
							disabled={isDownloading}
							className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/90 hover:bg-white text-[#5C4033] text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
							title={`Download ${side === "front" ? "Front" : "Back"} Image`}
						>
							{isDownloading ? (
								<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
							) : (
								<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C2703E]" />
							)}
							<span>Save {side === "front" ? "Front" : "Back"}</span>
						</button>

						<button
							type="button"
							onClick={() => handleCopy(side)}
							disabled={isCopying}
							className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[11px] sm:text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md ${
								isCopied
									? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
									: "bg-[#C2703E] hover:bg-[#A85E34] text-white shadow-[#C2703E]/20"
							}`}
						>
							{isCopying ? (
								<>
									<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
									<span>Generating...</span>
								</>
							) : isCopied ? (
								<>
									<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
									<span>Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
									<span>Copy {side === "front" ? "Front" : "Back"}</span>
								</>
							)}
						</button>
					</motion.div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
