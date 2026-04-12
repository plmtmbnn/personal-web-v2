import Link from "next/link";
import { getBlogsAdmin } from "@/features/blog/actions";
import { Plus, ChevronRight, BookOpen } from "lucide-react";
import AdminBlogList from "@/features/blog/components/AdminBlogList";
import { createClient } from "@/lib/core/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
	title: "Blog Management | Admin Portal",
};

/**
 * Server-side Admin check for the page.
 */
async function checkAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return false;

	const { data: profile } = await supabase
		.from("profiles")
		.select("is_admin")
		.eq("id", user.id)
		.single();

	return !!profile?.is_admin;
}

export default async function AdminBlogPage() {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const blogs = await getBlogsAdmin();

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
						<AdminBlogList initialBlogs={blogs} />
					</div>
				</div>
			</div>
		</main>
	);
}
