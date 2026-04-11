import BlogForm from "@/components/blog/BlogForm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Edit3, Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase-server";

interface EditorPageProps {
	params: Promise<{
		id?: string[];
	}>;
}

/**
 * Server-side Admin check for the editor page.
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

export default async function BlogEditorPage({ params }: EditorPageProps) {
	const isAdmin = await checkAdmin();

	if (!isAdmin) {
		redirect("/unauthorized");
	}

	const resolvedParams = await params;
	const id = resolvedParams.id?.[0];

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
		<main className="min-h-screen bg-slate-50/50 pb-24">
			{/* Structural Header - Solid & High Contrast */}
			<div className="bg-white border-b border-slate-200 mb-10">
				<div className="max-w-6xl mx-auto px-6 py-10">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2">
							<div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
								{initialData ? (
									<Edit3 className="w-3.5 h-3.5" />
								) : (
									<Plus className="w-3.5 h-3.5" />
								)}
								Content Creation Engine
							</div>
							<h1 className="text-4xl font-black text-slate-900 tracking-tight">
								{initialData ? "Refine Article" : "New Publication"}
							</h1>
							<div className="flex items-center gap-2 text-xs font-medium text-slate-400">
								<Link
									href="/admin"
									className="hover:text-blue-600 transition-colors"
								>
									Admin
								</Link>
								<ChevronRight className="w-3 h-3 opacity-50" />
								<Link
									href="/admin/blog"
									className="hover:text-blue-600 transition-colors"
								>
									Manage Blog
								</Link>
								<ChevronRight className="w-3 h-3 opacity-50" />
								<span className="text-slate-900">
									{initialData ? "Edit" : "Draft"}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 shadow-sm">
							<ShieldCheck className="w-4 h-4" />
							<span className="text-[10px] font-black uppercase tracking-widest">
								Admin Verified
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto">
				<BlogForm initialData={initialData} />
			</div>
		</main>
	);
}
