import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import TextCompareView from "@/features/utils/text-tools/text-compare/components/View";

export const metadata: Metadata = createMetadata({
	title: "Text Compare Studio - Similarity & Difference Analyzer",
	description:
		"Compare two text documents, articles, copy, or lists with real-time similarity metrics, Levenshtein edit distance, vocabulary overlap matrix, and side-by-side highlighting.",
	path: "/utils/text-compare",
	keywords: [
		"Text Compare",
		"Compare 2 Text",
		"Text Difference Checker",
		"Text Similarity Analyzer",
		"Levenshtein Distance Calculator",
		"Jaccard Similarity",
		"Side by Side Text Comparison",
		"Inline Text Diff",
		"Vocabulary Matrix",
		"List Comparison Tool",
	],
});

export default function TextComparePage() {
	return <TextCompareView />;
}
