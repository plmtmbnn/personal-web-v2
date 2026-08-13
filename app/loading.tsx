"use client";

import {
	motion,
	useMotionValue,
	useTransform,
	animate,
	useReducedMotion,
} from "framer-motion";
import { Zap } from "lucide-react";
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
		<div className="fixed inset-0 bg-slate-50/90 backdrop-blur-2xl bg-dot-pattern z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden select-none">
			{/* Aesthetic Ambient Background Glows */}
			<motion.div
				animate={{ scale: [1, 1.12, 1], opacity: [0.1, 0.22, 0.1] }}
				transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-1/2 left-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
				style={{
					x: "-50%",
					y: "-50%",
					background:
						"radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 45%, transparent 70%)",
				}}
			/>

			{/* Floating Glass Container */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 16 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
				className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col items-center gap-6 z-10 max-w-sm w-full mx-4 text-center"
			>
				{/* Orbiting Ring Hero */}
				<motion.div
					animate={{ y: [0, -6, 0] }}
					transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
					className="relative w-22 h-22 flex items-center justify-center"
				>
					{/* Outer SVG Orbit Ring */}
					<motion.svg
						className="absolute inset-0"
						width="88"
						height="88"
						viewBox="0 0 88 88"
						animate={{ rotate: 360 }}
						transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
					>
						<circle
							cx="44"
							cy="44"
							r="40"
							fill="none"
							stroke="rgba(226,232,240,0.8)"
							strokeWidth="1.5"
						/>
						<circle
							cx="44"
							cy="44"
							r="40"
							fill="none"
							stroke="url(#loading-orbit-gradient)"
							strokeWidth="3"
							strokeLinecap="round"
							strokeDasharray="70 180"
						/>
						<defs>
							<linearGradient
								id="loading-orbit-gradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
								<stop offset="50%" stopColor="#6366f1" />
								<stop offset="100%" stopColor="#06b6d4" />
							</linearGradient>
						</defs>
					</motion.svg>

					{/* Inner Dark Badge */}
					<div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-xl shadow-slate-900/20 relative z-10">
						<Zap className="w-6 h-6 text-indigo-400 fill-indigo-400/20" />
					</div>
				</motion.div>

				{/* Label + Percentage Counter */}
				<div className="flex flex-col items-center gap-3 w-full">
					<div className="flex items-center gap-2">
						<span className="text-xs font-black tracking-[0.25em] text-slate-800 uppercase">
							Synchronizing
						</span>
						<span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-extrabold text-indigo-600 tabular-nums">
							{percentText}
						</span>
					</div>

					{/* Animated Pulse Dots */}
					<div className="flex gap-1.5 items-center">
						{[0, 0.2, 0.4].map((delay, i) => (
							<motion.div
								key={String(i)}
								className="w-1.5 h-1.5 rounded-full bg-indigo-500"
								animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
								transition={{ duration: 1.2, repeat: Infinity, delay }}
							/>
						))}
					</div>

					{/* Progress Track & Bar */}
					<div className="w-full max-w-[200px] h-2 rounded-full bg-slate-100 overflow-hidden mt-1 p-0.5 border border-slate-200/60 shadow-inner">
						<motion.div
							className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
							style={{ width: barWidth }}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
