import { describe, it, expect } from "vitest";
import {
	computeTextStats,
	normalizeText,
	computeLevenshteinDistance,
	computeVocabularyAnalysis,
	computeSimilarityIndexes,
	computeSubDiff,
	compareTexts,
	generateMarkdownReport,
} from "../utils/comparator-engine";
import type { ComparisonOptions } from "../types";

describe("Text Compare & Comparator Engine", () => {
	const defaultOptions: ComparisonOptions = {
		ignoreCase: false,
		ignoreWhitespace: false,
		ignorePunctuation: false,
		ignoreBlankLines: false,
		sortLines: false,
	};

	describe("computeTextStats()", () => {
		it("returns zeroes for empty input", () => {
			expect(computeTextStats("")).toEqual({
				charCount: 0,
				charCountNoSpaces: 0,
				wordCount: 0,
				lineCount: 0,
				sentenceCount: 0,
				paragraphCount: 0,
				readingTimeSeconds: 0,
			});
		});

		it("computes accurate statistics for multi-paragraph text", () => {
			const text =
				"Hello world! How are you?\n\nI am doing great. Everything is awesome.";
			const stats = computeTextStats(text);

			expect(stats.charCount).toBe(text.length);
			expect(stats.charCountNoSpaces).toBe(text.replace(/\s/g, "").length);
			expect(stats.wordCount).toBe(12);
			expect(stats.lineCount).toBe(3);
			expect(stats.paragraphCount).toBe(2);
			expect(stats.sentenceCount).toBe(4);
			expect(stats.readingTimeSeconds).toBeGreaterThan(0);
		});
	});

	describe("normalizeText()", () => {
		it("normalizes case when ignoreCase is enabled", () => {
			const res = normalizeText("Hello WORLD", {
				...defaultOptions,
				ignoreCase: true,
			});
			expect(res).toBe("hello world");
		});

		it("removes punctuation when ignorePunctuation is enabled", () => {
			const res = normalizeText("Hello, world! (Test: 123)", {
				...defaultOptions,
				ignorePunctuation: true,
			});
			expect(res).toBe("Hello world Test 123");
		});

		it("normalizes consecutive whitespace when ignoreWhitespace is enabled", () => {
			const res = normalizeText("  Hello \t\t world  \n  test  ", {
				...defaultOptions,
				ignoreWhitespace: true,
			});
			expect(res).toBe("Hello world\ntest");
		});

		it("filters out blank lines when ignoreBlankLines is enabled", () => {
			const res = normalizeText("Line 1\n\n  \nLine 2", {
				...defaultOptions,
				ignoreBlankLines: true,
			});
			expect(res).toBe("Line 1\nLine 2");
		});

		it("sorts lines alphabetically when sortLines is enabled", () => {
			const res = normalizeText("Zebra\nApple\nMango", {
				...defaultOptions,
				sortLines: true,
			});
			expect(res).toBe("Apple\nMango\nZebra");
		});
	});

	describe("computeLevenshteinDistance()", () => {
		it("returns 0 for identical strings", () => {
			expect(computeLevenshteinDistance("kitten", "kitten")).toBe(0);
		});

		it("returns length of non-empty string when compared with empty", () => {
			expect(computeLevenshteinDistance("", "hello")).toBe(5);
			expect(computeLevenshteinDistance("hello", "")).toBe(5);
		});

		it("calculates edit distance correctly for known pairs", () => {
			expect(computeLevenshteinDistance("kitten", "sitting")).toBe(3);
			expect(computeLevenshteinDistance("saturday", "sunday")).toBe(3);
		});
	});

	describe("computeVocabularyAnalysis()", () => {
		it("identifies shared and unique words between two texts", () => {
			const textA = "apple banana orange apple";
			const textB = "banana kiwi orange grape";

			const analysis = computeVocabularyAnalysis(textA, textB);

			expect(analysis.totalShared).toBe(2); // banana, orange
			expect(analysis.totalUniqueA).toBe(1); // apple
			expect(analysis.totalUniqueB).toBe(2); // kiwi, grape
			expect(
				analysis.sharedWords.find((w) => w.word === "orange"),
			).toBeDefined();
		});
	});

	describe("computeSimilarityIndexes()", () => {
		it("returns 1 for both empty inputs", () => {
			expect(computeSimilarityIndexes("", "")).toEqual({
				jaccardIndex: 1,
				diceCoefficient: 1,
			});
		});

		it("returns 0 when one input is empty", () => {
			expect(computeSimilarityIndexes("hello world", "")).toEqual({
				jaccardIndex: 0,
				diceCoefficient: 0,
			});
		});

		it("calculates accurate Jaccard and Dice indices", () => {
			const textA = "quick brown fox";
			const textB = "fast brown fox";
			const res = computeSimilarityIndexes(textA, textB);

			// shared: brown, fox (2). union: quick, fast, brown, fox (4). Jaccard = 2/4 = 0.5
			expect(res.jaccardIndex).toBe(0.5);
			// Dice = 2*2 / (3 + 3) = 4/6 = 0.667
			expect(res.diceCoefficient).toBeCloseTo(0.667, 2);
		});
	});

	describe("computeSubDiff()", () => {
		it("returns unchanged chunk when strings are equal", () => {
			const res = computeSubDiff("hello world", "hello world", defaultOptions);
			expect(res.oldChunks).toEqual([
				{ text: "hello world", type: "unchanged" },
			]);
			expect(res.newChunks).toEqual([
				{ text: "hello world", type: "unchanged" },
			]);
		});

		it("highlights word modifications between two lines", () => {
			const res = computeSubDiff(
				"The blue car",
				"The red car",
				defaultOptions,
				"lines",
			);
			expect(
				res.oldChunks.some((c) => c.text === "blue" && c.type === "removed"),
			).toBe(true);
			expect(
				res.newChunks.some((c) => c.text === "red" && c.type === "added"),
			).toBe(true);
		});
	});

	describe("compareTexts() & generateMarkdownReport()", () => {
		it("handles both empty texts gracefully", () => {
			const result = compareTexts("", "", defaultOptions);
			expect(result.metrics.similarityPercent).toBe(100);
			expect(result.rows).toHaveLength(0);
			expect(result.differences).toHaveLength(0);
		});

		it("detects additions, deletions, and modifications across multiple lines", () => {
			const textA = "Line 1\nLine 2 is modified\nLine 3 to delete";
			const textB = "Line 1\nLine 2 is updated\nLine 4 added";

			const result = compareTexts(textA, textB, defaultOptions);

			expect(result.metrics.totalChanges).toBeGreaterThan(0);
			expect(result.rows.length).toBeGreaterThan(0);
			expect(result.metrics.similarityPercent).toBeGreaterThan(0);

			const report = generateMarkdownReport(result, "Doc V1", "Doc V2");
			expect(report).toContain(
				"# Text Comparison & Similarity Analysis Report",
			);
			expect(report).toContain("Doc V1");
			expect(report).toContain("Doc V2");
			expect(report).toContain("Itemized Differences");
		});
	});
});
