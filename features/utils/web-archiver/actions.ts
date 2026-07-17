"use server";

import { gotScraping } from "got-scraping";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { saveNote } from "@/features/brain/actions";
import { checkAdmin } from "@/features/auth/actions";

interface ArchiveResult {
	success: boolean;
	message: string;
	slug?: string;
	title?: string;
}

export async function archiveUrl(url: string): Promise<ArchiveResult> {
	// 1. Authorization check
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized: Admin pin required." };
	}

	// 2. Validate URL
	let targetUrl: URL;
	try {
		targetUrl = new URL(url);
	} catch (e) {
		return { success: false, message: "Invalid URL format." };
	}

	try {
		// 3. Scrape the URL
		console.log(`Archiving URL: ${targetUrl.toString()}`);
		const response = await gotScraping({
			url: targetUrl.toString(),
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
			},
			timeout: { request: 15000 },
		});

		if (response.statusCode < 200 || response.statusCode >= 300) {
			return {
				success: false,
				message: `Failed to fetch URL. Server returned status code: ${response.statusCode}`,
			};
		}

		const html = response.body;
		if (!html) {
			return {
				success: false,
				message: "No content returned from the URL.",
			};
		}

		// 4. Parse the HTML using JSDOM and Mozilla Readability
		const dom = new JSDOM(html, { url: targetUrl.toString() });
		const reader = new Readability(dom.window.document);
		const article = reader.parse();

		if (!article || !article.content) {
			return {
				success: false,
				message: "Failed to parse main article content from the web page.",
			};
		}

		// 5. Convert clean HTML content to Markdown
		const turndownService = new TurndownService({
			headingStyle: "atx",
			codeBlockStyle: "fenced",
		});

		// Basic pre/code block parsing rule for Turndown to preserve formatting
		turndownService.addRule("fencedCodeBlock", {
			filter: ["pre"],
			replacement: (content, node) => {
				// Try to get language class (e.g. language-js)
				const codeEl = (node as HTMLElement).querySelector("code");
				let lang = "";
				if (codeEl) {
					const className = codeEl.className || "";
					const match = className.match(/language-(\w+)/);
					if (match) {
						lang = match[1];
					}
				}
				// Clean content
				const rawText = codeEl ? codeEl.textContent : node.textContent;
				return `\n\`\`\`${lang}\n${(rawText || "").trim()}\n\`\`\`\n`;
			},
		});

		const markdownBody = turndownService.turndown(article.content);

		// 6. Build the full markdown file content
		const metadataLines = [
			`**Original Source**: [${article.title || targetUrl.hostname}](${targetUrl.toString()})`,
			article.byline ? `**Author**: ${article.byline}` : "",
			`**Archived At**: ${new Date().toLocaleString()}`,
		]
			.filter(Boolean)
			.join("  \n");

		const finalMarkdownContent = `${metadataLines}\n\n---\n\n${markdownBody}`;

		const title =
			article.title?.trim() || `Archived Page ${targetUrl.hostname}`;
		const tags = ["web-archive"];

		// 7. Save to local Second Brain
		const saveResult = await saveNote(
			"", // Empty slug, so saveNote auto-generates slug from title
			title,
			finalMarkdownContent,
			tags,
		);

		if (!saveResult.success) {
			return {
				success: false,
				message: saveResult.message || "Failed to save note in Second Brain.",
			};
		}

		return {
			success: true,
			message: "Successfully archived URL into Second Brain!",
			slug: saveResult.slug,
			title,
		};
	} catch (error: any) {
		console.error("Error during URL archiving:", error);
		return {
			success: false,
			message:
				error.message || "An unexpected error occurred during archiving.",
		};
	}
}
