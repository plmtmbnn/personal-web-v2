/**
 * Shared blog utilities — canonical source of truth for styles,
 * image helpers, and content processing. Prevents duplication
 * between page.tsx and AdminBlogList.tsx.
 */

// ─────────────────────────────────────────────
// Category Styles
// ─────────────────────────────────────────────
export const CATEGORY_STYLES: Record<string, string> = {
	Finance: "bg-emerald-50 text-emerald-700 border-emerald-100",
	Investment: "bg-emerald-50 text-emerald-700 border-emerald-100",
	Tech: "bg-blue-50 text-blue-700 border-blue-100",
	Running: "bg-rose-50 text-rose-700 border-rose-100",
	General: "bg-slate-50 text-slate-700 border-slate-100",
};

export const getCategoryStyles = (category: string): string =>
	CATEGORY_STYLES[category] ?? "bg-slate-50 text-slate-700 border-slate-100";

// ─────────────────────────────────────────────
// Reading Time — Markdown-aware
// ─────────────────────────────────────────────

/**
 * Calculates estimated reading time by stripping Markdown syntax
 * before counting words, preventing inflated estimates from tokens
 * like **, ##, [](), etc.
 */
export const getReadTime = (content: string): string => {
	const plainText = (content || "")
		.replace(/```[\s\S]*?```/g, "") // remove code blocks entirely
		.replace(/`[^`]*`/g, "") // remove inline code
		.replace(/!\[.*?\]\(.*?\)/g, "") // remove images
		.replace(/\[.*?\]\(.*?\)/g, "$1") // keep link text
		.replace(/^#{1,6}\s+/gm, "") // remove heading markers
		.replace(/[*_~>|\\]/g, "") // remove formatting chars
		.replace(/\s+/g, " ")
		.trim();

	const words = plainText.split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.ceil(words / 200));
	return `${minutes} MIN READ`;
};

/**
 * Returns the word count of the post content (Markdown-stripped).
 */
export const getWordCount = (content: string): number => {
	const plainText = (content || "")
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]*`/g, "")
		.replace(/!\[.*?\]\(.*?\)/g, "")
		.replace(/\[.*?\]\(.*?\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/[*_~>|\\]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	return plainText.split(/\s+/).filter(Boolean).length;
};

// ─────────────────────────────────────────────
// Image Placeholder — deterministic, clean URLs
// ─────────────────────────────────────────────

/**
 * Clean Unsplash placeholder URLs (no double query strings).
 */
export const PLACEHOLDERS = [
	"https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&q=80&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1512455011254-e2db8db4ef22?w=1400&q=80&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1400&q=80&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1400&q=80&auto=format&fit=crop",
];

export const getBlogImage = (imageUrl: string | null, seed: string): string => {
	if (imageUrl && imageUrl.trim() !== "") return imageUrl;
	const charSum = seed
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return PLACEHOLDERS[charSum % PLACEHOLDERS.length];
};

// ─────────────────────────────────────────────
// Heading Parser — for Table of Contents
// ─────────────────────────────────────────────
export interface HeadingItem {
	level: number;
	text: string;
	id: string;
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.trim();
}

/**
 * Parses Markdown content and returns a list of headings (h1–h3)
 * suitable for building a Table of Contents.
 */
export const parseHeadings = (content: string): HeadingItem[] => {
	const matches = Array.from(content.matchAll(/^(#{1,3})\s+(.+)$/gm));
	return matches.map(([, hashes, text]) => ({
		level: hashes.length,
		text: text.trim(),
		id: slugifyHeading(text.trim()),
	}));
};
