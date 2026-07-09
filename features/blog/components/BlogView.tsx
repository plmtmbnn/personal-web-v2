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
			<aside className="lg:col-span-3 space-y-6 sticky top-8 pb-8">
				{/* Title and Description */}
				<div className="space-y-4 w-full">
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
				<div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] space-y-5 w-full">
					{/* Search Input */}
					<div className="relative group">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
						<input
							type="text"
							placeholder="Search entries..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-12 py-3 bg-white border border-slate-200 hover:border-slate-300 focus:border-slate-950 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900"
								aria-label="Clear search"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</div>

					{/* Category tabs */}
					<div className="space-y-2">
						<p className="text-[9px] font-black uppercase tracking-wider text-slate-450 px-1">
							Categories
						</p>
						<div className="flex flex-row overflow-x-auto gap-1.5 no-scrollbar pb-2">
							{CATEGORIES.map((category) => {
								const isActive = activeCategory === category;
								return (
									<button
										key={category}
										onClick={() => setActiveCategory(category)}
										className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 active:scale-[0.98] ${
											isActive
												? "text-white bg-slate-950"
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
				<div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl max-w-sm w-full">
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
		    RIGHT COLUMN: Unified Grid
		═══════════════════════════════════════ */}
			<div className="lg:col-span-9 space-y-8">
				<AnimatePresence mode="wait">
					{hasActiveFilter && sortedBlogs.length === 0 ? (
						<motion.div
							key="filtering"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="grid grid-cols-1 md:grid-cols-2 gap-6"
						>
							{/* Skeleton Cards for Filtering */}
							{[1, 2, 3, 4].map((i) => (
								<motion.div
									key={i}
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.35, delay: i * 0.04 }}
								>
									<div className="relative flex flex-col h-full bg-white border border-slate-200 rounded-[2rem] overflow-hidden">
										{/* Image Skeleton */}
										<Skeleton className="relative w-full h-48" />
										{/* Content Skeleton */}
										<div className="flex-1 flex flex-col justify-between p-4 space-y-4">
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
							className="space-y-8"
						>
							{/* Header for filtered results */}
							{(searchQuery !== "" || activeCategory !== "All") && (
								<div className="flex items-center gap-4 pt-4">
									<h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 whitespace-nowrap">
										{activeCategory !== "All"
											? `Filtered by: ${activeCategory}`
											: "Search Results"}
									</h2>
									<div className="h-px w-full bg-slate-100" />
								</div>
							)}

							{/* Unified Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{sortedBlogs.map((post, index) => (
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
											<div
												className={`relative flex flex-col h-full bg-white border border-slate-200 hover:border-slate-400 rounded-[2rem] overflow-hidden transition-all duration-500 group-hover:shadow-xl group-hover:-translate-y-1 ${
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
													<div className="absolute top-3.5 left-3.5">
														<span
															className={`px-2.5 py-0.5 border text-[7.5px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm ${getCategoryStyles(post.category)}`}
														>
															{post.category}
														</span>
														{post.is_headline && (
															<span className="ml-2 px-2.5 py-0.5 bg-accent text-white text-[7.5px] font-black uppercase tracking-widest rounded-full shadow-md">
																Headline
															</span>
														)}
													</div>
												</div>

												{/* Content Section */}
												<div className="flex-1 flex flex-col justify-between p-4">
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
														<h3
															className={`font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 ${
																post.is_headline ? "text-xl" : "text-base"
															}`}
														>
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
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
