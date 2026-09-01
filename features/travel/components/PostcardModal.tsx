"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Copy, Check, Download, Loader2, Link2 } from "lucide-react";
import Image from "next/image";
import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";
import { usePostcardActions } from "../hooks/usePostcardActions";

/* ═══════════════════════════════════════════════════════════════════════
 * Animation presets
 * ═══════════════════════════════════════════════════════════════════ */

const SPRING_MODAL = { type: "spring" as const, stiffness: 320, damping: 28 };

/** Format visit date for display */
function formatVisitDate(visitedDate: string): string {
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
				className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto"
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
					className="fixed inset-0 bg-black/70 backdrop-blur-sm"
				/>

				{/* Floating Close Button */}
				<motion.button
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={{ delay: 0.2 }}
					onClick={onClose}
					className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all active:scale-90"
					aria-label="Close postcard"
				>
					<X className="w-5 h-5" />
				</motion.button>

				{/* Main Postcard Wrapper */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.93, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={reduceMotion ? undefined : { opacity: 0, scale: 0.93, y: 12 }}
					transition={SPRING_MODAL}
					className="relative w-full max-w-4xl z-10 my-auto flex flex-col items-center gap-5 sm:gap-6"
				>
					{/* 1. The Postcard (White border + full-bleed photo hero) */}
					<div className="w-full bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/50">
						{/* Inner photo card */}
						<div className="relative aspect-[8/5] rounded-md sm:rounded-lg overflow-hidden group">
							{/* Photo Background */}
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

							{/* Dark Gradient Overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent" />

							{/* Top Left — Bold Status Stamp */}
							<motion.div
								initial={
									reduceMotion ? false : { opacity: 0, scale: 0.5, rotate: 20 }
								}
								animate={{ opacity: 1, scale: 1, rotate: -3.5 }}
								transition={{
									delay: 0.3,
									type: "spring",
									stiffness: 250,
									damping: 18,
								}}
								className="absolute top-3 sm:top-5 left-3 sm:left-5 pointer-events-none"
							>
								<div
									className={`bg-white shadow-xl shadow-black/20 border-[2.5px] sm:border-[3px] p-[2px] sm:p-[3px] select-none ${
										isVisited ? "border-emerald-600" : "border-amber-600"
									}`}
								>
									<div
										className={`border px-3 sm:px-4 py-0.5 sm:py-1 text-center ${
											isVisited ? "border-emerald-600" : "border-amber-600"
										}`}
									>
										<p
											className={`text-base sm:text-xl font-black uppercase tracking-[0.12em] leading-tight ${
												isVisited ? "text-emerald-700" : "text-amber-700"
											}`}
										>
											{isVisited ? "VISITED" : "WISHLIST"}
										</p>
									</div>
								</div>
							</motion.div>

							{/* Top Right — Bold "TRAVEL POSTCARD" Stamp */}
							<motion.div
								initial={
									reduceMotion ? false : { opacity: 0, scale: 0.6, rotate: 10 }
								}
								animate={{ opacity: 1, scale: 1, rotate: -3 }}
								transition={{
									delay: 0.35,
									type: "spring",
									stiffness: 200,
									damping: 18,
								}}
								className="absolute top-3 sm:top-5 right-3 sm:right-5 pointer-events-none"
							>
								<div
									style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.3))" }}
								>
									<div
										className="bg-white p-2 sm:p-3 select-none"
										style={{
											WebkitMask:
												"linear-gradient(#000 0 0) 50% 50% / calc(100% - 6px) calc(100% - 6px) no-repeat, radial-gradient(circle at 0 0, transparent 3px, #000 3.5px) 0 0 / 12px 12px",
										}}
									>
										<div className="border-[2.5px] sm:border-[3px] border-slate-800 p-[2px] sm:p-1">
											<div className="border border-slate-800 px-3 sm:px-5 py-1.5 sm:py-2.5 text-center flex flex-col items-center">
												<p className="text-[9px] sm:text-xs font-black text-slate-800 tracking-[0.15em] leading-none">
													TRAVEL
												</p>
												<p className="text-sm sm:text-xl font-black text-slate-800 tracking-wider leading-tight mt-0.5">
													POSTCARD
												</p>
												{/* Decorative horizontal lines with Flag */}
												<div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
													<div className="w-3 sm:w-5 h-[2px] bg-slate-800" />
													{getCountryCode(destination.country) ? (
														<img
															src={`https://flagcdn.com/w40/${getCountryCode(
																destination.country,
															)}.png`}
															alt={destination.country}
															className="w-4 sm:w-5 h-auto object-cover rounded-[1px] shadow-[0_0_1px_rgba(0,0,0,0.5)]"
														/>
													) : (
														<span className="text-[10px] sm:text-[14px] leading-none block transform translate-y-[1px]">
															🌍
														</span>
													)}
													<div className="w-3 sm:w-5 h-[2px] bg-slate-800" />
												</div>
											</div>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Bottom Editorial Content */}
							<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 lg:p-9 flex flex-col items-start text-left">
								{/* Route + Expedition */}
								<div className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-white/60 mb-2 sm:mb-3">
									<span className="text-white/80">
										{destination.type === "domestic"
											? "✦ DOMESTIC"
											: "✦ INTERNATIONAL"}
									</span>
									<span className="mx-2">·</span>
									<span>Expedition #{destination.id.padStart(4, "0")}</span>
								</div>

								{/* Destination Name */}
								<h3 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight font-serif leading-none mb-1 sm:mb-2 drop-shadow-md">
									{destination.name}
								</h3>

								{/* Location Subtitle */}
								<p className="text-[11px] sm:text-sm md:text-base text-white/85 font-semibold mb-3 sm:mb-5">
									{destination.location}, {destination.country}
								</p>

								{/* Quote Description */}
								<p className="text-[11px] sm:text-[14px] md:text-lg text-white font-serif italic leading-relaxed max-w-2xl mb-5 sm:mb-8 drop-shadow-sm">
									&ldquo;{destination.description}&rdquo;
								</p>

								{/* Footer Line */}
								<div className="w-full pt-3 sm:pt-4 border-t border-white/15">
									<p className="text-[8px] sm:text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.15em] text-white/60">
										{AUTHOR.name}
										<span className="mx-2">·</span>
										{destination.visitedDate
											? formatVisitDate(destination.visitedDate).toUpperCase()
											: "PENDING"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* 2. Floating Action Bar */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex items-center gap-3 w-full sm:w-auto flex-wrap justify-center"
					>
						<button
							type="button"
							onClick={handleCopyLink}
							className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/90 hover:bg-white text-[#5C4033] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
							title="Copy Share Link"
						>
							{isLinkCopied ? (
								<>
									<Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
									<span className="text-emerald-700">Link Copied!</span>
								</>
							) : (
								<>
									<Link2 className="w-4 h-4 text-[#C2703E]" />
									<span>Copy Share Link</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={handleDownload}
							disabled={isDownloading}
							className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white/90 hover:bg-white text-[#5C4033] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md"
							title="Download PNG"
						>
							{isDownloading ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Download className="w-4 h-4 text-[#C2703E]" />
							)}
							<span>Save Image</span>
						</button>

						<button
							type="button"
							onClick={handleCopy}
							disabled={isCopying}
							className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg backdrop-blur-md ${
								isCopied
									? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20"
									: "bg-[#C2703E] hover:bg-[#A85E34] text-white shadow-[#C2703E]/20"
							}`}
						>
							{isCopying ? (
								<>
									<Loader2 className="w-4 h-4 animate-spin" />
									<span>Generating...</span>
								</>
							) : isCopied ? (
								<>
									<Check className="w-4 h-4 stroke-[3]" />
									<span>Copied!</span>
								</>
							) : (
								<>
									<Copy className="w-4 h-4" />
									<span>Copy Sticker</span>
								</>
							)}
						</button>
					</motion.div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
