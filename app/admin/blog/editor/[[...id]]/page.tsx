import BlogForm from "@/features/blog/components/BlogForm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
	ShieldCheck,
	Edit3,
	Plus,
	ChevronRight,
	ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/core/supabase-server";
import { checkAdmin } from "@/features/auth/actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Blog Editor | Admin Portal",
	description: "Create and refine entries in the knowledge base.",
};

interface EditorPageProps {
	params: Promise<{
		id?: string[];
	}>;
}

export default async function BlogEditorPage({ params }: EditorPageProps) {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const resolvedParams = await params;
	const rawId = resolvedParams.id?.[0];
	const id = rawId === "new" ? undefined : rawId;

	let initialData = null;

	if (id) {
		const supabase = await createClient();
		const { data: blog, error } = await supabase
			.from("blogs")
			.select("*")
			.eq("id", id)
			.single();

		if (error || !blog) {
			notFound();
		}
		initialData = blog;
	}

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pt-20 sm:pt-24 pb-32 sm:pb-36">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Top Floating Header Card */}
				<div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs mb-6 sm:mb-8">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
						<div className="space-y-1.5 sm:space-y-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-xs font-bold uppercase tracking-wider">
								{initialData ? (
									<Edit3 className="w-3.5 h-3.5 text-blue-600" />
								) : (
									<Plus className="w-3.5 h-3.5 text-blue-600" />
								)}
								<span>Content Creation Engine</span>
								<span className="w-1 h-1 rounded-full bg-blue-400" />
								<span className="text-[11px] font-semibold text-blue-600 lowercase tracking-normal">
									{initialData ? "edit mode" : "new draft"}
								</span>
							</div>

							<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
								{initialData ? "Refine Article" : "New Publication"}
							</h1>

							<div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/admin"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Admin Dashboard
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<Link
									href="/admin/blog"
									className="!text-slate-500 hover:!text-slate-900 transition-colors !no-underline"
								>
									Manage Blog
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-400" />
								<span className="text-slate-900 font-bold">
									{initialData ? "Edit" : "Draft"}
								</span>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<Link
								href="/admin/blog"
								className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer !no-underline"
							>
								<ArrowLeft className="w-4 h-4 text-slate-600" />
								<span>Back to Blog</span>
							</Link>
							<div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200/80 text-emerald-700 rounded-xl shadow-2xs">
								<ShieldCheck className="w-4 h-4 text-emerald-600" />
								<span className="text-[10px] font-extrabold uppercase tracking-wider">
									Admin Verified
								</span>
							</div>
						</div>
					</div>
				</div>

				<BlogForm initialData={initialData} />
			</div>
		</main>
	);
}
