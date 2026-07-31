"use client";

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
	type LucideIcon,
} from "lucide-react";

interface Experience {
	company: string;
	location: string;
	positions: Position[];
	description: string;
	color: string;
	icon: LucideIcon;
}

interface Position {
	title: string;
	period: string;
	responsibilities: string[];
	highlights?: string[];
}

const experiences: Experience[] = [
	{
		company: "RELIID (PT Relianceintegrasi Dunia Anda)",
		location: "Indonesia – Remote",
		description: "Technology Solution Company",
		color: "bg-blue-500",
		icon: Cpu,
		positions: [
			{
				title: "Head of Engineering",
				period: "Oct 2024 – Present",
				responsibilities: [
					"Define and execute engineering strategy across multiple fintech platforms",
					"Lead architecture and scalability of LOS & LMS across holding subsidiaries",
					"Oversee development of RELIID super-app integrating multiple products",
				],
				highlights: [
					"Architected Relipay group payment system (QRIS, top-up, bank transfer)",
					"Built OCR KTP API and Bank Statement Extractor for Indonesian banks",
				],
			},
		],
	},
	{
		company: "Finsoft (PT. Solutif Teknologi Indonesia)",
		location: "Indonesia – Remote",
		description: "Technology Solution Company",
		color: "bg-purple-500",
		icon: ShieldCheck,
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
			},
		],
	},
	{
		company: "Cooderu",
		location: "Remote",
		description: "EdTech Startup",
		color: "bg-orange-500",
		icon: Zap,
		positions: [
			{
				title: "Co-founder & CEO / Lead Instructor",
				period: "Jan 2022 – Dec 2023",
				responsibilities: [
					"Founded and operated remote tech bootcamp",
					"Designed full-stack curriculum (Node.js, React, APIs, Databases)",
					"Led teaching, mentoring, and operations",
				],
			},
		],
	},
	{
		company: "Pinjam Modal",
		location: "Indonesia – Remote",
		description: "Fintech Company",
		color: "bg-emerald-500",
		icon: LayoutDashboard,
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
			},
			{
				title: "Senior Full Stack Developer",
				period: "Oct 2020 – Jan 2022",
				responsibilities: [
					"Built core lending system modules",
					"Integrated KYC, credit scoring, and payment APIs",
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
			},
		],
	},
];

export default function WorkExperience() {
	const reduceMotion = useReducedMotion();
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
						engineering cultures.
					</p>
				</motion.div>

				{/* Enhanced Timeline */}
				<div className="relative">
					{/* Central Line */}
					<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200/80 md:-translate-x-1/2" />

					<div className="space-y-16 sm:space-y-24">
						{experiences.map((exp, idx) => {
							const Icon = exp.icon;
							return (
								<motion.div
									key={exp.company}
									initial={reduceMotion ? false : { opacity: 0, y: 40 }}
									whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-100px" }}
									transition={{ duration: 0.7, delay: idx * 0.1 }}
									className={`relative flex flex-col md:flex-row items-center ${
										idx % 2 === 0 ? "md:flex-row-reverse" : ""
									}`}
								>
									{/* Timeline Node */}
									<div className="absolute left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 rounded-full bg-white border-4 border-indigo-600 shadow-md shadow-indigo-500/20 z-20 -translate-x-1/2 flex items-center justify-center">
										<div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
									</div>

									{/* Card Side */}
									<div
										className={`w-full md:w-1/2 pl-10 md:pl-0 ${
											idx % 2 === 0 ? "md:pl-14" : "md:pr-14"
										}`}
									>
										<div className="group relative">
											<div className="relative bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200/80 transition-all duration-300 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-200/80 hover:border-slate-300">
												{/* Company Header */}
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-6 border-b border-slate-100">
													<div className="space-y-1">
														<div className="flex items-center gap-3">
															<div
																className={`p-2 rounded-xl ${exp.color} text-white shadow-xs`}
															>
																<Icon className="w-5 h-5" />
															</div>
															<h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
																{exp.company}
															</h3>
														</div>
														<p className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-11">
															{exp.description}
														</p>
													</div>
													<div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 pl-11 sm:pl-0">
														<MapPin className="w-3.5 h-3.5 text-slate-400" />
														<span>{exp.location}</span>
													</div>
												</div>

												{/* Positions Sub-Timeline */}
												<div className="space-y-8 relative">
													{exp.positions.map((pos) => (
														<div
															key={pos.title}
															className="relative pl-5 border-l-2 border-slate-100 last:border-transparent"
														>
															{/* Position Indicator */}
															<div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-slate-300 border border-white" />

															<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
																<h4 className="text-base sm:text-lg font-extrabold text-slate-900">
																	{pos.title}
																</h4>
																<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 shrink-0">
																	<Calendar className="w-3.5 h-3.5 text-indigo-600" />
																	{pos.period}
																</span>
															</div>

															<ul className="space-y-2.5 mb-5">
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

															{pos.highlights && (
																<div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-2.5 shadow-2xs">
																	<div className="flex items-center gap-2 text-xs font-extrabold text-amber-900 uppercase tracking-wider">
																		<Award className="w-4 h-4 text-amber-600" />
																		<span>Key Achievements</span>
																	</div>
																	<ul className="space-y-1.5">
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
														</div>
													))}
												</div>
											</div>
										</div>
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
					className="mt-24 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
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
								className="group p-5 sm:p-6 bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl text-center shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
							>
								<div
									className={`w-10 h-10 sm:w-12 sm:h-12 border ${s.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3.5 group-hover:scale-110 transition-transform shadow-2xs`}
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
		</main>
	);
}
