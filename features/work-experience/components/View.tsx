"use client";

import { useState } from "react";
import Link from "next/link";
import { EXPERIENCE_YEAR } from "@/lib/shared/constants";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
	Briefcase,
	MapPin,
	Calendar,
	Award,
	GraduationCap,
	ShieldCheck,
	Cpu,
	CheckCircle2,
	LayoutDashboard,
	ArrowUpRight,
	ArrowRight,
} from "lucide-react";
import ExperienceDetailModal, {
	type Experience,
} from "./ExperienceDetailModal";

const experiences: Experience[] = [
	{
		company: "RELIID",
		legalName: "PT Relianceintegrasi Dunia Anda",
		location: "Indonesia – Remote",
		industry: "Fintech & Enterprise Tech",
		fullOverview:
			"Reliance Group technology arm orchestrating multi-subsidiary digital transformation across financial services, payment gateways, and insurance ecosystems.",
		color: "bg-blue-50 border-blue-200 text-blue-600",
		badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
		icon: Cpu,
		impact: "Scaled unified payment & lending services across 5+ subsidiaries",
		positions: [
			{
				title: "Head of Engineering",
				period: "Oct 2024 – Present",
				responsibilities: [
					"Define and execute engineering strategy across multiple fintech platforms",
					"Lead architecture and scalability of LOS & LMS across holding subsidiaries",
					"Oversee development of RELIID super-app (React Native) integrating multiple products",
				],
				highlights: [
					"Architected Relipay group payment system (QRIS, top-up, bank transfer)",
					"Built OCR KTP API and Bank Statement Extractor for Indonesian banks",
				],
				skills: [
					"React Native",
					"Next.js",
					"Node.js",
					"FastAPI",
					"BI-FAST",
					"System Architecture",
					"Docker",
					"PostgreSQL",
				],
			},
		],
	},
	{
		company: "Finsoft",
		legalName: "PT Solutif Teknologi Indonesia",
		location: "Indonesia – Remote",
		industry: "Fintech & InsurTech",
		fullOverview:
			"Enterprise software consultancy developing core lending infrastructures, national insurance engines, and high-throughput financial microservices.",
		color: "bg-purple-50 border-purple-200 text-purple-600",
		badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
		icon: ShieldCheck,
		impact: "Engineered SIAPPS core platform serving 5M+ active users",
		positions: [
			{
				title: "Chief Technology Officer",
				period: "Apr 2023 – Oct 2024",
				responsibilities: [
					"Led full fintech ecosystem development (LOS, LMS, Insurance Platform)",
					"Directed architecture, security, and engineering execution",
					"Built SIAPPS platform serving 5M+ users",
				],
				highlights: [
					"World CIO 200 Summit 2024 Winner (Indonesia – Next Gen Category)",
					"Integrated multiple banks and payment gateways",
				],
				skills: [
					"Core Banking",
					"LOS / LMS",
					"InsurTech",
					"Microservices",
					"Go",
					"Node.js",
					"Redis",
					"DevOps",
				],
			},
		],
	},
	{
		company: "Cooderu",
		legalName: "EdTech Startup Venture",
		location: "Remote",
		industry: "EdTech & Education",
		fullOverview:
			"Remote-first technology bootcamp focused on training career changers and aspiring software engineers in modern full-stack web and cloud architectures.",
		color: "bg-amber-50 border-amber-200 text-amber-600",
		badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
		icon: GraduationCap,
		impact: "Graduated hundreds of career-ready full-stack software engineers",
		positions: [
			{
				title: "Co-founder & CEO / Lead Instructor",
				period: "Jan 2022 – Dec 2023",
				responsibilities: [
					"Founded and operated remote tech bootcamp",
					"Designed full-stack curriculum (Node.js, React, APIs, Databases)",
					"Led teaching, mentoring, and operations",
				],
				skills: [
					"Full-Stack Curriculum",
					"React",
					"Node.js",
					"REST APIs",
					"PostgreSQL",
					"Technical Mentorship",
				],
			},
		],
	},
	{
		company: "Pinjam Modal",
		legalName: "PT Finaccel Kreasi Indonesia",
		location: "Indonesia – Remote",
		industry: "P2P Lending & Fintech",
		fullOverview:
			"Licensed Indonesian P2P lending platform connecting SMEs and retail borrowers with productive capital, automated scoring, and rapid disbursement.",
		color: "bg-emerald-50 border-emerald-200 text-emerald-600",
		badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
		icon: LayoutDashboard,
		impact:
			"Grew from junior developer to engineering manager scaling core LMS",
		positions: [
			{
				title: "Software Engineering Manager",
				period: "Jan 2022 – Apr 2023",
				responsibilities: [
					"Led cross-functional engineering teams",
					"Managed system architecture and sprint execution",
					"Mentored junior and mid-level engineers",
				],
				highlights: ["Best Mentor Award 2021"],
				skills: [
					"Engineering Management",
					"Agile / Scrum",
					"System Design",
					"Team Leadership",
				],
			},
			{
				title: "Senior Full Stack Developer",
				period: "Oct 2020 – Jan 2022",
				responsibilities: [
					"Built core lending system modules",
					"Integrated KYC, credit scoring, and payment APIs",
				],
				skills: [
					"Node.js",
					"Vue.js / React",
					"Dukcapil eKYC",
					"Payment Gateways",
					"PostgreSQL",
				],
			},
			{
				title: "Full Stack Developer",
				period: "Sep 2018 – Oct 2020",
				responsibilities: [
					"Developed first-generation loan management system",
					"Built internal dashboards and reporting tools",
				],
				highlights: ["Best Employee Award 2020"],
				skills: ["PHP / Laravel", "JavaScript", "MySQL", "Reporting Engines"],
			},
		],
	},
];

