import React from "react";
import BlogForm from "@/components/blog/BlogForm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
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
	const id = resolvedParams.id?.[0]; // [[...id]] catch-all returns an array

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
		<div className="min-h-screen bg-background pb-20">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex items-center justify-between mb-8">
					<Link
						href="/admin/blog"
						className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-accent transition-all group"
					>
						<ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Dashboard
					</Link>

					<div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
						<ShieldCheck className="w-3.5 h-3.5" />
						<span className="text-[10px] font-black uppercase tracking-widest">
							Admin Verified
						</span>
					</div>
				</div>

				<BlogForm initialData={initialData} />
			</div>
		</div>
	);
}
