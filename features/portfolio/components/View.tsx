"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	PieChart as PieIcon,
	Briefcase,
	Rocket,
	ShieldCheck,
	UserPlus,
	PenTool,
	CircleDollarSign,
	Inbox,
	BookText,
	ChevronDown,
	ChevronUp,
	Cpu,
	Fingerprint,
	TrendingUp,
	LayoutDashboard,
} from "lucide-react";

/**
 * Project Data
 */
const losModules = [
	{
		icon: UserPlus,
		title: "Borrower Onboarding",
		desc: "Registration & verification",
	},
	{
		icon: Fingerprint,
		title: "eKYC System",
		desc: "Automated identity validation",
	},
	{
		icon: ShieldCheck,
		title: "Underwriting",
		desc: "Risk assessment workflow",
	},
	{ icon: PenTool, title: "Digital Signing", desc: "Secure document approval" },
	{
		icon: CircleDollarSign,
		title: "Disbursement",
		desc: "Automated fund release",
	},
	{ icon: Inbox, title: "Collections", desc: "Repayment tracking" },
	{ icon: BookText, title: "Accounting", desc: "Reports & compliance" },
];

const otherProjects = [
	{
		icon: ShieldCheck,
		title: "Insurance Core System",
		desc: "Policy & underwriting platform",
	},
	{
		icon: Cpu,
		title: "Standalone Tools",
		desc: "OCR & bank statement extractor",
	},
	{
		icon: LayoutDashboard,
		title: "Organization App",
		desc: "Membership & digital ID system",
	},
	{
		icon: TrendingUp,
		title: "Investment App",
		desc: "Market data & portfolio insights",
	},
];

