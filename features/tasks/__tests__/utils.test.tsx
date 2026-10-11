import { describe, it, expect } from "vitest";
import {
	calculateProgress,
	renderTextWithLinks,
	getJakartaDateString,
} from "../utils";
import type { Task } from "../types";
import { render } from "@testing-library/react";

describe("Task Utils", () => {
	describe("calculateProgress", () => {
		it("returns 0 for empty or null/undefined array", () => {
			expect(calculateProgress([])).toBe(0);
			// @ts-expect-error testing null safety
			expect(calculateProgress(null)).toBe(0);
		});

		it("returns 0 when no tasks are done", () => {
			const tasks: Partial<Task>[] = [
				{ id: "1", status: "todo" },
				{ id: "2", status: "in_progress" },
			];
			expect(calculateProgress(tasks as Task[])).toBe(0);
		});

		it("returns 100 when all tasks are done", () => {
			const tasks: Partial<Task>[] = [
				{ id: "1", status: "done" },
				{ id: "2", status: "done" },
			];
			expect(calculateProgress(tasks as Task[])).toBe(100);
		});

		it("calculates correct rounded percentage for partial completion", () => {
			const tasks: Partial<Task>[] = [
				{ id: "1", status: "done" },
				{ id: "2", status: "todo" },
				{ id: "3", status: "in_progress" },
			];
			// 1 out of 3 = 33.333% -> 33%
			expect(calculateProgress(tasks as Task[])).toBe(33);

			const tasks2: Partial<Task>[] = [
				{ id: "1", status: "done" },
				{ id: "2", status: "done" },
				{ id: "3", status: "todo" },
			];
			// 2 out of 3 = 66.666% -> 67%
			expect(calculateProgress(tasks2 as Task[])).toBe(67);
		});

		it("excludes cancelled tasks from total progress calculation", () => {
			const tasks: Partial<Task>[] = [
				{ id: "1", status: "done" },
				{ id: "2", status: "todo" },
				{ id: "3", status: "cancelled" },
			];
			// 1 out of 2 active tasks = 50%
			expect(calculateProgress(tasks as Task[])).toBe(50);
		});
	});

	describe("renderTextWithLinks", () => {
		it("returns null for empty text", () => {
			expect(renderTextWithLinks("")).toBeNull();
		});

		it("renders plain text without links as raw strings", () => {
			const result = renderTextWithLinks("Just a simple task description");
			const { container } = render(<div>{result}</div>);
			expect(container.textContent).toBe("Just a simple task description");
			expect(container.querySelector("a")).toBeNull();
		});

		it("converts http/https URLs into anchor links", () => {
			const result = renderTextWithLinks(
				"Check out https://github.com for details",
			);
			const { container } = render(<div>{result}</div>);

			const link = container.querySelector("a");
			expect(link).not.toBeNull();
			expect(link?.getAttribute("href")).toBe("https://github.com");
			expect(link?.getAttribute("target")).toBe("_blank");
			expect(link?.textContent).toContain("github.com");
		});

		it("strips trailing punctuation from URLs", () => {
			const result = renderTextWithLinks("See https://github.com.");
			const { container } = render(<div>{result}</div>);

			const link = container.querySelector("a");
			expect(link).not.toBeNull();
			expect(link?.getAttribute("href")).toBe("https://github.com");
			expect(container.textContent).toBe("See github.com.");
		});

		it("converts www. URLs into anchor links with https:// prefix", () => {
			const result = renderTextWithLinks("Visit www.google.com today");
			const { container } = render(<div>{result}</div>);

			const link = container.querySelector("a");
			expect(link).not.toBeNull();
			expect(link?.getAttribute("href")).toBe("https://www.google.com");
			expect(link?.textContent).toContain("google.com");
		});

		it("truncates long URLs display text (>30 chars)", () => {
			const longUrl =
				"https://example.com/very/long/path/to/some/resource/page";
			const result = renderTextWithLinks(`Link: ${longUrl}`);
			const { container } = render(<div>{result}</div>);

			const link = container.querySelector("a");
			expect(link).not.toBeNull();
			expect(link?.getAttribute("href")).toBe(longUrl);
			expect(link?.textContent).toContain("...");
		});
	});

	describe("getJakartaDateString", () => {
		it("formats a deterministic date properly in Asia/Jakarta timezone", () => {
			// 2026-10-11T20:00:00Z is 2026-10-12T03:00:00+07:00 in Jakarta
			const date = new Date("2026-10-11T20:00:00Z");
			expect(getJakartaDateString(date)).toBe("2026-10-12");
		});

		it("formats a morning UTC time as same day in Jakarta", () => {
			// 2026-10-11T02:00:00Z is 2026-10-11T09:00:00+07:00 in Jakarta
			const date = new Date("2026-10-11T02:00:00Z");
			expect(getJakartaDateString(date)).toBe("2026-10-11");
		});
	});
});
