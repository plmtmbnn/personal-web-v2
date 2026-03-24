"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TravelPage() {
	const [visible, setVisible] = useState(false);
	useEffect(() => setVisible(true), []);

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-pink-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-4xl mx-auto space-y-12 relative z-10">
				{/* Breadcrumb */}
				<Link
					href="/adventures"
					className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-purple-600 transition-colors gap-1 group"
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
						<div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg">
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
						</div>
						<h1 className="text-4xl sm:text-5xl font-bold text-foreground">
							Travel & Photography
						</h1>
					</div>

					<p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
						Capturing moments and telling stories through the lens. Every
						destination is a new perspective.
					</p>
				</div>

				<div
					className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-xl transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
				>
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-2xl font-bold text-foreground">
							Visual Stories
						</h2>
						<span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider">
							Instagram Moments
						</span>
					</div>

					<div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex justify-center">
						<iframe
							title="Instagram Embed"
							src="https://www.instagram.com/p/DBqBiMYzd4D/embed"
							height="480px"
							className="max-w-[400px] w-full"
							frameBorder="0"
							scrolling="no"
							loading="lazy"
						/>
					</div>

					<div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
						<h3 className="text-lg font-bold text-purple-900 mb-2">
							Intentional Exploration
						</h3>
						<p className="text-muted-foreground leading-relaxed">
							I travel not just to see new places, but to experience the
							cultures and stories that make them unique. Through photography, I
							try to freeze those intentional moments in time.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
