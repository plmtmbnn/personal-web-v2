"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveNote, deleteNote } from "@/features/brain/actions";
import NoteViewer from "@/features/brain/components/NoteViewer";
import NoteEditor from "@/features/brain/components/NoteEditor";
import type { BrainNote } from "@/features/brain/types";
import CustomModal from "@/features/shared/components/CustomModal";

interface NoteViewProps {
	initialNote: BrainNote | null;
	slug: string;
	existingSlugs: string[];
	isAdmin: boolean;
	isDevelopment: boolean;
}

export default function NoteView({
	initialNote,
	slug,
	existingSlugs,
	isAdmin,
	isDevelopment,
}: NoteViewProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const isNew = slug === "new";

	// If it's a new note, extract title preset if provided in query param
	const titlePreset = searchParams.get("title") || "";

	const [isEditing, setIsEditing] = useState(isNew);
	const [note, setNote] = useState<BrainNote | null>(initialNote);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleSave = async (
		originalSlug: string,
		title: string,
		content: string,
		tags: string[],
	) => {
		const res = await saveNote(originalSlug, title, content, tags);

		if (res.success && res.slug) {
			setIsEditing(false);
			router.push(`/brain/${res.slug}`);
			router.refresh();
		} else {
			throw new Error(res.message);
		}
	};

	const handleDelete = async () => {
		if (!note) return;

		const res = await deleteNote(note.slug);
		if (res.success) {
			setShowDeleteModal(false);
			router.push("/brain");
			router.refresh();
		} else {
			alert(res.message);
		}
	};

	if (isEditing) {
		const editorNote =
			note ||
			(isNew
				? {
						slug: "",
						title: titlePreset,
						content: "",
						tags: [],
						createdAt: "",
						backlinks: [],
						rawContent: "",
					}
				: null);

		return (
			<NoteEditor
				note={editorNote}
				onSave={handleSave}
				onCancel={() => {
					if (isNew) {
						router.push("/brain");
					} else {
						setIsEditing(false);
					}
				}}
			/>
		);
	}

	if (!note) {
		return (
			<div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-slate-500">
				<h2 className="text-xl font-bold mb-2">Note Not Found</h2>
				<p className="text-sm mb-4">
					The note you are looking for does not exist.
				</p>
				{isDevelopment && isAdmin && (
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
					>
						Create This Note
					</button>
				)}
			</div>
		);
	}

	return (
		<>
			<NoteViewer
				note={note}
				existingSlugs={existingSlugs}
				isAdmin={isAdmin}
				isDevelopment={isDevelopment}
				onEditClick={() => setIsEditing(true)}
				onDeleteClick={() => setShowDeleteModal(true)}
			/>

			{/* Custom Delete Modal confirmation */}
			<CustomModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleDelete}
				title="Delete Note"
				description={`Are you sure you want to permanently delete the note "${note.title}"? This will remove the file from your disk.`}
				confirmText="Delete Note"
				cancelText="Cancel"
				variant="danger"
			/>
		</>
	);
}
