"use client";

import { useState } from "react";
import {
	motion,
	AnimatePresence,
	useReducedMotion,
	type Variants,
} from "framer-motion";
import {
	PieChart as PieIcon,
	Briefcase,
	Layers,
	ShieldCheck,
	UserPlus,
	PenTool,
	CircleDollarSign,
	Inbox,
	BookText,
	ChevronDown,
	Cpu,
	Fingerprint,
	TrendingUp,
	LayoutDashboard,
	ArrowUpRight,
} from "lucide-react";
import PortfolioDetailModal, {
	type PortfolioItem,
} from "./PortfolioDetailModal";

/**
 * Enhanced Domain Project Data
 */
const losModules: PortfolioItem[] = [
	{
		id: "borrower-onboarding",
		icon: UserPlus,
		title: "Borrower Onboarding",
		desc: "Multi-channel applicant registration & pre-screening engine",
		category: "Fintech Core",
		tagline: "Seamless borrower acquisition with dynamic validation forms",
		fullDescription:
			"Streamlines borrower acquisition through omni-channel web and mobile portals. Features dynamic multi-step application forms, preliminary eligibility calculation, duplicate account detection, and instant document pre-validation.",
		capabilities: [
			"Dynamic multi-tier borrower classification (Individual, SME, Corporate)",
			"Real-time phone (OTP / WhatsApp) and email verification",
			"Anti-fraud duplicate registration & device fingerprint detection",
			"Instant pre-qualification and borrowing limit estimators",
		],
		techHighlights: [
			"Next.js App Router",
			"Redis Rate Limiter",
			"Twilio & WhatsApp API",
			"PostgreSQL / Prisma",
		],
		metrics: "Reduced drop-off by 35% with auto-save & instant pre-fill",
		themeColor: "indigo",
	},
	{
		id: "ekyc-system",
		icon: Fingerprint,
		title: "eKYC System",
		desc: "AI-powered biometric identity validation & liveness detection",
		category: "Fintech Core",
		tagline:
			"Instant identity verification compliant with regulatory standards",
		fullDescription:
			"Automated biometric identity verification integrated directly with government database pipelines (Dukcapil) and certified verification providers. Employs OCR image preprocessing, active/passive liveness detection, and facial recognition matching.",
		capabilities: [
			"Instant Indonesian KTP OCR with high-accuracy field parsing",
			"Passive and active facial liveness anti-spoofing detection",
			"Dukcapil direct API data cross-referencing & biometric matching",
			"Automated AML (Anti-Money Laundering) and PEP screening",
		],
		techHighlights: [
			"Custom Vision OCR Model",
			"Biometric Match API",
			"Dukcapil Gateway",
			"AES-256 Data Encryption",
		],
		metrics: "Sub-3-second identity verification with 99.4% OCR accuracy",
		themeColor: "indigo",
	},
	{
		id: "underwriting",
		icon: ShieldCheck,
		title: "Underwriting",
		desc: "Rule-based & AI credit scoring, risk assessment workflow",
		category: "Fintech Core",
		tagline: "Intelligent credit assessment engine for multi-tier decisioning",
		fullDescription:
			"Orchestrates multi-dimensional credit evaluation by fusing alternative financial data, bank statement parsing, and historical repayment signals. Supports multi-tier committee approvals, rule matrix configuration, and automated risk scoring.",
		capabilities: [
			"Configurable credit scoring engine with custom risk rule weights",
			"Pefindo / SLIK OJK credit bureau data parsing and synthesis",
			"Automated bank statement turnover & cash flow analyzer",
			"Multi-level hierarchical approval workflows with audit logs",
		],
		techHighlights: [
			"Rule Matrix Engine",
			"Bank Statement Analyzer",
			"SLIK / Pefindo Bureau API",
			"Event-Driven Architecture",
		],
		metrics: "Automated 70%+ of standard retail loan decisioning",
		themeColor: "indigo",
	},
	{
		id: "digital-signing",
		icon: PenTool,
		title: "Digital Signing",
		desc: "PSrE-certified cryptographic digital document signing",
		category: "Fintech Core",
		tagline: "Legally binding electronic contracts with certified CAs",
		fullDescription:
			"Enterprise digital signing pipeline interfacing with licensed PSrE Certificate Authorities (PrivyID, VIDA, Peruri). Generates immutable PDF contracts with dynamic watermark timestamps, cryptographic seals, and audit trails.",
		capabilities: [
			"Direct integration with licensed Indonesian PSrE providers",
			"Dynamic loan agreement generation with automated template variables",
			"Biometric-authorized signature placement with OTP validation",
			"Tamper-evident cryptographic verification and audit certificates",
		],
		techHighlights: [
			"PrivyID / VIDA SDK",
			"PDF Generation Engine",
			"Cryptographic Hashing",
			"Webhook Orchestration",
		],
		metrics: "100% paperless closing with instant contract issuance",
		themeColor: "indigo",
	},
	{
		id: "disbursement",
		icon: CircleDollarSign,
		title: "Disbursement",
		desc: "Automated real-time multi-bank & e-wallet fund release",
		category: "Fintech Core",
		tagline: "Instant payout gateway with automated account name validation",
		fullDescription:
			"High-throughput disbursement pipeline connected to national payment gateways and major banking disbursement APIs (BCA, Mandiri, BRI, BNI). Features automated account inquiry validation, balance monitoring, and instant retry queues.",
		capabilities: [
			"Direct Bank Disbursement via BI-FAST, SKN, and Real-Time RTGS",
			"Instant automated Name Validation & account matching",
			"Automated retry queues with circuit breakers for bank downtime",
			"Multi-wallet disbursement (GoPay, OVO, DANA, ShopeePay)",
		],
		techHighlights: [
			"BI-FAST Network",
			"Payment Gateway APIs",
			"BullMQ / Redis Queue",
			"Reconciliation Engine",
		],
		metrics: "Average fund release in < 15 seconds after contract signing",
		themeColor: "indigo",
	},
	{
		id: "collections",
		icon: Inbox,
		title: "Collections",
		desc: "Automated repayment scheduling, billing & virtual accounts",
		category: "Fintech Core",
		tagline:
			"Intelligent repayment tracking and multi-channel billing reminders",
		fullDescription:
			"Comprehensive Loan Management System (LMS) collection engine managing billing schedules, penalty calculations, dynamic Virtual Account generation, and automated omnichannel notification escalations.",
		capabilities: [
			"Automated Virtual Account (VA) generation across 10+ major banks",
			"Multi-tier escalation triggers (SMS, WhatsApp, Automated Voice, Push)",
			"Early repayment, partial payment, and fee restructuring support",
			"Field collection mobile portal synchronization & real-time logging",
		],
		techHighlights: [
			"Dynamic VA Gateways",
			"Cron Dispatcher",
			"WhatsApp Business API",
			"Realtime WebSocket Updates",
		],
		metrics: "Improved Day-1 on-time repayment rate by 22%",
		themeColor: "indigo",
	},
	{
		id: "accounting",
		icon: BookText,
		title: "Accounting",
		desc: "Automated general ledger, reconciliation & regulatory reporting",
		category: "Fintech Core",
		tagline:
			"Financial compliance, journal automation, and audit-ready reports",
		fullDescription:
			"Core LMS accounting engine automating daily settlement reconciliation, interest accrual calculations, provision for impairment (CKPN), and standardized regulatory reporting compliant with OJK (Fintag/Pusdafil).",
		capabilities: [
			"Automated double-entry bookkeeping and real-time journal posting",
			"Daily automated bank reconciliation and dispute resolution",
			"OJK Pusdafil & Fintag automated XML/JSON report generation",
			"PSA 71 / IFRS 9 expected credit loss & CKPN provisioning",
		],
		techHighlights: [
			"Automated Ledger Engine",
			"OJK Regulatory Exporter",
			"High-Precision Decimal Math",
			"Audit Trail Vault",
		],
		metrics:
			"Zero-discrepancy daily settlement across multi-billion IDR volume",
		themeColor: "indigo",
	},
];

