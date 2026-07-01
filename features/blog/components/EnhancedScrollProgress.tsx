"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Clock } from "lucide-react";

interface EnhancedScrollProgressProps {
	readTimeMinutes: number;
	wordCount?: number;
}

export function EnhancedScrollProgress({
	readTimeMinutes,
}: EnhancedScrollProgressProps) {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const params = useParams();
	const slug = params?.slug;

	const [progress, setProgress] = useState(0);
	const [timeRemaining, setTimeRemaining] = useState(readTimeMinutes);
	const [showProgress, setShowProgress] = useState(false);

	// Track scroll progress
	useEffect(() => {
		const unsubscribe = scrollYProgress.on("change", (latest) => {
			setProgress(latest);

			// Calculate time remaining based on scroll position
			const remaining = Math.ceil(readTimeMinutes * (1 - latest));
			setTimeRemaining(remaining);

			// Show progress badge after scrolling 10%
			setShowProgress(latest > 0.1);
		});

		return () => unsubscribe();
	}, [scrollYProgress, readTimeMinutes]);

	// Scroll to top on article change
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [slug]);

	return (
		<>
			{/* Progress bar */}
			<motion.div
				className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-50 origin-left print:hidden"
				style={{ scaleX }}
			/>

			{/* Floating progress indicator */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{
					opacity: showProgress ? 1 : 0,
					y: showProgress ? 0 : 20,
				}}
				className="fixed bottom-8 right-8 z-40 print:hidden"
			>
				<div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl px-4 py-3 shadow-2xl">
					<div className="flex items-center gap-3">
						{/* Circular progress */}
						<div className="relative w-10 h-10">
							<svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
								{/* Background circle */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="text-slate-700"
								/>
								{/* Progress circle */}
								<circle
									cx="18"
									cy="18"
									r="16"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeDasharray="100"
									strokeDashoffset={100 - progress * 100}
									className="text-blue-400 transition-all duration-300"
									strokeLinecap="round"
								/>
							</svg>
							<div className="absolute inset-0 flex items-center justify-center">
								<span className="text-[10px] font-black text-white">
									{Math.round(progress * 100)}%
								</span>
							</div>
						</div>

						{/* Time remaining */}
						<div>
							<p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
								{timeRemaining > 0 ? "Time Left" : "Completed"}
							</p>
							<div className="flex items-center gap-1.5">
								<Clock className="w-3 h-3 text-blue-400" />
								<span className="text-xs font-bold text-white">
									{timeRemaining > 0 ? `${timeRemaining} min` : "Done!"}
								</span>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</>
	);
}
