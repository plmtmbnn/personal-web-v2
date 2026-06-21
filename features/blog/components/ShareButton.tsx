"use client";

import { useState } from "react";
import { Share2, Check, Link2 } from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
	title: string;
	url?: string;
}

const socialTargets = (title: string, url: string) => [
	{
		id: "twitter",
		label: "X / Twitter",
		icon: FaXTwitter,
		color: "hover:bg-slate-900 hover:text-white hover:border-slate-900",
		href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
	},
	{
		id: "linkedin",
		label: "LinkedIn",
		icon: FaLinkedinIn,
		color: "hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5]",
		href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
	},
	{
		id: "whatsapp",
		label: "WhatsApp",
		icon: FaWhatsapp,
		color: "hover:bg-[#25d366] hover:text-white hover:border-[#25d366]",
		href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
	},
];

export default function ShareButton({ title, url }: ShareButtonProps) {
	const [copied, setCopied] = useState(false);

	const shareUrl =
		url || (typeof window !== "undefined" ? window.location.href : "");

	const handleNativeShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({ title, url: shareUrl });
			} catch {
				// User cancelled or not supported
			}
		} else {
			handleCopy();
		}
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard not available
		}
	};

	const targets = socialTargets(title, shareUrl);

	return (
		<div className="flex flex-col items-center gap-4 w-full">
			{/* Primary share / copy button */}
			<button
				onClick={handleNativeShare}
				className="flex items-center gap-3 px-6 py-3.5 bg-slate-950 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95 w-full justify-center"
			>
				<AnimatePresence mode="wait" initial={false}>
					{copied ? (
						<motion.span
							key="copied"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							className="flex items-center gap-2 text-emerald-400"
						>
							<Check className="w-4 h-4" /> Link Copied!
						</motion.span>
					) : (
						<motion.span
							key="share"
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							className="flex items-center gap-2"
						>
							<Share2 className="w-4 h-4" /> Share this Post
						</motion.span>
					)}
				</AnimatePresence>
			</button>

			{/* Divider */}
			<div className="flex items-center gap-3 w-full">
				<div className="flex-1 h-px bg-slate-100" />
				<span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
					Or share via
				</span>
				<div className="flex-1 h-px bg-slate-100" />
			</div>

			{/* Social buttons row */}
			<div className="flex items-center gap-2 w-full justify-center flex-wrap">
				{targets.map(({ id, label, icon: Icon, color, href }) => (
					<a
						key={id}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						className={`flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 transition-all duration-200 bg-white ${color} active:scale-95 shadow-sm`}
					>
						<Icon className="w-3.5 h-3.5" />
						{label}
					</a>
				))}

				{/* Copy link button */}
				<button
					onClick={handleCopy}
					className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200 bg-white active:scale-95 shadow-sm"
				>
					<Link2 className="w-3.5 h-3.5" />
					{copied ? "Copied!" : "Copy Link"}
				</button>
			</div>
		</div>
	);
}
