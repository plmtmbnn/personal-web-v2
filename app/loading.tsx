"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

/**
 * Root Loading State
 * Used for initial app hydration and general transitions.
 */
export default function GlobalLoading() {
	return (
		<div className="fixed inset-0 bg-background z-[9999] flex flex-col items-center justify-center pointer-events-none">
			{/* Aesthetic Background Ambient */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />

			<div className="relative flex flex-col items-center gap-8">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{
						duration: 0.5,
						repeat: Infinity,
						repeatType: "reverse",
					}}
					className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20 shadow-2xl shadow-accent/10"
				>
					<Zap className="w-10 h-10 text-accent fill-accent animate-pulse" />
				</motion.div>

				<div className="space-y-3 text-center">
					<h2 className="text-xl font-black tracking-tight text-foreground uppercase tracking-[0.2em]">
						Synchronizing
					</h2>
					<div className="flex items-center justify-center gap-1.5">
						<motion.div
							animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
							transition={{ duration: 1, repeat: Infinity, delay: 0 }}
							className="w-1 h-1 rounded-full bg-accent"
						/>
						<motion.div
							animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
							transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
							className="w-1 h-1 rounded-full bg-accent"
						/>
						<motion.div
							animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
							transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
							className="w-1 h-1 rounded-full bg-accent"
						/>
					</div>
				</div>
			</div>

			<div className="absolute bottom-12 text-center">
				<p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
					Fintech Architecture • Persistence Layer
				</p>
			</div>
		</div>
	);
}
