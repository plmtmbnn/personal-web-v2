import type {
	ComparisonMetrics,
	ComparisonOptions,
	ComparisonResult,
	DiffChunk,
	DiffRow,
	DifferenceSummaryItem,
	Granularity,
	TextStats,
	VocabularyAnalysis,
	VocabularyItem,
} from "../types";

/**
 * Computes statistical metrics for a single text.
 */
export function computeTextStats(text: string): TextStats {
	if (!text) {
		return {
			charCount: 0,
			charCountNoSpaces: 0,
			wordCount: 0,
			lineCount: 0,
			sentenceCount: 0,
			paragraphCount: 0,
			readingTimeSeconds: 0,
		};
	}

	const charCount = text.length;
	const charCountNoSpaces = text.replace(/\s/g, "").length;

	// Words: match alphanumeric chunks
	const words = text.match(/[\p{L}\p{N}'-]+/gu) || [];
	const wordCount = words.length;

	// Lines
	const lines = text.split("\n");
	const lineCount = lines.length;

	// Paragraphs: non-empty chunks separated by blank lines
	const paragraphs = text
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter((p) => p.length > 0);
	const paragraphCount = Math.max(1, paragraphs.length);

	// Sentences
	const sentences = text
		.split(/[.!?]+(?:\s+|$)/)
		.map((s) => s.trim())
		.filter((s) => s.length > 0);
	const sentenceCount = sentences.length || (wordCount > 0 ? 1 : 0);

	// Average reading speed: 200 words/min => wordCount / 200 * 60 seconds
	const readingTimeSeconds = Math.ceil((wordCount / 200) * 60);

	return {
		charCount,
		charCountNoSpaces,
		wordCount,
		lineCount,
		sentenceCount,
		paragraphCount,
		readingTimeSeconds,
	};
}

/**
 * Normalizes text based on comparison options.
 */
export function normalizeText(
	text: string,
	options: ComparisonOptions,
): string {
	let res = text;

	if (options.ignoreCase) {
		res = res.toLowerCase();
	}

	if (options.ignorePunctuation) {
		res = res.replace(/[^\p{L}\p{N}\s]/gu, "");
	}

	if (options.ignoreWhitespace) {
		// Normalize all consecutive whitespace to single space
		res = res
			.split("\n")
			.map((line) => line.trim().replace(/[ \t]+/g, " "))
			.join("\n");
	}

	if (options.ignoreBlankLines) {
		res = res
			.split("\n")
			.filter((line) => line.trim().length > 0)
			.join("\n");
	}

	if (options.sortLines) {
		res = res
			.split("\n")
			.filter((line) => !options.ignoreBlankLines || line.trim().length > 0)
			.sort((a, b) => a.localeCompare(b))
			.join("\n");
	}

	return res;
}

/**
 * Computes Levenshtein Distance with memory optimization.
 * For very large strings (> 3000 chars), caps computation to avoid freezing.
 */
export function computeLevenshteinDistance(strA: string, strB: string): number {
	const a = strA.slice(0, 3000);
	const b = strB.slice(0, 3000);

	const m = a.length;
	const n = b.length;

	if (m === 0) return n;
	if (n === 0) return m;

	let prevRow = new Array(n + 1);
	let currRow = new Array(n + 1);

	for (let j = 0; j <= n; j++) {
		prevRow[j] = j;
	}

	for (let i = 1; i <= m; i++) {
		currRow[0] = i;
		const charA = a[i - 1];

		for (let j = 1; j <= n; j++) {
			const charB = b[j - 1];
			const cost = charA === charB ? 0 : 1;

			currRow[j] = Math.min(
				prevRow[j]! + 1, // deletion
				currRow[j - 1]! + 1, // insertion
				prevRow[j - 1]! + cost, // substitution
			);
		}

		// Swap rows
		const temp = prevRow;
		prevRow = currRow;
		currRow = temp;
	}

	return prevRow[n] ?? 0;
}

/**
 * Tokenizes text into word frequency map.
 */
function getWordFrequencyMap(text: string): Map<string, number> {
	const map = new Map<string, number>();
	const words = text.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) || [];

	for (const word of words) {
		const clean = word.replace(/^['"]+|['"]+$/g, "");
		if (clean.length > 0) {
			map.set(clean, (map.get(clean) || 0) + 1);
		}
	}

	return map;
}

/**
 * Computes vocabulary breakdown: shared words, unique to A, unique to B.
 */
export function computeVocabularyAnalysis(
	textA: string,
	textB: string,
): VocabularyAnalysis {
	const mapA = getWordFrequencyMap(textA);
	const mapB = getWordFrequencyMap(textB);

	const sharedWords: VocabularyItem[] = [];
	const uniqueToA: VocabularyItem[] = [];
	const uniqueToB: VocabularyItem[] = [];

	// Process words from A
	for (const [word, countA] of mapA.entries()) {
		if (mapB.has(word)) {
			sharedWords.push({
				word,
				countA,
				countB: mapB.get(word) || 0,
			});
		} else {
			uniqueToA.push({
				word,
				countA,
				countB: 0,
			});
		}
	}

	// Process words only in B
	for (const [word, countB] of mapB.entries()) {
		if (!mapA.has(word)) {
			uniqueToB.push({
				word,
				countA: 0,
				countB,
			});
		}
	}

	// Sort by total frequency descending
	sharedWords.sort((a, b) => b.countA + b.countB - (a.countA + a.countB));
	uniqueToA.sort((a, b) => b.countA - a.countA);
	uniqueToB.sort((a, b) => b.countB - a.countB);

	return {
		sharedWords,
		uniqueToA,
		uniqueToB,
		totalShared: sharedWords.length,
		totalUniqueA: uniqueToA.length,
		totalUniqueB: uniqueToB.length,
	};
}

/**
 * Computes Jaccard Similarity and Dice Coefficient for two texts.
 */
export function computeSimilarityIndexes(
	textA: string,
	textB: string,
): { jaccardIndex: number; diceCoefficient: number } {
	const wordsA = new Set(textA.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) || []);
	const wordsB = new Set(textB.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) || []);

	if (wordsA.size === 0 && wordsB.size === 0) {
		return { jaccardIndex: 1, diceCoefficient: 1 };
	}
	if (wordsA.size === 0 || wordsB.size === 0) {
		return { jaccardIndex: 0, diceCoefficient: 0 };
	}

	let intersectionCount = 0;
	for (const word of wordsA) {
		if (wordsB.has(word)) {
			intersectionCount++;
		}
	}

	const unionCount = wordsA.size + wordsB.size - intersectionCount;
	const jaccardIndex = unionCount > 0 ? intersectionCount / unionCount : 0;
	const diceCoefficient =
		wordsA.size + wordsB.size > 0
			? (2 * intersectionCount) / (wordsA.size + wordsB.size)
			: 0;

	return {
		jaccardIndex: Math.round(jaccardIndex * 1000) / 1000,
		diceCoefficient: Math.round(diceCoefficient * 1000) / 1000,
	};
}

/**
 * Tokenizes text based on the chosen granularity.
 */
function tokenize(text: string, granularity: Granularity): string[] {
	if (!text) return [];

	switch (granularity) {
		case "chars":
			return Array.from(text);
		case "words":
			// Split by whitespace and punctuation boundaries while keeping whitespace tokens
			return text.split(/(\s+|[^\p{L}\p{N}\s]+)/gu).filter((t) => t.length > 0);
		case "sentences":
			// Split by sentence boundaries
			return text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 0);
		default:
			return text.split("\n");
	}
}

