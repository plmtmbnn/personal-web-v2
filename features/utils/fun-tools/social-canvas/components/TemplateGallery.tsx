"use client";

import { useState } from "react";
import {
	LayoutGrid,
	Layers,
	Type,
	Image as ImageIcon,
	Terminal,
	Check,
	User,
	Palette,
	FileText,
	Newspaper,
	Film,
	Disc3,
	Quote,
} from "lucide-react";
import {
	type TemplateCategory,
	type TemplateId,
	TEMPLATES,
	TEMPLATE_GROUPS,
} from "../types";

interface TemplateGalleryProps {
	selectedTemplate: TemplateId;
	onSelectTemplate: (templateId: TemplateId) => void;
}

export default function TemplateGallery({
	selectedTemplate,
	onSelectTemplate,
}: TemplateGalleryProps) {
	const [activeCategory, setActiveCategory] = useState<
		TemplateCategory | "all"
	>("all");

	const activeTemplateObj =
		TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

	// Filter templates based on active category
	const displayedTemplates =
		activeCategory === "all"
			? TEMPLATES
			: TEMPLATES.filter((t) => t.group === activeCategory);

	const activeGroupInfo =
		activeCategory === "all"
			? null
			: TEMPLATE_GROUPS.find((g) => g.id === activeCategory);

	// Helper for domain icon per template
	const getTemplateIcon = (id: TemplateId) => {
		switch (id) {
			case "breaking-news":
				return Newspaper;
			case "terminal-window":
				return Terminal;
			case "vinyl-now-playing":
				return Disc3;
			case "cinematic-subtitles":
				return Film;
			case "quote-minimal":
				return Quote;
			case "thread-starter":
			case "social-post":
				return User;
			case "typography-poster":
			case "manifesto-block":
				return Type;
			case "flat-bento":
			case "swiss-grid":
				return LayoutGrid;
			default:
				return ImageIcon;
		}
	};

	return (
		<section
			id="template-gallery"
			className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-8 space-y-6 scroll-mt-24"
		>
			{/* Top Header Row */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
				<div className="flex items-start gap-3.5">
					<div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
						<LayoutGrid className="w-5 h-5" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
								Template Catalog & Groups
							</h2>
							<span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
								{TEMPLATES.length} Styles
							</span>
						</div>
						<p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
							Choose from 22 curated faceless layouts organized across 4
							creative styles.
						</p>
					</div>
				</div>

				{/* Active Template Status Pill */}
				<div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl self-start sm:self-auto shrink-0">
					<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
					<span className="text-[11px] font-medium text-slate-500">
						Active:
					</span>
					<span className="text-xs font-bold text-slate-900 font-mono truncate max-w-[140px] sm:max-w-[180px]">
						{activeTemplateObj.label}
					</span>
				</div>
			</div>

			{/* Category Filter Tabs */}
			<div className="space-y-2">
				<div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-pan-x">
					<button
						type="button"
						onClick={() => setActiveCategory("all")}
						className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 touch-manipulation cursor-pointer active:scale-95 ${
							activeCategory === "all"
								? "bg-slate-900 text-white shadow-xs"
								: "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
						}`}
					>
						<Layers className="w-3.5 h-3.5" />
						<span>All Templates</span>
						<span
							className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
								activeCategory === "all"
									? "bg-slate-800 text-slate-300"
									: "bg-white text-slate-600"
							}`}
						>
							{TEMPLATES.length}
						</span>
					</button>

					{TEMPLATE_GROUPS.map((grp) => {
						const count = TEMPLATES.filter((t) => t.group === grp.id).length;
						const isCurrent = activeCategory === grp.id;
						const hasActive = activeTemplateObj.group === grp.id;

						return (
							<button
								key={grp.id}
								type="button"
								onClick={() => setActiveCategory(grp.id)}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 touch-manipulation cursor-pointer active:scale-95 ${
									isCurrent
										? "bg-slate-900 text-white shadow-xs"
										: "bg-slate-100 hover:bg-slate-200/70 text-slate-600"
								}`}
							>
								<span>{grp.label}</span>
								<span
									className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
										isCurrent
											? "bg-slate-800 text-slate-300"
											: "bg-white text-slate-600"
									}`}
								>
									{count}
								</span>
								{hasActive && !isCurrent && (
									<span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
								)}
							</button>
						);
					})}
				</div>

				{/* Active Category Description Banner */}
				{activeGroupInfo && (
					<div className="px-3.5 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
						<span className="font-bold text-slate-800">
							{activeGroupInfo.label}:
						</span>
						<span className="text-slate-500 font-medium">
							{activeGroupInfo.description}
						</span>
					</div>
				)}
			</div>

			{/* Template Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 pt-1">
				{displayedTemplates.map((tpl) => {
					const isSelected = selectedTemplate === tpl.id;
					const IconComponent = getTemplateIcon(tpl.id);
					const groupMeta = TEMPLATE_GROUPS.find((g) => g.id === tpl.group);

					return (
						<button
							key={tpl.id}
							type="button"
							onClick={() => onSelectTemplate(tpl.id)}
							className={`group text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between touch-manipulation active:scale-[0.98] ${
								isSelected
									? "bg-purple-50/40 border-purple-500/80 shadow-xs ring-1 ring-purple-500/30"
									: "bg-white hover:bg-slate-50/60 border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs"
							}`}
						>
							{/* Card Header: Icon & Category Tag */}
							<div className="flex items-center justify-between gap-2 mb-3">
								<div
									className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
										isSelected
											? "bg-purple-600 text-white"
											: "bg-slate-100 text-slate-600 group-hover:bg-purple-50 group-hover:text-purple-600"
									}`}
								>
									<IconComponent className="w-4 h-4" />
								</div>

								{isSelected ? (
									<span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-md font-mono">
										<Check className="w-3 h-3 text-purple-700" />
										Active
									</span>
								) : (
									<span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider truncate max-w-[110px]">
										{groupMeta?.label.split(" ")[0]}
									</span>
								)}
							</div>

							{/* Card Body: Title & Field Attributes */}
							<div className="space-y-1.5 flex-1">
								<h3
									className={`text-sm font-bold tracking-tight transition-colors ${
										isSelected
											? "text-purple-950 font-extrabold"
											: "text-slate-900 group-hover:text-purple-600"
									}`}
								>
									{tpl.label}
								</h3>
								<p className="text-[11px] text-slate-500 font-medium line-clamp-1">
									{tpl.fields.titleLabel} &middot; {tpl.fields.descriptionLabel}
								</p>
							</div>

							{/* Card Footer: Feature Badges */}
							<div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100 flex-wrap">
								{tpl.fields.hasAvatar && (
									<span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
										<User className="w-2.5 h-2.5" /> Avatar
									</span>
								)}
								{tpl.fields.hasTheme && (
									<span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
										<Palette className="w-2.5 h-2.5" /> Light/Dark
									</span>
								)}
								<span className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 font-mono ml-auto">
									<FileText className="w-2.5 h-2.5" /> Ready
								</span>
							</div>
						</button>
					);
				})}
			</div>
		</section>
	);
}
