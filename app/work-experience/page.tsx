"use client";

import { useState, useEffect } from "react";

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

const EXPERIENCE_YEAR = new Date().getFullYear() - 2018;

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
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-16 lg:py-24 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-6xl mx-auto space-y-20 relative z-10">
				{/* Header */}
				<div
					className={`text-center space-y-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
				>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
						Work Experience
					</h1>
					<p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
						{EXPERIENCE_YEAR}+ years building fintech platforms and leading
						engineering teams
					</p>
				</div>

				{/* Timeline */}
				<div className="relative space-y-16">
					<div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-slate-200 sm:-translate-x-1/2" />

					{experiences.map((exp, idx) => (
						<div
							key={String(idx)}
							className={`relative sm:w-[calc(50%-2rem)] transition-all duration-700 delay-${(idx + 1) * 100} ${
								isVisible
									? "opacity-100 translate-x-0"
									: `opacity-0 ${idx % 2 === 0 ? "-translate-x-10" : "translate-x-10"}`
							} ${idx % 2 === 0 ? "sm:ml-0" : "sm:ml-auto"}`}
						>
							{/* Dot */}
							<div
								className={`absolute left-4 sm:left-auto ${
									idx % 2 === 0 ? "sm:-right-8" : "sm:-left-8"
								} top-2 w-8 h-8 rounded-full bg-gradient-to-br ${exp.color} flex items-center justify-center text-white shadow-md`}
							>
								<div className="w-5 h-5">{exp.icon}</div>
							</div>

							{/* Card */}
							<div className="ml-16 sm:ml-0 bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-xl transition-all duration-300">
								<h3 className="text-2xl font-bold text-foreground">
									{exp.company}
								</h3>

								<div
									className={`w-16 h-1 bg-gradient-to-r ${exp.color} rounded-full mt-2 mb-3`}
								></div>

								<p className="text-sm text-muted-foreground mb-2 inline-block px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
									{exp.description}
								</p>

								<div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
									<svg
										className="w-4 h-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									{exp.location}
								</div>

								<div className="mt-6 space-y-8">
									{exp.positions.map((pos, pIdx) => (
										<div
											key={String(pIdx)}
											className={
												pIdx > 0 ? "pt-6 border-t border-slate-200" : ""
											}
										>
											<div className="flex flex-wrap items-center justify-between gap-2 mb-4">
												<h4 className="text-lg font-bold text-foreground">
													{pos.title}
												</h4>
												<div className="flex items-center gap-2 text-sm text-muted-foreground px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
													<svg
														className="w-4 h-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
														/>
													</svg>
													{pos.period}
												</div>
											</div>

											<ul className="space-y-3 text-muted-foreground text-sm">
												{pos.responsibilities.map((item, i) => (
													<li key={String(i)} className="flex gap-3">
														<span
															className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${exp.color} flex-shrink-0`}
														/>
														<span>{item}</span>
													</li>
												))}
											</ul>

											{pos.highlights && (
												<div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
													<div className="flex items-center gap-2 mb-3 text-foreground font-semibold text-sm">
														<svg
															className="w-4 h-4 text-blue-600"
															fill="none"
															viewBox="0 0 24 24"
															stroke="currentColor"
														>
															<path
																strokeLinecap="round"
																strokeLinejoin="round"
																strokeWidth={2}
																d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
															/>
														</svg>
														Key Achievements
													</div>
													<ul className="space-y-2 text-sm text-muted-foreground">
														{pos.highlights.map((h, i) => (
															<li key={String(i)} className="flex gap-2">
																<span>•</span>
																<span>{h}</span>
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
					))}
				</div>

				{/* Stats */}
				<div
					className={`transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
				>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-200">
						{[
							{
								num: `${EXPERIENCE_YEAR}+`,
								label: "Years Experience",
								icon: (
									<svg
										className="w-6 h-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
								),
								color: "text-blue-600",
							},
							{
								num: "4",
								label: "Companies",
								icon: (
									<svg
										className="w-6 h-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
										/>
									</svg>
								),
								color: "text-purple-600",
							},
							{
								num: "3",
								label: "Awards",
								icon: (
									<svg
										className="w-6 h-6"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<path d="M12 2L3 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.82v8c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V8l7-3.82z" />
									</svg>
								),
								color: "text-amber-600",
							},
							{
								num: "5M+",
								label: "Users Impacted",
								icon: (
									<svg
										className="w-6 h-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
										/>
									</svg>
								),
								color: "text-emerald-600",
							},
						].map((stat, i) => (
							<div
								key={String(i)}
								className="p-6 text-center bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
							>
								<div className={`flex justify-center mb-3 ${stat.color}`}>
									{stat.icon}
								</div>
								<p className={`text-3xl font-bold ${stat.color}`}>{stat.num}</p>
								<p className="text-sm text-muted-foreground mt-1">
									{stat.label}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
