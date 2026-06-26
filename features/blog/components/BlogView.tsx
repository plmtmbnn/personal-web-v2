"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	BookOpen,
	Clock,
	Sparkles,
	Search,
	X,
} from "lucide-react";
import type { Blog } from "@/features/blog/data";
import {
	getCategoryStyles,
	getBlogImage,
	getReadTime,
} from "@/features/blog/utils";

interface BlogViewProps {
	allBlogs: Blog[];
}

const CATEGORIES = ["All", "Tech", "Finance", "Running", "General"];

const getCategoryBorderColor = (category: string) => {
	const c = category;
	if (c === "Finance" || c === "Investment") return "border-l-emerald-500";
	if (c === "Tech") return "border-l-blue-500";
	if (c === "Running") return "border-l-rose-500";
	return "border-l-slate-400";
};

export default function BlogView({ allBlogs }: BlogViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");

	// Filter blogs dynamically
	const filteredBlogs = useMemo(() => {
		return allBlogs.filter((blog) => {
			const matchesSearch =
				blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				activeCategory === "All" ||
				blog.category.toLowerCase() === activeCategory.toLowerCase();
			return matchesSearch && matchesCategory;
		});
	}, [allBlogs, searchQuery, activeCategory]);

	// Curate layouts only when not actively searching/filtering
	const isCuratedMode = searchQuery === "" && activeCategory === "All";

	const { primaryHero, secondaryHeadlines, regularPosts } = useMemo(() => {
		if (!isCuratedMode) {
			return {
				primaryHero: null,
				secondaryHeadlines: [],
				regularPosts: filteredBlogs,
			};
		}

		const headlines = filteredBlogs.filter((blog) => blog.is_headline);
		const hero = headlines[0] || filteredBlogs[0];
		const secondary = headlines.slice(1, 3);
		const featuredIds = [hero?.id, ...secondary.map((b) => b.id)].filter(
			Boolean,
		);
		const regulars = filteredBlogs.filter(
			(blog) => !featuredIds.includes(blog.id),
		);

		return {
			primaryHero: hero,
			secondaryHeadlines: secondary,
			regularPosts: regulars,
		};
	}, [filteredBlogs, isCuratedMode]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
			{/* ═══════════════════════════════════════
			    LEFT COLUMN: Sticky Header & Filters
			═══════════════════════════════════════ */}
			<aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-6 lg:pb-8">
				{/* Title and Description */}
				<div className="space-y-4">
					<div className="flex items-center gap-2.5 text-slate-900">
						<BookOpen className="w-4 h-4 text-slate-500" />
						<span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
							Engineering Journal
						</span>
					</div>
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 leading-[0.95]">
						The <span className="gradient-text">Pulse</span>
					</h1>
					<p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
						High-fidelity insights on fintech architecture, distributed systems,
						and modern engineering culture.
					</p>
				</div>

				{/* Search & Category filter container */}
				<div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] space-y-5">
					{/* Search Input */}
					<div className="relative group">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
						<input
							type="text"
							placeholder="Search entries..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 hover:border-slate-355 focus:border-slate-950 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
								aria-label="Clear search"
							>
								<X className="w-3 h-3" />
							</button>
						)}
					</div>

					{/* Category tabs */}
					<div className="space-y-2">
						<p className="text-[9px] font-black uppercase tracking-wider text-slate-450 px-1">
							Categories
						</p>
						<div className="flex flex-row overflow-x-auto lg:flex-col lg:overflow-x-visible gap-1.5 no-scrollbar pb-2 lg:pb-0">
							{CATEGORIES.map((category) => {
								const isActive = activeCategory === category;
								return (
									<button
										key={category}
										onClick={() => setActiveCategory(category)}
										className={`relative px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 text-left shrink-0 active:scale-[0.98] ${
											isActive
												? "text-white"
												: "text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-100"
										}`}
									>
										{isActive && (
											<motion.div
												layoutId="activeCategoryBg"
												className="absolute inset-0 bg-slate-950 rounded-xl"
												transition={{
													type: "spring",
													stiffness: 380,
													damping: 30,
												}}
											/>
										)}
										<span className="relative z-10">{category}</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Archive Stats Badge */}
				<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-sm text-white">
							<Sparkles className="w-4 h-4" />
						</div>
						<div>
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
								Archive Size
							</p>
							<p className="text-xs font-black text-slate-900 leading-none">
								{allBlogs.length} articles
							</p>
						</div>
					</div>
				</div>
			</aside>

			{/* ═══════════════════════════════════════
			    RIGHT COLUMN: Highlight & Grid
			═══════════════════════════════════════ */}
			<div className="lg:col-span-8 space-y-12">
				<AnimatePresence mode="wait">
					{filteredBlogs.length === 0 ? (
						<motion.div
							key="no-results"
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							className="flex flex-col items-center justify-center text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-8"
						>
							<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-5">
								<Sparkles className="w-5 h-5 text-slate-400" />
							</div>
							<h3 className="text-lg font-black text-slate-900 tracking-tight mb-1.5">
								No stories found
							</h3>
							<p className="text-slate-400 text-xs max-w-xs">
								We couldn't find any articles matching your search query or
								selected category filter.
							</p>
						</motion.div>
					) : (
						<motion.div
							key={`${activeCategory}-${searchQuery}`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="space-y-12"
						>
							{/* Curated Layout Mode (All + Empty Search) */}
							{isCuratedMode && (
								<>
									{/* Primary Hero Section */}
									{primaryHero && (
										<section className="relative">
											<Link
												href={`/blog/${primaryHero.slug}`}
												className="group block relative !no-underline"
											>
												{/* Ambient Hover Glow */}
												<div className="absolute -inset-1 bg-gradient-to-tr from-blue-500/10 via-indigo-500/5 to-purple-500/10 rounded-[2.6rem] blur-2xl opacity-60 group-hover:opacity-100 transition duration-500 -z-10" />

												<div className="relative h-[360px] sm:h-[420px] w-full overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-2xl transition-all duration-500 group-hover:scale-[1.01] group-hover:-translate-y-1 group-hover:shadow-indigo-500/5">
													<Image
														src={getBlogImage(
															primaryHero.image_url,
															primaryHero.id,
														)}
														alt={primaryHero.title}
														fill
														priority
														className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
														sizes="(max-width: 1024px) 100vw, 66vw"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

													<div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
														<motion.div
															className={`bg-slate-950/60 backdrop-blur-xl border border-white/10 border-l-4 p-5 sm:p-8 rounded-[2rem] space-y-3.5 transition-all duration-300 ${getCategoryBorderColor(primaryHero.category)}`}
															whileHover={{
																backgroundColor: "rgba(2, 6, 23, 0.75)",
															}}
														>
															<div className="flex flex-wrap items-center gap-2">
																<span className="px-3.5 py-1 bg-accent text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-md">
																	Headline Story
																</span>
																<span
																	className={`px-3.5 py-1 border text-[8px] font-black uppercase tracking-widest rounded-full backdrop-blur-xl ${getCategoryStyles(primaryHero.category)}`}
																>
																	{primaryHero.category}
																</span>
															</div>
															<h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tighter leading-[1.1] group-hover:text-blue-400 transition-colors duration-500 line-clamp-2">
																{primaryHero.title}
															</h2>
															<p className="!text-white text-xs sm:text-sm font-medium leading-relaxed line-clamp-2 opacity-90">
																{primaryHero.description}
															</p>
															<div className="pt-1.5 border-t border-white/5 flex items-center justify-between">
																<div className="flex items-center gap-4 text-white/40 text-[8px] font-black uppercase tracking-[0.2em]">
																	<span className="flex items-center gap-1">
																		<Calendar className="w-3 h-3" />
																		{new Intl.DateTimeFormat("en-US", {
																			dateStyle: "long",
																		}).format(new Date(primaryHero.date))}
																	</span>
																	<span className="flex items-center gap-1">
																		<Clock className="w-3 h-3" />
																		{getReadTime(primaryHero.content)}
																	</span>
																</div>
																<span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-400 group-hover:gap-2.5 transition-all duration-300">
																	Read Story{" "}
																	<ArrowRight className="w-3.5 h-3.5 text-blue-450" />
																</span>
															</div>
														</motion.div>
													</div>
												</div>
											</Link>
										</section>
									)}

									{/* Secondary Headlines */}
									{secondaryHeadlines.length > 0 && (
										<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
											{secondaryHeadlines.map((post) => (
												<Link
													key={post.id}
													href={`/blog/${post.slug}`}
													className="group block relative !no-underline"
												>
													<div className="relative h-[340px] w-full overflow-hidden rounded-[2rem] border border-slate-200 shadow-xl transition-all duration-500">
														<Image
															src={getBlogImage(post.image_url, post.id)}
															alt={post.title}
															fill
															className="object-cover transition-transform duration-750 group-hover:scale-103"
															sizes="(max-width: 768px) 100vw, 33vw"
														/>
														<div className="absolute inset-0 bg-slate-950/40" />

														<div className="absolute bottom-4 left-4 right-4 p-5 bg-white/95 backdrop-blur-md rounded-[1.5rem] border border-white shadow-2xl transition-all duration-500 group-hover:-translate-y-0.5">
															<div className="flex items-center gap-2 mb-2">
																<span
																	className={`inline-block px-2.5 py-0.5 border text-[7px] font-black uppercase tracking-widest rounded-full backdrop-blur-xl ${getCategoryStyles(post.category)}`}
																>
																	{post.category}
																</span>
																<span className="flex items-center gap-1 text-[7px] font-black text-slate-400 uppercase tracking-widest">
																	<Clock className="w-2.5 h-2.5" />
																	{getReadTime(post.content)}
																</span>
															</div>
															<h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tighter leading-snug mb-2.5 group-hover:text-blue-600 transition-colors line-clamp-2">
																{post.title}
															</h3>
															<div className="flex items-center gap-1.5 text-slate-400 text-[7px] font-black uppercase tracking-widest">
																<Calendar className="w-3 h-3" />
																{new Intl.DateTimeFormat("en-US", {
																	dateStyle: "medium",
																}).format(new Date(post.date))}
															</div>
														</div>
													</div>
												</Link>
											))}
										</section>
									)}
								</>
							)}

							{/* Regular / Filtered Grid Section */}
							<section className="space-y-8">
								{isCuratedMode && (
									<div className="flex items-center gap-4 pt-4">
										<h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">
											Journal Archives
										</h2>
										<div className="h-px w-full bg-slate-100" />
									</div>
								)}

								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{regularPosts.map((post, index) => (
										<motion.div
											key={post.slug}
											initial={{ opacity: 0, y: 15 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.35, delay: index * 0.04 }}
										>
											<Link
												href={`/blog/${post.slug}`}
												className="group block !no-underline h-full"
											>
												<div className="flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 rounded-[2rem] p-3.5 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5">
													<div className="relative h-48 w-full mb-4 overflow-hidden rounded-[1.5rem] border border-slate-100">
														<Image
															src={getBlogImage(post.image_url, post.id)}
															alt={post.title}
															fill
															className="object-cover transition-transform duration-700 group-hover:scale-103"
															sizes="(max-width: 768px) 100vw, 33vw"
														/>
														<div className="absolute top-3.5 left-3.5">
															<span
																className={`px-2.5 py-0.5 border text-[7.5px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm ${getCategoryStyles(post.category)}`}
															>
																{post.category}
															</span>
														</div>
													</div>

													<div className="flex-1 flex flex-col justify-between px-2 pb-2">
														<div className="space-y-2.5">
															<div className="flex items-center gap-3 text-slate-400 text-[7.5px] font-black uppercase tracking-widest">
																<span className="flex items-center gap-1">
																	<Calendar className="w-2.5 h-2.5" />
																	{new Intl.DateTimeFormat("en-US", {
																		dateStyle: "medium",
																	}).format(new Date(post.date))}
																</span>
																<span className="flex items-center gap-1">
																	<Clock className="w-2.5 h-2.5" />
																	{getReadTime(post.content)}
																</span>
															</div>
															<h3 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
																{post.title}
															</h3>
															<p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
																{post.description}
															</p>
														</div>

														<div className="pt-4 flex items-center gap-1 text-slate-900 font-black text-[8.5px] uppercase tracking-[0.18em] group-hover:gap-2.5 transition-all">
															Read Article
															<ArrowRight className="w-3 h-3 text-blue-600" />
														</div>
													</div>
												</div>
											</Link>
										</motion.div>
									))}
								</div>
							</section>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
