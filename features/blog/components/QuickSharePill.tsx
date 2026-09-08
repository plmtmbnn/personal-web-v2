"use client";

import { useState, useCallback } from "react";
import { Share2, Link2, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface QuickSharePillProps {
	title: string;
}

export default function QuickSharePill({ title }: QuickSharePillProps) {
	const [copied, setCopied] = useState(false);
	const reduceMotion = useReducedMotion();

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard not available
		}
	}, []);

	const handleNativeShare = useCallback(async () => {
		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title,
					url: window.location.href,
				});
				return;
			} catch {
				// Fallback to copy if cancelled or rejected
			}
		}
		handleCopy();
	}, [title, handleCopy]);

	return (
		<div className="inline-flex items-center gap-1.5">
			<button
				type="button"
				onClick={handleNativeShare}
				className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-950 border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-2xs cursor-pointer"
				title="Share or copy article link"
			>
				<AnimatePresence mode="wait" initial={false}>
					{copied ? (
						<motion.span
							key="copied"
							initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="inline-flex items-center gap-1 text-emerald-600 font-bold"
						>
							<Check className="w-3 h-3" />
							<span>Copied</span>
						</motion.span>
					) : (
						<motion.span
							key="share"
							initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.8 }}
							className="inline-flex items-center gap-1"
						>
							<Share2 className="w-3 h-3 text-slate-500" />
							<span>Share</span>
						</motion.span>
					)}
				</AnimatePresence>
			</button>

			<button
				type="button"
				onClick={handleCopy}
				className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200/80 transition-all active:scale-90 shadow-2xs cursor-pointer"
				title="Copy article link"
				aria-label="Copy article link"
			>
				{copied ? (
					<Check className="w-3.5 h-3.5 text-emerald-600" />
				) : (
					<Link2 className="w-3.5 h-3.5" />
				)}
			</button>
		</div>
	);
}
