"use client";

import { useState, useEffect } from "react";

const adventures = [
	{
		title: "Running Milestone",
		description: "Miles logged, progress made. Every step is a victory.",
		embedUrl:
			"https://www.strava.com/athletes/38682026/activity-summary/84e311c34f606bea25b477bc6aa3e24b84c55e33",
		iframeHeight: "200px",
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
		accent: "from-emerald-500 to-teal-500",
		badge: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
			</svg>
		),
	},
	{
		title: "Photography",
		description: "Capturing moments, telling stories through the lens.",
		embedUrl: "https://www.instagram.com/p/DBqBiMYzd4D/embed",
		iframeHeight: "520px",
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
		accent: "from-purple-500 to-pink-500",
		badge: (
			<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
			</svg>
		),
	},
];

export default function Adventure() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-16 lg:py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-6xl mx-auto relative z-10">
				{/* Header */}
				<div
					className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
				>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Adventures
					</h1>
					<p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
						Exploring the world through running and photography
					</p>
				</div>

				{/* Cards */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					{adventures.map((item, index) => (
						<div
							key={item.title}
							className={`group bg-white rounded-2xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden ${
								isVisible
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-10"
							}`}
							style={{ transitionDelay: `${(index + 2) * 100}ms` }}
						>
							{/* Card Header */}
							<div className="p-6 border-b border-slate-100">
								<div className="flex items-start justify-between mb-4">
									<div
										className={`p-4 rounded-xl bg-gradient-to-br ${item.accent} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
									>
										{item.icon}
									</div>

									<div className="p-2 rounded-lg bg-slate-100 text-slate-600">
										{item.badge}
									</div>
								</div>

								<h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-600 transition-colors duration-300">
									{item.title}
								</h3>

								<div
									className={`w-16 h-1 bg-gradient-to-r ${item.accent} rounded-full mb-4`}
								/>

								<p className="text-muted-foreground leading-relaxed">
									{item.description}
								</p>
							</div>

							{/* Embed */}
							<div className="p-6">
								<div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
									<iframe
										title={item.title}
										className="w-full"
										height={item.iframeHeight}
										src={item.embedUrl}
										frameBorder="0"
										scrolling="no"
										loading="lazy"
										allowFullScreen
									/>
								</div>
							</div>

							{/* Footer */}
							<div className="px-6 pb-6">
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<div
										className={`w-2 h-2 rounded-full bg-gradient-to-r ${item.accent} animate-pulse`}
									/>
									<span>Live updates from my journey</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
