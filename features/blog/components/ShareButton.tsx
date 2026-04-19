"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
	title: string;
	url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleShare = async () => {
		const shareUrl = url || window.location.href;
		
		if (navigator.share) {
			try {
				await navigator.share({
					title: title,
					url: shareUrl,
				});
			} catch (err) {
				console.error("Error sharing:", err);
			}
		} else {
			// Fallback: Copy to clipboard
			try {
				await navigator.clipboard.writeText(shareUrl);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch (err) {
				console.error("Failed to copy:", err);
			}
		}
	};

	return (
		<button
			onClick={handleShare}
			className="flex items-center gap-3 w-full p-4 bg-white border border-slate-200 hover:bg-slate-950 hover:text-white rounded-2xl transition-all font-bold text-xs group shadow-sm relative overflow-hidden"
		>
			<AnimatePresence mode="wait">
				{copied ? (
					<motion.div
						key="check"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -20, opacity: 0 }}
						className="flex items-center gap-3 w-full justify-center text-emerald-500"
					>
						<Check className="w-4 h-4" /> Link Copied
					</motion.div>
				) : (
					<motion.div
						key="share"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: -20, opacity: 0 }}
						className="flex items-center gap-3 w-full"
					>
						<Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> 
						Share Insights
					</motion.div>
				)}
			</AnimatePresence>
		</button>
	);
}
