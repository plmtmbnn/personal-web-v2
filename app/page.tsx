"use client";

import { EXPERIENCE_YEAR } from "@/lib/constants";
import Image from "next/image";
import { useState, useEffect } from "react";

// Countdown Hook
const useCountdown = (to: number, duration: number) => {
	const [count, setCount] = useState(0);

	useEffect(() => {
		let start = 0;
		const increment = to / (duration / 16);
		const timer = setInterval(() => {
			start += increment;
			if (start >= to) {
				setCount(to);
				clearInterval(timer);
			} else {
				setCount(Math.floor(start));
			}
		}, 16);

		return () => clearInterval(timer);
	}, [to, duration]);

	return count;
};

const experienceYears = EXPERIENCE_YEAR;

export default function Home() {
	const [isVisible, setIsVisible] = useState(false);
	const yearsCount = useCountdown(experienceYears, 1500);
	const kmCount = useCountdown(1000, 2000);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	return (
		<section
			id="home"
			className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 xl:px-20 py-12 lg:py-6 relative overflow-hidden"
		>
			{/* Enhanced Background with Glassmorphism */}
			<div className="absolute inset-0">
				<div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background"></div>
				<div className="absolute top-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse"
					style={{ animationDelay: "1s" }}
				></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
			</div>

			<div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 xl:grid-cols-3 gap-8 lg:gap-16 xl:gap-20 items-center relative z-10">
				{/* Enhanced Avatar with Glassmorphism */}
				<div
					className={`flex justify-center lg:justify-start xl:justify-center transition-all duration-1000 ${
						isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
					}`}
				>
					<div className="relative group">
						{/* Rotating gradient border */}
						<div className="absolute -inset-1 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 rounded-full opacity-30 blur-lg group-hover:opacity-60 transition duration-500 animate-float"></div>

						{/* Glass ring effect */}
						<div className="absolute -inset-3 rounded-full glass-strong opacity-40 group-hover:opacity-60 transition duration-500"></div>

						{/* Profile Image */}
						<div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-72 xl:h-72 rounded-full overflow-hidden glass-strong group-hover:scale-105 transition-transform duration-500">
							<Image
								src="/profile.jpg"
								alt="Polma Tambunan"
								className="w-full h-full object-cover"
								priority={true}
								width={1000}
								height={1000}
							/>
						</div>

						{/* Enhanced Online indicator with glow */}
						<div className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6">
							<div className="relative">
								<div className="absolute inset-0 w-6 h-6 lg:w-8 lg:h-8 bg-emerald-400 rounded-full blur-md animate-pulse"></div>
								<div className="relative w-6 h-6 lg:w-8 lg:h-8 bg-emerald-500 rounded-full border-3 border-background shadow-lg"></div>
							</div>
						</div>
					</div>
				</div>

				{/* Enhanced Text Content with Glassmorphism */}
				<div className="lg:col-span-4 xl:col-span-2 space-y-6 sm:space-y-8 lg:space-y-10 text-left">
					<div
						className={`space-y-4 lg:space-y-6 transition-all duration-1000 delay-150 ${
							isVisible
								? "opacity-100 translate-x-0"
								: "opacity-0 -translate-x-10"
						}`}
					>
						<div className="flex items-center gap-3 text-muted-foreground text-sm lg:text-base font-medium tracking-wider uppercase">
							<div className="w-12 lg:w-16 h-px bg-gradient-to-r from-accent to-transparent"></div>
							<span className="glow-text">Software Engineer</span>
						</div>

						<h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-5xl font-bold text-foreground leading-tight">
							Hi 🌏, I'm{" "}
							<span className="gradient-text glow-text">Polma Tambunan</span>.
						</h1>

						<div className="w-24 lg:w-32 h-1.5 bg-gradient-to-r from-accent via-purple-500 to-cyan-500 rounded-full shadow-lg glow"></div>
					</div>

					<p
						className={`text-lg sm:text-xl lg:text-2xl xl:text-xl text-muted-foreground max-w-4xl leading-relaxed transition-all duration-1000 delay-300 ${
							isVisible
								? "opacity-100 translate-x-0"
								: "opacity-0 -translate-x-10"
						}`}
					>
						For the past{" "}
						<span className="text-accent font-semibold glow-text">
							{experienceYears}+ years
						</span>
						, I've been building secure, scalable, and impactful
						software—primarily in the{" "}
						<span className="text-purple-400 font-semibold">fintech space</span>
						. From lending platforms to digital identity systems, I bring
						engineering focus to critical business needs.
					</p>

					{/* Enhanced Stats Cards with Glassmorphism */}
					<div
						className={`grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 transition-all duration-1000 delay-500 ${
							isVisible
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-10"
						}`}
					>
						<div className="group relative overflow-hidden rounded-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative glass-card flex items-center gap-4 lg:gap-6 group-hover:border-accent/30 transition-all duration-500">
								<div className="p-4 bg-gradient-to-br from-accent to-purple-600 rounded-xl shadow-lg glow">
									<svg
										className="w-6 h-6 lg:w-8 lg:h-8 text-white"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
										/>
									</svg>
								</div>
								<div>
									<p className="text-3xl lg:text-4xl font-bold text-foreground glow-text">
										{yearsCount}+ Years
									</p>
									<p className="text-muted-foreground text-sm lg:text-base">
										Software Development
									</p>
								</div>
							</div>
						</div>

						<div className="group relative overflow-hidden rounded-2xl">
							<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
							<div className="relative glass-card flex items-center gap-4 lg:gap-6 group-hover:border-emerald-400/30 transition-all duration-500">
								<div className="p-4 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-xl shadow-lg glow">
									<svg
										className="w-6 h-6 lg:w-8 lg:h-8 text-white"
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
								<div>
									<p className="text-3xl lg:text-4xl font-bold text-foreground glow-text">
										{kmCount}+ KM
									</p>
									<p className="text-muted-foreground text-sm lg:text-base">
										Running per year
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Enhanced Scroll Indicator with Glassmorphism */}
			<div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
				<div className="glass-strong w-6 h-10 rounded-full flex justify-center p-2 glow">
					<div className="w-1.5 h-3 bg-accent rounded-full animate-pulse shadow-lg"></div>
				</div>
			</div>
		</section>
	);
}
