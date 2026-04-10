"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	PieChart as PieIcon,
	Briefcase,
	Rocket,
	ShieldCheck,
	Search,
	UserPlus,
	BarChart3,
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

export default function PortfolioPage() {
	const [activeSlice, setActiveSlice] = useState<number | null>(null);
	const [expandedSection, setExpandedSection] = useState<string | null>("los");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center space-y-6 mb-20"
				>
					<div className="flex items-center justify-center gap-3 text-accent mb-4">
						<PieIcon className="w-6 h-6" />
						<span className="text-[10px] font-black uppercase tracking-[0.4em]">
							Work Distribution
						</span>
					</div>
					<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
						Project <span className="gradient-text">Portfolio</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
						A comprehensive look at the high-impact systems I've architected,
						focused on fintech core operations and scalable platforms.
					</p>
				</motion.div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Analytics Visualizer (LHS) */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="lg:col-span-5"
					>
						<div className="glass-card p-10 rounded-[2.5rem] border-2 border-white/5 shadow-2xl relative overflow-hidden h-full">
							<div className="flex items-center gap-3 mb-10">
								<div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
								<h3 className="text-sm font-black uppercase tracking-widest text-foreground">
									Expertise Ratio
								</h3>
							</div>

							<div className="flex flex-col items-center">
								{/* Visual SVG Chart */}
								<div className="relative w-64 h-64 sm:w-72 sm:h-72 mb-12">
									<svg
										viewBox="0 0 200 200"
										className="w-full h-full transform -rotate-90"
									>
										{/* LOS & LMS (80%) */}
										<motion.circle
											cx="100"
											cy="100"
											r="80"
											fill="none"
											stroke="currentColor"
											strokeWidth="32"
											className="text-blue-500/80 cursor-pointer"
											strokeDasharray="402 502"
											animate={{
												strokeWidth: activeSlice === 0 ? 40 : 32,
												opacity:
													activeSlice === null || activeSlice === 0 ? 1 : 0.3,
											}}
											onClick={() => {
												setActiveSlice(0);
												setExpandedSection("los");
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
											className="text-purple-500/80 cursor-pointer"
											strokeDasharray="100 502"
											strokeDashoffset="-402"
											animate={{
												strokeWidth: activeSlice === 1 ? 40 : 32,
												opacity:
													activeSlice === null || activeSlice === 1 ? 1 : 0.3,
											}}
											onClick={() => {
												setActiveSlice(1);
												setExpandedSection("other");
											}}
											onMouseEnter={() => setActiveSlice(1)}
											onMouseLeave={() => setActiveSlice(null)}
										/>
									</svg>

									{/* Center Content */}
									<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
										<span className="text-5xl font-black text-foreground tracking-tighter">
											{activeSlice === 0
												? "80%"
												: activeSlice === 1
													? "20%"
													: "100%"}
										</span>
										<span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
											{activeSlice === 0
												? "Fintech"
												: activeSlice === 1
													? "Platform"
													: "Core Focus"}
										</span>
									</div>
								</div>

								{/* Legend */}
								<div className="w-full space-y-3">
									<button
										onClick={() => setExpandedSection("los")}
										className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${expandedSection === "los" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"}`}
									>
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-blue-500" />
											<span className="text-xs font-black uppercase tracking-widest">
												LOS & LMS Systems
											</span>
										</div>
										<span className="text-xs font-bold">80%</span>
									</button>
									<button
										onClick={() => setExpandedSection("other")}
										className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${expandedSection === "other" ? "bg-purple-500/10 border-purple-500/20 text-purple-500" : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"}`}
									>
										<div className="flex items-center gap-3">
											<div className="w-3 h-3 rounded-full bg-purple-500" />
											<span className="text-xs font-black uppercase tracking-widest">
												Notable Platforms
											</span>
										</div>
										<span className="text-xs font-bold">20%</span>
									</button>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Detailed Lists (RHS) */}
					<div className="lg:col-span-7 space-y-6">
						{/* LOS SECTION */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className={`group glass-card rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${expandedSection === "los" ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/5"}`}
						>
							<button
								onClick={() =>
									setExpandedSection(expandedSection === "los" ? null : "los")
								}
								className="w-full p-8 sm:p-10 flex items-center justify-between"
							>
								<div className="flex items-center gap-6">
									<div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
										<Briefcase className="w-7 h-7" />
									</div>
									<div className="text-left">
										<h3 className="text-2xl font-black text-foreground tracking-tight">
											Fintech Core Systems
										</h3>
										<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
											LOS & LMS Architectures
										</p>
									</div>
								</div>
								{expandedSection === "los" ? (
									<ChevronUp className="w-6 h-6 text-muted-foreground" />
								) : (
									<ChevronDown className="w-6 h-6 text-muted-foreground" />
								)}
							</button>

							<AnimatePresence>
								{expandedSection === "los" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
									>
										<div className="px-8 sm:px-10 pb-10 space-y-8">
											<p className="text-muted-foreground font-medium leading-relaxed">
												Scalable Loan Origination and Management engines capable
												of handling high-volume transactions with integrated
												compliance and automated decisioning.
											</p>
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
												{losModules.map((mod, idx) => (
													<div
														key={mod.title}
														className="p-5 bg-white/5 border border-white/5 rounded-2xl group/item hover:border-blue-500/30 transition-all duration-300"
													>
														<div className="flex items-center gap-4 mb-2">
															<mod.icon className="w-5 h-5 text-blue-400 group-hover/item:scale-110 transition-transform" />
															<span className="font-bold text-foreground text-sm">
																{mod.title}
															</span>
														</div>
														<p className="text-xs text-muted-foreground font-medium pl-9">
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
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							className={`group glass-card rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${expandedSection === "other" ? "border-purple-500/30 ring-1 ring-purple-500/20" : "border-white/5"}`}
						>
							<button
								onClick={() =>
									setExpandedSection(
										expandedSection === "other" ? null : "other",
									)
								}
								className="w-full p-8 sm:p-10 flex items-center justify-between"
							>
								<div className="flex items-center gap-6">
									<div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
										<Rocket className="w-7 h-7" />
									</div>
									<div className="text-left">
										<h3 className="text-2xl font-black text-foreground tracking-tight">
											Notable Platforms
										</h3>
										<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
											Specialized Ecosystems
										</p>
									</div>
								</div>
								{expandedSection === "other" ? (
									<ChevronUp className="w-6 h-6 text-muted-foreground" />
								) : (
									<ChevronDown className="w-6 h-6 text-muted-foreground" />
								)}
							</button>

							<AnimatePresence>
								{expandedSection === "other" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
									>
										<div className="px-8 sm:px-10 pb-10 space-y-8">
											<p className="text-muted-foreground font-medium leading-relaxed">
												Highly specialized digital products including InsurTech
												cores, automated identity extraction tools, and
												institutional membership portals.
											</p>
											<div className="space-y-4">
												{otherProjects.map((mod) => (
													<div
														key={mod.title}
														className="p-6 bg-white/5 border border-white/5 rounded-3xl group/item hover:border-purple-500/30 transition-all duration-300 flex items-center gap-6"
													>
														<div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 group-hover/item:scale-110 transition-transform flex-shrink-0">
															<mod.icon className="w-6 h-6" />
														</div>
														<div>
															<h4 className="font-bold text-foreground mb-1">
																{mod.title}
															</h4>
															<p className="text-sm text-muted-foreground font-medium">
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
