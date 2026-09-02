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
	Rocket,
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
			"Seamless integration with licensed Indonesian PSrE providers",
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
	hidden: { opacity: 0, y: 15 },
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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 relative z-10">
				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4"
				>
					<div>
						<motion.span
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs"
						>
							<PieIcon className="w-4 h-4 text-indigo-600" />
							Work Distribution & Platform Architecture
						</motion.span>
					</div>
					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Project <span className="text-indigo-600">Portfolio</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						A comprehensive breakdown of high-impact fintech core engines,
						digital platforms, and specialized tools I've architected. Click any
						module for in-depth architecture and capability details.
					</p>
				</motion.div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Analytics Visualizer (LHS) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="lg:col-span-5 lg:sticky lg:top-24"
					>
						<div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden h-full">
							<div className="flex items-center gap-2.5 mb-8">
								<div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />
								<h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">
									Expertise Distribution
								</h3>
							</div>

							<div className="flex flex-col items-center">
								{/* Visual SVG Chart */}
								<div className="relative w-56 h-56 sm:w-64 sm:h-64 mb-10 mt-2">
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
											className="text-indigo-600 cursor-pointer focus:outline-none"
											strokeDasharray="402 502"
											role="button"
											tabIndex={0}
											aria-label="Show LOS & LMS systems (80%)"
											animate={{
												strokeWidth: activeSlice === 0 ? 38 : 32,
												opacity:
													activeSlice === null || activeSlice === 0 ? 1 : 0.3,
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
											className="text-purple-600 cursor-pointer focus:outline-none"
											strokeDasharray="100 502"
											strokeDashoffset="-402"
											role="button"
											tabIndex={0}
											aria-label="Show notable platforms (20%)"
											animate={{
												strokeWidth: activeSlice === 1 ? 38 : 32,
												opacity:
													activeSlice === null || activeSlice === 1 ? 1 : 0.3,
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

									{/* Center Content */}
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
												initial={{
													opacity: 0,
													scale: 0.8,
												}}
												animate={{ opacity: 1, scale: 1 }}
												exit={{
													opacity: 0,
													scale: 1.1,
													position: "absolute",
												}}
												transition={{ duration: 0.2 }}
												className="flex flex-col items-center justify-center"
											>
												<span
													className={`text-4xl font-extrabold tracking-tight ${
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
												<span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-0.5">
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

								{/* Legend */}
								<div className="w-full space-y-3">
									<motion.button
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
										onClick={() => {
											setExpandedSection("los");
											setActiveSlice(0);
										}}
										onMouseEnter={() => setActiveSlice(0)}
										onMouseLeave={() => setActiveSlice(null)}
										className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors duration-200 cursor-pointer ${
											expandedSection === "los" || activeSlice === 0
												? "bg-indigo-50 border-indigo-200 text-indigo-900 shadow-xs"
												: "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70"
										}`}
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-3.5 h-3.5 rounded-full transition-colors ${
													activeSlice === 0 || expandedSection === "los"
														? "bg-indigo-600"
														: "bg-indigo-400"
												}`}
											/>
											<span className="text-xs font-bold uppercase tracking-wider text-slate-900">
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
										className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-colors duration-200 cursor-pointer ${
											expandedSection === "other" || activeSlice === 1
												? "bg-purple-50 border-purple-200 text-purple-900 shadow-xs"
												: "bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100/70"
										}`}
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-3.5 h-3.5 rounded-full transition-colors ${
													activeSlice === 1 || expandedSection === "other"
														? "bg-purple-600"
														: "bg-purple-400"
												}`}
											/>
											<span className="text-xs font-bold uppercase tracking-wider text-slate-900">
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

					{/* Detailed Lists (RHS) */}
					<motion.div layout className="lg:col-span-7 space-y-6">
						{/* LOS SECTION */}
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							layout
							className={`group bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
								expandedSection === "los"
									? "border-indigo-300 ring-2 ring-indigo-500/10 shadow-lg"
									: "border-slate-200/80"
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
								className="w-full p-6 sm:p-8 flex items-center justify-between text-left outline-none cursor-pointer"
							>
								<div className="flex items-center gap-5 sm:gap-6">
									<div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0">
										<Briefcase className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>
									<div>
										<h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
											Fintech Core Systems
										</h3>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
											LOS & LMS Architectures
										</p>
									</div>
								</div>
								<motion.div
									animate={{ rotate: expandedSection === "los" ? 180 : 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
									className="p-2 sm:p-2.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-500"
								>
									<ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
								</motion.div>
							</button>

							<AnimatePresence initial={false}>
								{expandedSection === "los" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-6 sm:px-8 pb-8 pt-2">
											<p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base mb-6 border-l-2 border-indigo-200 pl-4">
												Scalable Loan Origination and Management engines capable
												of handling high-volume transactions with integrated
												compliance and automated decisioning.
											</p>

											<motion.div
												className="grid grid-cols-1 sm:grid-cols-2 gap-4"
												initial="hidden"
												animate="visible"
												variants={{
													visible: { transition: { staggerChildren: 0.05 } },
												}}
											>
												{losModules.map((mod) => (
													<motion.button
														type="button"
														variants={cardVariants}
														whileHover={{ y: -3, scale: 1.01 }}
														whileTap={{ scale: 0.98 }}
														key={mod.id}
														onClick={() => setSelectedItem(mod)}
														className="text-left p-4 bg-slate-50/60 border border-slate-200/80 rounded-2xl group/item hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer relative flex flex-col justify-between"
													>
														<div>
															<div className="flex items-center justify-between gap-2 mb-2">
																<div className="flex items-center gap-3">
																	<div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover/item:scale-105 transition-transform duration-200">
																		<mod.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
																	</div>
																	<span className="font-bold text-slate-900 text-sm sm:text-base">
																		{mod.title}
																	</span>
																</div>
																<div className="p-1 rounded-full text-slate-400 group-hover/item:text-indigo-600 group-hover/item:bg-indigo-50 transition-colors">
																	<ArrowUpRight className="w-3.5 h-3.5" />
																</div>
															</div>
															<p className="text-xs text-slate-500 font-semibold pl-11 leading-relaxed">
																{mod.desc}
															</p>
														</div>
														<div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover/item:text-indigo-600 transition-colors">
															<span>View details</span>
															<span>→</span>
														</div>
													</motion.button>
												))}
											</motion.div>
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
							layout
							className={`group bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden shadow-xs hover:shadow-md ${
								expandedSection === "other"
									? "border-purple-300 ring-2 ring-purple-500/10 shadow-lg"
									: "border-slate-200/80"
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
								className="w-full p-6 sm:p-8 flex items-center justify-between text-left outline-none cursor-pointer"
							>
								<div className="flex items-center gap-5 sm:gap-6">
									<div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-50 border border-purple-100 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
										<Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
									</div>
									<div>
										<h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
											Notable Platforms
										</h3>
										<p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
											Specialized Ecosystems
										</p>
									</div>
								</div>
								<motion.div
									animate={{ rotate: expandedSection === "other" ? 180 : 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
									className="p-2 sm:p-2.5 rounded-full bg-slate-50 border border-slate-200/80 text-slate-500"
								>
									<ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
								</motion.div>
							</button>

							<AnimatePresence initial={false}>
								{expandedSection === "other" && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.4, ease: "easeInOut" }}
										style={{ overflow: "hidden" }}
									>
										<div className="px-6 sm:px-8 pb-8 pt-2">
											<p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base mb-6 border-l-2 border-purple-200 pl-4">
												Highly specialized digital products including InsurTech
												cores, automated identity extraction tools, and
												institutional membership portals.
											</p>

											<motion.div
												className="grid grid-cols-1 gap-4"
												initial="hidden"
												animate="visible"
												variants={{
													visible: { transition: { staggerChildren: 0.05 } },
												}}
											>
												{otherProjects.map((mod) => (
													<motion.button
														type="button"
														variants={cardVariants}
														whileHover={{ y: -3, scale: 1.01 }}
														whileTap={{ scale: 0.98 }}
														key={mod.id}
														onClick={() => setSelectedItem(mod)}
														className="text-left p-4 sm:p-5 bg-slate-50/60 border border-slate-200/80 rounded-2xl group/item hover:bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200 flex items-center justify-between gap-5 cursor-pointer"
													>
														<div className="flex items-center gap-4 sm:gap-5">
															<div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-600 group-hover/item:scale-105 transition-transform duration-200 shrink-0">
																<mod.icon className="w-5 h-5" />
															</div>
															<div>
																<div className="flex items-center gap-2">
																	<h4 className="font-bold text-slate-900 text-sm sm:text-base">
																		{mod.title}
																	</h4>
																	<span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60">
																		{mod.tagline}
																	</span>
																</div>
																<p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
																	{mod.desc}
																</p>
															</div>
														</div>
														<div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 group-hover/item:text-purple-600 transition-colors shrink-0 pr-2">
															<span className="hidden sm:inline">Details</span>
															<ArrowUpRight className="w-4 h-4" />
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
