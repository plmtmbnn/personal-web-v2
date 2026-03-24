"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const categories = [
	{
		title: "Running",
		slug: "running",
		description: "Miles logged, progress made. Every step is a victory.",
		accent: "from-emerald-500 to-teal-500",
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
					d="M13 10V3L4 14h7v7l9-11h-7z"
				/>
			</svg>
		),
	},
	{
		title: "Travel",
		slug: "travel",
		description: "Capturing moments, telling stories through the lens.",
		accent: "from-purple-500 to-pink-500",
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
					d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
				/>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
				/>
			</svg>
		),
	},
];

export default function AdventuresLanding() {
	const [visible, setVisible] = useState(false);
	useEffect(() => setVisible(true), []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-6xl mx-auto space-y-16 relative z-10">
				{/* Header */}
				<div
					className={`text-center transition-all duration-700 ${
						visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
					}`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Adventures
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Running journeys and visual stories I collect along the way. Select
						a category to explore further.
					</p>
				</div>

				{/* Selection Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{categories.map((cat, i) => (
						<Link
							key={cat.slug}
							href={`/adventures/${cat.slug}`}
							style={{ transitionDelay: `${i * 150}ms` }}
							className={`group relative p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden ${
								visible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-6"
							}`}
						>
							{/* Background Decoration */}
							<div
								className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-gradient-to-br ${cat.accent} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
							></div>

							<div className="relative z-10 flex flex-col h-full">
								<div
									className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${cat.accent} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}
								>
									{cat.icon}
								</div>

								<h3 className="text-2xl font-bold text-foreground mb-3">
									{cat.title}
								</h3>

								<p className="text-muted-foreground leading-relaxed mb-8 flex-1">
									{cat.description}
								</p>

								<div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
									<span>Explore</span>
									<svg
										className="w-5 h-5 group-hover:translate-x-2 transition-transform"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
