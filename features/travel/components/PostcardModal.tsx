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
	Compass,
} from "lucide-react";
import { Caveat } from "next/font/google";
import Image from "next/image";
import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";
import { usePostcardActions } from "../hooks/usePostcardActions";
import { formatVisitDate, getCountryCode } from "../utils/postcardCanvas";

const caveat = Caveat({
	subsets: ["latin"],
	variable: "--font-caveat",
	display: "swap",
});

const SPRING_MODAL = { type: "spring" as const, stiffness: 320, damping: 28 };

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
	const closeRef = useRef<HTMLButtonElement>(null);
	const [side, setSide] = useState<"front" | "back">("front");
	const [isZoomed, setIsZoomed] = useState(false);

	const {
		handleCopy,
		handleDownload,
		handleCopyLink,
		isCopying,
		isDownloading,
		isCopied,
		isLinkCopied,
	} = usePostcardActions(destination);

	useEffect(() => {
		if (!destination) return;
		const orig = document.body.style.overflow;
		const previousFocus = document.activeElement as HTMLElement | null;
		document.body.style.overflow = "hidden";
		setSide("front");
		setIsZoomed(false);
		closeRef.current?.focus();
		return () => {
			document.body.style.overflow = orig;
			previousFocus?.focus();
		};
	}, [destination]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

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

	const countryCode = getCountryCode(destination.country);

	return (
		<AnimatePresence>
			<div
				className={`fixed inset-x-0 top-0 z-[60] flex h-[100dvh] flex-col overflow-y-auto overscroll-contain p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-6 lg:p-8 ${caveat.variable}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby="journal-title"
				ref={modalRef}
				onKeyDown={handleKeyDownTrap}
			>
				<h2 id="journal-title" className="sr-only">
					{destination.name} Postcard
				</h2>

				<motion.div
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
				/>

				<motion.button
					ref={closeRef}
					type="button"
					initial={reduceMotion ? false : { opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0 }}
					transition={reduceMotion ? { duration: 0 } : { delay: 0.2 }}
					onClick={onClose}
					className="fixed top-[max(12px,env(safe-area-inset-top))] right-3 sm:top-6 sm:right-6 z-[70] min-w-11 min-h-11 p-2.5 text-white hover:text-slate-200 rounded-full transition-colors cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
					aria-label="Close postcard"
				>
					<X className="w-5 h-5" />
				</motion.button>

				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.93, y: 16 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={reduceMotion ? undefined : { opacity: 0, scale: 0.93, y: 12 }}
					transition={reduceMotion ? { duration: 0 } : SPRING_MODAL}
					className="relative w-full min-h-full max-w-6xl z-10 m-auto flex flex-col items-center justify-start sm:justify-center gap-3 sm:gap-5 py-14 sm:py-6"
					style={{ perspective: "2000px" }}
				>
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={reduceMotion ? { duration: 0 } : { delay: 0.3 }}
						className="flex bg-slate-800 p-1 rounded-xl gap-1 shrink-0"
						role="tablist"
						aria-label="Postcard side"
					>
						<button
							type="button"
							role="tab"
							aria-selected={side === "front"}
							onClick={() => setSide("front")}
							className={`min-h-11 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${side === "front" ? "bg-white text-slate-900" : "text-white hover:bg-white/10"}`}
						>
							Front
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={side === "back"}
							onClick={() => setSide("back")}
							className={`min-h-11 px-5 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${side === "back" ? "bg-white text-slate-900" : "text-white hover:bg-white/10"}`}
						>
							Back
						</button>
					</motion.div>

					<div className="relative flex flex-col justify-center items-center w-full min-w-0 py-1">
						{isZoomed && (
							<p className="mb-2 text-sm text-white">
								Scroll sideways to read the full postcard.
							</p>
						)}
						<section
							className={`w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${isZoomed ? "overflow-x-auto overflow-y-hidden" : "overflow-visible"}`}
							tabIndex={isZoomed ? 0 : undefined}
							aria-label={
								isZoomed
									? "Enlarged postcard, scroll sideways to read"
									: "Postcard preview"
							}
						>
							<motion.div
								className={`relative cursor-pointer group aspect-[8/5] m-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xl sm:rounded-2xl ${isZoomed ? "w-[800px]" : "w-full"}`}
								style={{
									maxHeight: isZoomed ? undefined : "min(52dvh, 480px)",
									maxWidth: isZoomed
										? undefined
										: "min(100%, calc(min(52dvh, 480px) * 1.6))",
									containerType: "inline-size",
									transformStyle: "preserve-3d",
								}}
								animate={{ rotateY: side === "front" ? 0 : 180 }}
								transition={
									reduceMotion
										? { duration: 0 }
										: { type: "spring", stiffness: 220, damping: 25 }
								}
								onClick={() =>
									setSide((s) => (s === "front" ? "back" : "front"))
								}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										setSide((s) => (s === "front" ? "back" : "front"));
									}
								}}
								role="button"
								tabIndex={0}
								aria-label={`Flip postcard (currently showing ${side})`}
							>
								<div
									className="absolute inset-0 w-full h-full bg-[#FDFBF7] p-[2.25cqw] rounded-xl sm:rounded-2xl shadow-xl shadow-black/30 flex flex-col"
									style={{
										backfaceVisibility: "hidden",
										WebkitBackfaceVisibility: "hidden",
									}}
								>
									<div className="relative flex-1 rounded-sm sm:rounded-md overflow-hidden bg-slate-200">
										<Image
											src={destination.imageUrl
												.replace(/w=\d+/, "w=1600")
												.replace(/h=\d+/, "h=1000")}
											alt={`${destination.name}, ${destination.location}`}
											fill
											priority
											sizes={
												isZoomed
													? "800px"
													: "(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 640px"
											}
											className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:transform-none"
										/>
									</div>
									<div className="h-[4cqw] flex justify-between items-end gap-2 px-[0.25cqw] text-slate-700 font-semibold text-[clamp(8px,1.5cqw,12px)] tracking-wide uppercase select-none">
										<span className="min-w-0 truncate">
											{destination.type === "domestic" ? "DOMESTIC" : "INTL"} /{" "}
											{destination.name}
										</span>
										<span className="max-w-[48%] truncate text-right">
											{destination.location}
										</span>
									</div>
								</div>

								<div
									className="absolute inset-0 w-full h-full bg-[#FDFBF7] rounded-xl sm:rounded-2xl shadow-xl shadow-black/30"
									style={{
										transform: "rotateY(180deg)",
										backfaceVisibility: "hidden",
										WebkitBackfaceVisibility: "hidden",
									}}
								>
									<div className="absolute top-[5cqw] bottom-[5cqw] left-1/2 w-px bg-slate-600/25 -translate-x-1/2" />
									<div
										aria-hidden="true"
										className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 text-[1cqw] font-semibold text-slate-600/70 tracking-wider whitespace-nowrap pointer-events-none select-none"
									>
										POLMA TAMBUNAN / FIELD DISPATCH
									</div>

									<div
										className="absolute left-[5cqw] top-[5cqw] w-[38.75cqw] h-[52.5cqw] text-[#1c1917]"
										style={{
											fontFamily: "var(--font-caveat), 'Caveat', cursive",
										}}
									>
										<p className="absolute top-0 text-[5.5cqw] leading-none -rotate-1 select-none">
											{formatVisitDate(destination.visitedDate)}
										</p>
										<p className="absolute top-[8.75cqw] w-full text-[4.125cqw] leading-[5.25cqw] rotate-1 select-none line-clamp-6">
											{destination.description}
										</p>
										<p className="absolute top-[45cqw] text-[5.5cqw] leading-none -rotate-2 select-none">
											{AUTHOR.name}
										</p>
									</div>

									<div className="absolute left-[55cqw] right-[5cqw] top-[5cqw] h-[53.75cqw]">
										<div
											aria-hidden="true"
											className="absolute top-0 right-0 flex items-center justify-center"
										>
											<div className="absolute -left-[8cqw] top-[4cqw] z-10 w-[13.75cqw] h-[13.75cqw] border border-slate-700/60 rounded-full flex items-center justify-center -rotate-12 opacity-80 pointer-events-none">
												<div className="w-[10cqw] h-[10cqw] border border-slate-700/60 rounded-full flex items-center justify-center">
													<span className="text-[1cqw] font-bold text-slate-700/80 -mt-[1.5cqw]">
														POST OFF.
													</span>
												</div>
												<svg
													className="absolute -right-[8cqw] top-1/2 -translate-y-1/2 w-[10cqw] h-[5cqw] opacity-70"
													viewBox="0 0 100 50"
													aria-hidden="true"
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

											<div className="w-[15cqw] h-[17.5cqw] bg-[#EAE6DF] border border-slate-800 rotate-2 relative overflow-hidden stamp-edges flex flex-col items-center justify-center p-[1cqw] shadow-sm">
												{countryCode ? (
													<img
														src={`https://flagcdn.com/w80/${countryCode}.png`}
														alt=""
														className="w-[7.5cqw] shadow-sm"
													/>
												) : (
													<Compass className="w-[4cqw] h-[4cqw] text-slate-700" />
												)}
												<div className="absolute bottom-[1cqw] right-[0.5cqw] w-full px-[1cqw]">
													<span className="text-[1cqw] font-bold text-slate-800 uppercase tracking-wider">
														{destination.country.substring(0, 3)}
													</span>
												</div>
											</div>
										</div>

										<div
											className="absolute top-[23.75cqw] w-full flex flex-col"
											style={{
												fontFamily: "var(--font-caveat), 'Caveat', cursive",
											}}
										>
											{[
												destination.name,
												destination.location,
												destination.country.toUpperCase(),
											].map((line, index) => (
												<div
													key={`${index}-${line}`}
													className="w-full h-[7.5cqw] border-b border-slate-600/25 flex items-end pb-[0.5cqw] min-w-0"
												>
													<span className="block max-w-full text-[4cqw] leading-[3.5cqw] text-[#1c1917] -rotate-2 select-none line-clamp-2 break-words">
														{line}
													</span>
												</div>
											))}
											<div className="w-full h-[7.5cqw] border-b border-slate-600/25" />
										</div>
									</div>
								</div>
							</motion.div>
						</section>
						<button
							type="button"
							onClick={() => setIsZoomed((value) => !value)}
							aria-pressed={isZoomed}
							className="mt-2 min-h-11 px-4 text-sm font-medium text-white hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
						>
							<RefreshCw
								className="inline-block w-4 h-4 mr-2"
								aria-hidden="true"
							/>
							{isZoomed ? "Fit postcard" : "Enlarge postcard"}
						</button>
					</div>

					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={reduceMotion ? { duration: 0 } : { delay: 0.3 }}
						className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center shrink-0 px-2"
					>
						<button
							type="button"
							onClick={handleCopyLink}
							className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
						>
							{isLinkCopied ? (
								<>
									<Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 stroke-[3]" />
									<span className="text-emerald-700">Link Copied</span>
								</>
							) : (
								<>
									<Link2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
									<span>Copy Link</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={() => handleDownload(side)}
							disabled={isDownloading}
							className="w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
						>
							{isDownloading ? (
								<Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-slate-600" />
							) : (
								<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
							)}
							<span>Save {side === "front" ? "Front" : "Back"}</span>
						</button>

						<button
							type="button"
							onClick={() => handleCopy(side)}
							disabled={isCopying}
							className={`w-full sm:w-auto min-h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
								isCopied
									? "bg-emerald-600 hover:bg-emerald-500 text-white"
									: "bg-slate-900 hover:bg-slate-800 text-white border border-white/15"
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
									<span>Copied</span>
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