/**
 * Longest Common Subsequence (LCS) matrix computation for arrays.
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
 * Helper to merge consecutive chunks of same diff type.
 */
function mergeConsecutiveChunks(chunks: DiffChunk[]): DiffChunk[] {
	if (chunks.length === 0) return [];
	const merged: DiffChunk[] = [];
	let current: DiffChunk = { ...chunks[0]! };

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
 * Computes fine-grained word/character level sub-diff between two strings.
 */
export function computeSubDiff(
	oldStr: string,
	newStr: string,
	options: ComparisonOptions,
	granularity: Granularity = "words",
): { oldChunks: DiffChunk[]; newChunks: DiffChunk[] } {
	if (oldStr === newStr) {
		return {
			oldChunks: [{ text: oldStr, type: "unchanged" }],
			newChunks: [{ text: newStr, type: "unchanged" }],
		};
	}

	const subGranularity = granularity === "lines" ? "words" : "chars";
	const tokensA = tokenize(oldStr, subGranularity);
	const tokensB = tokenize(newStr, subGranularity);

	const isTokenEqual = (a: string, b: string) => {
		let normA = a;
		let normB = b;
		if (options.ignoreCase) {
			normA = normA.toLowerCase();
			normB = normB.toLowerCase();
		}
		return normA === normB;
	};

	const dp = computeLCS(tokensA, tokensB, isTokenEqual);

	let i = tokensA.length;
	let j = tokensB.length;

	const oldChunksReversed: DiffChunk[] = [];
	const newChunksReversed: DiffChunk[] = [];

	while (i > 0 || j > 0) {
		const tokenA = tokensA[i - 1];
		const tokenB = tokensB[j - 1];

		if (
			i > 0 &&
			j > 0 &&
			tokenA !== undefined &&
			tokenB !== undefined &&
			isTokenEqual(tokenA, tokenB)
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
 * Main comprehensive comparator engine function.
 */
export function compareTexts(
	rawTextA: string,
	rawTextB: string,
	options: ComparisonOptions,
	granularity: Granularity = "lines",
): ComparisonResult {
	const statsA = computeTextStats(rawTextA);
	const statsB = computeTextStats(rawTextB);

	const normalizedA = normalizeText(rawTextA, options);
	const normalizedB = normalizeText(rawTextB, options);

	const vocabulary = computeVocabularyAnalysis(rawTextA, rawTextB);
	const { jaccardIndex, diceCoefficient } = computeSimilarityIndexes(
		rawTextA,
		rawTextB,
	);
	const levenshteinDistance = computeLevenshteinDistance(rawTextA, rawTextB);

	// Both empty
	if (!rawTextA && !rawTextB) {
		return {
			statsA,
			statsB,
			metrics: {
				similarityPercent: 100,
				levenshteinDistance: 0,
				jaccardIndex: 1,
				diceCoefficient: 1,
				charDelta: 0,
				wordDelta: 0,
				lineDelta: 0,
				totalChanges: 0,
				additionsCount: 0,
				deletionsCount: 0,
				modificationsCount: 0,
			},
			rows: [],
			inlineChunks: [],
			differences: [],
			vocabulary,
		};
	}

	// Line-based computation for dual side-by-side view
	const linesA = normalizedA === "" ? [] : normalizedA.split("\n");
	const linesB = normalizedB === "" ? [] : normalizedB.split("\n");

	const isLineEqual = (lineA: string, lineB: string) => {
		let a = lineA;
		let b = lineB;
		if (options.ignoreCase) {
			a = a.toLowerCase();
			b = b.toLowerCase();
		}
		if (options.ignoreWhitespace) {
			a = a.trim();
			b = b.trim();
		}
		return a === b;
	};

	const dp = computeLCS(linesA, linesB, isLineEqual);

	let i = linesA.length;
	let j = linesB.length;

	const rawDiff: Array<{
		type: "added" | "removed" | "unchanged";
		oldLineNum?: number;
		newLineNum?: number;
		oldText?: string;
		newText?: string;
	}> = [];

	while (i > 0 || j > 0) {
		const lineA = linesA[i - 1];
		const lineB = linesB[j - 1];

		if (
			i > 0 &&
			j > 0 &&
			lineA !== undefined &&
			lineB !== undefined &&
			isLineEqual(lineA, lineB)
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

	// Process into structured paired DiffRow array with sub-token diffs
	const rows: DiffRow[] = [];
	const differences: DifferenceSummaryItem[] = [];
	let additionsCount = 0;
	let deletionsCount = 0;
	let modificationsCount = 0;

	let idx = 0;
	while (idx < rawDiff.length) {
		const item = rawDiff[idx]!;

		// Pair contiguous removed + added into a "modified" row
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
				granularity,
			);

			rows.push({
				id: `row-${idx}`,
				type: "modified",
				oldLineNumber: item.oldLineNum,
				newLineNumber: nextItem.newLineNum,
				oldContent,
				newContent,
				oldChunks,
				newChunks,
			});

			differences.push({
				id: `diff-${idx}`,
				type: "modified",
				position: `Line ${item.oldLineNum} → ${nextItem.newLineNum}`,
				description: "Modified text content",
				oldSnippet: oldContent,
				newSnippet: newContent,
			});

			modificationsCount++;
			idx += 2;
			continue;
		}

		if (item.type === "added") {
			additionsCount++;
			rows.push({
				id: `row-${idx}`,
				type: "added",
				newLineNumber: item.newLineNum,
				newContent: item.newText,
				newChunks: [{ text: item.newText || "", type: "added" }],
			});
			differences.push({
				id: `diff-${idx}`,
				type: "added",
				position: `Line ${item.newLineNum}`,
				description: "Inserted new line",
				newSnippet: item.newText,
			});
		} else if (item.type === "removed") {
			deletionsCount++;
			rows.push({
				id: `row-${idx}`,
				type: "removed",
				oldLineNumber: item.oldLineNum,
				oldContent: item.oldText,
				oldChunks: [{ text: item.oldText || "", type: "removed" }],
			});
			differences.push({
				id: `diff-${idx}`,
				type: "removed",
				position: `Line ${item.oldLineNum}`,
				description: "Deleted line",
				oldSnippet: item.oldText,
			});
		} else {
			rows.push({
				id: `row-${idx}`,
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

	// Compute word-level inline diff chunks for prose reading view
	const tokensA = tokenize(
		rawTextA,
		granularity === "chars" ? "chars" : "words",
	);
	const tokensB = tokenize(
		rawTextB,
		granularity === "chars" ? "chars" : "words",
	);

	const dpTokens = computeLCS(tokensA, tokensB, (a, b) => {
		let na = a;
		let nb = b;
		if (options.ignoreCase) {
			na = na.toLowerCase();
			nb = nb.toLowerCase();
		}
		return na === nb;
	});

	let ti = tokensA.length;
	let tj = tokensB.length;
	const inlineReversed: DiffChunk[] = [];

	while (ti > 0 || tj > 0) {
		const tokA = tokensA[ti - 1];
		const tokB = tokensB[tj - 1];

		let isEqual = false;
		if (tokA !== undefined && tokB !== undefined) {
			let na = tokA;
			let nb = tokB;
			if (options.ignoreCase) {
				na = na.toLowerCase();
				nb = nb.toLowerCase();
			}
			isEqual = na === nb;
		}

		if (ti > 0 && tj > 0 && isEqual && tokA !== undefined) {
			inlineReversed.push({ text: tokA, type: "unchanged" });
			ti--;
			tj--;
		} else if (
			tj > 0 &&
			(ti === 0 ||
				(dpTokens[ti]?.[tj - 1] ?? 0) >= (dpTokens[ti - 1]?.[tj] ?? 0))
		) {
			if (tokB !== undefined) {
				inlineReversed.push({ text: tokB, type: "added" });
			}
			tj--;
		} else if (ti > 0) {
			if (tokA !== undefined) {
				inlineReversed.push({ text: tokA, type: "removed" });
			}
			ti--;
		}
	}

	const inlineChunks = mergeConsecutiveChunks(inlineReversed.reverse());

	// Calculate overall Similarity Percentage
	// Balanced composite of LCS token ratio and Jaccard word similarity
	const totalTokens = Math.max(1, tokensA.length + tokensB.length);
	const lcsCommonCount = dpTokens[tokensA.length]?.[tokensB.length] ?? 0;
	const tokenSimilarity = (lcsCommonCount * 2) / totalTokens;
	const similarityPercent = Math.min(
		100,
		Math.max(0, Math.round((tokenSimilarity * 0.7 + jaccardIndex * 0.3) * 100)),
	);

	const metrics: ComparisonMetrics = {
		similarityPercent,
		levenshteinDistance,
		jaccardIndex,
		diceCoefficient,
		charDelta: statsB.charCount - statsA.charCount,
		wordDelta: statsB.wordCount - statsA.wordCount,
		lineDelta: statsB.lineCount - statsA.lineCount,
		totalChanges: additionsCount + deletionsCount + modificationsCount,
		additionsCount,
		deletionsCount,
		modificationsCount,
	};

	return {
		statsA,
		statsB,
		metrics,
		rows,
		inlineChunks,
		differences,
		vocabulary,
	};
}

/**
 * Generates a clean Markdown export report.
 */
export function generateMarkdownReport(
	result: ComparisonResult,
	titleA = "Original (Text A)",
	titleB = "Modified (Text B)",
): string {
	const { statsA, statsB, metrics, differences, vocabulary } = result;

	const lines = [
		"# Text Comparison & Similarity Analysis Report",
		`Generated on: ${new Date().toLocaleString()}`,
		"",
		"## 📊 Similarity & Overview",
		`- **Comparing:** \`${titleA}\` vs \`${titleB}\``,
		`- **Overall Similarity:** ${metrics.similarityPercent}%`,
		`- **Levenshtein Distance:** ${metrics.levenshteinDistance} edits`,
		`- **Jaccard Word Index:** ${(metrics.jaccardIndex * 100).toFixed(1)}%`,
		`- **Dice Coefficient:** ${(metrics.diceCoefficient * 100).toFixed(1)}%`,
		`- **Total Difference Operations:** ${metrics.totalChanges} (${metrics.additionsCount} added, ${metrics.deletionsCount} removed, ${metrics.modificationsCount} modified)`,
		"",
		"## 📏 Metrics Comparison",
		`| Metric | ${titleA} | ${titleB} | Delta |`,
		"| :--- | :--- | :--- | :--- |",
		`| Words | ${statsA.wordCount} | ${statsB.wordCount} | ${metrics.wordDelta >= 0 ? `+${metrics.wordDelta}` : metrics.wordDelta} |`,
		`| Characters | ${statsA.charCount} | ${statsB.charCount} | ${metrics.charDelta >= 0 ? `+${metrics.charDelta}` : metrics.charDelta} |`,
		`| Lines | ${statsA.lineCount} | ${statsB.lineCount} | ${metrics.lineDelta >= 0 ? `+${metrics.lineDelta}` : metrics.lineDelta} |`,
		`| Sentences | ${statsA.sentenceCount} | ${statsB.sentenceCount} | ${statsB.sentenceCount - statsA.sentenceCount >= 0 ? `+${statsB.sentenceCount - statsA.sentenceCount}` : statsB.sentenceCount - statsA.sentenceCount} |`,
		`| Reading Time | ~${statsA.readingTimeSeconds}s | ~${statsB.readingTimeSeconds}s | - |`,
		"",
		"## 📝 Vocabulary Insights",
		`- **Shared Words:** ${vocabulary.totalShared} terms`,
		`- **Unique to ${titleA}:** ${vocabulary.totalUniqueA} terms`,
		`- **Unique to ${titleB}:** ${vocabulary.totalUniqueB} terms`,
		"",
		"## 🔍 Itemized Differences",
	];

	if (differences.length === 0) {
		lines.push("No differences detected. Both texts are identical.");
	} else {
		for (const diff of differences.slice(0, 50)) {
			lines.push(`### [${diff.type.toUpperCase()}] ${diff.position}`);
			if (diff.oldSnippet) {
				lines.push(`- **Removed:** \`${diff.oldSnippet.trim()}\``);
			}
			if (diff.newSnippet) {
				lines.push(`- **Added:** \`${diff.newSnippet.trim()}\``);
			}
			lines.push("");
		}
		if (differences.length > 50) {
			lines.push(`*...and ${differences.length - 50} more changes.*`);
		}
	}

	return lines.join("\n");
}
