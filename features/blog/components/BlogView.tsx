"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	ArrowUpRight,
	Search,
	X,
	Loader2,
	Lock,
	ChevronDown,
	BookOpen,
	Calendar,
	Clock,
} from "lucide-react";
import type { Blog } from "@/features/blog/data";
import {
	getBlogImage,
	getWordCount,
	getReadTime,
	getCategoryStyles,
} from "@/features/blog/utils";
import { Skeleton } from "@/features/shared/components/Shimmer";

interface BlogViewProps {
	allBlogs: Blog[];
}

type SortOption = "date-desc" | "date-asc" | "read-asc" | "read-desc";

const PAGE_SIZE = 9;
const CATEGORIES = ["All", "Tech", "Finance", "Running", "General"];

function formatDate(dateStr: string): string {
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return dateStr;
		return d.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	} catch {
		return dateStr;
	}
}

export default function BlogView({ allBlogs }: BlogViewProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState("All");
	const [sortBy, setSortBy] = useState<SortOption>("date-desc");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const reduceMotion = useReducedMotion();
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	// Check if any filter is actively applied
	const hasActiveFilter =
		searchQuery !== "" || activeCategory !== "All" || sortBy !== "date-desc";

	// Calculate article counts per category
	const categoryCounts = useMemo(() => {
		const counts: Record<string, number> = { All: allBlogs.length };
		for (const cat of CATEGORIES) {
			if (cat === "All") continue;
			counts[cat] = allBlogs.filter((b) => {
				const blogCat = b.category.toLowerCase();
				const target = cat.toLowerCase();
				if (target === "finance") {
					return blogCat === "finance" || blogCat === "investment";
				}
				return blogCat === target;
			}).length;
		}
		return counts;
	}, [allBlogs]);

	// Filter blogs dynamically
	const filteredBlogs = useMemo(() => {
		return allBlogs.filter((blog) => {
			const matchesSearch =
				blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				blog.description.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				activeCategory === "All" ||
				blog.category.toLowerCase() === activeCategory.toLowerCase() ||
				(activeCategory.toLowerCase() === "finance" &&
					(blog.category.toLowerCase() === "finance" ||
						blog.category.toLowerCase() === "investment"));
			return matchesSearch && matchesCategory;
		});
	}, [allBlogs, searchQuery, activeCategory]);

	// Sort blogs
	const sortedBlogs = useMemo(() => {
		return [...filteredBlogs].sort((a, b) => {
			if (sortBy === "date-desc") {
				if (a.is_headline && !b.is_headline) return -1;
				if (!a.is_headline && b.is_headline) return 1;
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
			if (sortBy === "date-asc") {
				return new Date(a.date).getTime() - new Date(b.date).getTime();
			}
			if (sortBy === "read-asc") {
				return getWordCount(a.content) - getWordCount(b.content);
			}
			if (sortBy === "read-desc") {
				return getWordCount(b.content) - getWordCount(a.content);
			}
			return 0;
		});
	}, [filteredBlogs, sortBy]);

	// Sliced blogs for batch pagination
	const displayedBlogs = useMemo(() => {
		return sortedBlogs.slice(0, visibleCount);
	}, [sortedBlogs, visibleCount]);

	const hasMore = visibleCount < sortedBlogs.length;

	// Handlers for filter state changes
	const handleSearchChange = (query: string) => {
		setSearchQuery(query);
		setVisibleCount(PAGE_SIZE);
	};

	const handleCategoryChange = (category: string) => {
		setActiveCategory(category);
		setVisibleCount(PAGE_SIZE);
	};

	const handleResetFilters = () => {
		setSearchQuery("");
		setActiveCategory("All");
		setSortBy("date-desc");
		setVisibleCount(PAGE_SIZE);
	};

	// IntersectionObserver for seamless infinite pagination
	useEffect(() => {
		if (!hasMore || isLoadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setIsLoadingMore(true);
					setTimeout(() => {
						setVisibleCount((prev) => prev + PAGE_SIZE);
						setIsLoadingMore(false);
					}, 350);
				}
			},
			{ rootMargin: "250px" },
		);

		const el = sentinelRef.current;
		if (el) observer.observe(el);

		return () => {
			if (el) observer.unobserve(el);
		};
	}, [hasMore, isLoadingMore]);

	return (
		<div className="space-y-8 sm:space-y-10">
			{/* ═══════════════════════════════════════
			    HERO HEADER: Editorial & Confident
			═══════════════════════════════════════ */}
			<header className="text-center max-w-3xl mx-auto space-y-3.5 pt-2 sm:pt-4">
				<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs">
					<BookOpen className="w-3.5 h-3.5 text-indigo-600" />
					<span>ENGINEERING JOURNAL • thoughts & distributed systems</span>
				</div>

				<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
					Insights for
					<br />
					<span>modern engineering</span>
				</h1>

				<p className="text-slate-500 text-sm sm:text-base font-normal max-w-xl mx-auto leading-relaxed">
					Thoughts, updates, and architectural patterns on distributed systems,
					fintech infrastructure, and building resilient systems.
				</p>
			</header>

			{/* ═══════════════════════════════════════
			    FLOATING CONTROLS TOOLBAR
			═══════════════════════════════════════ */}
			<div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-xs space-y-3">
				<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
					{/* Category Filter Pills Track */}
					<div className="flex items-center gap-1.5 overflow-x-auto max-w-full no-scrollbar py-0.5">
						{CATEGORIES.map((category) => {
							const isActive = activeCategory === category;
							const count = categoryCounts[category] ?? 0;
							return (
								<button
									key={category}
									type="button"
									onClick={() => handleCategoryChange(category)}
									className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-[background-color,border-color,color,transform] shrink-0 cursor-pointer active:scale-95 ${
										isActive
											? "bg-slate-900 text-white shadow-xs"
											: "bg-slate-50/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/70"
									}`}
								>
									<span>{category}</span>
									<span
										className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
											isActive
												? "bg-slate-800 text-slate-200"
												: "bg-white text-slate-500 border border-slate-200/60"
										}`}
									>
										{count}
									</span>
								</button>
							);
						})}
					</div>

					{/* Search & Sort Actions */}
					<div className="flex items-center gap-2 w-full md:w-auto justify-end">
						{/* Search Input */}
						<div className="relative flex-1 md:w-60 group">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none z-10" />
							<input
								type="text"
								placeholder="Search articles..."
								value={searchQuery}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 focus:border-indigo-500 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all shadow-xs"
							/>
							{searchQuery && (
								<button
									type="button"
									onClick={() => handleSearchChange("")}
									className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded-full bg-slate-200/80 hover:bg-slate-300 transition-colors text-slate-600 cursor-pointer z-10"
									aria-label="Clear search"
								>
									<X className="w-2.5 h-2.5" />
								</button>
							)}
						</div>

						{/* Sort Dropdown */}
						<div className="relative shrink-0">
							<select
								id="blog-sort-select"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortOption)}
								aria-label="Sort articles"
								className="appearance-none bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl pl-3.5 pr-8 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
							>
								<option value="date-desc">Newest First</option>
								<option value="date-asc">Oldest First</option>
								<option value="read-asc">Quickest Read</option>
								<option value="read-desc">Deepest Read</option>
							</select>
							<ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
						</div>
					</div>
				</div>

				{/* Active Filter Summary Strip */}
				{hasActiveFilter && (
					<div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
						<span>
							Showing{" "}
							<strong className="text-slate-900">{sortedBlogs.length}</strong>{" "}
							{sortedBlogs.length === 1 ? "article" : "articles"}
							{activeCategory !== "All" && ` in ${activeCategory}`}
							{searchQuery && ` matching "${searchQuery}"`}
						</span>
						<button
							type="button"
							onClick={handleResetFilters}
							className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer active:scale-95"
						>
							<X className="w-3.5 h-3.5" />
							<span>Reset Filters</span>
						</button>
					</div>
				)}
			</div>

			{/* ═══════════════════════════════════════
			    MAIN CONTENT: Floating Cards 3-Column Grid
			═══════════════════════════════════════ */}
			<AnimatePresence mode="wait">
				{sortedBlogs.length === 0 ? (
					/* Empty State Card */
					<motion.div
						key="no-results"
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -15 }}
						className="flex flex-col items-center justify-center text-center py-16 bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs max-w-md mx-auto"
					>
						<div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/70 flex items-center justify-center mb-4 text-slate-700 shadow-2xs">
							<Search className="w-5 h-5" />
						</div>
						<h3 className="text-lg font-black text-slate-900 tracking-tight mb-1">
							{allBlogs.length === 0 ? "No Articles Yet" : "No Articles Found"}
						</h3>
						<p className="text-slate-500 text-xs font-normal max-w-xs leading-relaxed">
							{allBlogs.length === 0
								? "The journal is currently empty. Check back soon for engineering insights."
								: "We couldn't find any articles matching your search query or selected category filter."}
						</p>
						{hasActiveFilter && (
							<button
								type="button"
								onClick={handleResetFilters}
								className="mt-5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-[background-color] cursor-pointer"
							>
								Clear Filters
							</button>
						)}
					</motion.div>
				) : (
					/* 3-Column Floating Article Grid */
					<motion.div
						key={`${activeCategory}-${searchQuery}-${sortBy}`}
						initial={reduceMotion ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="space-y-10 sm:space-y-12"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
							{displayedBlogs.map((post, index) => (
								<motion.article
									key={post.slug}
									initial={reduceMotion ? false : { opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{
										duration: 0.3,
										delay: (index % PAGE_SIZE) * 0.03,
									}}
									className="flex"
								>
									<Link
										href={`/blog/${post.slug}`}
										className="group flex flex-col justify-between w-full bg-white border border-slate-200/80 hover:border-slate-300 rounded-[2rem] p-4 sm:p-5 shadow-xs hover:shadow-md transition-[box-shadow,border-color,transform] !no-underline"
									>
										{/* Top Image & Floating Badges */}
										<div>
											<div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shadow-2xs border border-slate-100 mb-4">
												<Image
													src={getBlogImage(post.image_url, post.id)}
													alt={post.title}
													fill
													priority={index === 0}
													loading={index === 0 ? "eager" : "lazy"}
													className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
													sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
												/>

												{/* Badges on Image */}
												<div className="absolute top-3 left-3 flex items-center gap-1.5">
													<span
														className={`px-2.5 py-1 backdrop-blur-md text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs border ${getCategoryStyles(post.category)}`}
													>
														{post.category}
													</span>
													{post.is_headline && (
														<span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs">
															Featured
														</span>
													)}
												</div>

												{post.is_private && (
													<div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-xs">
														<Lock className="w-2.5 h-2.5" />
														<span>Protected</span>
													</div>
												)}

												{/* Reading Time Pill on Image Bottom-Right */}
												<div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-mono font-bold tracking-wide rounded-lg shadow-xs">
													<Clock className="w-3 h-3 text-slate-300" />
													<span>{getReadTime(post.content)}</span>
												</div>
											</div>

											{/* Date & Metadata Row */}
											<div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
												<Calendar className="w-3.5 h-3.5 text-slate-400" />
												<span>{formatDate(post.date)}</span>
											</div>

											{/* Article Title */}
											<h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
												{post.title}
											</h2>

											{/* Article Excerpt */}
											<p className="mt-2 text-xs sm:text-sm text-slate-500 font-normal leading-relaxed line-clamp-3">
												{post.description}
											</p>
										</div>

										{/* Bottom Action Footer */}
										<div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
											<span className="text-[11px] font-mono text-slate-400 font-medium">
												{getWordCount(post.content).toLocaleString()} words
											</span>

											<div className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
												<span>Read Article</span>
												<ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
											</div>
										</div>
									</Link>
								</motion.article>
							))}
						</div>

						{/* Infinite Scroll Sentinel & Loaders */}
						{hasMore && (
							<div className="pt-6 space-y-6 flex flex-col items-center">
								{isLoadingMore && (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 w-full">
										{[1, 2, 3].map((i) => (
											<div
												key={i}
												className="bg-white border border-slate-200/80 rounded-[2rem] p-4 sm:p-5 shadow-xs flex flex-col justify-between"
											>
												<div>
													<Skeleton className="w-full aspect-[16/10] rounded-2xl mb-4" />
													<Skeleton className="w-24 h-3.5 rounded-md mb-2" />
													<Skeleton className="w-full h-5 rounded-lg mb-2" />
													<Skeleton className="w-4/5 h-4 rounded-md" />
												</div>
												<div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
													<Skeleton className="w-16 h-3 rounded-md" />
													<Skeleton className="w-20 h-4 rounded-md" />
												</div>
											</div>
										))}
									</div>
								)}

								{/* Sentinel for IntersectionObserver */}
								<div ref={sentinelRef} className="h-4 w-full" />

								{/* Manual Trigger Button */}
								<button
									type="button"
									onClick={() => {
										setIsLoadingMore(true);
										setTimeout(() => {
											setVisibleCount((prev) => prev + PAGE_SIZE);
											setIsLoadingMore(false);
										}, 300);
									}}
									disabled={isLoadingMore}
									className="px-6 py-2.5 bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold rounded-xl shadow-xs transition-[background-color,border-color,color] flex items-center gap-2 cursor-pointer active:scale-95"
								>
									{isLoadingMore ? (
										<>
											<Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
											<span>Loading articles...</span>
										</>
									) : (
										<span>
											Load More Articles (
											{sortedBlogs.length - displayedBlogs.length} remaining)
										</span>
									)}
								</button>
							</div>
						)}

						{/* End of Archive Indicator */}
						{!hasMore && sortedBlogs.length > 0 && (
							<div className="pt-6 flex justify-center">
								<p className="text-xs font-mono font-medium text-slate-400">
									Showing all {sortedBlogs.length} articles
								</p>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
