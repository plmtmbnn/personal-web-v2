import { describe, it, expect } from "vitest";
import type { Blog } from "../data";
import { filterBlogs, sortBlogs } from "../utils";

describe("Blog Filtering and Sorting", () => {
	const mockBlogs: Blog[] = [
		{
			id: "1",
			slug: "tech-article-1",
			title: "Understanding React Hooks",
			description: "A deep dive into React hooks and their use cases",
			content: "Content for react hooks",
			category: "Tech",
			date: "2024-01-15",
			published: true,
			image_url: null,
			is_headline: false,
			is_private: false,
		},
		{
			id: "2",
			slug: "finance-article-1",
			title: "Investment Strategies for 2024",
			description: "Learn about modern investment approaches",
			content: "Content for finance",
			category: "Finance",
			date: "2024-01-20",
			published: true,
			image_url: null,
			is_headline: true,
			is_private: false,
		},
		{
			id: "3",
			slug: "tech-article-2",
			title: "TypeScript Best Practices",
			description: "Essential TypeScript patterns for production code",
			content: "Content for ts",
			category: "Tech",
			date: "2024-01-25",
			published: true,
			image_url: null,
			is_headline: false,
			is_private: false,
		},
		{
			id: "4",
			slug: "running-article-1",
			title: "Marathon Training Guide",
			description:
				"Complete guide to marathon preparation and hooks for progress tracking",
			content: "Content for marathon",
			category: "Running",
			date: "2024-01-10",
			published: true,
			image_url: null,
			is_headline: false,
			is_private: false,
		},
	];

	describe("filterBlogs", () => {
		it("should return all blogs when no filters applied", () => {
			const result = filterBlogs(mockBlogs, "", "All");
			expect(result).toHaveLength(4);
		});

		it("should filter by category correctly", () => {
			const result = filterBlogs(mockBlogs, "", "Tech");
			expect(result).toHaveLength(2);
			expect(result.every((blog) => blog.category === "Tech")).toBe(true);
		});

		it("should filter by search query in title", () => {
			const result = filterBlogs(mockBlogs, "React", "All");
			expect(result).toHaveLength(1);
			expect(result[0].slug).toBe("tech-article-1");
		});

		it("should filter by search query in description", () => {
			const result = filterBlogs(mockBlogs, "investment", "All");
			expect(result).toHaveLength(1);
			expect(result[0].category).toBe("Finance");
		});

		it("should filter by both search and category", () => {
			const result = filterBlogs(mockBlogs, "hooks", "Tech");
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe("Understanding React Hooks");
		});

		it("should return empty array when no matches found", () => {
			const result = filterBlogs(mockBlogs, "nonexistent", "All");
			expect(result).toHaveLength(0);
		});

		it("should be case insensitive for search", () => {
			const result = filterBlogs(mockBlogs, "REACT", "All");
			expect(result).toHaveLength(1);
		});

		it("should be case insensitive for category", () => {
			const result = filterBlogs(mockBlogs, "", "tech");
			expect(result).toHaveLength(2);
		});

		it("should handle search query in multiple blogs", () => {
			const result = filterBlogs(mockBlogs, "hooks", "All");
			expect(result).toHaveLength(2); // React article and Marathon article both mention "hooks"
		});
	});

	describe("sortBlogs", () => {
		it("should sort headline blogs first", () => {
			const result = sortBlogs(mockBlogs);
			expect(result[0].is_headline).toBe(true);
			expect(result[0].slug).toBe("finance-article-1");
		});

		it("should sort non-headline blogs by date (newest first)", () => {
			const result = sortBlogs(mockBlogs);
			const nonHeadlineBlogs = result.filter((blog) => !blog.is_headline);

			expect(nonHeadlineBlogs[0].slug).toBe("tech-article-2"); // Jan 25
			expect(nonHeadlineBlogs[1].slug).toBe("tech-article-1"); // Jan 15
			expect(nonHeadlineBlogs[2].slug).toBe("running-article-1"); // Jan 10
		});

		it("should not mutate original array", () => {
			const original = [...mockBlogs];
			sortBlogs(mockBlogs);
			expect(mockBlogs).toEqual(original);
		});

		it("should handle empty array", () => {
			const result = sortBlogs([]);
			expect(result).toHaveLength(0);
		});

		it("should handle single blog", () => {
			const singleBlog = [mockBlogs[0]];
			const result = sortBlogs(singleBlog);
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual(singleBlog[0]);
		});

		it("should maintain relative order of multiple headlines by date", () => {
			const blogsWithMultipleHeadlines: Blog[] = [
				{ ...mockBlogs[0], is_headline: true, date: "2024-01-15" },
				{ ...mockBlogs[1], is_headline: true, date: "2024-01-20" },
				mockBlogs[2],
			];

			const result = sortBlogs(blogsWithMultipleHeadlines);

			expect(result[0].is_headline).toBe(true);
			expect(result[1].is_headline).toBe(true);
			expect(result[0].date).toBe("2024-01-20"); // Newer headline first
			expect(result[1].date).toBe("2024-01-15");
		});
	});

	describe("Combined filtering and sorting", () => {
		it("should filter then sort correctly", () => {
			const filtered = filterBlogs(mockBlogs, "", "Tech");
			const sorted = sortBlogs(filtered);

			expect(sorted).toHaveLength(2);
			expect(sorted[0].date).toBe("2024-01-25"); // Newer first
		});

		it("should handle empty results after filtering", () => {
			const filtered = filterBlogs(mockBlogs, "nonexistent", "Finance");
			const sorted = sortBlogs(filtered);

			expect(sorted).toHaveLength(0);
		});

		it("should prioritize headline even in filtered results", () => {
			const blogsWithHeadline: Blog[] = [
				mockBlogs[0],
				{ ...mockBlogs[1], category: "Tech", is_headline: true },
				mockBlogs[2],
			];

			const filtered = filterBlogs(blogsWithHeadline, "", "Tech");
			const sorted = sortBlogs(filtered);

			expect(sorted[0].is_headline).toBe(true);
		});
	});

	describe("Empty State Scenarios", () => {
		it("should detect truly empty blog archive", () => {
			const emptyBlogs: Blog[] = [];
			const result = filterBlogs(emptyBlogs, "", "All");

			expect(result).toHaveLength(0);
		});

		it("should detect no results from active filter", () => {
			const hasActiveFilter = true;
			const searchQuery = "nonexistent-topic";
			const result = filterBlogs(mockBlogs, searchQuery, "All");

			expect(result).toHaveLength(0);
			expect(hasActiveFilter).toBe(true);
		});

		it("should detect no results from category filter", () => {
			const result = filterBlogs(mockBlogs, "", "General");

			expect(result).toHaveLength(0);
		});

		it("should detect valid results after filtering", () => {
			const result = filterBlogs(mockBlogs, "React", "All");

			expect(result).toHaveLength(1);
		});
	});
});
