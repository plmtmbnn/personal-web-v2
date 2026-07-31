"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
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
import { Skeleton } from "@/features/shared/components/Shimmer";

interface BlogViewProps {
	allBlogs: Blog[];
}

const CATEGORIES = ["All", "Tech", "Finance", "Running", "General"];

const getCategoryColor = (category: string) => {
	const c = category;
	if (c === "Finance" || c === "Investment") return "bg-emerald-500";
	if (c === "Tech") return "bg-blue-500";
	if (c === "Running") return "bg-rose-500";
	return "bg-slate-400";
};

export default function BlogView({ allBlogs }: BlogViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");
	const reduceMotion = useReducedMotion();

	// Check if a filter is actively applied (for skeleton loader)
	const hasActiveFilter = searchQuery !== "" || activeCategory !== "All";

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

	// Sort blogs: featured (is_headline) first, then by date
	const sortedBlogs = useMemo(() => {
		return [...filteredBlogs].sort((a, b) => {
			if (a.is_headline && !b.is_headline) return -1;
			if (!a.is_headline && b.is_headline) return 1;
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
	}, [filteredBlogs]);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start transition-all duration-300">
			{/* ═══════════════════════════════════════
		    LEFT COLUMN: Sticky Header & Filters
		═══════════════════════════════════════ */}
			<aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-28 pb-4">
				{/* Title and Description */}
				<div className="space-y-3 w-full">
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-slate-200/80 text-[10px] font-bold text-slate-700 uppercase tracking-wider shadow-xs">
							<BookOpen className="w-3.5 h-3.5 text-indigo-600" />
							Engineering Journal
						</span>
					</div>
					<h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.12]">
						The <span className="text-indigo-600">Pulse</span>
					</h1>
					<p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm">
						High-fidelity insights on fintech architecture, distributed systems,
						and modern engineering culture.
					</p>
				</div>

				{/* Search & Category filter container */}
				<div className="bg-white border border-slate-200/80 p-5 rounded-[2rem] space-y-5 w-full shadow-sm">
					{/* Search Input */}
					<div className="relative group">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
						<input
							type="text"
							placeholder="Search entries..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-10 py-3 bg-slate-50/70 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
								aria-label="Clear search"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					{/* Category tabs */}
					<div className="space-y-2">
						<p className="text-[9.5px] font-bold uppercase tracking-wider text-slate-500 px-1">
							Categories
						</p>
						<div className="flex flex-row flex-wrap lg:flex-col gap-1.5 no-scrollbar">
							{CATEGORIES.map((category) => {
								const isActive = activeCategory === category;
								return (
									<button
										key={category}
										onClick={() => setActiveCategory(category)}
										className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
											isActive
												? "text-white bg-slate-900 shadow-sm"
												: "text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60"
										}`}
									>
										<div
											className={`relative z-10 w-2 h-2 rounded-full ${getCategoryColor(category)}`}
										/>
										<span className="relative z-10">{category}</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* Archive Stats Badge */}
				<div className="flex items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl max-w-sm w-full shadow-xs">
					<div className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
							<Sparkles className="w-4 h-4" />
						</div>
						<div>
							<p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-none mb-1">
								Archive Size
							</p>
							<p className="text-xs font-extrabold text-slate-900 leading-none">
								{allBlogs.length} articles published
							</p>
						</div>
					</div>
				</div>
			</aside>

			{/* ═══════════════════════════════════════
		    RIGHT COLUMN: Unified Grid
		═══════════════════════════════════════ */}
			<div className="lg:col-span-9 space-y-8">
				<AnimatePresence mode="wait">
					{hasActiveFilter && sortedBlogs.length === 0 ? (
						<motion.div
							key="filtering"
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="grid grid-cols-1 md:grid-cols-2 gap-6"
						>
							{/* Skeleton Cards for Filtering */}
							{[1, 2, 3, 4].map((i) => (
								<motion.div
									key={i}
									initial={reduceMotion ? false : { opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.35, delay: i * 0.04 }}
								>
									<div className="relative flex flex-col h-full bg-white border border-slate-200/80 rounded-[2.5rem] overflow-hidden shadow-xs">
										{/* Image Skeleton */}
										<Skeleton className="relative w-full h-48" />
										{/* Content Skeleton */}
										<div className="flex-1 flex flex-col justify-between p-6 space-y-4">
											<div className="space-y-2.5">
												<div className="flex items-center gap-3">
													<Skeleton className="w-12 h-3 rounded-full" />
													<Skeleton className="w-10 h-3 rounded-full" />
												</div>
												<Skeleton className="w-full h-5 rounded-xl" />
												<Skeleton className="w-3/4 h-3 rounded-full" />
												<Skeleton className="w-1/2 h-3 rounded-full" />
											</div>
											<div className="pt-4 flex items-center gap-1">
												<Skeleton className="w-16 h-3 rounded-full" />
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					) : sortedBlogs.length === 0 ? (
						<motion.div
							key="no-results"
							initial={reduceMotion ? false : { opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							className="flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200/80 rounded-[2.5rem] p-8 shadow-xs"
						>
							<div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
								<Sparkles className="w-5 h-5" />
							</div>
							<h3 className="text-lg font-extrabold text-slate-900 tracking-tight mb-1">
								No stories found
							</h3>
							<p className="text-slate-500 text-xs font-semibold max-w-xs">
								We couldn't find any articles matching your search query or
								selected category filter.
							</p>
						</motion.div>
					) : (
						<motion.div
							key={`${activeCategory}-${searchQuery}`}
							initial={reduceMotion ? false : { opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.25 }}
							className="space-y-6"
						>
							{/* Header for filtered results */}
							{(searchQuery !== "" || activeCategory !== "All") && (
								<div className="flex items-center gap-4 pt-2">
									<h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
										{activeCategory !== "All"
											? `Filtered by: ${activeCategory}`
											: "Search Results"}
									</h2>
									<div className="h-px w-full bg-slate-200/80" />
								</div>
							)}

							{/* Unified Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{sortedBlogs.map((post, index) => (
									<motion.div
										key={post.slug}
										initial={reduceMotion ? false : { opacity: 0, y: 15 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.35, delay: index * 0.04 }}
									>
										<Link
											href={`/blog/${post.slug}`}
											className="group block !no-underline h-full"
										>
											<div
												className={`relative flex flex-col h-full bg-white border border-slate-200/80 hover:border-slate-300 rounded-[2.5rem] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1.5 ${
													post.is_headline ? "md:col-span-2" : ""
												}`}
											>
												{/* Image Section */}
												<div
													className={`relative w-full overflow-hidden ${
														post.is_headline ? "h-64 sm:h-80" : "h-48"
													}`}
												>
													<Image
														src={getBlogImage(post.image_url, post.id)}
														alt={post.title}
														fill
														className="object-cover transition-transform duration-700 group-hover:scale-105"
														sizes="(max-width: 768px) 100vw, 50vw"
													/>
													{/* Category Badge */}
													<div className="absolute top-3.5 left-3.5 flex items-center gap-2">
														<span
															className={`px-3 py-1 border text-[9px] font-extrabold uppercase tracking-wider rounded-full backdrop-blur-md shadow-xs ${getCategoryStyles(post.category)}`}
														>
															{post.category}
														</span>
														{post.is_headline && (
															<span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-extrabold uppercase tracking-wider rounded-full shadow-xs">
																Headline
															</span>
														)}
													</div>
												</div>

												{/* Content Section */}
												<div className="flex-1 flex flex-col justify-between p-6">
													<div className="space-y-3">
														<div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
															<span className="flex items-center gap-1.5">
																<Calendar className="w-3 h-3 text-indigo-600" />
																{new Intl.DateTimeFormat("en-US", {
																	dateStyle: "medium",
																}).format(new Date(post.date))}
															</span>
															<span>•</span>
															<span className="flex items-center gap-1.5">
																<Clock className="w-3 h-3 text-indigo-600" />
																{getReadTime(post.content)}
															</span>
														</div>
														<h3
															className={`font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2 ${
																post.is_headline
																	? "text-xl sm:text-2xl"
																	: "text-lg"
															}`}
														>
															{post.title}
														</h3>
														<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed line-clamp-2">
															{post.description}
														</p>
													</div>

													<div className="pt-5 flex items-center gap-1.5 text-indigo-600 font-bold text-xs uppercase tracking-wider group-hover:gap-2.5 transition-all">
														Read Article
														<ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
													</div>
												</div>
											</div>
										</Link>
									</motion.div>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
