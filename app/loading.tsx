"use client";

import {
	motion,
	useMotionValue,
	useTransform,
	animate,
	useReducedMotion,
} from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalLoading() {
	const progress = useMotionValue(0);
	const reduceMotion = useReducedMotion();
	const [percentText, setPercentText] = useState("0%");

	useEffect(() => {
		// Realistic loader: moves to 40% quickly, then crawls to 95% over time
		const controls = animate(progress, [0, 0.4, 0.75, 0.95], {
			times: [0, 0.12, 0.45, 1],
			duration: 12,
			ease: ["easeOut", "easeInOut", "linear"],
		});

		const unsubscribe = progress.on("change", (latest) => {
			setPercentText(`${Math.round(latest * 100)}%`);
		});

		return () => {
			controls.stop();
			unsubscribe();
		};
	}, [progress]);

	const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

	return (
		<div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md bg-dot-pattern z-[9999] flex flex-col items-center justify-center pointer-events-none select-none">
			{/* Aesthetic Ambient Background Glows */}
			<motion.div
				animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
				transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
				style={{
					x: "-50%",
					y: "-50%",
					background:
						"radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.05) 45%, transparent 70%)",
				}}
			/>

			{/* Floating Glass Container - Modern Floating Card Dashboard Aesthetic */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{
					duration: 0.5,
					ease: [0.23, 1, 0.32, 1],
					type: "spring",
					stiffness: 300,
					damping: 24,
				}}
				className="relative bg-white rounded-3xl p-8 border border-slate-200/80 shadow-2xl shadow-indigo-900/5 flex flex-col items-center gap-7 z-10 max-w-[320px] w-full mx-4 text-center overflow-hidden"
			>
				{/* Top Inner Glow */}
				<div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

				{/* Central Visual */}
				<div className="relative">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
						className="relative w-20 h-20 flex items-center justify-center"
					>
						{/* Outer Ring */}
						<svg
							className="absolute inset-0 w-full h-full text-slate-100"
							viewBox="0 0 100 100"
						>
							<circle
								cx="50"
								cy="50"
								r="46"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							/>
						</svg>

						{/* Animated Ring segments */}
						<svg
							className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
							viewBox="0 0 100 100"
						>
							<circle
								cx="50"
								cy="50"
								r="46"
								fill="none"
								stroke="url(#loading-gradient)"
								strokeWidth="2.5"
								strokeLinecap="round"
								strokeDasharray="60 220"
							/>
							<defs>
								<linearGradient
									id="loading-gradient"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
								>
									<stop offset="0%" stopColor="#818cf8" />
									<stop offset="100%" stopColor="#38bdf8" />
								</linearGradient>
							</defs>
						</svg>
					</motion.div>

					{/* Center Icon */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center relative overflow-hidden">
							<div className="absolute inset-0 bg-indigo-50/50" />
							<motion.div
								animate={{ rotate: -360 }}
								transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
							>
								<Loader2 className="w-5 h-5 text-indigo-500 relative z-10" />
							</motion.div>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="flex flex-col items-center gap-4 w-full relative z-10">
					<div className="space-y-1">
						<h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center justify-center gap-2">
							Synchronizing
							<span className="flex gap-0.5">
								{[0, 1, 2].map((i) => (
									<motion.span
										key={i}
										className="w-1 h-1 rounded-full bg-indigo-500 block"
										animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
										transition={{
											duration: 1.2,
											repeat: Infinity,
											delay: i * 0.2,
										}}
									/>
								))}
							</span>
						</h3>
						<p className="text-xs font-semibold text-slate-500">
							Establishing secure connection
						</p>
					</div>

					{/* Progress Section */}
					<div className="w-full flex flex-col gap-2">
						<div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
							<span>Progress</span>
							<span className="text-indigo-600 tabular-nums">
								{percentText}
							</span>
						</div>
						<div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
							<motion.div
								className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 relative"
								style={{ width: barWidth }}
							>
								{/* Shimmer Effect */}
								<motion.div
									className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
									animate={{ x: ["-100%", "200%"] }}
									transition={{
										duration: 1.5,
										repeat: Infinity,
										ease: "linear",
									}}
								/>
							</motion.div>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
