"use client";

import { EXPERIENCE_YEAR } from "@/lib/constants";
import { useEffect, useState } from "react";

interface Experience {
	company: string;
	location: string;
	positions: Position[];
	description: string;
	color: string;
	icon: React.ReactNode;
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
		icon: (
			<svg
				className="w-full h-full"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
		),
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
		icon: (
			<svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2L3 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v8c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V8l7-3.82z" />
			</svg>
		),
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
		icon: (
			<svg
				className="w-full h-full"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 14l9-5-9-5-9 5 9 5z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
				/>
			</svg>
		),
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
		icon: (
			<svg
				className="w-full h-full"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
				/>
			</svg>
		),
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
	const [visible, setVisible] = useState(false);

	useEffect(() => setVisible(true), []);

	return (
		<section className="relative py-16 lg:py-20 px-4 sm:px-6 bg-background overflow-hidden">
			{/* Ambient background */}
			<div className="absolute inset-0">
				<div className="absolute top-24 right-24 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40" />
				<div className="absolute bottom-24 left-24 w-[420px] h-[420px] bg-purple-50 rounded-full blur-3xl opacity-40" />
			</div>

			<div className="relative max-w-6xl mx-auto space-y-16">
				{/* Header */}
				<div
					className={`text-center transition-all duration-700 ${
						visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
					}`}
				>
					<h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
						Work Experience
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{EXPERIENCE_YEAR}+ years building fintech platforms and leading
						engineering teams
					</p>
				</div>

				{/* Timeline */}
				<div className="relative space-y-12">
					<div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-200 sm:-translate-x-1/2" />

					{experiences.map((exp, idx) => (
						<div
							key={String(idx)}
							className={`relative sm:w-[calc(50%-2rem)] transition-all duration-700 ${
								visible
									? "opacity-100 translate-x-0"
									: idx % 2 === 0
										? "opacity-0 -translate-x-6"
										: "opacity-0 translate-x-6"
							} ${idx % 2 === 0 ? "sm:ml-0" : "sm:ml-auto"}`}
						>
							{/* Timeline Dot */}
							<div
								className={`absolute left-4 sm:left-auto ${
									idx % 2 === 0 ? "sm:-right-7" : "sm:-left-7"
								} top-3 w-7 h-7 rounded-full bg-gradient-to-br ${
									exp.color
								} flex items-center justify-center text-white shadow`}
							>
								<div className="w-4 h-4">{exp.icon}</div>
							</div>

							{/* Card */}
							<div className="ml-14 sm:ml-0 bg-white border border-slate-200 rounded-2xl p-5 lg:p-6 shadow-sm hover:shadow-lg transition-all">
								<h3 className="text-xl font-semibold text-foreground">
									{exp.company}
								</h3>

								<div
									className={`w-12 h-1 bg-gradient-to-r ${exp.color} rounded-full my-2`}
								/>

								<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
									<span className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
										{exp.description}
									</span>
									<span className="flex items-center gap-1">
										📍 {exp.location}
									</span>
								</div>

								{/* Positions */}
								<div className="mt-6 space-y-6">
									{exp.positions.map((pos, pIdx) => (
										<div
											key={String(pIdx)}
											className={pIdx ? "pt-5 border-t border-slate-200" : ""}
										>
											<div className="flex flex-wrap items-center justify-between gap-2 mb-3">
												<h4 className="font-semibold text-foreground">
													{pos.title}
												</h4>
												<span className="text-xs text-muted-foreground px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
													{pos.period}
												</span>
											</div>

											<ul className="space-y-2 text-sm text-muted-foreground">
												{pos.responsibilities.map((item, i) => (
													<li key={String(i)} className="flex gap-2">
														<span
															className={`mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${exp.color}`}
														/>
														<span>{item}</span>
													</li>
												))}
											</ul>

											{pos.highlights && (
												<div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
													<p className="text-sm font-semibold mb-2">
														Key Achievements
													</p>
													<ul className="space-y-1 text-sm text-muted-foreground">
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
					))}
				</div>

				{/* Stats */}
				<div
					className={`grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 border-t border-slate-200 transition-all duration-700 ${
						visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
					}`}
				>
					{[
						{ num: `${EXPERIENCE_YEAR}+`, label: "Years Experience" },
						{ num: "4", label: "Companies" },
						{ num: "3", label: "Awards" },
						{ num: "5M+", label: "Users Impacted" },
					].map((s, i) => (
						<div
							key={String(i)}
							className="text-center bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
						>
							<p className="text-2xl font-bold text-foreground">{s.num}</p>
							<p className="text-sm text-muted-foreground">{s.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
