"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Save, X, Eye, Edit3, Loader2 } from "lucide-react";
import type { BrainNote } from "../types";
import { slugify } from "../utils";

interface NoteEditorProps {
	note?: BrainNote | null;
	onSave: (
		slug: string,
		title: string,
		content: string,
		tags: string[],
	) => Promise<void>;
	onCancel: () => void;
}

export default function NoteEditor({
	note,
	onSave,
	onCancel,
}: NoteEditorProps) {
	const [title, setTitle] = useState(note?.title || "");
	const [tagsString, setTagsString] = useState(note?.tags.join(", ") || "");
	const [content, setContent] = useState(note?.content || "");
	const [mode, setMode] = useState<"edit" | "preview" | "split">("edit");
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-expand textarea
	const adjustHeight = () => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			textarea.style.height = `${textarea.scrollHeight}px`;
		}
	};

	useEffect(() => {
		adjustHeight();
	}, [content, mode]);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			setError("Title is required");
			return;
		}

		setIsSaving(true);
		setError(null);

		const parsedTags = tagsString
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean);

		const originalSlug = note?.slug || "";

		try {
			await onSave(originalSlug, title.trim(), content, parsedTags);
		} catch (err: any) {
			setError(err.message || "Failed to save note");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
			{/* Top Control Bar */}
			<div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
				<h2 className="text-base font-semibold text-slate-800">
					{note ? `Editing: ${note.title}` : "Create New Note"}
				</h2>

				<div className="flex items-center gap-3">
					{/* Mode Toggles */}
					<div className="flex bg-slate-50 border border-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-500">
						<button
							type="button"
							onClick={() => setMode("edit")}
							className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
								mode === "edit"
									? "bg-white text-emerald-600 shadow-sm"
									: "hover:text-slate-800"
							}`}
						>
							<Edit3 className="w-3.5 h-3.5" />
							<span>Write</span>
						</button>
						<button
							type="button"
							onClick={() => setMode("preview")}
							className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
								mode === "preview"
									? "bg-white text-emerald-600 shadow-sm"
									: "hover:text-slate-800"
							}`}
						>
							<Eye className="w-3.5 h-3.5" />
							<span>Preview</span>
						</button>
						<button
							type="button"
							onClick={() => setMode("split")}
							className={`hidden md:flex px-3 py-1 rounded-lg items-center gap-1 transition-all ${
								mode === "split"
									? "bg-white text-emerald-600 shadow-sm"
									: "hover:text-slate-800"
							}`}
						>
							<span>Split</span>
						</button>
					</div>

					<button
						type="button"
						onClick={handleSave}
						disabled={isSaving}
						className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
					>
						{isSaving ? (
							<Loader2 className="w-3.5 h-3.5 animate-spin" />
						) : (
							<Save className="w-3.5 h-3.5" />
						)}
						<span>Save</span>
					</button>

					<button
						type="button"
						onClick={onCancel}
						disabled={isSaving}
						className="p-2 border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-colors cursor-pointer"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Main Form Fields */}
			<div className="flex-1 flex flex-col md:flex-row overflow-hidden">
				{/* Editor Side */}
				{(mode === "edit" || mode === "split") && (
					<form
						onSubmit={handleSave}
						className={`flex-1 p-6 md:p-8 flex flex-col gap-5 overflow-y-auto ${
							mode === "split" ? "border-r border-slate-100" : ""
						}`}
					>
						{error && (
							<div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium rounded-xl">
								{error}
							</div>
						)}

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="note-title"
								className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
							>
								Title
							</label>
							<input
								id="note-title"
								type="text"
								placeholder="E.g., Nextjs Optimization Tips"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold text-slate-800 text-lg"
							/>
						</div>

						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="note-tags"
								className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
							>
								Tags (comma separated)
							</label>
							<input
								id="note-tags"
								type="text"
								placeholder="E.g., react, performance, optimization"
								value={tagsString}
								onChange={(e) => setTagsString(e.target.value)}
								className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-mono text-slate-600"
							/>
						</div>

						<div className="flex-1 flex flex-col gap-1.5 min-h-[300px]">
							<label
								htmlFor="note-content"
								className="text-xs font-semibold text-slate-500 uppercase tracking-wider"
							>
								Content (Markdown)
							</label>
							<div className="text-[10px] text-slate-400 mt-[-4px]">
								Use{" "}
								<code className="bg-slate-50 px-1 py-0.5 rounded font-mono border border-slate-100">
									[[Note Title]]
								</code>{" "}
								for linking.
							</div>
							<textarea
								id="note-content"
								ref={textareaRef}
								placeholder="Write your thoughts here... Use [[wiki-links]] to connect notes together."
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="w-full flex-1 px-4 py-4 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 text-sm font-mono leading-relaxed resize-none overflow-y-hidden"
							/>
						</div>
					</form>
				)}

				{/* Preview Side */}
				{(mode === "preview" || mode === "split") && (
					<div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50">
						<div className="max-w-prose mx-auto bg-white border border-slate-100 p-6 md:p-8 rounded-2xl shadow-sm min-h-full">
							<h1 className="text-3xl font-bold text-slate-800 mb-2">
								{title || "Untitled Note"}
							</h1>

							{tagsString && (
								<div className="flex flex-wrap gap-1 mb-6 border-b border-slate-50 pb-4">
									{tagsString
										.split(",")
										.map((t) => t.trim())
										.filter(Boolean)
										.map((tag) => (
											<span
												key={tag}
												className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono text-[10px]"
											>
												{tag}
											</span>
										))}
								</div>
							)}

							<div className="prose prose-slate max-w-none text-sm md:text-base">
								<ReactMarkdown>
									{content || "*No content yet. Start typing!*"}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
