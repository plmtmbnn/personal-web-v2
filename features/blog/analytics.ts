"use client";

/**
 * Blog Analytics Service
 * Tracks reading behavior without external dependencies
 * Uses localStorage for client-side analytics
 */

export interface BlogAnalytics {
	slug: string;
	title: string;
	viewedAt: string;
	readTime: number; // minutes
	scrollDepth: number; // percentage
	timeSpent: number; // seconds
	completed: boolean;
}

const ANALYTICS_KEY = "blog_analytics";
const SESSION_KEY = "blog_session";

/**
 * Get all analytics data from localStorage
 */
function getAnalyticsData(): BlogAnalytics[] {
	if (typeof window === "undefined") return [];

	try {
		const data = localStorage.getItem(ANALYTICS_KEY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

/**
 * Save analytics data to localStorage
 */
function saveAnalyticsData(data: BlogAnalytics[]): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to save analytics:", error);
	}
}

/**
 * Get current session data
 */
function getSessionData(): {
	slug: string;
	startTime: number;
	maxScroll: number;
} | null {
	if (typeof window === "undefined") return null;

	try {
		const data = sessionStorage.getItem(SESSION_KEY);
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
}

/**
 * Save session data
 */
function saveSessionData(data: {
	slug: string;
	startTime: number;
	maxScroll: number;
}): void {
	if (typeof window === "undefined") return;

	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
	} catch (error) {
		console.warn("Failed to save session:", error);
	}
}

/**
 * Track blog post view
 */
export function trackBlogView(slug: string, _title: string, _readTime: number) {
	if (typeof window === "undefined") return;

	const session = getSessionData();

	// Don't track duplicate views in the same session
	if (session?.slug === slug) return;

	// Initialize new session
	saveSessionData({
		slug,
		startTime: Date.now(),
		maxScroll: 0,
	});
}

/**
 * Track scroll depth
 */
export function trackScrollDepth(scrollPercentage: number) {
	if (typeof window === "undefined") return;

	const session = getSessionData();
	if (!session) return;

	// Update max scroll depth
	if (scrollPercentage > session.maxScroll) {
		session.maxScroll = scrollPercentage;
		saveSessionData(session);
	}
}

/**
 * Track when user leaves the page (completion)
 */
export function trackBlogCompletion(
	slug: string,
	title: string,
	readTime: number,
) {
	if (typeof window === "undefined") return;

	const session = getSessionData();
	if (!session || session.slug !== slug) return;

	const timeSpent = Math.round((Date.now() - session.startTime) / 1000); // seconds
	const scrollDepth = Math.round(session.maxScroll * 100);
	const completed = scrollDepth > 90; // Consider completed if scrolled >90%

	const analytics: BlogAnalytics = {
		slug,
		title,
		viewedAt: new Date().toISOString(),
		readTime,
		scrollDepth,
		timeSpent,
		completed,
	};

	// Save to analytics data
	const allAnalytics = getAnalyticsData();
	allAnalytics.push(analytics);

	// Keep only last 100 entries
	if (allAnalytics.length > 100) {
		allAnalytics.shift();
	}

	saveAnalyticsData(allAnalytics);

	// Clear session
	sessionStorage.removeItem(SESSION_KEY);
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
	const data = getAnalyticsData();

	return {
		totalViews: data.length,
		totalTimeSpent: data.reduce((sum, item) => sum + item.timeSpent, 0),
		averageScrollDepth:
			data.length > 0
				? Math.round(
						data.reduce((sum, item) => sum + item.scrollDepth, 0) / data.length,
					)
				: 0,
		completedArticles: data.filter((item) => item.completed).length,
		recentViews: data.slice(-10).reverse(),
		topArticles: Object.entries(
			data.reduce(
				(acc, item) => {
					acc[item.slug] = (acc[item.slug] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			),
		)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([slug, count]) => ({
				slug,
				views: count,
				title: data.find((item) => item.slug === slug)?.title || slug,
			})),
	};
}

/**
 * Clear all analytics data (for privacy/testing)
 */
export function clearAnalytics() {
	if (typeof window === "undefined") return;

	localStorage.removeItem(ANALYTICS_KEY);
	sessionStorage.removeItem(SESSION_KEY);
}
