"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	CheckCircle2,
	Star,
	Copy,
	Check,
	Download,
	Loader2,
	MapPin,
} from "lucide-react";
import Image from "next/image";
import type { Destination } from "../types";
import { usePostcardActions } from "../hooks/usePostcardActions";

/* ═══════════════════════════════════════════════════════════════════════
 * Animation presets
 * ═══════════════════════════════════════════════════════════════════ */

const SPRING_MODAL = { type: "spring" as const, stiffness: 320, damping: 28 };
const SPRING_SNAPPY = { type: "spring" as const, stiffness: 400, damping: 30 };

/**
 * Classic airmail diagonal stripe border — CSS repeating-linear-gradient
 * that produces the navy/red/cream chevron pattern.
 */
const AIRMAIL_BORDER_STYLE = {
	backgroundImage: `repeating-linear-gradient(
		-45deg,
		#1E3A8A 0px, #1E3A8A 10px,
		#FAF5EC 10px, #FAF5EC 20px,
		#BE123C 20px, #BE123C 30px,
		#FAF5EC 30px, #FAF5EC 40px
	)`,
} as const;

/* ═══════════════════════════════════════════════════════════════════════
 * Sub-components (co-located, not exported)
 * ═══════════════════════════════════════════════════════════════════ */

/** Compact Polaroid photo with tilt + tape */
function PolaroidPhoto({ destination }: { destination: Destination }) {
	const isVisited = destination.isVisited;
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, rotate: -4, y: 8 }}
			animate={{ opacity: 1, rotate: -1.5, y: 0 }}
			transition={{ delay: 0.15, ...SPRING_SNAPPY }}
			className="relative"
		>
			{/* Tape accent */}
			<div className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 w-14 h-4 bg-amber-100/60 border border-amber-200/40 rounded-sm shadow-2xs rotate-1" />

			{/* Polaroid frame */}
			<div className="bg-white p-2.5 sm:p-3 rounded-md shadow-lg shadow-amber-900/8 border border-amber-200/30">
				<div className="aspect-[4/3] relative rounded-sm overflow-hidden bg-amber-50">
					<Image
						src={destination.imageUrl
							.replace(/w=\d+/, "w=800")
							.replace(/h=\d+/, "h=600")}
						alt={`${destination.name}, ${destination.location}`}
						fill
						className={`object-cover ${
							!isVisited ? "grayscale contrast-105 brightness-95" : ""
						}`}
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
				</div>

				{/* Polaroid caption */}
				<div className="mt-2.5 px-0.5 space-y-0.5">
					<h4 className="text-[13px] sm:text-[15px] font-black text-slate-900 tracking-tight font-serif truncate">
						{destination.name}
					</h4>
					<div className="flex items-center justify-between gap-1">
						<div className="flex items-center gap-1 text-amber-800/50 text-[9px] sm:text-[10px] font-semibold truncate">
							<MapPin className="w-2.5 h-2.5 text-[#C2703E] shrink-0" />
							<span className="truncate">
								{destination.location}, {destination.country}
							</span>
						</div>
						{destination.visitedDate && (
							<div className="shrink-0 px-1.5 py-0.5 border border-[#C2703E]/25 rounded-sm bg-[#FFF8F0]">
								<span className="text-[7px] sm:text-[8px] font-black text-[#C2703E] uppercase tracking-wider font-mono">
									{(() => {
										const [year, month] = destination.visitedDate.split("-");
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
									})()}
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Status badge on photo */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.25, ...SPRING_SNAPPY }}
				className="absolute top-3.5 left-4 z-10"
			>
				<span
					className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider border shadow-sm backdrop-blur-md ${
						isVisited
							? "bg-emerald-500/90 text-white border-emerald-400/30"
							: "bg-amber-500/90 text-white border-amber-400/30"
					}`}
				>
					{isVisited ? (
						<>
							<CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
							Visited
						</>
					) : (
						<>
							<Star className="w-2.5 h-2.5 fill-current" />
							Wishlist
						</>
					)}
				</span>
			</motion.div>
		</motion.div>
	);
}

/** Compact journal content (Right Side) */
function JournalContent({ destination }: { destination: Destination }) {
	const isVisited = destination.isVisited;
	const reduceMotion = useReducedMotion();

	return (
		<div className="flex flex-col justify-between h-full space-y-4">
			{/* Destination headline */}
			<div>
				<span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] text-[#C2703E]/60 inline-flex items-center gap-1">
					{destination.type === "domestic" ? "✦ DOMESTIC" : "✦ INTERNATIONAL"}
				</span>
				<h4 className="text-xl sm:text-2xl font-black text-[#3D2B1F] tracking-tight font-serif leading-none mt-1">
					{destination.name}
				</h4>
				<p className="text-[10px] sm:text-[11px] text-[#C2703E]/70 font-semibold mt-1">
					{destination.location}, {destination.country}
				</p>
				<p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.1em] text-amber-800/40 mt-1">
					Expedition #{destination.id.padStart(4, "0")}
				</p>
			</div>

			{/* Description quote */}
			<div className="py-2.5 px-3 bg-white/40 border border-amber-900/10 rounded-lg">
				<p className="text-[11px] sm:text-xs text-[#5C4033] font-serif italic leading-[1.7]">
					&ldquo;{destination.description}&rdquo;
				</p>
			</div>

			{/* Field Notes */}
			<div className="space-y-1">
				<p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.1em] text-amber-800/35 flex items-center gap-1.5">
					<span className="inline-block w-4 h-px bg-amber-800/15" />
					Field Notes
					<span className="inline-block flex-1 h-px bg-amber-800/8" />
				</p>
				<div className="space-y-0 mt-1">
					{[
						{ label: "Traveler", value: "Fellow World Explorer" },
						{ label: "Via", value: destination.location },
						{ label: "Country", value: destination.country },
					].map((line) => (
						<div
							key={line.label}
							className="flex items-baseline gap-1.5 border-b border-amber-900/10 py-1.5"
						>
							<span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-800/40 shrink-0 w-12 sm:w-16">
								{line.label}
							</span>
							<span className="text-[11px] sm:text-xs font-semibold text-[#3D2B1F] truncate">
								{line.value}
							</span>
						</div>
					))}
				</div>
			</div>

			{/* Visa Stamp + Postmark */}
			<div className="flex items-end justify-between gap-2 pt-1 relative">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, rotate: 8, scale: 0.8 }}
					animate={{ opacity: 1, rotate: -3, scale: 1 }}
					transition={{
						delay: 0.5,
						type: "spring",
						stiffness: 220,
						damping: 18,
					}}
				>
					<div
						className={`px-3 py-1.5 rounded-md border-[1.5px] border-dashed text-center select-none ${
							isVisited
								? "bg-emerald-50/60 border-emerald-600/35 text-emerald-800"
								: "bg-amber-50/60 border-amber-600/35 text-amber-800"
						}`}
					>
						<p className="text-[6px] sm:text-[7px] font-black uppercase tracking-[0.08em]">
							★ Passport Control ★
						</p>
						<p className="text-[10px] sm:text-[11px] font-black tracking-tight mt-0.5">
							{isVisited ? "Entry Granted" : "On Radar"}
						</p>
						<p className="text-[6px] sm:text-[7px] font-semibold uppercase tracking-wider opacity-60 mt-0.5">
							{destination.visitedDate || "Pending"}
						</p>
					</div>
				</motion.div>

				<motion.div
					initial={
						reduceMotion ? false : { opacity: 0, scale: 0.5, rotate: -30 }
					}
					animate={{ opacity: 0.45, scale: 1, rotate: -15 }}
					transition={{
						delay: 0.6,
						type: "spring",
						stiffness: 180,
						damping: 16,
					}}
					className="shrink-0"
				>
					<div
						className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-[1.5px] flex flex-col items-center justify-center text-center select-none ${
							isVisited
								? "border-emerald-700/35 text-emerald-800"
								: "border-amber-700/35 text-amber-800"
						}`}
					>
						<div
							className={`w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full border flex flex-col items-center justify-center ${
								isVisited ? "border-emerald-700/20" : "border-amber-700/20"
							}`}
						>
							<span className="text-[5px] sm:text-[6px] font-black uppercase tracking-[0.08em]">
								{destination.country.length > 9
									? destination.country.slice(0, 9)
									: destination.country}
							</span>
							<span className="text-[7px] sm:text-[8px] font-black leading-tight mt-0.5">
								{destination.visitedDate || "2026"}
							</span>
							<span className="text-[4.5px] sm:text-[5px] font-extrabold uppercase tracking-[0.1em] opacity-50 mt-0.5">
								Air Mail
							</span>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
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
	const { handleCopy, handleDownload, isCopying, isDownloading, isCopied } =
		usePostcardActions(destination);

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
					className="fixed inset-0 bg-amber-950/70 backdrop-blur-sm"
				/>

				{/* Floating Close Button (Outside Postcard) */}
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
					className="relative w-full max-w-3xl z-10 my-auto flex flex-col items-center gap-6"
				>
					{/* 1. The Postcard Itself (Clean, No UI Buttons Inside) */}
					<div
						className="w-full rounded-2xl sm:rounded-[1.25rem] p-[7px] sm:p-2.5 shadow-2xl shadow-amber-950/40"
						style={AIRMAIL_BORDER_STYLE}
					>
						{/* Inner paper card */}
						<div
							className="bg-[#FAF5EC] rounded-xl sm:rounded-[14px] overflow-hidden border border-amber-200/40 p-4 sm:p-6"
							style={{
								backgroundImage:
									"url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 5h1v1H1V5zm2-2h1v1H3V3zm2-2h1v1H5V1z' fill='%239C8874' fill-opacity='0.03'/%3E%3C/svg%3E\")",
							}}
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start">
								<PolaroidPhoto destination={destination} />
								<JournalContent destination={destination} />
							</div>
						</div>
					</div>

					{/* 2. Floating Action Bar (Outside Postcard) */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="flex items-center gap-3 w-full sm:w-auto"
					>
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
