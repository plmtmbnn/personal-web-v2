"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * NavigationLoader
 * A top-loading progress bar that appears during route navigation.
 * Inspired by NProgress but built with Framer Motion — no extra dependencies.
 *
 * Detection strategy:
 *  - Watch `pathname` changes (cross-page routing).
 *  - On change, show a progress bar that animates to ~85%.
 *  - Hide it shortly after the new route settles.
 */
export default function NavigationLoader() {
	const pathname = usePathname();
	const reduceMotion = useReducedMotion();
	const [isLoading, setIsLoading] = useState(false);
	const isFirstMount = useRef(true);

	// Trigger loader on route navigation (skip first mount and ignore shallow query changes)
	useEffect(() => {
		if (isFirstMount.current) {
			isFirstMount.current = false;
			return;
		}
		setIsLoading(true);
		const timeout = setTimeout(() => setIsLoading(false), 800);
		return () => clearTimeout(timeout);
	}, [pathname]);

	return (
		<AnimatePresence>
			{isLoading && (
				<motion.div
					className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none"
					initial={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
				>
					<motion.div
						className="h-full bg-indigo-600"
						initial={reduceMotion ? { width: "85%" } : { width: "0%" }}
						animate={{ width: "85%" }}
						exit={{ width: "100%" }}
						transition={{
							duration: 0.8,
							ease: "easeOut",
						}}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
