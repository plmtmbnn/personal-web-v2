"use client";

import { useEffect, useState } from "react";

const adventures = [
	{
		title: "Running Milestone",
		description: "Miles logged, progress made. Every step is a victory.",
		embedUrl:
			"https://www.strava.com/athletes/38682026/activity-summary/84e311c34f606bea25b477bc6aa3e24b84c55e33",
		iframeHeight: "180px",
		accent: "from-emerald-500 to-teal-500",
		icon: (
			<svg
				className="w-5 h-5"
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
		title: "Photography",
		description: "Capturing moments, telling stories through the lens.",
		embedUrl: "https://www.instagram.com/p/DBqBiMYzd4D/embed",
		iframeHeight: "420px",
		accent: "from-purple-500 to-pink-500",
		icon: (
			<svg
				className="w-5 h-5"
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

export default function Adventure() {
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
					className={`text-center mb-12 transition-all duration-700 ${
						visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
					}`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Adventures
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Running journeys and visual stories I collect along the way
					</p>
				</div>

				{/* Cards */}
				<div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
					{adventures.map((item, i) => (
						<div
							key={item.title}
							style={{ transitionDelay: `${i * 120}ms` }}
							className={`rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition-all duration-500 ${
								visible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-6"
							}`}
						>
							{/* Header */}
							<div className="p-5 border-b border-slate-100">
								<div className="flex items-center gap-4 mb-3">
									<div
										className={`w-10 h-10 flex items-center justify-center rounded-lg bg-gradient-to-br ${item.accent} text-white shadow-sm`}
									>
										{item.icon}
									</div>

									<h3 className="text-xl font-semibold text-foreground">
										{item.title}
									</h3>
								</div>

								<p className="text-sm text-muted-foreground leading-relaxed">
									{item.description}
								</p>
							</div>

							{/* Embed */}
							<div className="p-4">
								<div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
									<iframe
										title={item.title}
										src={item.embedUrl}
										height={item.iframeHeight}
										className="w-full"
										frameBorder="0"
										scrolling="no"
										loading="lazy"
										allowFullScreen
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