export default function PortfolioView() {
	const reduceMotion = useReducedMotion();
	const [activeSlice, setActiveSlice] = useState<number | null>(null);
	const [expandedSection, setExpandedSection] = useState<string | null>("los");

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<PieIcon className="w-4 h-4 text-indigo-600" />
							Work Distribution & Platform Architecture
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Project <span className="text-indigo-600">Portfolio</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						A comprehensive breakdown of high-impact fintech core engines,
						digital platforms, and specialized tools I've architected.
					</p>
				</motion.div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Analytics Visualizer (LHS) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="lg:col-span-5"
					>
						<div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden h-full">
							<div className="flex items-center gap-2.5 mb-8">
								<div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse" />
								<h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
									Expertise Distribution
								</h3>
							</div>

							<div className="flex flex-col items-center">
								{/* Visual SVG Chart */}
								<div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-8">
									<svg
										viewBox="0 0 200 200"
										className="w-full h-full transform -rotate-90"
										aria-label="Project Distribution Chart"
										role="img"
									>
										{/* LOS & LMS (80%) */}
										<motion.circle
											cx="100"
											cy="100"
											r="80"
											fill="none"
											stroke="currentColor"
											strokeWidth="32"
											className="text-indigo-600 cursor-pointer focus:outline-none focus-visible:stroke-indigo-400"
											strokeDasharray="402 502"
											role="button"
											tabIndex={0}
											aria-label="Show LOS & LMS systems (80%)"
											animate={{
												strokeWidth: activeSlice === 0 ? 38 : 32,
												opacity:
													activeSlice === null || activeSlice === 0 ? 1 : 0.4,
											}}
											onClick={() => {
												setActiveSlice(0);
												setExpandedSection("los");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setActiveSlice(0);
													setExpandedSection("los");
												}
											}}
											onMouseEnter={() => setActiveSlice(0)}
											onMouseLeave={() => setActiveSlice(null)}
										/>
										{/* Other (20%) */}
										<motion.circle
											cx="100"
											cy="100"
											r="80"
											fill="none"
											stroke="currentColor"
											strokeWidth="32"
											className="text-purple-600 cursor-pointer focus:outline-none focus-visible:stroke-purple-400"
											strokeDasharray="100 502"
											strokeDashoffset="-402"
											role="button"
											tabIndex={0}
											aria-label="Show notable platforms (20%)"
											animate={{
												strokeWidth: activeSlice === 1 ? 38 : 32,
												opacity:
													activeSlice === null || activeSlice === 1 ? 1 : 0.4,
											}}
											onClick={() => {
												setActiveSlice(1);
												setExpandedSection("other");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													setActiveSlice(1);
													setExpandedSection("other");
												}
											}}
											onMouseEnter={() => setActiveSlice(1)}
											onMouseLeave={() => setActiveSlice(null)}
										/>
									</svg>

									{/* Center Content */}
									<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
										<span className="text-4xl font-extrabold text-slate-900 tracking-tight">
											{activeSlice === 0
												? "80%"
												: activeSlice === 1
													? "20%"
													: "11+"}
										</span>
										<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
											{activeSlice === 0
												? "Fintech Core"
												: activeSlice === 1
													? "Platforms"
													: "Total Projects"}
										</span>
									</div>
								</div>

								{/* Legend */}
								<div className="w-full space-y-2.5">
									<button
										onClick={() => {
											setExpandedSection("los");
											setActiveSlice(0);
										}}
										onMouseEnter={() => setActiveSlice(0)}
										onMouseLeave={() => setActiveSlice(null)}
										className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
											expandedSection === "los"
												? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs"
												: "bg-slate-50/80 border-slate-100 text-slate-600 hover:bg-slate-100/80"
										}`}
									>
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-indigo-600" />
											<span className="text-xs font-bold uppercase tracking-wider text-slate-900">
												LOS & LMS Systems
											</span>
										</div>
										<span className="text-xs font-extrabold text-slate-900">
											80%
										</span>
									</button>
									<button
										onClick={() => {
											setExpandedSection("other");
											setActiveSlice(1);
										}}
										onMouseEnter={() => setActiveSlice(1)}
										onMouseLeave={() => setActiveSlice(null)}
										className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 ${
											expandedSection === "other"
												? "bg-purple-50 border-purple-200 text-purple-900 shadow-xs"
												: "bg-slate-50/80 border-slate-100 text-slate-600 hover:bg-slate-100/80"
										}`}
									>
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-purple-600" />
											<span className="text-xs font-bold uppercase tracking-wider text-slate-900">
												Notable Platforms
											</span>
										</div>
										<span className="text-xs font-extrabold text-slate-900">
											20%
										</span>
									</button>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Detailed Lists (RHS) */}
					<div className="lg:col-span-7 space-y-6">
						{/* LOS SECTION */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className={`group bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
								expandedSection === "los"
									? "border-indigo-300 ring-2 ring-indigo-500/10 shadow-lg"
									: "border-slate-200/80"
							}`}
						>
							<button
								onClick={() => {
									setExpandedSection(expandedSection === "los" ? null : "los");
									setActiveSlice(expandedSection === "los" ? null : 0);
								}}
								onMouseEnter={() => setActiveSlice(0)}
								onMouseLeave={() => setActiveSlice(null)}
								aria-expanded={expandedSection === "los"}
								className="w-full p-6 sm:p-8 flex items-center justify-between text-left"
							>
								<div className="flex items-center gap-4 sm:gap-6">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-50 border border-indigo-100/80 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
										<Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>
									<div>
										<h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
											Fintech Core Systems
										</h3>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
											LOS & LMS Architectures
										</p>
									</div>
								</div>
								<div className="p-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
									{expandedSection === "los" ? (
										<ChevronUp className="w-5 h-5" />
									) : (
										<ChevronDown className="w-5 h-5" />
									)}
								</div>
							</button>

							<AnimatePresence>
								{expandedSection === "los" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-6 sm:px-8 pb-8 space-y-6">
											<p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
												Scalable Loan Origination and Management engines capable
												of handling high-volume transactions with integrated
												compliance and automated decisioning.
											</p>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
												{losModules.map((mod) => (
													<div
														key={mod.title}
														className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl group/item hover:bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-300"
													>
														<div className="flex items-center gap-3 mb-1.5">
															<div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover/item:scale-110 transition-transform">
																<mod.icon className="w-4 h-4" />
															</div>
															<span className="font-bold text-slate-900 text-sm">
																{mod.title}
															</span>
														</div>
														<p className="text-xs text-slate-500 font-semibold pl-8">
															{mod.desc}
														</p>
													</div>
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>

						{/* OTHER SECTION */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							className={`group bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md ${
								expandedSection === "other"
									? "border-purple-300 ring-2 ring-purple-500/10 shadow-lg"
									: "border-slate-200/80"
							}`}
						>
							<button
								onClick={() => {
									setExpandedSection(
										expandedSection === "other" ? null : "other",
									);
									setActiveSlice(expandedSection === "other" ? null : 1);
								}}
								onMouseEnter={() => setActiveSlice(1)}
								onMouseLeave={() => setActiveSlice(null)}
								aria-expanded={expandedSection === "other"}
								className="w-full p-6 sm:p-8 flex items-center justify-between text-left"
							>
								<div className="flex items-center gap-4 sm:gap-6">
									<div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-50 border border-purple-100/80 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
										<Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>
									<div>
										<h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
											Notable Platforms
										</h3>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
											Specialized Ecosystems
										</p>
									</div>
								</div>
								<div className="p-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-600">
									{expandedSection === "other" ? (
										<ChevronUp className="w-5 h-5" />
									) : (
										<ChevronDown className="w-5 h-5" />
									)}
								</div>
							</button>

							<AnimatePresence>
								{expandedSection === "other" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-6 sm:px-8 pb-8 space-y-6">
											<p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">
												Highly specialized digital products including InsurTech
												cores, automated identity extraction tools, and
												institutional membership portals.
											</p>
											<div className="space-y-3">
												{otherProjects.map((mod) => (
													<div
														key={mod.title}
														className="p-4 sm:p-5 bg-slate-50/70 border border-slate-200/60 rounded-2xl group/item hover:bg-white hover:border-purple-200 hover:shadow-md transition-all duration-300 flex items-center gap-4"
													>
														<div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover/item:scale-110 transition-transform shrink-0">
															<mod.icon className="w-5 h-5" />
														</div>
														<div>
															<h4 className="font-bold text-slate-900 text-sm sm:text-base">
																{mod.title}
															</h4>
															<p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
																{mod.desc}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</div>
				</div>
			</div>
		</main>
	);
}
