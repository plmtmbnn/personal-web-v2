import type {
	DiffChangeChunk,
	DiffGranularity,
	DiffLine,
	DiffOptions,
	DiffStats,
} from "../types";

/**
 * Normalizes a string for comparison according to options.
 */
function normalizeForCompare(str: string, options: DiffOptions): string {
	let res = str;
	if (options.ignoreCase) {
		res = res.toLowerCase();
	}
	if (options.ignoreWhitespace) {
		res = res.trim().replace(/\s+/g, " ");
	}
	return res;
}

/**
 * Computes Longest Common Subsequence (LCS) matrix between two arrays.
 */
function computeLCS<T>(
	a: T[],
	b: T[],
	isEqual: (itemA: T, itemB: T) => boolean,
): number[][] {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () =>
		new Array(n + 1).fill(0),
	);

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const itemA = a[i - 1];
			const itemB = b[j - 1];
			if (itemA !== undefined && itemB !== undefined && isEqual(itemA, itemB)) {
				dp[i]![j] = (dp[i - 1]?.[j - 1] ?? 0) + 1;
			} else {
				dp[i]![j] = Math.max(dp[i - 1]?.[j] ?? 0, dp[i]?.[j - 1] ?? 0);
			}
		}
	}

	return dp;
}

/**
 * Tokenizes a string into words or characters for fine-grained sub-diffing.
 */
function tokenizeString(str: string, granularity: DiffGranularity): string[] {
	if (granularity === "chars") {
		return str.split("");
	}
	// Granularity is 'words' or fallback: split keeping delimiters/spaces
	return str.split(/(\s+|[^\w\s])/).filter((t) => t.length > 0);
}

/**
 * Computes character or word-level changes between two single lines.
 */
export function computeSubDiff(
	oldLine: string,
	newLine: string,
	options: DiffOptions,
): { oldChunks: DiffChangeChunk[]; newChunks: DiffChangeChunk[] } {
	if (options.granularity === "lines" || oldLine === newLine) {
		return {
			oldChunks: [{ text: oldLine, type: "unchanged" }],
			newChunks: [{ text: newLine, type: "unchanged" }],
		};
	}

	const oldTokens = tokenizeString(oldLine, options.granularity);
	const newTokens = tokenizeString(newLine, options.granularity);

	const dp = computeLCS(oldTokens, newTokens, (a, b) => {
		return normalizeForCompare(a, options) === normalizeForCompare(b, options);
	});

	let i = oldTokens.length;
	let j = newTokens.length;

	const oldChunksReversed: DiffChangeChunk[] = [];
	const newChunksReversed: DiffChangeChunk[] = [];

	while (i > 0 || j > 0) {
		const tokenA = oldTokens[i - 1];
		const tokenB = newTokens[j - 1];

		if (
			i > 0 &&
			j > 0 &&
			tokenA !== undefined &&
			tokenB !== undefined &&
			normalizeForCompare(tokenA, options) ===
				normalizeForCompare(tokenB, options)
		) {
			oldChunksReversed.push({ text: tokenA, type: "unchanged" });
			newChunksReversed.push({ text: tokenB, type: "unchanged" });
			i--;
			j--;
		} else if (
			j > 0 &&
			(i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))
		) {
			if (tokenB !== undefined) {
				newChunksReversed.push({ text: tokenB, type: "added" });
			}
			j--;
		} else if (i > 0) {
			if (tokenA !== undefined) {
				oldChunksReversed.push({ text: tokenA, type: "removed" });
			}
			i--;
		}
	}

	return {
		oldChunks: mergeConsecutiveChunks(oldChunksReversed.reverse()),
		newChunks: mergeConsecutiveChunks(newChunksReversed.reverse()),
	};
}

/**
 * Helper to merge consecutive chunks of identical type for clean rendering.
 */
function mergeConsecutiveChunks(chunks: DiffChangeChunk[]): DiffChangeChunk[] {
	if (chunks.length === 0) return [];
	const merged: DiffChangeChunk[] = [];
	let current: DiffChangeChunk = { ...chunks[0]! };

	for (let idx = 1; idx < chunks.length; idx++) {
		const next = chunks[idx]!;
		if (next.type === current.type) {
			current.text += next.text;
		} else {
			merged.push(current);
			current = { ...next };
		}
	}
	merged.push(current);
	return merged;
}

/**
 * Computes line-by-line diff with aligned line numbers and sub-diff highlighting.
 */
