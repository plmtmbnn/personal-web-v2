import { describe, it, expect } from "vitest";
import {
	computeDiff,
	computeSubDiff,
	generateUnifiedPatch,
} from "../utils/diff-engine";
import { DIFF_SAMPLES } from "../utils/samples";
import type { DiffOptions } from "../types";

const defaultOptions: DiffOptions = {
	ignoreWhitespace: false,
	ignoreCase: false,
	granularity: "words",
};

describe("computeDiff (LCS Engine)", () => {
	it("detects identical texts with 100% similarity", () => {
		const text = "function hello() {\n  return 'world';\n}";
		const { lines, stats } = computeDiff(text, text, defaultOptions);

		expect(stats.additions).toBe(0);
		expect(stats.deletions).toBe(0);
		expect(stats.unchanged).toBe(3);
		expect(stats.similarityPercent).toBe(100);
		expect(lines).toHaveLength(3);
	});

	it("detects added and removed lines", () => {
		const original = "Line 1\nLine 2\nLine 3";
		const modified = "Line 1\nInserted Line\nLine 3";

		const { lines, stats } = computeDiff(original, modified, defaultOptions);

		expect(stats.additions).toBe(1);
		expect(stats.deletions).toBe(1);
		expect(stats.unchanged).toBe(2);

		// Modified line should have old and new chunks
		const modLine = lines.find((l) => l.type === "modified");
		expect(modLine).toBeDefined();
		expect(modLine?.oldContent).toBe("Line 2");
		expect(modLine?.newContent).toBe("Inserted Line");
	});

	it("handles completely different texts", () => {
		const original = "Alpha\nBeta";
		const modified = "Gamma\nDelta";

		const { stats } = computeDiff(original, modified, defaultOptions);
		expect(stats.unchanged).toBe(0);
		expect(stats.similarityPercent).toBe(0);
	});

	it("handles empty strings gracefully", () => {
		const { lines, stats } = computeDiff("", "", defaultOptions);
		expect(lines).toHaveLength(0);
		expect(stats.additions).toBe(0);
		expect(stats.deletions).toBe(0);
	});

	it("respects ignoreWhitespace option", () => {
		const original = "  const x = 10;  ";
		const modified = "const x = 10;";

		const diffStrict = computeDiff(original, modified, {
			...defaultOptions,
			ignoreWhitespace: false,
		});
		expect(diffStrict.stats.unchanged).toBe(0);

		const diffIgnore = computeDiff(original, modified, {
			...defaultOptions,
			ignoreWhitespace: true,
		});
		expect(diffIgnore.stats.unchanged).toBe(1);
		expect(diffIgnore.stats.similarityPercent).toBe(100);
	});

	it("respects ignoreCase option", () => {
		const original = "SELECT * FROM Users;";
		const modified = "select * from users;";

		const diffStrict = computeDiff(original, modified, {
			...defaultOptions,
			ignoreCase: false,
		});
		expect(diffStrict.stats.unchanged).toBe(0);

		const diffIgnore = computeDiff(original, modified, {
			...defaultOptions,
			ignoreCase: true,
		});
		expect(diffIgnore.stats.unchanged).toBe(1);
	});
});

describe("computeSubDiff (Word & Character Precision)", () => {
	it("identifies specific word changes inside a modified line", () => {
		const oldLine = "const total = calculateTax(amount, standardRate);";
		const newLine = "const total = calculateTax(amount, discountedRate);";

		const { oldChunks, newChunks } = computeSubDiff(oldLine, newLine, {
			...defaultOptions,
			granularity: "words",
		});

		const removedChunk = oldChunks.find((c) => c.type === "removed");
		const addedChunk = newChunks.find((c) => c.type === "added");

		expect(removedChunk?.text).toBe("standardRate");
		expect(addedChunk?.text).toBe("discountedRate");
	});

	it("identifies character-level changes with granularity='chars'", () => {
		const oldLine = "cat";
		const newLine = "car";

		const { oldChunks, newChunks } = computeSubDiff(oldLine, newLine, {
			...defaultOptions,
			granularity: "chars",
		});

		const removedChar = oldChunks.find((c) => c.type === "removed");
		const addedChar = newChunks.find((c) => c.type === "added");

		expect(removedChar?.text).toBe("t");
		expect(addedChar?.text).toBe("r");
	});
});

describe("generateUnifiedPatch", () => {
	it("generates a valid unified diff patch format", () => {
		const original = "line1\nold line\nline3";
		const modified = "line1\nnew line\nline3";

		const patch = generateUnifiedPatch(original, modified, "sample.ts");

		expect(patch).toContain("--- a/sample.ts");
		expect(patch).toContain("+++ b/sample.ts");
		expect(patch).toContain("@@ -1,3 +1,3 @@");
		expect(patch).toContain("-old line");
		expect(patch).toContain("+new line");
		expect(patch).toContain(" line1");
	});
});

describe("DIFF_SAMPLES", () => {
	it("contains curated samples with valid content", () => {
		expect(DIFF_SAMPLES.length).toBeGreaterThanOrEqual(4);
		for (const sample of DIFF_SAMPLES) {
			expect(sample.id).toBeDefined();
			expect(sample.title).toBeDefined();
			expect(sample.original.length).toBeGreaterThan(0);
			expect(sample.modified.length).toBeGreaterThan(0);
		}
	});
});
