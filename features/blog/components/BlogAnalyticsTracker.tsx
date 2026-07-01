"use client";

import { useEffect, useRef } from "react";
import {
	trackBlogView,
	trackScrollDepth,
	trackBlogCompletion,
} from "@/features/blog/analytics";

interface BlogAnalyticsTrackerProps {
	slug: string;
	title: string;
	readTime: number; // in minutes
}

/**
 * BlogAnalyticsTracker
 * Tracks blog reading behavior: views, scroll depth, time spent
 * Runs in the background without affecting UI
 */
export default function BlogAnalyticsTracker({
	slug,
	title,
	readTime,
}: BlogAnalyticsTrackerProps) {
	const hasTrackedView = useRef(false);

	useEffect(() => {
		// Track initial view (once per session)
		if (!hasTrackedView.current) {
			trackBlogView(slug, title, readTime);
			hasTrackedView.current = true;
		}

		// Track scroll depth
		const handleScroll = () => {
			const windowHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			const scrollTop = window.scrollY;
			const scrollPercentage = scrollTop / (documentHeight - windowHeight) || 0;

			trackScrollDepth(Math.min(scrollPercentage, 1));
		};

		// Throttle scroll events (every 500ms)
		let scrollTimeout: NodeJS.Timeout;
		const throttledScroll = () => {
			if (scrollTimeout) return;
			scrollTimeout = setTimeout(() => {
				handleScroll();
				scrollTimeout = null as any;
			}, 500);
		};

		// Track when user leaves
		const handleBeforeUnload = () => {
			trackBlogCompletion(slug, title, readTime);
		};

		// Track when tab becomes hidden
		const handleVisibilityChange = () => {
			if (document.hidden) {
				trackBlogCompletion(slug, title, readTime);
			}
		};

		// Add event listeners
		window.addEventListener("scroll", throttledScroll, { passive: true });
		window.addEventListener("beforeunload", handleBeforeUnload);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		// Cleanup
		return () => {
			window.removeEventListener("scroll", throttledScroll);
			window.removeEventListener("beforeunload", handleBeforeUnload);
			document.removeEventListener("visibilitychange", handleVisibilityChange);

			// Final track on unmount
			trackBlogCompletion(slug, title, readTime);
		};
	}, [slug, title, readTime]);

	// This component doesn't render anything
	return null;
}
