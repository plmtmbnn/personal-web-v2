"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop
 * A floating button that appears after the user scrolls 400px down.
 * Smooth-scrolls to the top of the page on click.
 */
export default function BackToTop() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 400);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

	return (
		<AnimatePresence>
			{visible && (
				<motion.button
					initial={{ opacity: 0, scale: 0.8, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 12 }}
					transition={{ type: "spring", stiffness: 380, damping: 28 }}
					onClick={scrollToTop}
					aria-label="Back to top"
					className="fixed bottom-8 right-6 z-50 w-11 h-11 flex items-center justify-center bg-slate-950 text-white rounded-2xl shadow-xl shadow-slate-300/40 hover:bg-blue-600 hover:shadow-blue-200/60 active:scale-90 transition-all duration-200 print:hidden"
				>
					<ArrowUp className="w-4 h-4" />
				</motion.button>
			)}
		</AnimatePresence>
	);
}
