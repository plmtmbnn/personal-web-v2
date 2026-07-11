"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plus, Tag, Calendar, Folder } from "lucide-react";
import type { BrainNote } from "../types";
import { slugify } from "../utils";

interface BrainSidebarProps {
	notes: BrainNote[];
	isAdmin: boolean;
	isDevelopment: boolean;
}

export default function BrainSidebar({
	notes,
	isAdmin,
	isDevelopment,
}: BrainSidebarProps) {
	const pathname = usePathname();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// Get unique tags
	const allTags = Array.from(
		new Set(notes.flatMap((note) => note.tags)),
	).sort();

	// Filter notes based on search query and tag selection
	const filteredNotes = notes.filter((note) => {
		const matchesSearch =
			note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			note.content.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesTag = selectedTag ? note.tags.includes(selectedTag) : true;
		return matchesSearch && matchesTag;
	});

	return (
		<aside className="w-full md:w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col h-full overflow-hidden">
			{/* Top Bar / Search */}
			<div className="p-4 border-b border-slate-50 flex flex-col gap-3">
				<div className="flex items-center justify-between">
					<Link
						href="/brain"
						className="flex items-center gap-2 text-slate-800 font-semibold hover:text-emerald-600 transition-colors"
					>
						<Folder className="w-5 h-5 text-emerald-500" />
						<span>Second Brain</span>
					</Link>
					{isAdmin && isDevelopment && (
						<Link
							href="/brain/new"
							className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
							title="Create New Note"
						>
							<Plus className="w-4 h-4" />
						</Link>
					)}
				</div>
				<div className="relative">
					<Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
					<input
						type="text"
						placeholder="Search notes or tags..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
					/>
				</div>
			</div>

			{/* Tag Filters */}
			{allTags.length > 0 && (
				<div className="px-4 py-2 border-b border-slate-50 flex flex-wrap gap-1.5 overflow-x-auto max-h-24 scrollbar-none">
					<button
						type="button"
						onClick={() => setSelectedTag(null)}
						className={`px-2 py-0.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
							selectedTag === null
								? "bg-emerald-500 text-white font-medium"
								: "bg-slate-50 text-slate-600 hover:bg-slate-100"
						}`}
					>
						All
					</button>
					{allTags.map((tag) => (
						<button
							key={tag}
							type="button"
							onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
							className={`px-2 py-0.5 text-xs rounded-full transition-colors flex items-center gap-1 ${
								tag === selectedTag
									? "bg-emerald-500 text-white font-medium"
									: "bg-slate-50 text-slate-600 hover:bg-slate-100"
							}`}
						>
							<Tag className="w-3 h-3 opacity-60" />
							{tag}
						</button>
					))}
				</div>
			)}

			{/* Notes List */}
			<div className="flex-1 overflow-y-auto divide-y divide-slate-50">
				{filteredNotes.length === 0 ? (
					<div className="p-8 text-center text-slate-400 text-sm">
						No notes found.
					</div>
				) : (
					filteredNotes.map((note) => {
						const isNoteActive = pathname === `/brain/${note.slug}`;
						return (
							<Link
								key={note.slug}
								href={`/brain/${note.slug}`}
								className={`block p-4 transition-all ${
									isNoteActive
										? "bg-emerald-50/50 border-l-4 border-emerald-500"
										: "hover:bg-slate-50/50 border-l-4 border-transparent"
								}`}
							>
								<div className="flex flex-col gap-1">
									<h4
										className={`text-sm font-medium transition-colors ${
											isNoteActive
												? "text-emerald-700"
												: "text-slate-800 hover:text-emerald-600"
										}`}
									>
										{note.title}
									</h4>
									<p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
										{note.content.replace(/[#*`_\[\]]/g, "")}
									</p>
									<div className="flex items-center justify-between mt-2.5">
										<span className="text-[10px] text-slate-400 flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{note.createdAt}
										</span>
										{note.tags.length > 0 && (
											<span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md font-mono">
												#{note.tags[0]}
											</span>
										)}
									</div>
								</div>
							</Link>
						);
					})
				)}
			</div>
		</aside>
	);
}
