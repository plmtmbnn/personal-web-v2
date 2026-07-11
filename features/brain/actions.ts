"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/features/auth/actions";
import type { BrainNote, GraphData } from "./types";
import { extractWikiLinks, parseFrontmatter, slugify } from "./utils";

const BRAIN_DIR = path.join(process.cwd(), "content", "brain");

/**
 * Ensures the brain directory exists.
 */
async function ensureDirectory() {
	try {
		await fs.mkdir(BRAIN_DIR, { recursive: true });
	} catch (err) {
		console.error("Error creating brain directory:", err);
	}
}

/**
 * Get all notes from the filesystem with frontmatter and backlinks parsed.
 */
export async function getNotes(): Promise<BrainNote[]> {
	await ensureDirectory();

	try {
		const files = await fs.readdir(BRAIN_DIR);
		const mdFiles = files.filter((f) => f.endsWith(".md"));

		const notesWithoutBacklinks: Omit<BrainNote, "backlinks">[] = [];
		const slugMap = new Map<string, string>(); // slug -> title

		// First pass: Read all notes and build slug-to-title map
		for (const file of mdFiles) {
			const filePath = path.join(BRAIN_DIR, file);
			const rawContent = await fs.readFile(filePath, "utf-8");
			const { metadata, body } = parseFrontmatter(rawContent);
			const slug = file.replace(/\.md$/, "");
			const title =
				metadata.title || file.replace(/\.md$/, "").replace(/-/g, " ");

			slugMap.set(slug, title);

			// Extract tags
			const tags = metadata.tags
				? metadata.tags
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean)
				: [];

			notesWithoutBacklinks.push({
				slug,
				title,
				content: body,
				tags,
				createdAt:
					metadata.created_at || new Date().toISOString().split("T")[0],
				rawContent,
			});
		}

		// Second pass: Calculate backlinks & match target wikilinks to existing slugs
		const notes: BrainNote[] = notesWithoutBacklinks.map((note) => {
			const outgoingTargets = extractWikiLinks(note.content).map(slugify);

			// Find notes linking to this one
			const backlinks = notesWithoutBacklinks
				.filter((otherNote) => {
					if (otherNote.slug === note.slug) return false;
					const otherOutgoing = extractWikiLinks(otherNote.content).map(
						slugify,
					);
					return otherOutgoing.includes(note.slug);
				})
				.map((otherNote) => ({
					slug: otherNote.slug,
					title: otherNote.title,
				}));

			return {
				...note,
				backlinks,
			};
		});

		// Sort by creation date or title
		return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	} catch (err) {
		console.error("Error reading brain notes:", err);
		return [];
	}
}

/**
 * Get a specific note by its slug.
 */
export async function getNoteBySlug(slug: string): Promise<BrainNote | null> {
	const allNotes = await getNotes();
	return allNotes.find((n) => n.slug === slug) || null;
}

/**
 * Save or update a note. Only works in local development environment.
 */
export async function saveNote(
	slug: string,
	title: string,
	content: string,
	tags: string[],
): Promise<{ success: boolean; message: string; slug?: string }> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized: Admin pin required." };
	}

	if (process.env.NODE_ENV !== "development") {
		return {
			success: false,
			message: "Saving is disabled in production to prevent ephemeral writes.",
		};
	}

	await ensureDirectory();

	try {
		const targetSlug = slugify(slug || title);
		const filePath = path.join(BRAIN_DIR, `${targetSlug}.md`);

		// If slug changed, delete the old file
		if (slug && slug !== targetSlug) {
			const oldPath = path.join(BRAIN_DIR, `${slug}.md`);
			try {
				await fs.unlink(oldPath);
			} catch (e) {
				// Ignore if old file didn't exist
			}
		}

		const frontmatter = [
			"---",
			`title: ${title}`,
			`tags: ${tags.join(", ")}`,
			`created_at: ${new Date().toISOString().split("T")[0]}`,
			"---",
			content,
		].join("\n");

		await fs.writeFile(filePath, frontmatter, "utf-8");

		revalidatePath("/brain");
		revalidatePath(`/brain/${targetSlug}`);

		return {
			success: true,
			message: "Note saved successfully",
			slug: targetSlug,
		};
	} catch (err: any) {
		console.error("Error saving note:", err);
		return { success: false, message: err.message || "Failed to save note" };
	}
}

/**
 * Delete a note. Only works in local development environment.
 */
export async function deleteNote(
	slug: string,
): Promise<{ success: boolean; message: string }> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized: Admin pin required." };
	}

	if (process.env.NODE_ENV !== "development") {
		return { success: false, message: "Deleting is disabled in production." };
	}

	try {
		const filePath = path.join(BRAIN_DIR, `${slug}.md`);
		await fs.unlink(filePath);

		revalidatePath("/brain");
		return { success: true, message: "Note deleted successfully" };
	} catch (err: any) {
		console.error("Error deleting note:", err);
		return { success: false, message: err.message || "Failed to delete note" };
	}
}

/**
 * Computes nodes and links for the interactive knowledge graph view.
 */
export async function getGraphData(): Promise<GraphData> {
	const notes = await getNotes();
	const slugSet = new Set(notes.map((n) => n.slug));

	const nodes = notes.map((note) => ({
		id: note.slug,
		title: note.title,
		val: 1 + note.backlinks.length, // More connected nodes are larger
	}));

	const links: { source: string; target: string }[] = [];

	for (const note of notes) {
		const outgoing = extractWikiLinks(note.content).map(slugify);
		for (const targetSlug of outgoing) {
			// Only draw lines to existing pages in the vault
			if (slugSet.has(targetSlug)) {
				links.push({
					source: note.slug,
					target: targetSlug,
				});
			}
		}
	}

	return { nodes, links };
}
