"use client";

import type { JSX } from "react";
import { Fade, Slide } from "react-awesome-reveal";
import {
	HiAcademicCap,
	HiBriefcase,
	HiCalendar,
	HiLocationMarker,
	HiSparkles,
	HiTrendingUp,
} from "react-icons/hi";
import { FaChartLine, FaCode, FaRocket, FaTrophy } from "react-icons/fa";
import { EXPERIENCE_YEAR } from "@/lib/constants";

/* ---------------------------------- */
/* Types                              */
/* ---------------------------------- */
interface Experience {
	company: string;
	location: string;
	positions: Position[];
	description: string;
	color: string;
	icon: JSX.Element;
}

interface Position {
	title: string;
	period: string;
	responsibilities: string[];
	highlights?: string[];
}

/* ---------------------------------- */
/* Data                               */
/* ---------------------------------- */
const experiences: Experience[] = [
	{
		company: "RELIID (PT Relianceintegrasi Dunia Anda)",
		location: "Indonesia – Remote",
		description: "Technology Solution Company",
		color: "from-blue-500 to-cyan-500",
		icon: <FaRocket />,
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
		icon: <FaTrophy />,
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
		icon: <HiAcademicCap />,
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
		icon: <FaChartLine />,
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

/* ---------------------------------- */
/* Component                          */
/* ---------------------------------- */
const WorkExperience = () => {
	return (
		<section className="min-h-screen bg-white px-4 sm:px-6 py-16 lg:py-24">
			<div className="max-w-6xl mx-auto space-y-20">
				{/* Header */}
				<Fade triggerOnce>
					<div className="text-center space-y-6">
						<h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
							Work Experience
						</h1>

						<p className="max-w-2xl mx-auto text-lg text-slate-600">
							{EXPERIENCE_YEAR}+ years building fintech platforms and leading
							engineering teams
						</p>
					</div>
				</Fade>

				{/* Timeline */}
				<div className="relative space-y-16">
					<div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-200 sm:-translate-x-1/2" />

					{experiences.map((exp, idx) => (
						<Slide
							key={String(idx)}
							direction={idx % 2 === 0 ? "right" : "left"}
							triggerOnce
						>
							<div
								className={`relative sm:w-[calc(50%-2rem)] ${
									idx % 2 === 0 ? "sm:ml-0" : "sm:ml-auto"
								}`}
							>
								{/* Dot */}
								<div
									className={`absolute left-4 sm:left-auto ${
										idx % 2 === 0 ? "sm:-right-8" : "sm:-left-8"
									} top-2 w-8 h-8 rounded-full bg-gradient-to-br ${exp.color} flex items-center justify-center text-white`}
								>
									{exp.icon}
								</div>

								{/* Card */}
								<div className="ml-16 sm:ml-0 bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-sm">
									<h3 className="text-2xl font-bold text-slate-900">
										{exp.company}
									</h3>

									<p className="text-sm text-slate-500 mt-1">
										{exp.description}
									</p>

									<div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
										<HiLocationMarker />
										{exp.location}
									</div>

									<div className="mt-6 space-y-8">
										{exp.positions.map((pos, pIdx) => (
											<div key={String(pIdx)}>
												<div className="flex flex-wrap items-center justify-between gap-2">
													<h4 className="text-lg font-semibold text-slate-900">
														{pos.title}
													</h4>
													<div className="flex items-center gap-2 text-sm text-slate-500">
														<HiCalendar />
														{pos.period}
													</div>
												</div>

												<ul className="mt-4 space-y-2 text-slate-600 text-sm">
													{pos.responsibilities.map((item, i) => (
														<li key={String(i)} className="flex gap-2">
															<span className="mt-1 w-1.5 h-1.5 bg-slate-400 rounded-full" />
															{item}
														</li>
													))}
												</ul>

												{pos.highlights && (
													<div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
														<div className="flex items-center gap-2 mb-2 text-slate-700 font-medium text-sm">
															<HiTrendingUp />
															Key Achievements
														</div>
														<ul className="space-y-1 text-sm text-slate-600">
															{pos.highlights.map((h, i) => (
																<li key={String(i)}>• {h}</li>
															))}
														</ul>
													</div>
												)}
											</div>
										))}
									</div>
								</div>
							</div>
						</Slide>
					))}
				</div>

				{/* Stats */}
				<Fade triggerOnce>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-200">
						{[
							[`${EXPERIENCE_YEAR}+`, "Years Experience", <HiBriefcase />],
							["4", "Companies", <HiLocationMarker />],
							["3", "Awards", <FaTrophy />],
							["5M+", "Users Impacted", <FaCode />],
						].map(([num, label, icon], i) => (
							<div
								key={String(i)}
								className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-sm"
							>
								<div className="flex justify-center mb-3 text-slate-600">
									{icon}
								</div>
								<p className="text-3xl font-bold text-slate-900">{num}</p>
								<p className="text-sm text-slate-500">{label}</p>
							</div>
						))}
					</div>
				</Fade>
			</div>
		</section>
	);
};

export default WorkExperience;
