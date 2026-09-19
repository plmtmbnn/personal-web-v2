import Link from "next/link";
import { getBlogsAdmin, getBlogStats } from "@/features/blog/actions";
import {
	Plus,
	ChevronRight,
	BookOpen,
	ArrowUpRight,
	Globe,
	FileEdit,
	Star,
	Layers,
} from "lucide-react";
import DynamicAdminBlogList from "@/features/blog/components/DynamicAdminBlogList";
import { redirect } from "next/navigation";
import { checkAdmin } from "@/features/auth/actions";
import { Suspense } from "react";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/shared/metadata";
import ErrorStateFallback from "./ErrorFallback";

export const metadata: Metadata = createMetadata({
	title: "Blog Management | Admin Portal",
	description: "Manage, create, and refine entries in the knowledge base.",
	path: "/admin/blog",
});

export const dynamic = "force-dynamic";

interface AdminBlogPageProps {
	searchParams: Promise<{
		page?: string;
		search?: string;
		status?: string;
		sort?: string;
		headline?: string;
		category?: string;
		pageSize?: string;
	}>;
}

export default async function AdminBlogPage({
	searchParams,
}: AdminBlogPageProps) {
	const [isAdmin, blogStats] = await Promise.all([
		checkAdmin(),
		getBlogStats(),
	]);

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const params = await searchParams;
	const currentStatus = params.status || "all";
	const currentHeadline = params.headline === "true";

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
				{/* Top Floating Header Card */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
						<div className="flex items-start sm:items-center gap-4">
							<div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
								<BookOpen className="w-6 h-6" />
							</div>
							<div className="space-y-1.5">
								<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
									<BookOpen className="w-3.5 h-3.5 text-blue-600" />
									<span>Knowledge Base Management</span>
									<span className="w-1 h-1 rounded-full bg-blue-400" />
									<span className="text-[11px] font-semibold text-blue-600 lowercase tracking-normal">
										publishing console
									</span>
								</div>
								<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
									Blog Articles
								</h1>
								<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
									<Link
										href="/admin"
										className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
									>
										Admin Dashboard
									</Link>
									<ChevronRight className="w-3 h-3 text-slate-400" />
									<span className="text-slate-900 font-bold">Manage Blog</span>
								</div>
							</div>
						</div>

						<div className="flex items-center gap-2.5 sm:gap-3 self-start sm:self-center">
							<Link
								href="/blog"
								target="_blank"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 hover:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-[background-color,color] active:scale-95 cursor-pointer !no-underline group"
								title="Open public blog reader in new tab"
							>
								<span>View Public Blog</span>
								<ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
							</Link>

							<Link
								href="/admin/blog/editor"
								className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 !text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-[background-color] active:scale-95 cursor-pointer !no-underline group"
							>
								<Plus className="w-4 h-4 text-white stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
								<span className="!text-white">Create New Post</span>
							</Link>
						</div>
					</div>
				</div>

				{/* Interactive KPI Telemetry Strip */}
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
					{/* Total Entries */}
					<Link
						href="/admin/blog"
						className={`p-4 rounded-2xl border transition-all cursor-pointer !no-underline flex flex-col justify-between group min-h-[110px] ${
							currentStatus === "all" && !currentHeadline
								? "bg-white border-slate-300 shadow-xs ring-2 ring-slate-900/5"
								: "bg-white/80 border-slate-200/70 hover:bg-white hover:border-slate-300 shadow-2xs"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
								Total Articles
							</span>
							<div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 shadow-2xs">
								<Layers className="w-3.5 h-3.5" />
							</div>
						</div>
						<div>
							<p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
								{blogStats.total}
							</p>
							<p className="text-[11px] font-medium text-slate-400 mt-0.5">
								Knowledge repository
							</p>
						</div>
					</Link>

					{/* Published */}
					<Link
						href="/admin/blog?status=published"
						className={`p-4 rounded-2xl border transition-all cursor-pointer !no-underline flex flex-col justify-between group min-h-[110px] ${
							currentStatus === "published" && !currentHeadline
								? "bg-emerald-50/40 border-emerald-300 shadow-xs ring-2 ring-emerald-500/10"
								: "bg-white/80 border-slate-200/70 hover:bg-white hover:border-emerald-200 shadow-2xs"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
								Published
							</span>
							<div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
								<Globe className="w-3.5 h-3.5" />
							</div>
						</div>
						<div>
							<p className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">
								{blogStats.published}
							</p>
							<p className="text-[11px] font-medium text-emerald-600/90 mt-0.5">
								Live on public web
							</p>
						</div>
					</Link>

					{/* Drafts */}
					<Link
						href="/admin/blog?status=draft"
						className={`p-4 rounded-2xl border transition-all cursor-pointer !no-underline flex flex-col justify-between group min-h-[110px] ${
							currentStatus === "draft" && !currentHeadline
								? "bg-amber-50/40 border-amber-300 shadow-xs ring-2 ring-amber-500/10"
								: "bg-white/80 border-slate-200/70 hover:bg-white hover:border-amber-200 shadow-2xs"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
								Drafts
							</span>
							<div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs">
								<FileEdit className="w-3.5 h-3.5" />
							</div>
						</div>
						<div>
							<p className="text-2xl sm:text-3xl font-black text-amber-950 tracking-tight">
								{blogStats.draft}
							</p>
							<p className="text-[11px] font-medium text-amber-600/90 mt-0.5">
								In-progress revisions
							</p>
						</div>
					</Link>

					{/* Headlines */}
					<Link
						href="/admin/blog?headline=true"
						className={`p-4 rounded-2xl border transition-all cursor-pointer !no-underline flex flex-col justify-between group min-h-[110px] ${
							currentHeadline
								? "bg-blue-50/40 border-blue-300 shadow-xs ring-2 ring-blue-500/10"
								: "bg-white/80 border-slate-200/70 hover:bg-white hover:border-blue-200 shadow-2xs"
						}`}
					>
						<div className="flex items-center justify-between mb-2">
							<span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
								Headlines
							</span>
							<div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
								<Star className="w-3.5 h-3.5 fill-blue-600/20" />
							</div>
						</div>
						<div>
							<p className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
								{blogStats.headlines}
							</p>
							<p className="text-[11px] font-medium text-blue-600/90 mt-0.5">
								Pinned hero showcases
							</p>
						</div>
					</Link>
				</div>

				{/* Main Content Container - Single Canonical Floating Card */}
				<Suspense fallback={<BlogListSkeleton />}>
					<BlogListDataLoader
						searchParams={searchParams}
						blogStats={blogStats}
					/>
				</Suspense>
			</div>
		</main>
	);
}

async function BlogListDataLoader({
	searchParams,
	blogStats,
}: {
	searchParams: Promise<{
		page?: string;
		search?: string;
		status?: string;
		sort?: string;
		headline?: string;
		category?: string;
		pageSize?: string;
	}>;
	blogStats: {
		total: number;
		published: number;
		draft: number;
		headlines: number;
	};
}) {
	try {
		const params = await searchParams;
		const currentPage = Number(params.page) || 1;
		const currentSearch = params.search || "";
		const currentStatus =
			(params.status as "all" | "published" | "draft") || "all";
		const currentSort = (params.sort as "newest" | "oldest") || "newest";
		const currentHeadline = params.headline === "true";
		const currentCategory = params.category || "all";
		const currentPageSize = Number(params.pageSize) || 5;

		const { blogs, totalCount } = await getBlogsAdmin({
			page: currentPage,
			search: currentSearch,
			status: currentStatus,
			sort: currentSort,
			is_headline: currentHeadline || undefined,
			category: currentCategory !== "all" ? currentCategory : undefined,
			limit: currentPageSize,
		});

		return (
			<DynamicAdminBlogList
				initialBlogs={blogs}
				totalCount={totalCount}
				currentPage={currentPage}
				currentSearch={currentSearch}
				currentStatus={currentStatus}
				currentSort={currentSort}
				currentHeadline={currentHeadline}
				currentCategory={currentCategory}
				currentPageSize={currentPageSize}
				blogStats={blogStats}
			/>
		);
	} catch (error) {
		console.error("Failed to load admin blog list:", error);
		return <ErrorStateFallback />;
	}
}

function BlogListSkeleton() {
	return (
		<div className="flex flex-col bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden animate-pulse">
			{/* Stats Bar Skeleton */}
			<div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						{[1, 2, 3, 4].map((i) => (
							<div key={i} className="h-7 w-20 bg-slate-200 rounded-xl" />
						))}
					</div>
					<div className="h-8 w-28 bg-slate-200 rounded-xl" />
				</div>
			</div>

			{/* Filter Bar Skeleton */}
			<div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
				<div className="flex flex-col sm:flex-row items-center gap-4">
					<div className="h-10 bg-slate-200 rounded-xl flex-1 w-full" />
					<div className="h-10 w-32 bg-slate-200 rounded-xl" />
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-14 bg-slate-200 rounded" />
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-7 w-16 bg-slate-200 rounded-xl" />
					))}
				</div>
			</div>

			{/* Table Skeleton */}
			<div className="overflow-x-auto">
				<table className="w-full text-left min-w-[1060px]">
					<thead className="bg-slate-50/80 border-b border-slate-100">
						<tr>
							<th className="px-5 py-4 w-12">
								<div className="h-4 w-4 bg-slate-200 rounded" />
							</th>
							<th className="px-4 py-4 w-16">
								<div className="h-4 w-6 bg-slate-200 rounded mx-auto" />
							</th>
							<th className="px-6 py-4">
								<div className="h-4 w-32 bg-slate-200 rounded" />
							</th>
							<th className="px-6 py-4">
								<div className="h-4 w-20 bg-slate-200 rounded" />
							</th>
							<th className="px-6 py-4 text-center">
								<div className="h-4 w-16 bg-slate-200 rounded mx-auto" />
							</th>
							<th className="px-6 py-4 text-center">
								<div className="h-4 w-16 bg-slate-200 rounded mx-auto" />
							</th>
							<th className="px-6 py-4">
								<div className="h-4 w-24 bg-slate-200 rounded" />
							</th>
							<th className="px-6 py-4 text-right">
								<div className="h-4 w-16 bg-slate-200 rounded ml-auto" />
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100">
						{[1, 2, 3, 4, 5].map((row) => (
							<tr key={row}>
								<td className="px-5 py-5">
									<div className="h-4 w-4 bg-slate-200 rounded" />
								</td>
								<td className="px-4 py-5">
									<div className="h-4 w-4 bg-slate-200 rounded mx-auto" />
								</td>
								<td className="px-6 py-5">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 rounded-xl bg-slate-200" />
										<div className="space-y-2">
											<div className="h-4 w-48 bg-slate-200 rounded" />
											<div className="h-3 w-32 bg-slate-200 rounded" />
										</div>
									</div>
								</td>
								<td className="px-6 py-5">
									<div className="h-6 w-20 bg-slate-200 rounded-full" />
								</td>
								<td className="px-6 py-5">
									<div className="h-6 w-12 bg-slate-200 rounded-full mx-auto" />
								</td>
								<td className="px-6 py-5">
									<div className="h-6 w-16 bg-slate-200 rounded-full mx-auto" />
								</td>
								<td className="px-6 py-5">
									<div className="space-y-1">
										<div className="h-3.5 w-24 bg-slate-200 rounded" />
										<div className="h-3 w-16 bg-slate-200 rounded" />
									</div>
								</td>
								<td className="px-6 py-5">
									<div className="h-8 w-24 bg-slate-200 rounded-lg ml-auto" />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
