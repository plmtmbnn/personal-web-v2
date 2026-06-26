"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export function ScrollProgress() {
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	const params = useParams();
	const slug = params?.slug;

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [slug]);

	return (
		<motion.div
			className="fixed top-0 left-0 right-0 h-[3px] bg-blue-600 z-50 origin-left"
			style={{ scaleX }}
		/>
	);
}
