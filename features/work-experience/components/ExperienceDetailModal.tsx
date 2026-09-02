"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Calendar,
	MapPin,
	CheckCircle2,
	Award,
	Building2,
	Cpu,
	type LucideIcon,
} from "lucide-react";

export interface Position {
	title: string;
	period: string;
	responsibilities: string[];
	skills?: string[];
	highlights?: string[];
}

export interface Experience {
	company: string;
	legalName?: string;
	location: string;
	industry: string;
	positions: Position[];
	fullOverview?: string;
	color: string;
	badgeColor: string;
	icon: LucideIcon;
	impact?: string;
}

interface ExperienceDetailModalProps {
	experience: Experience | null;
	isOpen: boolean;
	onClose: () => void;
}

export default function ExperienceDetailModal({
	experience,
	isOpen,
	onClose,
}: ExperienceDetailModalProps) {
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

	if (!experience) return null;

	const Icon = experience.icon;

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

					{/* Modal Card */}
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
									className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${experience.color}`}
								>
									<Icon className="w-7 h-7" />
								</div>
								<div className="space-y-1">
									<div className="flex flex-wrap items-center gap-2">
										<h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
											{experience.company}
										</h2>
										<span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
											{experience.industry}
										</span>
									</div>
									{experience.legalName && (
										<p className="text-xs text-slate-500 font-medium">
											{experience.legalName}
										</p>
									)}
									<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 pt-0.5">
										<MapPin className="w-3.5 h-3.5 text-slate-400" />
										<span>{experience.location}</span>
									</div>
								</div>
							</div>

							{/* Overview */}
							{experience.fullOverview && (
								<div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
									<p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
										{experience.fullOverview}
									</p>
								</div>
							)}

							{/* Impact Banner */}
							{experience.impact && (
								<div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3.5 text-indigo-950">
									<div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
										<Building2 className="w-4 h-4" />
									</div>
									<div>
										<p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
											Organizational Impact
										</p>
										<p className="text-xs sm:text-sm font-bold mt-0.5">
											{experience.impact}
										</p>
									</div>
								</div>
							)}

							{/* Roles & Career Progression */}
							<div className="space-y-6">
								<h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
									Roles & Responsibilities
								</h3>

								<div className="space-y-5">
									{experience.positions.map((pos) => (
										<div
											key={pos.title}
											className="p-5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-4"
										>
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<h4 className="text-base font-extrabold text-slate-900">
													{pos.title}
												</h4>
												<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shrink-0 w-fit">
													<Calendar className="w-3.5 h-3.5 text-indigo-600" />
													{pos.period}
												</span>
											</div>

											{/* Responsibilities */}
											<ul className="space-y-2">
												{pos.responsibilities.map((resp, rIdx) => (
													<li
														key={String(rIdx)}
														className="flex gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium"
													>
														<CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
														<span>{resp}</span>
													</li>
												))}
											</ul>

											{/* Highlights */}
											{pos.highlights && pos.highlights.length > 0 && (
												<div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
													<div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
														<Award className="w-4 h-4 text-amber-600" />
														<span>Key Achievements</span>
													</div>
													<ul className="space-y-1">
														{pos.highlights.map((h, hIdx) => (
															<li
																key={String(hIdx)}
																className="text-xs font-semibold text-amber-950 leading-relaxed italic"
															>
																• {h}
															</li>
														))}
													</ul>
												</div>
											)}

											{/* Skills & Tech Stack */}
											{pos.skills && pos.skills.length > 0 && (
												<div className="pt-2 border-t border-slate-200/60">
													<div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
														<Cpu className="w-3.5 h-3.5" />
														<span>Technologies & Practices</span>
													</div>
													<div className="flex flex-wrap gap-1.5">
														{pos.skills.map((skill) => (
															<span
																key={skill}
																className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
															>
																{skill}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
