import { describe, it, expect, beforeEach } from "vitest";
import {
	trackBlogView,
	trackScrollDepth,
	trackBlogCompletion,
	getAnalyticsSummary,
	clearAnalytics,
} from "../analytics";

describe("Blog Analytics Service", () => {
	beforeEach(() => {
		clearAnalytics();
	});

	describe("trackBlogView & Session Management", () => {
		it("initializes a session when a post view is tracked", () => {
			trackBlogView("post-1", "Test Post 1", 5);
			const session = sessionStorage.getItem("blog_session");
			expect(session).not.toBeNull();
			const parsed = JSON.parse(session!);
			expect(parsed.slug).toBe("post-1");
			expect(parsed.maxScroll).toBe(0);
		});

		it("does not overwrite session if tracking same post twice in a row", () => {
			trackBlogView("post-1", "Test Post 1", 5);
			const initialSession = sessionStorage.getItem("blog_session");

			// Track same post again
			trackBlogView("post-1", "Test Post 1", 5);
			const secondSession = sessionStorage.getItem("blog_session");

			expect(secondSession).toBe(initialSession);
		});
	});

	describe("trackScrollDepth", () => {
		it("updates maxScroll in active session if new scroll percentage is higher", () => {
			trackBlogView("post-1", "Test Post 1", 5);

			trackScrollDepth(0.4);
			let session = JSON.parse(sessionStorage.getItem("blog_session")!);
			expect(session.maxScroll).toBe(0.4);

			// Lower scroll depth shouldn't decrease maxScroll
			trackScrollDepth(0.2);
			session = JSON.parse(sessionStorage.getItem("blog_session")!);
			expect(session.maxScroll).toBe(0.4);

			// Higher scroll depth updates maxScroll
			trackScrollDepth(0.95);
			session = JSON.parse(sessionStorage.getItem("blog_session")!);
			expect(session.maxScroll).toBe(0.95);
		});

		it("does nothing if there is no active session", () => {
			expect(() => trackScrollDepth(0.8)).not.toThrow();
			expect(sessionStorage.getItem("blog_session")).toBeNull();
		});
	});

	describe("trackBlogCompletion & getAnalyticsSummary", () => {
		it("records completion data and clears session on completion", () => {
			trackBlogView("post-1", "Test Post 1", 5);
			trackScrollDepth(0.95); // >90% scroll depth means completed = true

			trackBlogCompletion("post-1", "Test Post 1", 5);

			// Session should be cleared
			expect(sessionStorage.getItem("blog_session")).toBeNull();

			const summary = getAnalyticsSummary();
			expect(summary.totalViews).toBe(1);
			expect(summary.completedArticles).toBe(1);
			expect(summary.averageScrollDepth).toBe(95);
			expect(summary.topArticles).toHaveLength(1);
			expect(summary.topArticles[0].slug).toBe("post-1");
		});

		it("marks article as not completed if scroll depth <= 90%", () => {
			trackBlogView("post-2", "Test Post 2", 3);
			trackScrollDepth(0.5); // 50% scroll

			trackBlogCompletion("post-2", "Test Post 2", 3);

			const summary = getAnalyticsSummary();
			expect(summary.totalViews).toBe(1);
			expect(summary.completedArticles).toBe(0);
			expect(summary.averageScrollDepth).toBe(50);
		});

		it("correctly ranks top articles by view count", () => {
			// Track post-a twice
			trackBlogView("post-a", "Post A", 3);
			trackBlogCompletion("post-a", "Post A", 3);
			trackBlogView("post-a", "Post A", 3);
			trackBlogCompletion("post-a", "Post A", 3);

			// Track post-b once
			trackBlogView("post-b", "Post B", 4);
			trackBlogCompletion("post-b", "Post B", 4);

			const summary = getAnalyticsSummary();
			expect(summary.totalViews).toBe(3);
			expect(summary.topArticles[0].slug).toBe("post-a");
			expect(summary.topArticles[0].views).toBe(2);
			expect(summary.topArticles[1].slug).toBe("post-b");
			expect(summary.topArticles[1].views).toBe(1);
		});

		it("handles getAnalyticsSummary when no data exists", () => {
			const summary = getAnalyticsSummary();
			expect(summary.totalViews).toBe(0);
			expect(summary.totalTimeSpent).toBe(0);
			expect(summary.averageScrollDepth).toBe(0);
			expect(summary.completedArticles).toBe(0);
			expect(summary.recentViews).toEqual([]);
			expect(summary.topArticles).toEqual([]);
		});
	});

	describe("clearAnalytics", () => {
		it("removes analytics from localStorage and sessionStorage", () => {
			trackBlogView("post-1", "Test Post 1", 5);
			trackBlogCompletion("post-1", "Test Post 1", 5);

			expect(localStorage.getItem("blog_analytics")).not.toBeNull();

			clearAnalytics();

			expect(localStorage.getItem("blog_analytics")).toBeNull();
			expect(sessionStorage.getItem("blog_session")).toBeNull();
			expect(getAnalyticsSummary().totalViews).toBe(0);
		});
	});
});
