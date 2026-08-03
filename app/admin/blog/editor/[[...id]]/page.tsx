import BlogForm from "@/features/blog/components/BlogForm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Edit3, Plus, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/core/supabase-server";
import { checkAdmin } from "@/features/auth/actions";

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
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32">
			{/* Structural Hero Header */}
			<div className="bg-slate-900 border-b border-slate-800 mb-10 pt-8 sm:pt-10 pb-10 sm:pb-12 text-white shadow-md">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-2 text-center md:text-left">
							<div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 font-extrabold text-xs uppercase tracking-wider">
								{initialData ? (
									<Edit3 className="w-4 h-4 text-indigo-400" />
								) : (
									<Plus className="w-4 h-4 text-indigo-400" />
								)}
								Content Creation Engine
							</div>
							<h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
								{initialData ? "Refine Article" : "New Publication"}
							</h1>
							<div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-slate-400">
								<Link
									href="/admin"
									className="!text-slate-300 hover:!text-white transition-colors !no-underline"
								>
									Admin
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-500" />
								<Link
									href="/admin/blog"
									className="!text-slate-300 hover:!text-white transition-colors !no-underline"
								>
									Manage Blog
								</Link>
								<ChevronRight className="w-3 h-3 text-slate-500" />
								<span className="text-white font-extrabold">
									{initialData ? "Edit" : "Draft"}
								</span>
							</div>
						</div>

						<div className="flex justify-center">
							<div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full shadow-xs">
								<ShieldCheck className="w-4 h-4 text-emerald-400" />
								<span className="text-[10px] font-extrabold uppercase tracking-wider">
									Admin Verified
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<BlogForm initialData={initialData} />
			</div>
		</main>
	);
}
