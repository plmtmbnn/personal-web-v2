"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
	Calendar,
	Tag,
	ArrowLeft,
	Edit2,
	Link as LinkIcon,
	Trash2,
} from "lucide-react";
import type { BrainNote } from "../types";
import { slugify } from "../utils";

interface NoteViewerProps {
	note: BrainNote;
	existingSlugs: string[];
	isAdmin: boolean;
	isDevelopment: boolean;
	onEditClick: () => void;
	onDeleteClick?: () => void;
}

export default function NoteViewer({
	note,
	existingSlugs,
	isAdmin,
	isDevelopment,
	onEditClick,
	onDeleteClick,
}: NoteViewerProps) {
	// Pre-process WikiLinks [[Target]] or [[Target|Alias]] into standard markdown links [Alias](/brain/slug)
	const processedContent = note.content.replace(
		/\[\[(.*?)\]\]/g,
		(match, p1) => {
			const parts = p1.split("|");
			const target = parts[0].trim();
			const alias = parts[1] ? parts[1].trim() : target;
			const slug = slugify(target);
			return `[${alias}](/brain/${slug})`;
		},
	);

	// Custom markdown components to handle routing using Next.js Link
	const markdownComponents = {
		a: ({ href, children, ...props }: any) => {
			if (href?.startsWith("/brain/")) {
				const slug = href.replace("/brain/", "");
				const exists = existingSlugs.includes(slug);

				if (!exists) {
					return (
						<Link
							href={
								isDevelopment && isAdmin
									? `/brain/new?title=${encodeURIComponent(slug.replace(/-/g, " "))}`
									: href
							}
							className="text-slate-400 hover:text-emerald-600 border-b border-dashed border-slate-300 hover:border-emerald-500 transition-colors inline-flex items-center gap-0.5"
							title={
								isDevelopment && isAdmin
									? "Click to create this note"
									: "Note does not exist yet"
							}
							{...props}
						>
							{children}
							{isDevelopment && isAdmin && (
								<span className="text-[10px] opacity-75 font-normal">+</span>
							)}
						</Link>
					);
				}

				return (
					<Link
						href={href}
						className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-500/30 hover:decoration-emerald-500 transition-all font-medium"
						{...props}
					>
						{children}
					</Link>
				);
			}

			return (
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="text-emerald-600 hover:text-emerald-700 underline transition-colors"
					{...props}
				>
					{children}
				</a>
			);
		},
		h1: ({ children }: any) => (
			<h1 className="text-2xl font-bold text-slate-800 mt-6 mb-4">
				{children}
			</h1>
		),
		h2: ({ children }: any) => (
			<h2 className="text-xl font-semibold text-slate-800 mt-5 mb-3">
				{children}
			</h2>
		),
		h3: ({ children }: any) => (
			<h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">
				{children}
			</h3>
		),
		p: ({ children }: any) => (
			<p className="text-slate-600 leading-relaxed mb-4 text-sm md:text-base">
				{children}
			</p>
		),
		ul: ({ children }: any) => (
			<ul className="list-disc pl-6 mb-4 space-y-1.5 text-slate-600 text-sm md:text-base">
				{children}
			</ul>
		),
		ol: ({ children }: any) => (
			<ol className="list-decimal pl-6 mb-4 space-y-1.5 text-slate-600 text-sm md:text-base">
				{children}
			</ol>
		),
		li: ({ children }: any) => <li className="pl-1">{children}</li>,
		code: ({ children }: any) => (
			<code className="bg-slate-50 text-slate-700 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-100">
				{children}
			</code>
		),
		blockquote: ({ children }: any) => (
			<blockquote className="border-l-4 border-emerald-500 bg-slate-50/50 pl-4 py-1 pr-2 rounded-r-lg my-4 italic text-slate-600">
				{children}
			</blockquote>
		),
	};

	return (
		<div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto">
			{/* Action Header */}
			<div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
				<Link
					href="/brain"
					className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 text-sm transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					<span>Back to Graph</span>
				</Link>

				<div className="flex items-center gap-2">
					{isAdmin && isDevelopment ? (
						<>
							<button
								type="button"
								onClick={onEditClick}
								className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl transition-all"
							>
								<Edit2 className="w-3.5 h-3.5" />
								<span>Edit Note</span>
							</button>
							{onDeleteClick && (
								<button
									type="button"
									onClick={onDeleteClick}
									className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-all"
								>
									<Trash2 className="w-3.5 h-3.5" />
									<span>Delete</span>
								</button>
							)}
						</>
					) : (
						<span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
							Read-Only Mode
						</span>
					)}
				</div>
			</div>

			{/* Main Note Sheet */}
			<div className="max-w-3xl w-full mx-auto px-6 py-8 flex-1 flex flex-col gap-6">
				<div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-sm">
					{/* Metadata */}
					<div className="flex flex-col gap-2 mb-6 border-b border-slate-50 pb-5">
						<h1 className="text-3xl font-bold text-slate-800">{note.title}</h1>
						<div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
							<span className="flex items-center gap-1">
								<Calendar className="w-3.5 h-3.5" />
								{note.createdAt}
							</span>
							{note.tags.length > 0 && (
								<div className="flex items-center gap-1.5">
									<Tag className="w-3.5 h-3.5 text-slate-400" />
									<div className="flex gap-1">
										{note.tags.map((t) => (
											<span
												key={t}
												className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono text-[10px]"
											>
												{t}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Markdown Render */}
					<div className="prose prose-slate max-w-none">
						<ReactMarkdown components={markdownComponents}>
							{processedContent}
						</ReactMarkdown>
					</div>
				</div>

				{/* Backlinks Section */}
				<div className="mt-4">
					<h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
						<LinkIcon className="w-4 h-4 text-slate-400" />
						<span>Backlinks ({note.backlinks.length})</span>
					</h3>

					{note.backlinks.length === 0 ? (
						<p className="text-xs text-slate-400 italic bg-white border border-slate-100 rounded-xl p-4">
							No other notes link to this page.
						</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							{note.backlinks.map((link) => (
								<Link
									key={link.slug}
									href={`/brain/${link.slug}`}
									className="p-4 bg-white hover:bg-emerald-50/20 border border-slate-100 hover:border-emerald-100 rounded-2xl shadow-sm transition-all group flex flex-col gap-1"
								>
									<span className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">
										{link.title}
									</span>
									<span className="text-[10px] text-slate-400">
										Referenced in this note
									</span>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
