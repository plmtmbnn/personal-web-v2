import Link from "next/link";
import { getBlogsAdmin, getBlogStats } from "@/features/blog/actions";
import { Plus, ChevronRight, BookOpen } from "lucide-react";
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
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	return (
		<main className="min-h-screen bg-slate-50/50 pb-24">
			{/* Structural Header - Solid & High Contrast */}
			<div className="bg-white border-b border-slate-200 mb-10">
				<div className="max-w-6xl mx-auto px-6 py-10">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
								<BookOpen className="w-3.5 h-3.5" />
								Knowledge Base Management
							</div>
							<h1 className="text-4xl font-black text-slate-900 tracking-tight">
								Blog Articles
							</h1>
							<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
								<Link
									href="/admin"
									className="hover:text-blue-600 transition-colors"
								>
									Admin Dashboard
								</Link>
								<ChevronRight className="w-3 h-3 opacity-50" />
								<span className="text-slate-900">Manage Blog</span>
							</div>
						</div>

						<Link
							href="/admin/blog/editor"
							className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white !no-underline rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
						>
							<Plus className="w-4 h-4 text-white" />
							<span className="text-white">Create New Post</span>
						</Link>
					</div>
				</div>
			</div>

			{/* Main Content Container - Solid Boundaries */}
			<div className="max-w-6xl mx-auto px-6">
				<div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
					<div className="p-1 bg-slate-50/50">
						<Suspense fallback={<BlogListSkeleton />}>
							<BlogListDataLoader searchParams={searchParams} />
						</Suspense>
					</div>
				</div>
			</div>
		</main>
	);
}

async function BlogListDataLoader({
	searchParams,
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

		const [{ blogs, totalCount }, blogStats] = await Promise.all([
			getBlogsAdmin({
				page: currentPage,
				search: currentSearch,
				status: currentStatus,
				sort: currentSort,
				is_headline: currentHeadline || undefined,
				category: currentCategory !== "all" ? currentCategory : undefined,
				limit: currentPageSize,
			}),
			getBlogStats(),
		]);

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
		<div className="flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden animate-pulse">
			{/* Stats Bar Skeleton */}
			<div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
				<div className="flex items-center gap-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="h-6 w-24 bg-slate-200 rounded-md" />
					))}
				</div>
			</div>

			{/* Filter Bar Skeleton */}
			<div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
				<div className="flex flex-col lg:flex-row items-center gap-4">
					<div className="h-10 bg-slate-200 rounded-xl flex-1 w-full" />
					<div className="flex gap-3 w-full lg:w-auto">
						<div className="h-10 w-28 bg-slate-200 rounded-xl" />
						<div className="h-10 w-36 bg-slate-200 rounded-xl" />
						<div className="h-10 w-28 bg-slate-200 rounded-xl" />
					</div>
				</div>
				<div className="flex items-center gap-2">
					<div className="h-4 w-12 bg-slate-200 rounded" />
					{[1, 2, 3, 4, 5].map((i) => (
						<div key={i} className="h-6 w-16 bg-slate-200 rounded-full" />
					))}
				</div>
			</div>

			{/* Table Skeleton */}
			<div className="overflow-x-auto">
				<table className="w-full text-left min-w-[1060px]">
					<thead className="bg-slate-50 border-b border-slate-100">
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
										<div className="w-12 h-12 rounded-lg bg-slate-200" />
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
