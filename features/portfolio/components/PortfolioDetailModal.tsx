"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	CheckCircle2,
	Cpu,
	Zap,
	Layers,
	type LucideIcon,
} from "lucide-react";

export interface PortfolioItem {
	id: string;
	icon: LucideIcon;
	title: string;
	desc: string;
	category: "Fintech Core" | "Specialized Platform";
	tagline: string;
	fullDescription: string;
	capabilities: string[];
	techHighlights: string[];
	metrics?: string;
	themeColor: "indigo" | "purple";
}

interface PortfolioDetailModalProps {
	item: PortfolioItem | null;
	isOpen: boolean;
	onClose: () => void;
}

export default function PortfolioDetailModal({
	item,
	isOpen,
	onClose,
}: PortfolioDetailModalProps) {
	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	if (!item) return null;

	const isIndigo = item.themeColor === "indigo";
	const IconComponent = item.icon;

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
						onClick={onClose}
					/>

					{/* Modal Content */}
					<motion.div
						initial={{ opacity: 0, scale: 0.96, y: 16 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 16 }}
						transition={{ duration: 0.2, ease: "easeOut" }}
						className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-[2rem] shadow-xl shadow-slate-900/15 overflow-hidden z-10 my-auto"
					>
						{/* Close Button */}
						<button
							type="button"
							onClick={onClose}
							aria-label="Close modal"
							className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-20 cursor-pointer"
						>
							<X className="w-5 h-5" />
						</button>

						<div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
							{/* Header */}
							<div className="flex items-start gap-4 sm:gap-5 pr-8">
								<div
									className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
										isIndigo
											? "bg-indigo-50 border-indigo-100 text-indigo-600"
											: "bg-purple-50 border-purple-100 text-purple-600"
									}`}
								>
									<IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<span
											className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
												isIndigo
													? "bg-indigo-50 border-indigo-200 text-indigo-700"
													: "bg-purple-50 border-purple-200 text-purple-700"
											}`}
										>
											{item.category}
										</span>
									</div>
									<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
										{item.title}
									</h2>
									<p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
										{item.tagline}
									</p>
								</div>
							</div>

							{/* Description */}
							<div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
								<p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
									{item.fullDescription}
								</p>
							</div>

							{/* Key Capabilities */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Layers
										className={`w-4 h-4 ${
											isIndigo ? "text-indigo-600" : "text-purple-600"
										}`}
									/>
									<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
										Key Architecture & Capabilities
									</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
									{item.capabilities.map((cap) => (
										<div
											key={cap}
											className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs"
										>
											<CheckCircle2
												className={`w-4 h-4 shrink-0 mt-0.5 ${
													isIndigo ? "text-indigo-600" : "text-purple-600"
												}`}
											/>
											<span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug">
												{cap}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Tech Stack & Standards */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<Cpu
										className={`w-4 h-4 ${
											isIndigo ? "text-indigo-600" : "text-purple-600"
										}`}
									/>
									<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
										Technology & Integrations
									</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{item.techHighlights.map((tech) => (
										<span
											key={tech}
											className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 text-xs font-semibold text-slate-700 transition-colors"
										>
											{tech}
										</span>
									))}
								</div>
							</div>

							{/* Metrics & Impact Banner */}
							{item.metrics && (
								<div
									className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
										isIndigo
											? "bg-indigo-50 border-indigo-100 text-indigo-950"
											: "bg-purple-50 border-purple-100 text-purple-950"
									}`}
								>
									<div
										className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
											isIndigo
												? "bg-indigo-600 text-white"
												: "bg-purple-600 text-white"
										}`}
									>
										<Zap className="w-4 h-4" />
									</div>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
											Impact & Efficiency
										</p>
										<p className="text-xs sm:text-sm font-bold mt-0.5">
											{item.metrics}
										</p>
									</div>
								</div>
							)}
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
