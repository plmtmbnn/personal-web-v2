export type TextComparisonMode =
	| "side-by-side"
	| "inline"
	| "differences-only"
	| "vocabulary";

export type Granularity = "words" | "chars" | "lines" | "sentences";

export interface ComparisonOptions {
	ignoreCase: boolean;
	ignoreWhitespace: boolean;
	ignorePunctuation: boolean;
	ignoreBlankLines: boolean;
	sortLines: boolean;
}

export interface TextStats {
	charCount: number;
	charCountNoSpaces: number;
	wordCount: number;
	lineCount: number;
	sentenceCount: number;
	paragraphCount: number;
	readingTimeSeconds: number;
}

export type ChunkType = "added" | "removed" | "unchanged" | "modified";

export interface DiffChunk {
	text: string;
	type: ChunkType;
	oldText?: string;
	newText?: string;
}

export interface DiffRow {
	id: string;
	type: ChunkType;
	oldLineNumber?: number;
	newLineNumber?: number;
	oldContent?: string;
	newContent?: string;
	oldChunks?: DiffChunk[];
	newChunks?: DiffChunk[];
}

export interface VocabularyItem {
	word: string;
	countA: number;
	countB: number;
}

export interface VocabularyAnalysis {
	sharedWords: VocabularyItem[];
	uniqueToA: VocabularyItem[];
	uniqueToB: VocabularyItem[];
	totalUniqueA: number;
	totalUniqueB: number;
	totalShared: number;
}

export interface DifferenceSummaryItem {
	id: string;
	type: "added" | "removed" | "modified";
	description: string;
	position: string;
	oldSnippet?: string;
	newSnippet?: string;
}

export interface ComparisonMetrics {
	similarityPercent: number;
	levenshteinDistance: number;
	jaccardIndex: number;
	diceCoefficient: number;
	charDelta: number;
	wordDelta: number;
	lineDelta: number;
	totalChanges: number;
	additionsCount: number;
	deletionsCount: number;
	modificationsCount: number;
}

export interface ComparisonResult {
	statsA: TextStats;
	statsB: TextStats;
	metrics: ComparisonMetrics;
	rows: DiffRow[];
	inlineChunks: DiffChunk[];
	differences: DifferenceSummaryItem[];
	vocabulary: VocabularyAnalysis;
}

export interface SampleComparison {
	id: string;
	title: string;
	category: string;
	description: string;
	textA: string;
	textB: string;
}
