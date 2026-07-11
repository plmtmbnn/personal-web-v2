/**
 * Convert a title or text to a URL-friendly slug.
 */
export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w-]+/g, "") // Remove all non-word chars
		.replace(/--+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start
		.replace(/-+$/, ""); // Trim - from end
}

/**
 * Parses frontmatter YAML block and markdown body content.
 */
export function parseFrontmatter(fileContent: string): {
	metadata: Record<string, string>;
	body: string;
} {
	const normalized = fileContent.replace(/\r\n/g, "\n");
	const match = normalized.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

	if (!match) {
		return { metadata: {}, body: fileContent };
	}

	const yamlText = match[1];
	const body = match[2];
	const metadata: Record<string, string> = {};

	for (const line of yamlText.split("\n")) {
		const colonIndex = line.indexOf(":");
		if (colonIndex !== -1) {
			const key = line.slice(0, colonIndex).trim();
			let val = line.slice(colonIndex + 1).trim();
			// Strip leading/trailing quotes if they exist
			val = val.replace(/^['"]|['"]$/g, "");
			metadata[key] = val;
		}
	}

	return { metadata, body };
}

/**
 * Extracts targets of [[WikiLinks]] (or [[WikiLink|Alias]]) from markdown text.
 * Returns the raw targets (e.g. "Knowledge Graph Ideas").
 */
export function extractWikiLinks(content: string): string[] {
	const regex = /\[\[(.*?)\]\]/g;
	const links: string[] = [];
	let match = regex.exec(content);

	while (match !== null) {
		const rawTarget = match[1].split("|")[0].trim();
		if (rawTarget) {
			links.push(rawTarget);
		}
		match = regex.exec(content);
	}

	return links;
}
