"use client";

import { EXPERIENCE_YEAR } from "@/lib/constants";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

interface Experience {
	company: string;
	location: string;
	positions: Position[];
	description: string;
	color: string;
	icon: any;
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
		color: "from-blue-500 to-cyan-500",
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
		color: "from-purple-500 to-pink-500",
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
		color: "from-orange-500 to-red-500",
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
		color: "from-emerald-500 to-teal-500",
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
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Dynamic Background Ambience */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Header Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center space-y-6 mb-24"
				>
					<div className="flex items-center justify-center gap-3 text-accent mb-4">
						<Briefcase className="w-6 h-6" />
						<span className="text-[10px] font-black uppercase tracking-[0.4em]">
							Career Milestones
						</span>
					</div>
					<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
						Professional <span className="gradient-text">Experience</span>
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
						{EXPERIENCE_YEAR}+ years architecting secure fintech ecosystems and
						leading high-performance engineering cultures.
					</p>
				</motion.div>

				{/* Enhanced Timeline */}
				<div className="relative">
					{/* Central Line */}
					<div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-accent/50 via-indigo-500/20 to-transparent md:-translate-x-1/2" />

					<div className="space-y-24">
						{experiences.map((exp, idx) => {
							const Icon = exp.icon;
							return (
								<motion.div
									key={exp.company}
									initial={{ opacity: 0, y: 40 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true, margin: "-100px" }}
									transition={{ duration: 0.7, delay: idx * 0.1 }}
									className={`relative flex flex-col md:flex-row items-center ${idx % 2 === 0 ? "md:flex-row-reverse" : ""}`}
								>
									{/* Timeline Node */}
									<div className="absolute left-4 md:left-1/2 top-0 md:top-8 w-8 h-8 rounded-full bg-background border-4 border-accent shadow-[0_0_20px_rgba(15,23,42,0.3)] z-20 md:-translate-x-1/2 flex items-center justify-center">
										<div className="w-2 h-2 rounded-full bg-accent animate-ping" />
									</div>

									{/* Card Side */}
									<div
										className={`w-full md:w-1/2 pl-12 md:pl-0 ${idx % 2 === 0 ? "md:pl-16" : "md:pr-16"}`}
									>
										<div className="group relative">
											{/* Hover Gradient Glow */}
											<div
												className={`absolute -inset-0.5 bg-gradient-to-r ${exp.color} rounded-[2.5rem] opacity-0 group-hover:opacity-20 transition duration-500 blur-xl`}
											/>

											<div className="relative glass-card p-8 sm:p-10 rounded-[2.5rem] border-2 border-white/5 bg-white/5 backdrop-blur-xl hover:border-accent/30 transition-all duration-500 shadow-2xl">
												{/* Company Header */}
												<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
													<div className="space-y-1">
														<div className="flex items-center gap-3">
															<div
																className={`p-2 rounded-lg bg-gradient-to-br ${exp.color} text-white shadow-lg`}
															>
																<Icon className="w-5 h-5" />
															</div>
															<h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-accent transition-colors">
																{exp.company}
															</h3>
														</div>
														<p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-10">
															{exp.description}
														</p>
													</div>
													<div className="flex flex-col items-start sm:items-end gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
														<div className="flex items-center gap-2">
															<MapPin className="w-3 h-3" />
															<span>{exp.location}</span>
														</div>
													</div>
												</div>

												{/* Positions Sub-Timeline */}
												<div className="space-y-10 relative">
													{exp.positions.map((pos) => (
														<div
															key={pos.title}
															className="relative pl-6 border-l border-white/10 last:border-transparent"
														>
															{/* Position Indicator */}
															<div className="absolute -left-[5px] top-2 w-[9px] h-[9px] rounded-full bg-white/20 border border-white/40" />

															<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
																<h4 className="text-lg font-bold text-foreground">
																	{pos.title}
																</h4>
																<span className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-accent">
																	<Calendar className="w-3 h-3" />
																	{pos.period}
																</span>
															</div>

															<ul className="space-y-3 mb-6">
																{pos.responsibilities.map((resp, rIdx) => (
																	<li
																		key={String(rIdx)}
																		className="flex gap-3 text-sm text-muted-foreground leading-relaxed font-medium"
																	>
																		<CheckCircle2 className="w-4 h-4 mt-0.5 text-accent/40 flex-shrink-0" />
																		<span>{resp}</span>
																	</li>
																))}
															</ul>

															{pos.highlights && (
																<div className="p-5 bg-accent/5 border border-accent/10 rounded-2xl space-y-3">
																	<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent">
																		<Award className="w-3 h-3" />
																		<span>Key Achievements</span>
																	</div>
																	<ul className="space-y-2">
																		{pos.highlights.map((h, hIdx) => (
																			<li
																				key={String(hIdx)}
																				className="text-xs font-bold text-foreground/80 leading-relaxed italic"
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
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-6"
				>
					{[
						{
							num: `${EXPERIENCE_YEAR}+`,
							label: "Years Experience",
							icon: Briefcase,
						},
						{ num: "4", label: "Companies", icon: Building2 }, // Building2 is part of lucide
						{ num: "3", label: "Awards", icon: Award },
						{ num: "5M+", label: "Users Impacted", icon: Users },
					].map((s) => {
						const SIcon = s.icon === Building2 ? LayoutDashboard : s.icon; // Fail-safe for icon naming
						return (
							<div
								key={s.label}
								className="group p-6 glass-card border-2 border-white/5 rounded-3xl bg-white/5 backdrop-blur-md text-center hover:border-accent/30 transition-all duration-500"
							>
								<div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent mx-auto mb-4 group-hover:scale-110 transition-transform">
									<SIcon className="w-5 h-5" />
								</div>
								<p className="text-3xl font-black text-foreground tracking-tighter">
									{s.num}
								</p>
								<p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">
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

// Fail-safe for building icon
function Building2(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
			<path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
			<path d="M18 9h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
			<path d="M10 6h4" />
			<path d="M10 10h4" />
			<path d="M10 14h4" />
			<path d="M10 18h4" />
		</svg>
	);
}
