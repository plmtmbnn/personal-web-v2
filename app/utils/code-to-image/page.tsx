import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import CodeToImageView from "@/features/utils/file-tools/code-to-image/components/View";

export const metadata: Metadata = createMetadata({
	title:
		"Code Snippet to Aesthetic Social Card Generator - Ray.so & Carbon Alternative",
	description:
		"Transform code snippets, terminal commands, or text into high-resolution gradient-backed social cards for Twitter/X, LinkedIn, and blog banners. 100% in-browser, high-DPI export.",
	path: "/utils/code-to-image",
	keywords: [
		"Code to Image",
		"Carbon Alternative",
		"Ray.so Alternative",
		"Code Screenshot Generator",
		"Code Social Card",
		"Syntax Highlighter Image",
		"Code to PNG",
		"Developer Social Cards",
		"Developer Tools",
	],
});

export default function CodeToImagePage() {
	return <CodeToImageView />;
}
