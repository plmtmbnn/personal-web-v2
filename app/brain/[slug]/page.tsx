import { getNoteBySlug, getNotes } from "@/features/brain/actions";
import { checkAdmin } from "@/features/auth/actions";
import NoteView from "./View";
import type { Metadata } from "next";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);

	if (slug === "new") {
		return {
			title: "New Note | Second Brain",
		};
	}

	const note = await getNoteBySlug(slug);
	if (!note) {
		return {
			title: "Note Not Found | Second Brain",
		};
	}

	return {
		title: `${note.title} | Second Brain`,
		description: note.content.slice(0, 150).replace(/[#*`_\[\]]/g, ""),
	};
}

export default async function NotePage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);

	const notes = await getNotes();
	const existingSlugs = notes.map((n) => n.slug);
	const isAdmin = await checkAdmin();
	const isDevelopment = process.env.NODE_ENV === "development";

	let initialNote = null;
	if (slug !== "new") {
		initialNote = await getNoteBySlug(slug);
	}

	return (
		<NoteView
			initialNote={initialNote}
			slug={slug}
			existingSlugs={existingSlugs}
			isAdmin={isAdmin}
			isDevelopment={isDevelopment}
		/>
	);
}
