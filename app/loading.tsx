"use client";

import {
	motion,
	useMotionValue,
	useTransform,
	animate,
	useReducedMotion,
} from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";

export default function GlobalLoading() {
	const progress = useMotionValue(0);
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		// Realistic loader: moves to 40% quickly, then crawls to 95% over time
		const controls = animate(progress, [0, 0.4, 0.7, 0.95], {
			times: [0, 0.1, 0.4, 1],
			duration: 15,
			ease: ["easeOut", "easeInOut", "linear"],
		});
		return controls.stop;
	}, [progress]);

	const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

	return (
		<div className="fixed inset-0 bg-slate-50/90 backdrop-blur-xl bg-dot-pattern z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
			{/* Ambient glow */}
			<motion.div
				animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.18, 0.08] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-1/2 left-1/2 w-[480px] h-[480px] rounded-full"
				style={{
					x: "-50%",
					y: "-50%",
					background:
						"radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
				}}
			/>

			{/* Floating Card Container */}
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 12 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
				className="relative bg-white/95 backdrop-blur-md rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col items-center gap-6 z-10"
			>
				{/* Icon with spinning rings */}
				<motion.div
					animate={{ y: [0, -4, 0] }}
					transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
					className="relative w-20 h-20"
				>
					{/* Outer arc */}
					<motion.svg
						className="absolute inset-0"
						width="80"
						height="80"
						viewBox="0 0 80 80"
						animate={{ rotate: 360 }}
						transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
					>
						<circle
							cx="40"
							cy="40"
							r="36"
							fill="none"
							stroke="rgba(226,232,240,0.8)"
							strokeWidth="1.5"
						/>
						<circle
							cx="40"
							cy="40"
							r="36"
							fill="none"
							stroke="url(#arc-gradient)"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeDasharray="60 166"
						/>
						<defs>
							<linearGradient
								id="arc-gradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="0%"
							>
								<stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
								<stop offset="100%" stopColor="#6366f1" />
							</linearGradient>
						</defs>
					</motion.svg>

					{/* Icon box */}
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-xs">
							<Zap className="w-5 h-5 fill-indigo-600 text-indigo-600" />
						</div>
					</div>
				</motion.div>

				{/* Label + progress bar */}
				<div className="flex flex-col items-center gap-3">
					<p className="text-xs font-semibold tracking-wider text-slate-700 uppercase m-0">
						Synchronizing
					</p>

					<div className="flex gap-1.5 items-center">
						{[0, 0.2, 0.4].map((delay, i) => (
							<motion.div
								key={String(i)}
								className="w-1.5 h-1.5 rounded-full bg-indigo-500"
								animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
								transition={{ duration: 1.2, repeat: Infinity, delay }}
							/>
						))}
					</div>

					<div className="w-44 h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1 p-0.5">
						<motion.div
							className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
							style={{ width: barWidth }}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
