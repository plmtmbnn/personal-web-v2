"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Blog } from "@/features/blog/data";
import { saveBlog } from "@/features/blog/actions";
import { useRouter } from "next/navigation";
import {
	Loader2,
	Save,
	Eye,
	Edit3,
	CheckCircle,
	AlertCircle,
	Calendar,
	Globe,
	FileText,
	Type,
	Layout,
	Tag,
	Image as ImageIcon,
	Sparkles,
	Bold,
	Italic,
	Code,
	Link as LinkIcon,
	List,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("bash", bash);
import { motion, AnimatePresence } from "framer-motion";

interface BlogFormProps {
	initialData?: Blog | null;
}

export default function BlogForm({ initialData }: BlogFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editorMode, setEditorMode] = useState<"edit" | "preview" | "split">(
		"edit",
	);
	const [status, setStatus] = useState<{
		type: "success" | "error";
		message: string;
	} | null>(null);

	const [draftAvailable, setDraftAvailable] = useState<any>(null);
	const [prevTitle, setPrevTitle] = useState(initialData?.title || "");

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<Partial<Blog>>({
		defaultValues: initialData || {
			title: "",
			slug: "",
			description: "",
			content: "",
			date: new Date().toISOString().split("T")[0],
			published: false,
			category: "General",
			image_url: "",
			is_headline: false,
		},
	});

	const content = watch("content") || "";
	const title = watch("title") || "";
	const slug = watch("slug") || "";
	const description = watch("description") || "";
	const imageUrl = watch("image_url") || "";

	// Auto-Slug generation
	useEffect(() => {
		if (title !== prevTitle) {
			setPrevTitle(title);
			const expectedPrevSlug = prevTitle
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, "");

			if (!slug || slug === expectedPrevSlug) {
				const newSlug = title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, "-")
					.replace(/(^-|-$)/g, "");
				setValue("slug", newSlug);
			}
		}
	}, [title, slug, prevTitle, setValue]);

	// Draft Backup
	useEffect(() => {
		const draftKey = `blog_editor_draft_${initialData?.id || "new"}`;
		const values = {
			title,
			slug,
			description,
			content,
			category: watch("category"),
			image_url: imageUrl,
			date: watch("date"),
			published: watch("published"),
			is_headline: watch("is_headline"),
		};

		if (title || content || description || imageUrl) {
			localStorage.setItem(
				draftKey,
				JSON.stringify({
					...values,
					savedAt: new Date().toISOString(),
				}),
			);
		}
	}, [
		title,
		slug,
		description,
		content,
		imageUrl,
		watch("category"),
		watch("date"),
		watch("published"),
		watch("is_headline"),
		initialData,
	]);

	// Check for existing draft on mount
	useEffect(() => {
		const draftKey = `blog_editor_draft_${initialData?.id || "new"}`;
		const saved = localStorage.getItem(draftKey);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				const hasDiff =
					(parsed.title && parsed.title !== (initialData?.title || "")) ||
					(parsed.content && parsed.content !== (initialData?.content || ""));
				if (hasDiff) {
					setDraftAvailable(parsed);
				}
			} catch (e) {
				console.error("Failed to parse draft", e);
			}
		}
	}, [initialData]);

	const restoreDraft = () => {
		if (draftAvailable) {
			reset({
				title: draftAvailable.title || "",
				slug: draftAvailable.slug || "",
				description: draftAvailable.description || "",
				content: draftAvailable.content || "",
				category: draftAvailable.category || "General",
				image_url: draftAvailable.image_url || "",
				date: draftAvailable.date || new Date().toISOString().split("T")[0],
				published: draftAvailable.published || false,
				is_headline: draftAvailable.is_headline || false,
			});
			setDraftAvailable(null);
		}
	};

	const discardDraft = () => {
		const draftKey = `blog_editor_draft_${initialData?.id || "new"}`;
		localStorage.removeItem(draftKey);
		setDraftAvailable(null);
	};

	// Save Action
	const onSubmit = async (data: Partial<Blog>) => {
		setIsSubmitting(true);
		setStatus(null);

		try {
			const result = await saveBlog({ ...data, id: initialData?.id });
			if (result.success) {
				setStatus({ type: "success", message: result.message });
				const draftKey = `blog_editor_draft_${initialData?.id || "new"}`;
				localStorage.removeItem(draftKey);
				if (!initialData) setTimeout(() => router.push("/admin/blog"), 1500);
			} else {
				setStatus({ type: "error", message: result.message });
			}
		} catch (_error: any) {
			setStatus({ type: "error", message: "An unexpected error occurred." });
		} finally {
			setIsSubmitting(false);
		}
	};

	// Metrics
	const wordCount = content
		? content.trim().split(/\s+/).filter(Boolean).length
		: 0;
	const readingTime = Math.ceil(wordCount / 200);
	const charCount = content ? content.length : 0;

	// Toolbar Handler
	const insertMarkdown = (syntax: string) => {
		const textarea = document.getElementById("content") as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const text = textarea.value;
		const selectedText = text.substring(start, end);

		let replacement = "";
		let selectOffset = 0;
		let selectLength = 0;

		switch (syntax) {
			case "bold":
				replacement = `**${selectedText || "bold text"}**`;
				selectOffset = 2;
				selectLength = selectedText ? selectedText.length : 9;
				break;
			case "italic":
				replacement = `*${selectedText || "italic text"}*`;
				selectOffset = 1;
				selectLength = selectedText ? selectedText.length : 11;
				break;
			case "code":
				replacement = `\`${selectedText || "code"}\``;
				selectOffset = 1;
				selectLength = selectedText ? selectedText.length : 4;
				break;
			case "codeblock":
				replacement = `\n\`\`\`javascript\n${selectedText || "// code block"}\n\`\`\`\n`;
				selectOffset = 15;
				selectLength = selectedText ? selectedText.length : 13;
				break;
			case "link":
				replacement = `[${selectedText || "link text"}](https://example.com)`;
				selectOffset = 1;
				selectLength = selectedText ? selectedText.length : 9;
				break;
			case "list":
				replacement = `\n- ${selectedText || "list item"}`;
				selectOffset = 3;
				selectLength = selectedText ? selectedText.length : 9;
				break;
			default:
				return;
		}

		const newContent =
			text.substring(0, start) + replacement + text.substring(end);
		setValue("content", newContent);

		setTimeout(() => {
			textarea.focus();
			textarea.setSelectionRange(
				start + selectOffset,
				start + selectOffset + selectLength,
			);
		}, 50);
	};

	const categories = ["Tech", "Running", "Finance", "Investment", "General"];

	const renderEditorInputs = () => (
		<div className="space-y-6">
			{/* Title Input */}
			<div className="space-y-2">
				<div className="flex justify-between items-center ml-1">
					<label
						htmlFor="title"
						className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2"
					>
						<Type className="w-3.5 h-3.5" /> Headline
					</label>
					{title.length > 0 && (
						<span
							className={`text-[9px] font-black uppercase tracking-widest ${
								title.length > 60
									? "text-amber-600 font-bold"
									: "text-slate-400"
							}`}
						>
							{title.length} / 60 Chars {title.length > 60 && "⚠️ (Too Long)"}
						</span>
					)}
				</div>
				<input
					id="title"
					{...register("title", { required: "Title is required" })}
					placeholder="Enter article title..."
					className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-sm"
				/>
				{errors.title && (
					<p className="text-[10px] text-rose-600 font-bold ml-1">
						{errors.title.message}
					</p>
				)}
			</div>

			{/* Slug & Description */}
			<div className="grid grid-cols-1 gap-6">
				<div className="space-y-2">
					<label
						htmlFor="slug"
						className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 ml-1"
					>
						<Globe className="w-3.5 h-3.5" /> Permalink
					</label>
					<div className="flex items-center">
						<span className="bg-slate-50 border border-r-0 border-slate-200 px-4 py-2.5 rounded-l-xl text-xs font-mono text-slate-400 italic">
							/blog/
						</span>
						<input
							id="slug"
							{...register("slug")}
							placeholder="auto-generated"
							className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between items-center ml-1">
						<label
							htmlFor="description"
							className="text-[11px] font-bold uppercase text-slate-500 tracking-wider"
						>
							Summary
						</label>
						{description.length > 0 && (
							<span
								className={`text-[9px] font-black uppercase tracking-widest ${
									description.length > 160
										? "text-amber-600 font-bold"
										: "text-slate-400"
								}`}
							>
								{description.length} / 160 Chars{" "}
								{description.length > 160 && "⚠️ (Too Long)"}
							</span>
						)}
					</div>
					<textarea
						id="description"
						{...register("description", {
							required: "Description is required",
						})}
						rows={2}
						placeholder="Brief overview..."
						className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-sm"
					/>
				</div>
			</div>

			{/* Markdown Content Area */}
			<div className="space-y-2">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 ml-1">
					<label
						htmlFor="content"
						className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2"
					>
						<FileText className="w-3.5 h-3.5" /> Content (Markdown)
					</label>

					{/* Markdown Editing Toolbar */}
					<div className="flex items-center gap-0.5 bg-slate-100 p-0.5 border border-slate-200 rounded-lg">
						<button
							type="button"
							onClick={() => insertMarkdown("bold")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Bold Text"
						>
							<Bold className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={() => insertMarkdown("italic")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Italic Text"
						>
							<Italic className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={() => insertMarkdown("code")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Inline Code"
						>
							<Code className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={() => insertMarkdown("codeblock")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Code Block"
						>
							<FileText className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={() => insertMarkdown("link")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Hyperlink"
						>
							<LinkIcon className="w-3.5 h-3.5" />
						</button>
						<button
							type="button"
							onClick={() => insertMarkdown("list")}
							className="p-1.5 hover:bg-white hover:text-slate-900 rounded text-slate-500 transition-all cursor-pointer"
							title="Bullet List"
						>
							<List className="w-3.5 h-3.5" />
						</button>
					</div>
				</div>

				<textarea
					id="content"
					{...register("content", {
						required: "Content is required",
					})}
					rows={editorMode === "split" ? 14 : 18}
					placeholder="# Your story starts here..."
					className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-6 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all leading-relaxed shadow-sm"
				/>

				{/* Metrics Footer Bar */}
				<div className="flex items-center gap-4 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
					<div>
						Words: <span className="text-slate-700">{wordCount}</span>
					</div>
					<div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
					<div>
						Characters: <span className="text-slate-700">{charCount}</span>
					</div>
					<div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
					<div>
						Est. Read Time:{" "}
						<span className="text-slate-700">{readingTime} min</span>
					</div>
				</div>
			</div>
		</div>
	);

	const renderPreviewPane = () => (
		<div className="bg-white border border-slate-200 p-8 sm:p-12 rounded-[2rem] shadow-sm min-h-[500px] max-h-[800px] overflow-y-auto prose prose-slate max-w-none prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-pre:bg-transparent prose-pre:p-0 prose-img:rounded-[2.5rem] prose-img:border-4 prose-img:border-slate-50">
			{editorMode !== "split" && (
				<h1 className="text-4xl sm:text-5xl font-black mb-8 border-b border-slate-100 pb-6 leading-tight tracking-tight">
					{title || "Untitled"}
				</h1>
			)}
			<ReactMarkdown
				components={{
					code({ node, inline, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || "");
						return !inline && match ? (
							<div className="w-full overflow-auto rounded-xl !my-8 shadow-md border border-slate-800 bg-[#282c34] max-h-[32rem]">
								<SyntaxHighlighter
									style={oneDark as any}
									language={match[1]}
									PreTag="div"
									customStyle={{
										margin: 0,
										padding: "1.5rem",
										fontSize: "0.875rem",
										lineHeight: "1.5",
										backgroundColor: "transparent",
										whiteSpace: "pre",
										wordBreak: "normal",
										overflowWrap: "normal",
									}}
									{...props}
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							</div>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{content || "*Empty content*"}
			</ReactMarkdown>
		</div>
	);

	const renderSidebarSettings = () => (
		<>
			<div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
				<div className="flex items-center gap-2 text-slate-900 mb-2">
					<Layout className="w-4 h-4 text-blue-600" />
					<h3 className="text-[11px] font-bold uppercase tracking-widest">
						Post Settings
					</h3>
				</div>

				{/* Category Input */}
				<div className="space-y-2">
					<label
						htmlFor="category"
						className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-2"
					>
						<Tag className="w-3 h-3" /> Category
					</label>
					<input
						id="category"
						list="category-options"
						{...register("category")}
						placeholder="e.g. Fintech"
						className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-bold text-xs text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
					/>
					<datalist id="category-options">
						{categories.map((cat) => (
							<option key={cat} value={cat} />
						))}
					</datalist>
				</div>

				{/* Cover Image URL Input */}
				<div className="space-y-2">
					<label
						htmlFor="image_url"
						className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-2"
					>
						<ImageIcon className="w-3 h-3" /> Cover Image URL
					</label>
					<input
						id="image_url"
						{...register("image_url")}
						placeholder="https://images.unsplash.com/..."
						className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-[10px] text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
					/>
					{imageUrl?.startsWith("http") && (
						<div className="mt-2 relative aspect-video rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 flex items-center justify-center">
							<img
								src={imageUrl}
								alt="Cover Preview"
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.style.display = "none";
								}}
							/>
						</div>
					)}
				</div>

				{/* Date Input */}
				<div className="space-y-2">
					<label
						htmlFor="date"
						className="text-[10px] font-bold uppercase text-slate-400 ml-1 flex items-center gap-2"
					>
						<Calendar className="w-3 h-3" /> Publish Date
					</label>
					<input
						id="date"
						type="date"
						{...register("date")}
						className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-bold text-xs text-slate-700 focus:outline-none focus:border-blue-500"
					/>
				</div>

				{/* Headline Toggle */}
				<div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl group hover:border-blue-200 transition-colors">
					<div className="space-y-0.5">
						<label
							htmlFor="is_headline"
							className="text-[10px] font-black uppercase text-blue-900 block tracking-tight flex items-center gap-1.5 text-left"
						>
							<Sparkles className="w-3 h-3" /> Featured Story
						</label>
						<span className="text-blue-400 uppercase font-bold text-[7px] block mt-0.5 text-left">
							Mark as headline
						</span>
					</div>
					<label className="relative inline-flex items-center cursor-pointer scale-90 select-none">
						<input
							id="is_headline"
							type="checkbox"
							{...register("is_headline")}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
					</label>
				</div>

				{/* Visibility Toggle */}
				<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-emerald-200 transition-colors">
					<div className="space-y-0.5">
						<label
							htmlFor="published"
							className="text-[10px] font-black uppercase text-slate-900 block tracking-tight text-left"
						>
							Public Visibility
						</label>
						<span className="text-slate-400 uppercase font-bold text-[7px] block mt-0.5 text-left">
							Staged for production
						</span>
					</div>
					<label className="relative inline-flex items-center cursor-pointer scale-90 select-none">
						<input
							id="published"
							type="checkbox"
							{...register("published")}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
					</label>
				</div>
			</div>

			<div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl shadow-sm">
				<h3 className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-2 mb-3">
					<AlertCircle className="w-3.5 h-3.5" /> Editor Insight
				</h3>
				<p className="text-[11px] text-blue-600/80 font-medium leading-relaxed italic">
					Headlines are prioritized at the top of the blog index. Ensure you
					provide a high-resolution cover image for better visual impact.
				</p>
			</div>
		</>
	);

	return (
		<div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24 text-slate-900">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-slate-200">
					<div>
						<h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
							{initialData ? (
								<Edit3 className="w-6 h-6 text-blue-600" />
							) : (
								<Plus className="w-6 h-6 text-blue-600" />
							)}
							{initialData ? "Edit Article" : "New Article"}
						</h1>
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
							Content Management • Editor
						</p>
					</div>

					<div className="flex items-center gap-2">
						{/* Mode Toggles */}
						<div className="flex items-center gap-0.5 bg-slate-100 p-0.5 border border-slate-200 rounded-xl mr-2">
							<button
								type="button"
								onClick={() => setEditorMode("edit")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
									editorMode === "edit"
										? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								<Edit3 className="w-3.5 h-3.5 inline mr-1" /> Edit
							</button>
							<button
								type="button"
								onClick={() => setEditorMode("split")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer hidden lg:block ${
									editorMode === "split"
										? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								<Layout className="w-3.5 h-3.5 inline mr-1" /> Split
							</button>
							<button
								type="button"
								onClick={() => setEditorMode("preview")}
								className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
									editorMode === "preview"
										? "bg-white text-slate-800 shadow-sm border border-slate-200/50"
										: "text-slate-500 hover:text-slate-700"
								}`}
							>
								<Eye className="w-3.5 h-3.5 inline mr-1" /> Preview
							</button>
						</div>

						<button
							type="submit"
							disabled={isSubmitting}
							className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-70 active:scale-95 cursor-pointer"
						>
							{isSubmitting ? (
								<Loader2 className="w-3.5 h-3.5 animate-spin" />
							) : (
								<Save className="w-3.5 h-3.5" />
							)}
							Save Changes
						</button>
					</div>
				</div>

				{/* Draft Recovery Toast */}
				<AnimatePresence>
					{draftAvailable && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border bg-amber-50 text-amber-900 border-amber-200 shadow-sm"
						>
							<div className="flex items-center gap-3">
								<AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
								<div>
									<p className="text-xs font-black uppercase tracking-widest text-amber-800">
										Unsaved draft detected
									</p>
									<p className="text-[11px] text-amber-700/80 font-bold uppercase tracking-wide mt-0.5">
										Saved on {new Date(draftAvailable.savedAt).toLocaleString()}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<button
									type="button"
									onClick={restoreDraft}
									className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-[9px] uppercase tracking-widest rounded-lg shadow-sm transition-all cursor-pointer"
								>
									Restore Draft
								</button>
								<button
									type="button"
									onClick={discardDraft}
									className="px-3.5 py-1.5 bg-white border border-amber-200 text-amber-700 hover:bg-amber-100/50 font-black text-[9px] uppercase tracking-widest rounded-lg shadow-sm transition-all cursor-pointer"
								>
									Discard
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Status Toast */}
				<AnimatePresence>
					{status && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							className={`p-4 rounded-xl flex items-center gap-3 border ${
								status.type === "success"
									? "bg-emerald-50 text-emerald-700 border-emerald-100"
									: "bg-rose-50 text-rose-700 border-rose-100"
							}`}
						>
							{status.type === "success" ? (
								<CheckCircle className="w-5 h-5 animate-bounce" />
							) : (
								<AlertCircle className="w-5 h-5" />
							)}
							<p className="text-xs font-bold uppercase tracking-wide">
								{status.message}
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Main Editor Area */}
					<div
						className={`${editorMode === "split" ? "lg:col-span-12" : "lg:col-span-8"} space-y-6`}
					>
						<AnimatePresence mode="wait">
							{editorMode === "split" ? (
								<motion.div
									key="split"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="grid grid-cols-1 lg:grid-cols-2 gap-8"
								>
									{/* Left - Editor Pane */}
									<div className="space-y-6">{renderEditorInputs()}</div>
									{/* Right - Preview Pane */}
									<div className="space-y-6">{renderPreviewPane()}</div>
								</motion.div>
							) : editorMode === "preview" ? (
								<motion.div
									key="preview"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
								>
									{renderPreviewPane()}
								</motion.div>
							) : (
								<motion.div
									key="editor"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="space-y-6"
								>
									{renderEditorInputs()}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Sidebar */}
					<div
						className={`${editorMode === "split" ? "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6 mt-8" : "lg:col-span-4 space-y-6"}`}
					>
						{renderSidebarSettings()}
					</div>
				</div>
			</form>
		</div>
	);
}

// Sub-component for New Post icon logic
function Plus(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</svg>
	);
}
