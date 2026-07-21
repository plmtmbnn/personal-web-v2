import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import FileRenamerView from "@/features/utils/file-tools/file-renamer/components/View";

export const metadata: Metadata = createMetadata({
	title: "Kebab-Case File Renamer",
	description:
		"Batch rename files into clean, SEO-friendly kebab-case while preserving extensions. Perfect for developers and content creators.",
	path: "/utils/file-renamer",
	keywords: [
		"File Renamer",
		"Kebab Case Converter",
		"Batch Rename",
		"Developer Tools",
		"SEO Filenames",
	],
});

export default function FileRenamerPage() {
	return <FileRenamerView />;
}
