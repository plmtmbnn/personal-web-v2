"use client";

import {
	useState,
	useTransition,
	useEffect,
	useCallback,
	useMemo,
	useRef,
	Fragment,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Blog } from "@/features/blog/data";
import {
	deleteBlog,
	toggleBlogStatus,
	updateBlogMetadata,
	bulkToggleStatus,
	bulkDeleteBlogs,
	bulkUpdateCategory,
} from "@/features/blog/actions";
import {
	Edit,
	Trash2,
	Calendar,
	Search,
	Loader2,
	Eye,
	Inbox,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Sparkles,
	ImageIcon,
	ChevronDown,
	MoreHorizontal,
	X,
	Download,
	CheckSquare,
	Square,
	FileText,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import CustomModal from "@/features/shared/components/CustomModal";
import {
	AdminToastProvider,
	useAdminToast,
} from "@/features/shared/components/AdminToast";
import { getCategoryStyles } from "@/features/blog/utils";

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const PAGE_SIZE_OPTIONS = [5, 10, 25] as const;
const CATEGORIES = [
	"Tech",
	"Running",
	"Finance",
	"Investment",
	"General",
] as const;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface BlogStats {
	total: number;
	published: number;
	draft: number;
	headlines: number;
}

interface AdminBlogListProps {
	initialBlogs: Blog[];
	totalCount: number;
	currentPage: number;
	currentSearch: string;
	currentStatus: "all" | "published" | "draft";
	currentSort: "newest" | "oldest";
	currentHeadline: boolean;
	currentCategory: string;
	currentPageSize: number;
	blogStats: BlogStats;
}

// ─────────────────────────────────────────────
// Inner Component (uses toast context)
// ─────────────────────────────────────────────
function AdminBlogListInner({
	initialBlogs,
	totalCount,
	currentPage,
	currentSearch,
	currentStatus,
	currentSort,
	currentHeadline,
	currentCategory,
	currentPageSize,
	blogStats,
}: AdminBlogListProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { toast } = useAdminToast();
	const [isPending, startTransition] = useTransition();

	// ── Per-row action states ──────────────────
	const [isDeleting, setIsDeleting] = useState<string | null>(null);
	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [updatingMetadataId, setUpdatingMetadataId] = useState<string | null>(
		null,
	);
	const [expandedRow, setExpandedRow] = useState<string | null>(null);

	// ── Modals ────────────────────────────────
	const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
	const [bulkDeleteModal, setBulkDeleteModal] = useState(false);

	// ── Local search state ────────────────────
	const [searchQuery, setSearchQuery] = useState(currentSearch);
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// ── Bulk select ───────────────────────────
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [isBulkLoading, setIsBulkLoading] = useState(false);
	const [bulkCategoryValue, setBulkCategoryValue] = useState("Tech");

	// ── Derived ───────────────────────────────
	const hasActiveFilters =
		currentSearch !== "" ||
		currentStatus !== "all" ||
		currentHeadline ||
		currentCategory !== "all";

	const totalPages = Math.ceil(totalCount / currentPageSize);

	const allSelected =
		initialBlogs.length > 0 && initialBlogs.every((b) => selectedIds.has(b.id));
	const someSelected = selectedIds.size > 0;

	// ── URL param helper ──────────────────────
	const updateParams = useCallback(
		(updates: Record<string, string | null>) => {
			const params = new URLSearchParams(searchParams.toString());
			for (const [key, value] of Object.entries(updates)) {
				if (
					value === null ||
					value === "all" ||
					(key === "page" && value === "1") ||
					(key === "pageSize" && value === "5")
				) {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}
			startTransition(() => {
				router.push(`${pathname}?${params.toString()}`);
			});
		},
		[searchParams, router, pathname],
	);

	// ── Stable debounced search ───────────────
	useEffect(() => {
		if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
		searchDebounceRef.current = setTimeout(() => {
			if (searchQuery !== currentSearch) {
				updateParams({ search: searchQuery, page: "1" });
			}
		}, 500);
		return () => {
			if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
		};
	}, [searchQuery]); // intentionally limited — updateParams & currentSearch are stable for this effect

	// ── Clear selection on page change ────────
	useEffect(() => {
		setSelectedIds(new Set());
	}, [currentPage, currentSearch, currentStatus, currentCategory]);

	// ─────────────────────────────────────────
	// Per-row Actions
	// ─────────────────────────────────────────
	const handleToggleStatus = async (id: string, currentPublished: boolean) => {
		setTogglingId(id);
		startTransition(async () => {
			const result = await toggleBlogStatus(id, currentPublished);
			if (result.success) {
				toast(
					currentPublished ? "Post unpublished." : "Post published!",
					currentPublished ? "info" : "success",
				);
			} else {
				toast(`Error: ${result.message}`, "error");
			}
			setTogglingId(null);
		});
	};

	const handleUpdateMetadata = async (id: string, updates: Partial<Blog>) => {
		setUpdatingMetadataId(id);
		startTransition(async () => {
			const result = await updateBlogMetadata(id, updates);
			if (!result.success) {
				toast(`Error: ${result.message}`, "error");
			} else {
				toast("Metadata updated.", "success");
			}
			setUpdatingMetadataId(null);
		});
	};

	const confirmDelete = async () => {
		if (!deleteModalId) return;
		setIsDeleting(deleteModalId);
		const result = await deleteBlog(deleteModalId);
		if (result.success) {
			toast("Entry purged.", "success");
		} else {
			toast(`Error: ${result.message}`, "error");
		}
		setDeleteModalId(null);
		setIsDeleting(null);
	};

	// ─────────────────────────────────────────
	// Bulk Actions
	// ─────────────────────────────────────────
	const handleBulkPublish = async (publish: boolean) => {
		setIsBulkLoading(true);
		const result = await bulkToggleStatus([...selectedIds], publish);
		if (result.success) {
			toast(result.message, "success");
			setSelectedIds(new Set());
			startTransition(() => router.refresh());
		} else {
			toast(`Error: ${result.message}`, "error");
		}
		setIsBulkLoading(false);
	};

	const handleBulkDelete = async () => {
		setIsBulkLoading(true);
		const result = await bulkDeleteBlogs([...selectedIds]);
		if (result.success) {
			toast(result.message, "success");
			setSelectedIds(new Set());
			startTransition(() => router.refresh());
		} else {
			toast(`Error: ${result.message}`, "error");
		}
		setBulkDeleteModal(false);
		setIsBulkLoading(false);
	};

	const handleBulkCategory = async () => {
		setIsBulkLoading(true);
		const result = await bulkUpdateCategory(
			[...selectedIds],
			bulkCategoryValue,
		);
		if (result.success) {
			toast(result.message, "success");
			setSelectedIds(new Set());
			startTransition(() => router.refresh());
		} else {
			toast(`Error: ${result.message}`, "error");
		}
		setIsBulkLoading(false);
	};

	// ─────────────────────────────────────────
	// Select helpers
	// ─────────────────────────────────────────
	const toggleSelectAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(initialBlogs.map((b) => b.id)));
		}
	};

	const toggleSelectOne = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// ─────────────────────────────────────────
	// CSV Export
	// ─────────────────────────────────────────
	const handleExportCSV = () => {
		const headers = [
			"id",
			"title",
			"slug",
			"category",
			"published",
			"is_headline",
			"date",
			"description",
		];
		const rows = initialBlogs.map((b) => [
			b.id,
			`"${b.title.replace(/"/g, '""')}"`,
			b.slug,
			b.category,
			b.published,
			b.is_headline,
			b.date,
			`"${(b.description || "").replace(/"/g, '""')}"`,
		]);
		const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `blogs-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
		a.click();
		URL.revokeObjectURL(url);
		toast("CSV exported successfully.", "success");
	};

	// ─────────────────────────────────────────
	// Pagination helper
	// ─────────────────────────────────────────
	const pageNumbers = useMemo(() => {
		const pages: (number | "...")[] = [];
		const maxVisible = 5;
		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (currentPage <= 3) {
				pages.push(1, 2, 3, 4, "...", totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(
					1,
					"...",
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages,
				);
			} else {
				pages.push(
					1,
					"...",
					currentPage - 1,
					currentPage,
					currentPage + 1,
					"...",
					totalPages,
				);
			}
		}
		return pages;
	}, [currentPage, totalPages]);

	// ─────────────────────────────────────────
	// Showing X–Y of N guard
	// ─────────────────────────────────────────
	const showFrom =
		totalCount === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
	const showTo = Math.min(currentPage * currentPageSize, totalCount);

	// ─────────────────────────────────────────
	// Render
	// ─────────────────────────────────────────
	return (
		<div className="flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden text-slate-900">
			{/* ── Delete Single Modal ── */}
			<CustomModal
				isOpen={!!deleteModalId}
				onClose={() => setDeleteModalId(null)}
				onConfirm={confirmDelete}
				title="Purge Knowledge Entry"
				description="This action is irreversible. The entry will be permanently removed from the knowledge base and public view."
				variant="danger"
				confirmText="Confirm Purge"
				isLoading={!!isDeleting}
			/>

			{/* ── Bulk Delete Modal ── */}
			<CustomModal
				isOpen={bulkDeleteModal}
				onClose={() => setBulkDeleteModal(false)}
				onConfirm={handleBulkDelete}
				title={`Purge ${selectedIds.size} Entries?`}
				description="This is irreversible. All selected posts will be permanently removed."
				variant="danger"
				confirmText="Confirm Bulk Purge"
				isLoading={isBulkLoading}
			/>

			{/* ═══════════════════════════════════════
			    STATS BAR
			═══════════════════════════════════════ */}
			<div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
				<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
					{(
						[
							{
								label: "Total",
								value: blogStats.total,
								color: "text-slate-900",
							},
							{
								label: "Published",
								value: blogStats.published,
								color: "text-emerald-600",
							},
							{
								label: "Drafts",
								value: blogStats.draft,
								color: "text-amber-600",
							},
							{
								label: "Headlines",
								value: blogStats.headlines,
								color: "text-blue-600",
							},
						] as const
					).map(({ label, value, color }) => (
						<div key={label} className="flex items-center gap-2">
							<span className={`text-lg font-black ${color}`}>{value}</span>
							<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
								{label}
							</span>
							<span className="text-slate-200 text-lg font-light last:hidden">
								•
							</span>
						</div>
					))}

					{/* Export CSV */}
					<div className="ml-auto">
						<button
							onClick={handleExportCSV}
							className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-all shadow-sm"
						>
							<Download className="w-3 h-3" />
							Export CSV
						</button>
					</div>
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    FILTER BAR
			═══════════════════════════════════════ */}
			<div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
				{/* Row 1: Search + Controls */}
				<div className="flex flex-col lg:flex-row items-center gap-4">
					{/* Search */}
					<div className="relative flex-1 w-full">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
						<input
							type="text"
							placeholder="Search by title or description..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						)}
					</div>

					<div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
						{/* Headlines filter */}
						<button
							onClick={() =>
								updateParams({
									headline: !currentHeadline ? "true" : null,
									page: "1",
								})
							}
							className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
								currentHeadline
									? "border-blue-500 text-blue-600 ring-4 ring-blue-500/10"
									: "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
							}`}
						>
							<Sparkles
								className={`w-3.5 h-3.5 ${currentHeadline ? "fill-blue-600" : ""}`}
							/>
							Headlines
						</button>

						{/* Status filter */}
						<div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
							{(["all", "published", "draft"] as const).map((s) => (
								<button
									key={s}
									onClick={() => updateParams({ status: s, page: "1" })}
									className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
										currentStatus === s
											? "bg-slate-900 text-white shadow-sm"
											: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
									}`}
								>
									{s}
								</button>
							))}
						</div>

						{/* Sort toggle */}
						<button
							onClick={() =>
								updateParams({
									sort: currentSort === "newest" ? "oldest" : "newest",
									page: "1",
								})
							}
							className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
						>
							<ArrowUpDown className="w-3.5 h-3.5" />
							{currentSort === "newest" ? "Newest First" : "Oldest First"}
						</button>

						{/* Clear all filters */}
						<AnimatePresence>
							{hasActiveFilters && (
								<motion.button
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									onClick={() => {
										setSearchQuery("");
										updateParams({
											search: null,
											status: null,
											headline: null,
											category: null,
											page: "1",
										});
									}}
									className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-100 transition-all shadow-sm"
								>
									<X className="w-3 h-3" />
									Clear
								</motion.button>
							)}
						</AnimatePresence>
					</div>
				</div>

				{/* Row 2: Category Filter Chips */}
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mr-1">
						Category
					</span>
					{(["all", ...CATEGORIES] as const).map((cat) => (
						<button
							key={cat}
							onClick={() => updateParams({ category: cat, page: "1" })}
							className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
								currentCategory === cat
									? getCategoryStyles(cat) +
										" ring-2 ring-offset-1 ring-current/20 shadow-sm"
									: "bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
							}`}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			{/* ═══════════════════════════════════════
			    BULK ACTION BAR
			═══════════════════════════════════════ */}
			<AnimatePresence>
				{someSelected && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="px-6 py-3 bg-blue-50 border-b border-blue-100 flex flex-wrap items-center gap-3">
							<span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
								{selectedIds.size} selected
							</span>
							<div className="h-4 w-px bg-blue-200" />

							<button
								onClick={() => handleBulkPublish(true)}
								disabled={isBulkLoading}
								className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
							>
								Publish All
							</button>
							<button
								onClick={() => handleBulkPublish(false)}
								disabled={isBulkLoading}
								className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all disabled:opacity-50"
							>
								Unpublish All
							</button>

							{/* Bulk category */}
							<div className="flex items-center gap-2 bg-white border border-blue-200 rounded-lg px-2 py-1">
								<select
									value={bulkCategoryValue}
									onChange={(e) => setBulkCategoryValue(e.target.value)}
									className="text-[10px] font-black uppercase tracking-widest text-slate-700 outline-none bg-transparent cursor-pointer"
								>
									{CATEGORIES.map((c) => (
										<option key={c} value={c}>
											{c}
										</option>
									))}
								</select>
								<button
									onClick={handleBulkCategory}
									disabled={isBulkLoading}
									className="px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
								>
									Apply
								</button>
							</div>

							<button
								onClick={() => setBulkDeleteModal(true)}
								disabled={isBulkLoading}
								className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all disabled:opacity-50 ml-auto"
							>
								<span className="flex items-center gap-1.5">
									<Trash2 className="w-3 h-3" />
									Delete {selectedIds.size}
								</span>
							</button>

							{isBulkLoading && (
								<Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ═══════════════════════════════════════
			    TABLE
			═══════════════════════════════════════ */}
			<div className="overflow-x-auto custom-scrollbar relative">
				{/* Loading Overlay */}
				<AnimatePresence>
					{isPending && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4"
						>
							<div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
								<Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
							</div>
							<p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
								Synchronizing...
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				<table className="w-full text-left min-w-[1060px]">
					<thead className="bg-slate-50 border-b border-slate-100">
						<tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
							{/* Checkbox col */}
							<th className="px-5 py-4 w-12">
								<button
									onClick={toggleSelectAll}
									className="text-slate-400 hover:text-blue-600 transition-colors"
									title={allSelected ? "Deselect all" : "Select all"}
								>
									{allSelected ? (
										<CheckSquare className="w-4 h-4 text-blue-600" />
									) : (
										<Square className="w-4 h-4" />
									)}
								</button>
							</th>
							<th className="px-4 py-4 text-center w-16">#</th>
							<th className="px-6 py-4">Knowledge Entry</th>
							<th className="px-6 py-4">Category</th>
							<th className="px-6 py-4 text-center">Headline</th>
							<th className="px-6 py-4 text-center">Status</th>
							<th className="px-6 py-4">Publication</th>
							<th className="px-6 py-4 text-right sticky right-0 bg-slate-50 z-20 shadow-[-12px_0_20px_-12px_rgba(0,0,0,0.08)]">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{initialBlogs.length > 0 ? (
							initialBlogs.map((blog, idx) => {
								const isExpanded = expandedRow === blog.id;
								const isSelected = selectedIds.has(blog.id);
								return (
									<Fragment key={blog.id}>
										<tr
											key={String(blog.id)}
											className={`transition-colors group ${
												isSelected ? "bg-blue-50/40" : "hover:bg-blue-50/20"
											}`}
										>
											{/* Checkbox */}
											<td className="px-5 py-5">
												<button
													onClick={() => toggleSelectOne(blog.id)}
													className="text-slate-400 hover:text-blue-600 transition-colors"
												>
													{isSelected ? (
														<CheckSquare className="w-4 h-4 text-blue-600" />
													) : (
														<Square className="w-4 h-4" />
													)}
												</button>
											</td>

											{/* Row number */}
											<td className="px-4 py-5 text-center text-[10px] font-black text-slate-300">
												{(currentPage - 1) * currentPageSize + idx + 1}
											</td>

											{/* Title + slug + image */}
											<td className="px-6 py-5">
												<div className="flex items-center gap-4">
													{/* Thumbnail */}
													<div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
														{blog.image_url ? (
															<Image
																src={blog.image_url}
																alt={blog.title}
																fill
																className="object-cover"
																sizes="48px"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-slate-300">
																<ImageIcon className="w-5 h-5" />
															</div>
														)}
													</div>

													<div className="flex flex-col min-w-0">
														<div className="flex items-center gap-2">
															<Link
																href={`/admin/blog/editor/${blog.id}`}
																className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate"
															>
																{blog.title}
															</Link>
														</div>
														{blog.description && (
															<p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">
																{blog.description}
															</p>
														)}
														<span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate lowercase opacity-60">
															/{blog.slug}
														</span>
													</div>
												</div>
											</td>

											{/* Category select */}
											<td className="px-6 py-5">
												<div className="relative inline-block group/select">
													<select
														disabled={!!updatingMetadataId}
														value={blog.category || "General"}
														onChange={(e) =>
															handleUpdateMetadata(blog.id, {
																category: e.target.value,
															})
														}
														className={`appearance-none px-3 py-1.5 pr-8 border text-[9px] font-black uppercase tracking-widest rounded-full cursor-pointer transition-all outline-none focus:ring-2 focus:ring-blue-500/20 ${getCategoryStyles(blog.category)} disabled:opacity-50`}
													>
														{CATEGORIES.map((cat) => (
															<option key={cat} value={cat}>
																{cat}
															</option>
														))}
													</select>
													<ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
													{updatingMetadataId === blog.id && (
														<div className="absolute -right-6 top-1/2 -translate-y-1/2">
															<Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
														</div>
													)}
												</div>
											</td>

											{/* Headline toggle */}
											<td className="px-6 py-5">
												<div className="flex justify-center">
													<button
														onClick={() =>
															handleUpdateMetadata(blog.id, {
																is_headline: !blog.is_headline,
															})
														}
														className={`p-2 rounded-xl border transition-all duration-300 ${
															blog.is_headline
																? "bg-blue-50 border-blue-100 text-blue-600 shadow-sm"
																: "bg-white border-slate-100 text-slate-300 hover:text-blue-400 hover:bg-slate-50"
														}`}
														title={
															blog.is_headline
																? "Headline Active"
																: "Set as Headline"
														}
													>
														<Sparkles
															className={`w-4 h-4 ${blog.is_headline ? "fill-blue-600" : ""}`}
														/>
													</button>
												</div>
											</td>

											{/* Publish toggle */}
											<td className="px-6 py-5">
												<div className="flex items-center justify-center gap-3">
													<button
														onClick={() =>
															handleToggleStatus(blog.id, blog.published)
														}
														disabled={togglingId === blog.id}
														aria-label={
															blog.published
																? `Unpublish "${blog.title}"`
																: `Publish "${blog.title}"`
														}
														className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
															blog.published ? "bg-emerald-500" : "bg-slate-200"
														}`}
													>
														<span
															className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
																blog.published
																	? "translate-x-6"
																	: "translate-x-1"
															}`}
														/>
														{togglingId === blog.id && (
															<div className="absolute -right-6">
																<Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
															</div>
														)}
													</button>
												</div>
											</td>

											{/* Date with relative tooltip */}
											<td className="px-6 py-5">
												<div
													className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap group/date cursor-default"
													title={formatDistanceToNow(new Date(blog.date), {
														addSuffix: true,
													})}
												>
													<Calendar className="w-3.5 h-3.5 opacity-40" />
													<span className="group-hover/date:hidden">
														{format(new Date(blog.date), "MMM d, yyyy")}
													</span>
													<span className="hidden group-hover/date:inline text-slate-400 text-[10px] font-bold">
														{formatDistanceToNow(new Date(blog.date), {
															addSuffix: true,
														})}
													</span>
												</div>
											</td>

											<td
												className={`px-6 py-5 sticky right-0 z-10 transition-colors shadow-[-12px_0_20px_-12px_rgba(0,0,0,0.08)] ${
													isSelected
														? "bg-blue-50/40"
														: "bg-white group-hover:bg-blue-50/20"
												}`}
											>
												<div className="flex items-center justify-end gap-1">
													{/* Expand row preview */}
													<button
														onClick={() =>
															setExpandedRow(isExpanded ? null : blog.id)
														}
														className={`p-2 rounded-lg transition-all ${
															isExpanded
																? "text-blue-600 bg-blue-50"
																: "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
														}`}
														title="Preview"
													>
														<FileText className="w-4 h-4" />
													</button>
													<Link
														href={`/blog/${blog.slug}`}
														target="_blank"
														className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
														title="View Live"
													>
														<Eye className="w-4 h-4" />
													</Link>
													<Link
														href={`/admin/blog/editor/${blog.id}`}
														className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
														title="Edit Entry"
													>
														<Edit className="w-4 h-4" />
													</Link>
													<button
														onClick={() => setDeleteModalId(blog.id)}
														className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
														title="Purge"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>

										{/* ── Expandable Preview Row ── */}
										<AnimatePresence>
											{isExpanded && (
												<motion.tr
													key={`preview-${blog.id}`}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
												>
													<td colSpan={8} className="px-0 py-0">
														<motion.div
															initial={{ height: 0 }}
															animate={{ height: "auto" }}
															exit={{ height: 0 }}
															transition={{ duration: 0.2, ease: "easeInOut" }}
															className="overflow-hidden"
														>
															<div className="px-6 py-5 bg-slate-50/70 border-t border-b border-slate-100 flex gap-6">
																{blog.image_url && (
																	<div className="relative w-28 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
																		<Image
																			src={blog.image_url}
																			alt={blog.title}
																			fill
																			className="object-cover"
																			sizes="112px"
																		/>
																	</div>
																)}
																<div className="flex flex-col gap-1.5 min-w-0">
																	<p className="text-xs font-bold text-slate-700">
																		{blog.title}
																	</p>
																	{blog.description ? (
																		<p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
																			{blog.description}
																		</p>
																	) : (
																		<p className="text-xs text-slate-400 italic">
																			No description provided.
																		</p>
																	)}
																	<div className="flex items-center gap-3 mt-1">
																		<span
																			className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getCategoryStyles(blog.category)}`}
																		>
																			{blog.category}
																		</span>
																		<span
																			className={`text-[9px] font-black uppercase tracking-widest ${blog.published ? "text-emerald-600" : "text-amber-600"}`}
																		>
																			{blog.published ? "Published" : "Draft"}
																		</span>
																		{blog.is_headline && (
																			<span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-blue-600">
																				<Sparkles className="w-3 h-3 fill-blue-600" />
																				Headline
																			</span>
																		)}
																	</div>
																</div>
															</div>
														</motion.div>
													</td>
												</motion.tr>
											)}
										</AnimatePresence>
									</Fragment>
								);
							})
						) : (
							<tr>
								<td colSpan={8} className="px-6 py-24 text-center">
									<div className="flex flex-col items-center gap-4">
										<div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
											<Inbox className="w-6 h-6" />
										</div>
										<p className="text-slate-400 font-bold text-sm">
											No entries found for this configuration.
										</p>
										{hasActiveFilters && (
											<button
												onClick={() => {
													setSearchQuery("");
													updateParams({
														search: null,
														status: null,
														headline: null,
														category: null,
														page: "1",
													});
												}}
												className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline"
											>
												Clear all filters
											</button>
										)}
									</div>
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* ═══════════════════════════════════════
			    PAGINATION FOOTER
			═══════════════════════════════════════ */}
			<div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
				{/* Left: count + page size */}
				<div className="flex items-center gap-4">
					<div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
						{totalCount === 0 ? (
							<span className="text-slate-900">0</span>
						) : (
							<>
								Showing <span className="text-slate-900">{showFrom}</span> to{" "}
								<span className="text-slate-900">{showTo}</span>
							</>
						)}
						<span className="mx-2 opacity-30">•</span>
						<span className="text-slate-900">{totalCount}</span> Total
					</div>

					{/* Page size selector */}
					<div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
						{PAGE_SIZE_OPTIONS.map((size) => (
							<button
								key={size}
								onClick={() =>
									updateParams({ pageSize: String(size), page: "1" })
								}
								className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
									currentPageSize === size
										? "bg-slate-900 text-white"
										: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
								}`}
							>
								{size}
							</button>
						))}
					</div>
				</div>

				{/* Right: page buttons */}
				<div className="flex items-center gap-1">
					<button
						onClick={() => updateParams({ page: String(currentPage - 1) })}
						disabled={currentPage <= 1 || isPending}
						className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-sm mr-2"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>

					<div className="flex items-center gap-1">
						{pageNumbers.map((page, idx) => {
							if (page === "...") {
								return (
									<div
										key={`dots-${idx}`}
										className="w-10 h-10 flex items-center justify-center text-slate-300"
									>
										<MoreHorizontal className="w-4 h-4" />
									</div>
								);
							}
							const isActive = page === currentPage;
							return (
								<button
									key={`page-${page}`}
									onClick={() => updateParams({ page: String(page) })}
									disabled={isPending}
									className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all shadow-sm ${
										isActive
											? "bg-blue-600 text-white shadow-blue-200"
											: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
									}`}
								>
									{page}
								</button>
							);
						})}
					</div>

					<button
						onClick={() => updateParams({ page: String(currentPage + 1) })}
						disabled={currentPage >= totalPages || isPending}
						className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-sm ml-2"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}

// ─────────────────────────────────────────────
// Exported wrapper (provides toast context)
// ─────────────────────────────────────────────
export default function AdminBlogList(props: AdminBlogListProps) {
	return (
		<AdminToastProvider>
			<AdminBlogListInner {...props} />
		</AdminToastProvider>
	);
}