const otherProjects: PortfolioItem[] = [
	{
		id: "insurance-core",
		icon: ShieldCheck,
		title: "Insurance Core System",
		desc: "End-to-end policy lifecycle, underwriting & claims platform",
		category: "Specialized Platform",
		tagline: "Comprehensive InsurTech backbone for life & general insurance",
		fullDescription:
			"Enterprise insurance core management system handling product configuration, automated rating engines, premium quotation, policy issuance, endorsement, and digital claims processing.",
		capabilities: [
			"Dynamic insurance product builder with custom benefit matrices",
			"Automated rating & premium calculation engine",
			"Digital claims submission with hospital/TPA billing integration",
			"B2B broker and agency hierarchy commission management",
		],
		techHighlights: [
			"Microservices Architecture",
			"Dynamic Formula Engine",
			"TPA Gateway",
			"Secure Document Vault",
		],
		metrics: "Manages policies for 500k+ insured members",
		themeColor: "purple",
	},
	{
		id: "standalone-tools",
		icon: Cpu,
		title: "Standalone Tools",
		desc: "High-speed OCR parser & intelligent bank statement extractor",
		category: "Specialized Platform",
		tagline: "Modular micro-utilities for automated document intelligence",
		fullDescription:
			"Independent microservices engineered to extract structured data from unstructured financial documents. Extracts transactions, balances, and identity attributes from PDF/scanned bank statements and Indonesian national IDs.",
		capabilities: [
			"Multi-bank statement PDF parser (BCA, Mandiri, BRI, BNI, CIMB)",
			"High-resolution OCR preprocessing with deskewing and contrast normalization",
			"Transaction categorization and income regularity scoring",
			"RESTful API with HMAC authentication and SDK wrappers",
		],
		techHighlights: [
			"FastAPI / Node.js",
			"Tesseract / OpenCV",
			"PDF Plumber Engine",
			"Docker Containers",
		],
		metrics: "Processes multi-page bank statements in < 2 seconds",
		themeColor: "purple",
	},
	{
		id: "organization-app",
		icon: LayoutDashboard,
		title: "Organization App",
		desc: "Membership ecosystem, digital ID credentials & event platform",
		category: "Specialized Platform",
		tagline: "All-in-one institutional community and credential platform",
		fullDescription:
			"Community super-app built for institutions and professional organizations. Delivers verifiable digital membership cards, tiered permissions, event ticketing with QR check-in, and member-to-member networking.",
		capabilities: [
			"Cryptographic dynamic QR digital membership ID cards",
			"Event management with real-time scanner check-in",
			"Member directory with privacy-preserving contact exchange",
			"Integrated notification announcements and fee collection",
		],
		techHighlights: [
			"React Native / Expo",
			"Supabase / PostgreSQL",
			"Dynamic QR Code Engine",
			"Push Notification Service",
		],
		metrics: "Serving 50k+ active organization members",
		themeColor: "purple",
	},
	{
		id: "investment-app",
		icon: TrendingUp,
		title: "Investment App",
		desc: "Market intelligence, fear & greed index & portfolio telemetry",
		category: "Specialized Platform",
		tagline:
			"Real-time stock & crypto sentiment tracking and asset visualization",
		fullDescription:
			"Financial analytics platform aggregating real-time market sentiment, institutional foreign flow tracking, fear & greed indexes, and interactive investment asset calculators.",
		capabilities: [
			"Real-time composite scoring engine and sector heatmaps",
			"Whale accumulation and foreign flow tracking analytics",
			"Average down / capital allocation simulator",
			"Interactive technical chart integration and alert webhooks",
		],
		techHighlights: [
			"Next.js App Router",
			"Recharts / Chart.js",
			"Redis Cache",
			"Financial Market APIs",
		],
		metrics: "Sub-millisecond sentiment caching with live telemetry",
		themeColor: "purple",
	},
];

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
};

