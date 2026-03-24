"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RunningPage() {
	const [visible, setVisible] = useState(false);
	useEffect(() => setVisible(true), []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-teal-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-4xl mx-auto space-y-12 relative z-10">
				{/* Breadcrumb */}
				<Link
					href="/adventures"
					className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-emerald-600 transition-colors gap-1 group"
				>
					<svg
						className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15 19l-7-7 7-7"
						/>
					</svg>
					Back to Adventures
				</Link>

				<div
					className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
				>
					<div className="flex items-center gap-4 mb-6">
						<div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
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
						</div>
						<h1 className="text-4xl sm:text-5xl font-bold text-foreground">
							Running
						</h1>
					</div>

					<p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
						Miles logged, progress made. Every step is a victory in my journey
						to push physical and mental boundaries.
					</p>
				</div>

				<div
					className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-xl transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
				>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-bold text-foreground">
							Weekly Summary
						</h2>
						<span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-wider">
							Live from Strava
						</span>
					</div>

					<div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
						<iframe
							title="Strava Summary"
							src="https://www.strava.com/athletes/38682026/activity-summary/84e311c34f606bea25b477bc6aa3e24b84c55e33"
							height="180px"
							className="w-full"
							frameBorder="0"
							scrolling="no"
							loading="lazy"
						/>
					</div>

					<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
							<h3 className="font-bold text-slate-900 mb-1">Consistency</h3>
							<p className="text-sm text-muted-foreground">
								Running 1000KM+ per year since 2020.
							</p>
						</div>
						<div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
							<h3 className="font-bold text-slate-900 mb-1">Mindset</h3>
							<p className="text-sm text-muted-foreground">
								Running is where I solve my toughest engineering problems.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
