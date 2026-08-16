export type DiffType = "added" | "removed" | "unchanged" | "modified";

export type ViewMode = "split" | "unified";

export type DiffGranularity = "words" | "chars" | "lines";

export interface DiffChangeChunk {
	text: string;
	type: "added" | "removed" | "unchanged";
}

export interface DiffLine {
	id: string;
	type: DiffType;
	oldLineNumber?: number;
	newLineNumber?: number;
	oldContent?: string;
	newContent?: string;
	oldChunks?: DiffChangeChunk[];
	newChunks?: DiffChangeChunk[];
}

export interface DiffOptions {
	ignoreWhitespace: boolean;
	ignoreCase: boolean;
	granularity: DiffGranularity;
}

export interface DiffStats {
	additions: number;
	deletions: number;
	unchanged: number;
	totalOldLines: number;
	totalNewLines: number;
	similarityPercent: number;
}

export interface DiffSample {
	id: string;
	title: string;
	category: string;
	original: string;
	modified: string;
}