export function computeDiff(
	originalText: string,
	modifiedText: string,
	options: DiffOptions,
): { lines: DiffLine[]; stats: DiffStats } {
	const originalLines = originalText === "" ? [] : originalText.split("\n");
	const modifiedLines = modifiedText === "" ? [] : modifiedText.split("\n");

	const dp = computeLCS(originalLines, modifiedLines, (a, b) => {
		return normalizeForCompare(a, options) === normalizeForCompare(b, options);
	});

	let i = originalLines.length;
	let j = modifiedLines.length;

	const rawDiff: Array<{
		type: "added" | "removed" | "unchanged";
		oldLineNum?: number;
		newLineNum?: number;
		oldText?: string;
		newText?: string;
	}> = [];

	while (i > 0 || j > 0) {
		const lineA = originalLines[i - 1];
		const lineB = modifiedLines[j - 1];

		if (
			i > 0 &&
			j > 0 &&
			lineA !== undefined &&
			lineB !== undefined &&
			normalizeForCompare(lineA, options) ===
				normalizeForCompare(lineB, options)
		) {
			rawDiff.push({
				type: "unchanged",
				oldLineNum: i,
				newLineNum: j,
				oldText: lineA,
				newText: lineB,
			});
			i--;
			j--;
		} else if (
			j > 0 &&
			(i === 0 || (dp[i]?.[j - 1] ?? 0) >= (dp[i - 1]?.[j] ?? 0))
		) {
			rawDiff.push({
				type: "added",
				newLineNum: j,
				newText: lineB,
			});
			j--;
		} else if (i > 0) {
			rawDiff.push({
				type: "removed",
				oldLineNum: i,
				oldText: lineA,
			});
			i--;
		}
	}

	rawDiff.reverse();

	// Process raw diff into structured paired DiffLine array with sub-diff chunks
	const resultLines: DiffLine[] = [];
	let additions = 0;
	let deletions = 0;
	let unchanged = 0;

	let idx = 0;
	while (idx < rawDiff.length) {
		const item = rawDiff[idx]!;

		// Check for contiguous removed + added block to pair as 'modified'
		if (
			item.type === "removed" &&
			idx + 1 < rawDiff.length &&
			rawDiff[idx + 1]?.type === "added"
		) {
			const nextItem = rawDiff[idx + 1]!;
			const oldContent = item.oldText || "";
			const newContent = nextItem.newText || "";

			const { oldChunks, newChunks } = computeSubDiff(
				oldContent,
				newContent,
				options,
			);

			resultLines.push({
				id: `line-${idx}`,
				type: "modified",
				oldLineNumber: item.oldLineNum,
				newLineNumber: nextItem.newLineNum,
				oldContent,
				newContent,
				oldChunks,
				newChunks,
			});

			deletions++;
			additions++;
			idx += 2;
			continue;
		}

		if (item.type === "added") {
			additions++;
			resultLines.push({
				id: `line-${idx}`,
				type: "added",
				newLineNumber: item.newLineNum,
				newContent: item.newText,
				newChunks: [{ text: item.newText || "", type: "added" }],
			});
		} else if (item.type === "removed") {
			deletions++;
			resultLines.push({
				id: `line-${idx}`,
				type: "removed",
				oldLineNumber: item.oldLineNum,
				oldContent: item.oldText,
				oldChunks: [{ text: item.oldText || "", type: "removed" }],
			});
		} else {
			unchanged++;
			resultLines.push({
				id: `line-${idx}`,
				type: "unchanged",
				oldLineNumber: item.oldLineNum,
				newLineNumber: item.newLineNum,
				oldContent: item.oldText,
				newContent: item.newText,
				oldChunks: [{ text: item.oldText || "", type: "unchanged" }],
				newChunks: [{ text: item.newText || "", type: "unchanged" }],
			});
		}
		idx++;
	}

	const totalLines = Math.max(1, originalLines.length + modifiedLines.length);
	const similarityPercent = Math.max(
		0,
		Math.min(100, Math.round(((unchanged * 2) / totalLines) * 100)),
	);

	const stats: DiffStats = {
		additions,
		deletions,
		unchanged,
		totalOldLines: originalLines.length,
		totalNewLines: modifiedLines.length,
		similarityPercent,
	};

	return { lines: resultLines, stats };
}

/**
 * Generates standard unified .patch file content.
 */
export function generateUnifiedPatch(
	original: string,
	modified: string,
	filename = "file.txt",
): string {
	const defaultOptions: DiffOptions = {
		ignoreWhitespace: false,
		ignoreCase: false,
		granularity: "lines",
	};

	const { lines } = computeDiff(original, modified, defaultOptions);

	const header = `--- a/${filename}\n+++ b/${filename}\n@@ -1,${original.split("\n").length} +1,${modified.split("\n").length} @@\n`;

	const body = lines
		.map((line) => {
			if (line.type === "added") {
				return `+${line.newContent || ""}`;
			}
			if (line.type === "removed") {
				return `-${line.oldContent || ""}`;
			}
			if (line.type === "modified") {
				return `-${line.oldContent || ""}\n+${line.newContent || ""}`;
			}
			return ` ${line.oldContent || ""}`;
		})
		.join("\n");

	return header + body;
}
