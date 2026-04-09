import React from "react";
import Link from "next/link";
import { getBlogsAdmin } from "@/lib/actions/blog";
import { Plus, LayoutGrid, Search } from "lucide-react";
import AdminBlogList from "@/components/blog/AdminBlogList";
import { createClient } from "@/utils/supabase-server";
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
		<div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-10 min-h-screen">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
				<div>
					<h1 className="text-4xl font-black tracking-tighter text-foreground">
						Blog Management
					</h1>
					<p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em] mt-2 flex items-center gap-2">
						<LayoutGrid className="w-3 h-3" /> Dashboard • Content Control
					</p>
				</div>

				<Link
					href="/admin/blog/editor"
					className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-2xl font-semibold shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
				>
					<Plus className="w-5 h-5" />
					Create New Post
				</Link>
			</div>

			<div className="glass-card rounded-[2.5rem] border-2 border-white/5 shadow-2xl overflow-hidden bg-background-secondary/10 backdrop-blur-md">
				<AdminBlogList initialBlogs={blogs} />
			</div>
		</div>
	);
}