export default function PortfolioView() {
	const reduceMotion = useReducedMotion();
	const [activeSlice, setActiveSlice] = useState<number | null>(null);
	const [expandedSection, setExpandedSection] = useState<string | null>("los");
	const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10">
				{/* ── Floating Card Header ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-8 sm:mb-10"
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
									<PieIcon className="w-3.5 h-3.5 text-indigo-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									PORTFOLIO · fintech & platform architecture
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Project Portfolio
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								Fintech core engines, digital platforms, and specialized tools.
								Click any module for architecture details.
							</p>
						</div>

						{/* Quick stat row */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									11+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Systems
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									80%
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Fintech
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-purple-600 tabular-nums">
									20%
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Platforms
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── Content Grid ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Analytics Visualizer — sticky LHS */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
						className="lg:col-span-4 lg:sticky lg:top-24"
					>
						<div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-xs">
							<div className="flex items-center gap-2 mb-5">
								<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Expertise Distribution
								</span>
							</div>

							{/* SVG Donut Chart */}
							<div className="flex flex-col items-center">
								<div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-6">
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
											strokeWidth={30}
											initial={false}
											className="text-indigo-600 cursor-pointer"
											strokeDasharray="402 502"
											role="button"
											tabIndex={0}
											aria-label="Show LOS & LMS systems (80%)"
											animate={{
												strokeWidth: activeSlice === 0 ? 38 : 30,
												opacity:
													activeSlice === null || activeSlice === 0 ? 1 : 0.25,
											}}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 20,
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
											strokeWidth={30}
											initial={false}
											className="text-purple-600 cursor-pointer"
											strokeDasharray="100 502"
											strokeDashoffset="-402"
											role="button"
											tabIndex={0}
											aria-label="Show notable platforms (20%)"
											animate={{
												strokeWidth: activeSlice === 1 ? 38 : 30,
												opacity:
													activeSlice === null || activeSlice === 1 ? 1 : 0.25,
											}}
											transition={{
												type: "spring",
												stiffness: 300,
												damping: 20,
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

									{/* Center label */}
									<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
										<AnimatePresence mode="wait">
											<motion.div
												key={
													activeSlice === 0
														? "los"
														: activeSlice === 1
															? "other"
															: "total"
												}
												initial={{ opacity: 0, scale: 0.85 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 1.1 }}
												transition={{ duration: 0.15 }}
												className="flex flex-col items-center"
											>
												<span
													className={`text-3xl font-extrabold tracking-tight ${
														activeSlice === 0
															? "text-indigo-600"
															: activeSlice === 1
																? "text-purple-600"
																: "text-slate-900"
													}`}
												>
													{activeSlice === 0
														? "80%"
														: activeSlice === 1
															? "20%"
															: "11+"}
												</span>
												<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
													{activeSlice === 0
														? "Fintech Core"
														: activeSlice === 1
															? "Platforms"
															: "Total Projects"}
												</span>
											</motion.div>
										</AnimatePresence>
									</div>
								</div>

								{/* Legend buttons */}
								<div className="w-full space-y-2">
									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											setExpandedSection("los");
											setActiveSlice(0);
										}}
										onMouseEnter={() => setActiveSlice(0)}
										onMouseLeave={() => setActiveSlice(null)}
										className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-[background-color,border-color] duration-200 cursor-pointer ${
											expandedSection === "los" || activeSlice === 0
												? "bg-indigo-50 border-indigo-200"
												: "bg-slate-50 border-slate-200/80 hover:bg-slate-100/70"
										}`}
									>
										<div className="flex items-center gap-2.5">
											<div
												className={`w-2.5 h-2.5 rounded-full ${
													activeSlice === 0 || expandedSection === "los"
														? "bg-indigo-600"
														: "bg-indigo-300"
												}`}
											/>
											<span className="text-xs font-bold text-slate-900">
												LOS & LMS Systems
											</span>
										</div>
										<span className="text-xs font-extrabold text-slate-900">
											80%
										</span>
									</motion.button>

									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											setExpandedSection("other");
											setActiveSlice(1);
										}}
										onMouseEnter={() => setActiveSlice(1)}
										onMouseLeave={() => setActiveSlice(null)}
										className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border transition-[background-color,border-color] duration-200 cursor-pointer ${
											expandedSection === "other" || activeSlice === 1
												? "bg-purple-50 border-purple-200"
												: "bg-slate-50 border-slate-200/80 hover:bg-slate-100/70"
										}`}
									>
										<div className="flex items-center gap-2.5">
											<div
												className={`w-2.5 h-2.5 rounded-full ${
													activeSlice === 1 || expandedSection === "other"
														? "bg-purple-600"
														: "bg-purple-300"
												}`}
											/>
											<span className="text-xs font-bold text-slate-900">
												Notable Platforms
											</span>
										</div>
										<span className="text-xs font-extrabold text-slate-900">
											20%
										</span>
									</motion.button>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Detailed Lists — RHS */}
					<motion.div layout className="lg:col-span-8 space-y-4">
						{/* ── Fintech Core Section ── */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
							layout
							className={`bg-white rounded-2xl border transition-[border-color,box-shadow] duration-300 overflow-hidden shadow-xs ${
								expandedSection === "los"
									? "border-indigo-200 shadow-sm"
									: "border-slate-200/80 hover:shadow-sm"
							}`}
						>
							<button
								type="button"
								onClick={() => {
									setExpandedSection(expandedSection === "los" ? null : "los");
									setActiveSlice(expandedSection === "los" ? null : 0);
								}}
								onMouseEnter={() => setActiveSlice(0)}
								onMouseLeave={() => setActiveSlice(null)}
								aria-expanded={expandedSection === "los"}
								className="w-full p-5 sm:p-6 flex items-center justify-between text-left outline-none cursor-pointer"
							>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 sm:w-11 sm:h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
										<Briefcase className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
											Fintech Core Systems
										</h2>
										<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
											LOS & LMS Architectures · 7 modules
										</p>
									</div>
								</div>
								<motion.div
									animate={{ rotate: expandedSection === "los" ? 180 : 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 22 }}
									className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 shrink-0"
								>
									<ChevronDown className="w-4 h-4" />
								</motion.div>
							</button>

							<AnimatePresence initial={false}>
								{expandedSection === "los" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.35, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-5 sm:px-6 pb-6 pt-1">
											<motion.div
												className="grid grid-cols-1 sm:grid-cols-2 gap-3"
												initial="hidden"
												animate="visible"
												variants={{
													visible: { transition: { staggerChildren: 0.04 } },
												}}
											>
												{losModules.map((mod) => (
													<motion.button
														type="button"
														variants={cardVariants}
														whileHover={{ y: -2 }}
														whileTap={{ scale: 0.98 }}
														key={mod.id}
														onClick={() => setSelectedItem(mod)}
														className="text-left p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl group/item hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer flex flex-col justify-between"
													>
														<div>
															<div className="flex items-center justify-between gap-2 mb-2">
																<div className="flex items-center gap-2.5">
																	<div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover/item:scale-105 transition-transform duration-200">
																		<mod.icon className="w-3.5 h-3.5" />
																	</div>
																	<span className="font-bold text-slate-900 text-xs sm:text-sm">
																		{mod.title}
																	</span>
																</div>
																<ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-indigo-500 transition-colors shrink-0" />
															</div>
															<p className="text-[11px] text-slate-500 font-medium leading-relaxed">
																{mod.desc}
															</p>
														</div>
														<div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
															<p className="text-[10px] font-bold text-slate-400 group-hover/item:text-indigo-500 transition-colors">
																{mod.metrics}
															</p>
														</div>
													</motion.button>
												))}
											</motion.div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>

						{/* ── Notable Platforms Section ── */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
							layout
							className={`bg-white rounded-2xl border transition-[border-color,box-shadow] duration-300 overflow-hidden shadow-xs ${
								expandedSection === "other"
									? "border-purple-200 shadow-sm"
									: "border-slate-200/80 hover:shadow-sm"
							}`}
						>
							<button
								type="button"
								onClick={() => {
									setExpandedSection(
										expandedSection === "other" ? null : "other",
									);
									setActiveSlice(expandedSection === "other" ? null : 1);
								}}
								onMouseEnter={() => setActiveSlice(1)}
								onMouseLeave={() => setActiveSlice(null)}
								aria-expanded={expandedSection === "other"}
								className="w-full p-5 sm:p-6 flex items-center justify-between text-left outline-none cursor-pointer"
							>
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 sm:w-11 sm:h-11 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
										<Layers className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
											Notable Platforms
										</h2>
										<p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
											Specialized Ecosystems · 4 platforms
										</p>
									</div>
								</div>
								<motion.div
									animate={{ rotate: expandedSection === "other" ? 180 : 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 22 }}
									className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 shrink-0"
								>
									<ChevronDown className="w-4 h-4" />
								</motion.div>
							</button>

							<AnimatePresence initial={false}>
								{expandedSection === "other" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.35, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-5 sm:px-6 pb-6 pt-1">
											<motion.div
												className="grid grid-cols-1 sm:grid-cols-2 gap-3"
												initial="hidden"
												animate="visible"
												variants={{
													visible: { transition: { staggerChildren: 0.04 } },
												}}
											>
												{otherProjects.map((mod) => (
													<motion.button
														type="button"
														variants={cardVariants}
														whileHover={{ y: -2 }}
														whileTap={{ scale: 0.98 }}
														key={mod.id}
														onClick={() => setSelectedItem(mod)}
														className="text-left p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl group/item hover:bg-white hover:border-purple-200 hover:shadow-sm transition-[background-color,border-color,box-shadow] duration-200 cursor-pointer flex flex-col justify-between"
													>
														<div>
															<div className="flex items-center justify-between gap-2 mb-2">
																<div className="flex items-center gap-2.5">
																	<div className="p-1.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 group-hover/item:scale-105 transition-transform duration-200">
																		<mod.icon className="w-3.5 h-3.5" />
																	</div>
																	<span className="font-bold text-slate-900 text-xs sm:text-sm">
																		{mod.title}
																	</span>
																</div>
																<ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-purple-500 transition-colors shrink-0" />
															</div>
															<p className="text-[11px] text-slate-500 font-medium leading-relaxed">
																{mod.desc}
															</p>
														</div>
														<div className="mt-2.5 pt-2.5 border-t border-slate-200/60">
															<p className="text-[10px] font-bold text-slate-400 group-hover/item:text-purple-500 transition-colors">
																{mod.metrics}
															</p>
														</div>
													</motion.button>
												))}
											</motion.div>
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</motion.div>
					</motion.div>
				</div>
			</div>

			{/* Portfolio Item Detail Modal */}
			<PortfolioDetailModal
				item={selectedItem}
				isOpen={Boolean(selectedItem)}
				onClose={() => setSelectedItem(null)}
			/>
		</main>
	);
}