const cardVariants: Variants = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
};

export default function WorkExperience() {
	const reduceMotion = useReducedMotion();
	const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-8 sm:space-y-10">
				{/* ── Modern Floating Card Header Standard ── */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs"
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
									<Briefcase className="w-3.5 h-3.5 text-indigo-600" />
								</div>
								<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
									CAREER TIMELINE · LEADERSHIP & SYSTEM ARCHITECTURE
								</span>
							</div>
							<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
								Professional Experience
							</h1>
							<p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
								Over {EXPERIENCE_YEAR} years architecting secure fintech
								ecosystems, scaling core lending platforms, and leading
								high-performance engineering teams.
							</p>
						</div>

						{/* Telemetry Quick Strip */}
						<div className="flex items-center gap-4 sm:gap-5 shrink-0">
							<div className="text-center">
								<p className="text-xl font-extrabold text-slate-900 tabular-nums">
									{EXPERIENCE_YEAR}+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Years
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-indigo-600 tabular-nums">
									4
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Companies
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-amber-600 tabular-nums">
									3
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Awards
								</p>
							</div>
							<div className="w-px h-8 bg-slate-100" />
							<div className="text-center">
								<p className="text-xl font-extrabold text-emerald-600 tabular-nums">
									5M+
								</p>
								<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Users
								</p>
							</div>
						</div>
					</div>
				</motion.div>

				{/* ── 12-Column Two-Column Split Architecture ── */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left Column — Sticky Overview & Honors (4 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
						className="lg:col-span-4 lg:sticky lg:top-24 space-y-4"
					>
						{/* Executive Summary Card */}
						<div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-xs">
							<span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-3">
								Leadership Profile
							</span>
							<h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight mb-2">
								Engineering Leadership
							</h2>
							<p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
								Specialized in enterprise LOS & LMS systems, high-throughput
								financial pipelines, and scaling engineering organizations from
								early venture to millions of active users.
							</p>

							{/* Core Competencies */}
							<div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
								{[
									"Fintech Core",
									"LOS & LMS",
									"BI-FAST Network",
									"eKYC / Dukcapil",
									"System Architecture",
									"Engineering Org Scaling",
								].map((tag) => (
									<span
										key={tag}
										className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px] font-medium text-slate-600"
									>
										{tag}
									</span>
								))}
							</div>
						</div>

						{/* Honors & Recognitions Card */}
						<div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-xs">
							<div className="flex items-center gap-2 mb-3.5">
								<Award className="w-4 h-4 text-amber-600" />
								<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
									Recognitions & Honors
								</span>
							</div>

							<div className="space-y-3">
								<div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
									<p className="text-xs font-bold text-amber-950">
										World CIO 200 Summit 2024
									</p>
									<p className="text-[11px] font-medium text-amber-800/80 mt-0.5">
										Winner · Indonesia Next Gen Category
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
									<p className="text-xs font-bold text-slate-900">
										Best Mentor Award 2021
									</p>
									<p className="text-[11px] font-medium text-slate-500 mt-0.5">
										Pinjam Modal Engineering Team
									</p>
								</div>
								<div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
									<p className="text-xs font-bold text-slate-900">
										Best Employee Award 2020
									</p>
									<p className="text-[11px] font-medium text-slate-500 mt-0.5">
										Pinjam Modal Core Platform
									</p>
								</div>
							</div>
						</div>

						{/* Connected Work Links */}
						<div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs flex items-center justify-between">
							<Link
								href="/portfolio"
								className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 !no-underline"
							>
								<span>View Portfolio</span>
								<ArrowRight className="w-3.5 h-3.5" />
							</Link>
							<div className="w-px h-4 bg-slate-200" />
							<Link
								href="/contact"
								className="text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5 !no-underline"
							>
								<span>Get in Touch</span>
								<ArrowRight className="w-3.5 h-3.5" />
							</Link>
						</div>
					</motion.div>

					{/* Right Column — Chronological Career Track (8 cols) */}
					<motion.div
						className="lg:col-span-8 space-y-5"
						initial={reduceMotion ? false : "hidden"}
						animate="visible"
						variants={{
							visible: { transition: { staggerChildren: 0.08 } },
						}}
					>
						{experiences.map((exp) => {
							const Icon = exp.icon;

							return (
								<motion.div
									key={exp.company}
									variants={cardVariants}
									whileHover={reduceMotion ? undefined : { y: -2 }}
									transition={{ type: "spring", stiffness: 300, damping: 22 }}
								>
									<button
										type="button"
										onClick={() => setSelectedExp(exp)}
										className="w-full text-left bg-white border border-slate-200/80 hover:border-slate-300 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-[border-color,box-shadow] duration-200 cursor-pointer group"
									>
										{/* Company Header Row */}
										<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
											<div className="flex items-center gap-3.5">
												<div
													className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${exp.color} group-hover:scale-105 transition-transform duration-200`}
												>
													<Icon className="w-5 h-5" />
												</div>
												<div>
													<div className="flex flex-wrap items-center gap-2">
														<h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
															{exp.company}
														</h2>
														<span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
															{exp.industry}
														</span>
													</div>
													{exp.legalName && (
														<p className="text-xs text-slate-400 font-medium mt-0.5">
															{exp.legalName}
														</p>
													)}
												</div>
											</div>

											<div className="flex items-center gap-3 shrink-0">
												<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
													<MapPin className="w-3.5 h-3.5 text-slate-400" />
													<span>{exp.location}</span>
												</div>
												<div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 flex items-center justify-center transition-colors">
													<ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
												</div>
											</div>
										</div>

										{/* High-Impact Highlight Callout */}
										{exp.impact && (
											<div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
												<span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
												<span>{exp.impact}</span>
											</div>
										)}

										{/* Positions Progression */}
										<div className="space-y-6 relative">
											{exp.positions.map((pos, pIdx) => (
												<div
													key={pos.title}
													className={`relative ${
														exp.positions.length > 1
															? "pl-5 border-l-2 border-slate-100 pb-2 last:border-transparent last:pb-0"
															: ""
													}`}
												>
													{/* Progression Dot if multi-position */}
													{exp.positions.length > 1 && (
														<div
															className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-white ${
																pIdx === 0 ? "bg-indigo-600" : "bg-slate-300"
															}`}
														/>
													)}

													<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
														<h3 className="text-base font-extrabold text-slate-900">
															{pos.title}
														</h3>
														<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shrink-0 w-fit">
															<Calendar className="w-3 h-3 text-indigo-600" />
															{pos.period}
														</span>
													</div>

													<ul className="space-y-1.5 mb-3">
														{pos.responsibilities
															.slice(0, 2)
															.map((resp, rIdx) => (
																<li
																	key={String(rIdx)}
																	className="flex gap-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium"
																>
																	<CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
																	<span>{resp}</span>
																</li>
															))}
													</ul>

													{/* Tech Skills Pills */}
													{pos.skills && pos.skills.length > 0 && (
														<div className="flex flex-wrap gap-1.5 pt-1">
															{pos.skills.slice(0, 6).map((skill) => (
																<span
																	key={skill}
																	className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/70 text-[10px] font-semibold text-slate-600"
																>
																	{skill}
																</span>
															))}
															{pos.skills.length > 6 && (
																<span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
																	+{pos.skills.length - 6}
																</span>
															)}
														</div>
													)}
												</div>
											))}
										</div>

										{/* Bottom Action Affordance */}
										<div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
											<span>View complete achievements & tech details</span>
											<span className="inline-flex items-center gap-1">
												<span>Deep dive</span>
												<ArrowUpRight className="w-3.5 h-3.5" />
											</span>
										</div>
									</button>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</div>

			{/* Experience Detail Modal */}
			<ExperienceDetailModal
				experience={selectedExp}
				isOpen={Boolean(selectedExp)}
				onClose={() => setSelectedExp(null)}
			/>
		</main>
	);
}
