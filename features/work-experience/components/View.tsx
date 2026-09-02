"use client";

import { useState } from "react";
import { EXPERIENCE_YEAR } from "@/lib/shared/constants";
import { motion, useReducedMotion } from "framer-motion";
import {
	Briefcase,
	MapPin,
	Calendar,
	Award,
	Zap,
	ShieldCheck,
	Users,
	Cpu,
	CheckCircle2,
	LayoutDashboard,
	Building2,
	ArrowUpRight,
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
					"🏆 World CIO 200 Summit 2024 Winner (Indonesia – Next Gen Category)",
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
		icon: Zap,
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
				highlights: ["🏆 Best Mentor Award 2021"],
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
				highlights: ["🏆 Best Employee Award 2020"],
				skills: ["PHP / Laravel", "JavaScript", "MySQL", "Reporting Engines"],
			},
		],
	},
];

export default function WorkExperience() {
	const reduceMotion = useReducedMotion();
	const [selectedExp, setSelectedExp] = useState<Experience | null>(null);

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 space-y-4"
				>
					<div>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-xs">
							<Briefcase className="w-4 h-4 text-indigo-600" />
							Career Milestones & Leadership
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						Professional <span className="text-indigo-600">Experience</span>
					</h1>
					<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
						Over {EXPERIENCE_YEAR} years architecting secure fintech ecosystems,
						scaling core lending platforms, and building high-performance
						engineering cultures. Click any card for in-depth role details.
					</p>
				</motion.div>

				{/* Timeline */}
				<div className="relative">
					{/* Central Connector Line */}
					<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 md:-translate-x-1/2" />

					<div className="space-y-12 sm:space-y-20">
						{experiences.map((exp, idx) => {
							const Icon = exp.icon;
							return (
								<motion.div
									key={exp.company}
									initial={reduceMotion ? false : { opacity: 0, y: 30 }}
									whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-80px" }}
									transition={{ duration: 0.6, delay: idx * 0.1 }}
									className={`relative flex flex-col md:flex-row items-center ${
										idx % 2 === 0 ? "md:flex-row-reverse" : ""
									}`}
								>
									{/* Timeline Node */}
									<div className="absolute left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-sm z-20 -translate-x-1/2 flex items-center justify-center">
										<div className="w-2 h-2 rounded-full bg-indigo-600" />
									</div>

									{/* Card Side */}
									<div
										className={`w-full md:w-1/2 pl-10 md:pl-0 ${
											idx % 2 === 0 ? "md:pl-12" : "md:pr-12"
										}`}
									>
										<motion.button
											type="button"
											whileHover={{ y: -3 }}
											whileTap={{ scale: 0.99 }}
											onClick={() => setSelectedExp(exp)}
											className="text-left w-full group relative bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200/80 shadow-xs hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
										>
											{/* Clean Company Header */}
											<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-5 border-b border-slate-100">
												<div className="flex items-center gap-3.5">
													<div
														className={`w-11 h-11 rounded-xl border ${exp.color} flex items-center justify-center shrink-0`}
													>
														<Icon className="w-5 h-5" />
													</div>
													<div>
														<div className="flex flex-wrap items-center gap-2">
															<h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
																{exp.company}
															</h3>
															<span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
																{exp.industry}
															</span>
														</div>
														{exp.legalName && (
															<p className="text-xs text-slate-500 font-medium mt-0.5">
																{exp.legalName}
															</p>
														)}
													</div>
												</div>

												<div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 shrink-0">
													<MapPin className="w-3.5 h-3.5 text-slate-400" />
													<span>{exp.location}</span>
												</div>
											</div>

											{/* Positions Sub-Timeline */}
											<div className="space-y-6 relative">
												{exp.positions.map((pos) => (
													<div
														key={pos.title}
														className="relative pl-5 border-l-2 border-slate-100 last:border-transparent"
													>
														{/* Position Indicator */}
														<div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-300 border border-white" />

														<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
															<h4 className="text-base font-extrabold text-slate-900">
																{pos.title}
															</h4>
															<span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-slate-50 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shrink-0 w-fit">
																<Calendar className="w-3.5 h-3.5 text-indigo-600" />
																{pos.period}
															</span>
														</div>

														<ul className="space-y-2 mb-3.5">
															{pos.responsibilities
																.slice(0, 2)
																.map((resp, rIdx) => (
																	<li
																		key={String(rIdx)}
																		className="flex gap-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium"
																	>
																		<CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
																		<span>{resp}</span>
																	</li>
																))}
														</ul>

														{/* Tech Skills Pills */}
														{pos.skills && pos.skills.length > 0 && (
															<div className="flex flex-wrap gap-1.5 pt-1">
																{pos.skills.slice(0, 5).map((skill) => (
																	<span
																		key={skill}
																		className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[10px] font-semibold text-slate-600"
																	>
																		{skill}
																	</span>
																))}
																{pos.skills.length > 5 && (
																	<span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">
																		+{pos.skills.length - 5}
																	</span>
																)}
															</div>
														)}
													</div>
												))}
											</div>

											{/* Card Footer Callout */}
											<div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-indigo-600 transition-colors">
												<span>View complete overview & achievements</span>
												<div className="flex items-center gap-1">
													<span>Deep dive</span>
													<ArrowUpRight className="w-4 h-4" />
												</div>
											</div>
										</motion.button>
									</div>

									{/* Empty Side for MD+ screens to maintain timeline look */}
									<div className="hidden md:block md:w-1/2" />
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* Impact Stats */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mt-20 sm:mt-28 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
				>
					{[
						{
							num: `${EXPERIENCE_YEAR}+`,
							label: "Years Experience",
							icon: Briefcase,
							color: "bg-indigo-50 text-indigo-600 border-indigo-100",
						},
						{
							num: "4",
							label: "Companies",
							icon: Building2,
							color: "bg-cyan-50 text-cyan-600 border-cyan-100",
						},
						{
							num: "3",
							label: "Awards Won",
							icon: Award,
							color: "bg-amber-50 text-amber-600 border-amber-100",
						},
						{
							num: "5M+",
							label: "Users Impacted",
							icon: Users,
							color: "bg-emerald-50 text-emerald-600 border-emerald-100",
						},
					].map((s) => {
						const SIcon = s.icon;
						return (
							<div
								key={s.label}
								className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
							>
								<div
									className={`w-10 h-10 sm:w-12 sm:h-12 border ${s.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3.5`}
								>
									<SIcon className="w-5 h-5 sm:w-6 sm:h-6" />
								</div>
								<p className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
									{s.num}
								</p>
								<p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
									{s.label}
								</p>
							</div>
						);
					})}
				</motion.div>
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
