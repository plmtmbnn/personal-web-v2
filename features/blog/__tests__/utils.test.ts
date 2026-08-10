import { describe, it, expect } from "vitest";
import {
	getCategoryStyles,
	getReadTime,
	getWordCount,
	getBlogImage,
	CATEGORIES,
	CATEGORY_STYLES,
	PLACEHOLDERS,
} from "../utils";

describe("Blog Utilities", () => {
	describe("getCategoryStyles", () => {
		it("returns correct style class for known categories", () => {
			CATEGORIES.forEach((cat) => {
				expect(getCategoryStyles(cat)).toBe(CATEGORY_STYLES[cat]);
			});
		});

		it("returns fallback default style class for unknown category", () => {
			const fallback = getCategoryStyles("UnknownCategory");
			expect(fallback).toBe("bg-slate-50 text-slate-700 border-slate-100");
		});

		it("handles empty string gracefully", () => {
			expect(getCategoryStyles("")).toBe(
				"bg-slate-50 text-slate-700 border-slate-100",
			);
		});
	});

	describe("getReadTime", () => {
		it("returns default 1 MIN READ for short text", () => {
			expect(getReadTime("Short blog post content")).toBe("1 MIN READ");
		});

		it("handles empty or null-like input", () => {
			expect(getReadTime("")).toBe("1 MIN READ");
			// @ts-expect-error testing null safety
			expect(getReadTime(null)).toBe("1 MIN READ");
		});

		it("strips fenced code blocks before counting words", () => {
			const textWithCode = `
# Title
Here is a paragraph with five words.

\`\`\`typescript
const a = 1;
const b = 2;
const c = a + b;
// A very long code block with many lines and words that should not count towards reading time...
\`\`\`

Another five words paragraph here.
`;
			// Should only count non-code words (~10 words total -> 1 min)
			expect(getReadTime(textWithCode)).toBe("1 MIN READ");
		});

		it("strips inline code, images, links syntax, heading markers, and markdown characters", () => {
			const markdown = `
# Header 1
## Header 2
### Header 3

This is **bold** text, *italic* text, and ~strikethrough~ text.
Check out [this link](https://example.com) and inline \`const x = 100;\`.
![An image caption](https://example.com/img.jpg)

> Blockquote line 1
> Blockquote line 2
`;
			const count = getWordCount(markdown);
			expect(count).toBeGreaterThan(0);
			expect(getReadTime(markdown)).toBe("1 MIN READ");
		});

		it("calculates multi-minute read times correctly for long content", () => {
			// 500 words should be Math.ceil(500 / 200) = 3 MIN READ
			const longText = Array(500).fill("word").join(" ");
			expect(getReadTime(longText)).toBe("3 MIN READ");
		});
	});

	describe("getWordCount", () => {
		it("returns 0 for empty string", () => {
			expect(getWordCount("")).toBe(0);
			// @ts-expect-error testing null safety
			expect(getWordCount(null)).toBe(0);
		});

		it("accurately counts words in clean text", () => {
			expect(getWordCount("Hello world from unit tests!")).toBe(5);
		});

		it("ignores code blocks in word count", () => {
			const content = "One two three ```code block words here``` four five";
			expect(getWordCount(content)).toBe(5);
		});
	});

	describe("getBlogImage", () => {
		it("returns original image URL if provided and non-empty", () => {
			const customUrl = "https://custom-image.com/test.jpg";
			expect(getBlogImage(customUrl, "test-seed")).toBe(customUrl);
		});

		it("trims whitespace when checking provided image URL", () => {
			const customUrl = "  https://custom-image.com/test.jpg  ";
			expect(getBlogImage(customUrl, "test-seed")).toBe(customUrl);
		});

		it("returns deterministic placeholder from seed when image URL is null or empty", () => {
			const img1 = getBlogImage(null, "react-guide");
			const img2 = getBlogImage("", "react-guide");
			const img3 = getBlogImage("   ", "react-guide");

			expect(img1).toBe(img2);
			expect(img2).toBe(img3);
			expect(PLACEHOLDERS).toContain(img1);
		});

		it("produces different placeholders for different seeds", () => {
			const seeds = ["seed-a", "seed-b", "seed-c", "seed-d", "seed-e"];
			const results = new Set(seeds.map((s) => getBlogImage(null, s)));

			expect(results.size).toBeGreaterThan(1);
			for (const url of results) {
				expect(PLACEHOLDERS).toContain(url);
			}
		});
	});
});
