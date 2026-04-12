"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Zap } from "lucide-react";
import { useEffect } from "react";

const PARTICLES = [
	{ tx: -40, ty: -60, delay: 0, size: 3 },
	{ tx: 50, ty: -70, delay: 0.2, size: 2 },
	{ tx: -55, ty: -40, delay: 0.6, size: 2 },
	{ tx: 45, ty: -55, delay: 0.8, size: 3 },
	{ tx: 30, ty: -80, delay: 1.0, size: 2 },
	{ tx: -60, ty: -30, delay: 1.2, size: 2 },
] as const;

export default function GlobalLoading() {
	const progress = useMotionValue(0);

	useEffect(() => {
		const controls = animate(progress, 0.93, {
			duration: 4,
			ease: [0.4, 0, 0.2, 1],
			repeat: Infinity,
			repeatDelay: 0.5,
		});
		return controls.stop;
	}, [progress]);

	const barWidth = useTransform(progress, [0, 1], ["0%", "100%"]);

	return (
		<div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center pointer-events-none overflow-hidden">
			{/* Ambient glow */}
			<motion.div
				animate={{ scale: [1, 1.08, 1], opacity: [0.08, 0.18, 0.08] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full"
				style={{
					background:
						"radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)",
				}}
			/>
			<motion.div
				animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.14, 0.06] }}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
					delay: 0.6,
				}}
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
				style={{
					background:
						"radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
				}}
			/>

			{/* Particles */}
			{PARTICLES.map((p, i) => (
				<motion.div
					key={String(i)}
					className="absolute top-1/2 left-1/2 rounded-full bg-indigo-500"
					style={{ width: p.size, height: p.size }}
					animate={{
						x: [0, p.tx],
						y: [0, p.ty],
						scale: [1, 0],
						opacity: [0.5, 0],
					}}
					transition={{
						duration: 2.4 + i * 0.2,
						repeat: Infinity,
						delay: p.delay,
						ease: "easeOut",
					}}
				/>
			))}

			{/* Core */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="relative flex flex-col items-center gap-7"
			>
				{/* Icon with spinning rings */}
				<motion.div
					animate={{ y: [0, -8, 0] }}
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
							stroke="rgba(99,102,241,0.12)"
							strokeWidth="1.5"
						/>
						<circle
							cx="40"
							cy="40"
							r="36"
							fill="none"
							stroke="url(#arc-light)"
							strokeWidth="2"
							strokeLinecap="round"
							strokeDasharray="60 166"
						/>
						<defs>
							<linearGradient id="arc-light" x1="0%" y1="0%" x2="100%" y2="0%">
								<stop offset="0%" stopColor="#6366f1" stopOpacity={0} />
								<stop offset="100%" stopColor="#6366f1" />
							</linearGradient>
						</defs>
					</motion.svg>

					{/* Inner arc */}
					<motion.svg
						className="absolute inset-0"
						width="80"
						height="80"
						viewBox="0 0 80 80"
						animate={{ rotate: -360 }}
						transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
					>
						<circle
							cx="40"
							cy="40"
							r="28"
							fill="none"
							stroke="rgba(139,92,246,0.1)"
							strokeWidth="1"
						/>
						<circle
							cx="40"
							cy="40"
							r="28"
							fill="none"
							stroke="rgba(139,92,246,0.4)"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeDasharray="20 156"
						/>
					</motion.svg>

					{/* Icon box */}
					<div className="absolute inset-0 flex items-center justify-center">
						<motion.div
							animate={{ opacity: [0.85, 1, 0.85] }}
							transition={{ duration: 1.5, repeat: Infinity }}
							className="w-12 h-12 rounded-[14px] flex items-center justify-center"
							style={{
								background: "rgba(99,102,241,0.08)",
								border: "1px solid rgba(99,102,241,0.22)",
								boxShadow: "0 2px 16px rgba(99,102,241,0.1)",
							}}
						>
							<Zap className="w-5 h-5 fill-indigo-500 text-indigo-500" />
						</motion.div>
					</div>
				</motion.div>

				{/* Label + dots + progress */}
				<div className="flex flex-col items-center gap-3">
					<p className="text-[13px] font-medium tracking-[0.18em] text-indigo-500 uppercase m-0">
						Synchronizing
					</p>

					<div className="flex gap-[5px] items-center">
						{[0, 0.2, 0.4].map((delay, i) => (
							<motion.div
								key={String(i)}
								className="w-[5px] h-[5px] rounded-full bg-indigo-500"
								animate={{ scale: [1, 1.6, 1], opacity: [0.3, 1, 0.3] }}
								transition={{ duration: 1.2, repeat: Infinity, delay }}
							/>
						))}
					</div>

					<div
						className="w-[180px] h-[2px] rounded-full overflow-hidden mt-1"
						style={{ background: "rgba(99,102,241,0.1)" }}
					>
						<motion.div
							className="h-full rounded-full"
							style={{
								width: barWidth,
								background: "linear-gradient(90deg, #6366f1, #a5b4fc)",
							}}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
