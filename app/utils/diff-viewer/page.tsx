import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import DiffViewerView from "@/features/utils/text-tools/diff-viewer/components/View";

export const metadata: Metadata = createMetadata({
	title: "Text & Code Diff Comparator - Side-by-Side & Unified Diff Tool",
	description:
		"Fast, client-side text and code difference comparator. Side-by-side split view, inline unified diffs, word and character-level granular highlighting, and unified .patch export.",
	path: "/utils/diff-viewer",
	keywords: [
		"Diff Checker",
		"Code Diff Tool",
		"Text Comparator",
		"Side by Side Diff",
		"Unified Diff",
		"Patch Generator",
		"Code Comparison",
		"Word Level Diff",
		"Developer Tools",
	],
});

export default function DiffViewerPage() {
	return <DiffViewerView />;
}
