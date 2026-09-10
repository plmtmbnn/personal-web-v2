import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import {
	slugifyHeading,
	HeadingSlugger,
	extractHeadings,
	rehypeHeadingIds,
	normalizeMarkdown,
} from "../components/TableOfContents";
import BlogContent from "../components/BlogContent";

describe("Table of Contents Utilities", () => {
	describe("slugifyHeading", () => {
		it("converts simple text into clean kebab-case", () => {
			expect(slugifyHeading("Daily Routine")).toBe("daily-routine");
		});

		it("removes markdown formatting characters", () => {
			expect(slugifyHeading("Understanding `useState` and **Hooks**")).toBe(
				"understanding-usestate-and-hooks",
			);
		});

		it("removes special punctuation and collapses multiple hyphens", () => {
			expect(slugifyHeading("React 19: What's New? - Complete Guide")).toBe(
				"react-19-whats-new-complete-guide",
			);
		});

		it("trims leading and trailing hyphens", () => {
			expect(slugifyHeading(" - Special Title - ")).toBe("special-title");
		});

		it("handles empty or punctuation-only strings gracefully", () => {
			expect(slugifyHeading("")).toBe("");
			expect(slugifyHeading("!@#$%^&*()")).toBe("");
		});
	});

	describe("HeadingSlugger", () => {
		it("generates simple slug for first occurrence", () => {
			const slugger = new HeadingSlugger();
			expect(slugger.slug("Workout")).toBe("workout");
		});

		it("disambiguates duplicate headings with incremental suffixes", () => {
			const slugger = new HeadingSlugger();
			expect(slugger.slug("Workout")).toBe("workout");
			expect(slugger.slug("Workout")).toBe("workout-1");
			expect(slugger.slug("Workout")).toBe("workout-2");
		});

		it("handles collisions when heading already contains a numerical suffix", () => {
			const slugger = new HeadingSlugger();
			expect(slugger.slug("Workout")).toBe("workout");
			expect(slugger.slug("Workout 1")).toBe("workout-1");
			// Third occurrence of "Workout" should skip "workout-1" and become "workout-2"
			expect(slugger.slug("Workout")).toBe("workout-2");
		});

		it("falls back to 'heading' for strings with no alphanumeric characters", () => {
			const slugger = new HeadingSlugger();
			expect(slugger.slug("🔥🔥🔥")).toBe("heading");
			expect(slugger.slug("🚀🚀🚀")).toBe("heading-1");
		});

		it("clears occurrences map upon reset", () => {
			const slugger = new HeadingSlugger();
			expect(slugger.slug("Workout")).toBe("workout");
			slugger.reset();
			expect(slugger.slug("Workout")).toBe("workout");
		});
	});

	describe("extractHeadings", () => {
		it("returns empty array for null or empty markdown", () => {
			expect(extractHeadings("")).toEqual([]);
			// @ts-expect-error test null safety
			expect(extractHeadings(null)).toEqual([]);
		});

		it("extracts H2 and H3 headings while ignoring H1 and H4+", () => {
			const markdown = `
# Document Title
## Main Chapter
Some paragraph text
### Subchapter
More text
#### Detail Level 4
`;
			const headings = extractHeadings(markdown);
			expect(headings).toHaveLength(2);
			expect(headings[0]).toEqual({
				id: "main-chapter",
				text: "Main Chapter",
				level: 2,
			});
			expect(headings[1]).toEqual({
				id: "subchapter",
				text: "Subchapter",
				level: 3,
			});
		});

		it("ignores headings inside fenced code blocks with backticks or tildes", () => {
			const markdown = `
## Visible Heading

\`\`\`markdown
## Code Block Heading 1
\`\`\`

~~~typescript
## Code Block Heading 2
~~~

### Visible Subheading
`;
			const headings = extractHeadings(markdown);
			expect(headings).toHaveLength(2);
			expect(headings[0].id).toBe("visible-heading");
			expect(headings[1].id).toBe("visible-subheading");
		});

		it("disambiguates duplicate heading titles with unique IDs", () => {
			const markdown = `
## Morning Routine
### Workout
Detailed morning drills

## Evening Routine
### Workout
Light evening recovery

## Weekend Special
### Workout
Long endurance session
`;
			const headings = extractHeadings(markdown);
			expect(headings).toHaveLength(6);

			const workoutHeadings = headings.filter((h) => h.text === "Workout");
			expect(workoutHeadings).toHaveLength(3);

			// Distinct IDs prevent duplicate key errors in React and allow separate anchor jumping
			expect(workoutHeadings[0].id).toBe("workout");
			expect(workoutHeadings[1].id).toBe("workout-1");
			expect(workoutHeadings[2].id).toBe("workout-2");

			// Ensure all headings in the document have completely unique IDs
			const ids = headings.map((h) => h.id);
			const uniqueIds = new Set(ids);
			expect(uniqueIds.size).toBe(headings.length);
		});

		it("cleans links, images, and formatting from heading text", () => {
			const markdown = `
## Modern [React](https://react.dev) Framework
### ![Icon](https://example.com/icon.png) **Performance** & *Speed*
## Using \`useMemo\` Effectively ##
`;
			const headings = extractHeadings(markdown);
			expect(headings).toHaveLength(3);
			expect(headings[0]).toEqual({
				id: "modern-react-framework",
				text: "Modern React Framework",
				level: 2,
			});
			expect(headings[1]).toEqual({
				id: "performance-speed",
				text: "Performance & Speed",
				level: 3,
			});
			expect(headings[2]).toEqual({
				id: "using-usememo-effectively",
				text: "Using useMemo Effectively",
				level: 2,
			});
		});

		it("produces identical IDs as BlogContent for matching markdown headings", () => {
			const markdown = `
## Workout
First workout

### Workout
Second workout

## Workout
Third workout
`;
			const headings = extractHeadings(markdown);
			expect(headings.map((h) => h.id)).toEqual([
				"workout",
				"workout-1",
				"workout-2",
			]);
		});
	});

	describe("rehypeHeadingIds", () => {
		it("attaches unique IDs to headings during AST compilation", () => {
			const markdown = `
## Workout
First

### Workout
Second

## Workout
Third
`;
			const capturedIds: string[] = [];

			const html = renderToString(
				React.createElement(
					ReactMarkdown,
					{
						rehypePlugins: [rehypeHeadingIds],
						components: {
							h2({ id, children }: any) {
								capturedIds.push(id);
								return React.createElement("h2", { id }, children);
							},
							h3({ id, children }: any) {
								capturedIds.push(id);
								return React.createElement("h3", { id }, children);
							},
						},
					},
					markdown,
				),
			);

			expect(capturedIds).toEqual(["workout", "workout-1", "workout-2"]);
			expect(html).toContain('id="workout"');
			expect(html).toContain('id="workout-1"');
			expect(html).toContain('id="workout-2"');
		});

		it("is strictly pure and produces identical IDs on subsequent render passes without mutation", () => {
			const markdown = `
## Weekly Running Volume
Content

## Workout
Content

### Mobility
Content

## Workout
Content
`;

			const renderPass = () => {
				const capturedIds: string[] = [];
				renderToString(
					React.createElement(
						ReactMarkdown,
						{
							rehypePlugins: [rehypeHeadingIds],
							components: {
								h2({ id, children }: any) {
									capturedIds.push(id);
									return React.createElement("h2", { id }, children);
								},
								h3({ id, children }: any) {
									capturedIds.push(id);
									return React.createElement("h3", { id }, children);
								},
							},
						},
						markdown,
					),
				);
				return capturedIds;
			};

			const pass1 = renderPass();
			const pass2 = renderPass();
			const pass3 = renderPass();

			// IDs must remain 100% consistent across render passes (no hydration drift)
			expect(pass1).toEqual([
				"weekly-running-volume",
				"workout",
				"mobility",
				"workout-1",
			]);
			expect(pass2).toEqual(pass1);
			expect(pass3).toEqual(pass1);
		});

		it("produces identical IDs as extractHeadings", () => {
			const markdown = `
## Weekly Running Volume
## Workout
### Mobility
## Workout
### Purpose
## Running
### 1. Goblet Squat
## Workout
`;
			const headings = extractHeadings(markdown);

			const capturedIds: string[] = [];
			renderToString(
				React.createElement(
					ReactMarkdown,
					{
						rehypePlugins: [rehypeHeadingIds],
						components: {
							h2({ id }: any) {
								capturedIds.push(id);
								return null;
							},
							h3({ id }: any) {
								capturedIds.push(id);
								return null;
							},
						},
					},
					markdown,
				),
			);

			expect(capturedIds).toEqual(headings.map((h) => h.id));
		});

		it("autolinks raw URLs in text and opens them in a new tab", () => {
			const markdown =
				"Visit https://strava.com or www.google.com for tracking.";
			const html = renderToString(
				React.createElement(BlogContent, { content: markdown }),
			);

			expect(html).toContain('href="https://strava.com"');
			expect(html).toContain('target="_blank"');
			expect(html).toContain('rel="noopener noreferrer"');
			expect(html).toContain('href="https://www.google.com"');
		});

		it("converts inline code URL highlights into clickable links opening in a new tab", () => {
			const markdown =
				"Check my Strava profile here: `https://www.strava.com/athletes/12345` and docs at `www.nextjs.org`.";
			const html = renderToString(
				React.createElement(BlogContent, { content: markdown }),
			);

			expect(html).toContain('href="https://www.strava.com/athletes/12345"');
			expect(html).toContain('href="https://www.nextjs.org"');
			expect(html).toContain('target="_blank"');
			expect(html).toContain('rel="noopener noreferrer"');
			// Verifies that standard non-URL inline code is not converted into a link
			const normalCodeMarkdown = "Use the `useState` hook.";
			const normalHtml = renderToString(
				React.createElement(BlogContent, { content: normalCodeMarkdown }),
			);
			expect(normalHtml).toContain("<code");
			expect(normalHtml).not.toContain('href="useState"');
		});

		it("renders GFM tables into structured HTML table elements with alignment and bold styling", () => {
			const markdown = `
Repeat this 8-week cycle continuously:

| Week | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Distance** | 16 km | 18 km | 16 km | **20 km** | 16 km | 18 km | 16 km | **20 km** |
`;
			const html = renderToString(
				React.createElement(BlogContent, { content: markdown }),
			);

			expect(html).toContain("<table");
			expect(html).toContain("<thead");
			expect(html).toContain("<tbody");
			expect(html).toContain("<th");
			expect(html).toContain("<td");
			expect(html).toContain("Week");
			expect(html).toContain("Distance");
			expect(html).toContain("16 km");
			expect(html).toContain("20 km");
			// Verifies responsive container, bold tags, and column alignment
			expect(html).toContain("overflow-x-auto");
			expect(html).toContain("<strong>Distance</strong>");
			expect(html).toContain("<strong>20 km</strong>");
			expect(html).toContain('style="text-align:left"');
			expect(html).toContain('style="text-align:center"');
		});

		it("normalizes single-line collapsed tables with '| |' or '||' and renders as tables", () => {
			const collapsedMarkdown =
				"| Day | Focus | Workout | | :--- | :--- | :--- | | Mon | Rest & Mobility | No running | | Tue | Aerobic Base | 8–10 km Easy |";
			const normalized = normalizeMarkdown(collapsedMarkdown);
			expect(normalized).toContain("|\n|");

			const html = renderToString(
				React.createElement(BlogContent, { content: collapsedMarkdown }),
			);

			expect(html).toContain("<table");
			expect(html).toContain("Day");
			expect(html).toContain("Focus");
			expect(html).toContain("Mon");
			expect(html).toContain("Tue");
		});
	});
});
