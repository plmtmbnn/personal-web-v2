"use server";

import { createClient } from "@/lib/core/supabase-server";
import { revalidatePath } from "next/cache";
import type { Blog } from "@/features/blog/data";
import { checkAdmin } from "@/features/auth/actions";

export type ActionResponse<T = any> = {
	success: boolean;
	message: string;
	data?: T;
	error?: any;
};

/**
 * Utility to generate a URL-friendly slug.
 */
function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w-]+/g, "") // Remove all non-word chars
		.replace(/--+/g, "-"); // Replace multiple - with single -
}

/**
 * Fetch blogs for admin with filtering, sorting, and pagination.
 */
export async function getBlogsAdmin(
	params: {
		search?: string;
		status?: "all" | "published" | "draft";
		is_headline?: boolean;
		category?: string;
		sort?: "newest" | "oldest";
		page?: number;
		limit?: number;
	} = {},
): Promise<{ blogs: Blog[]; totalCount: number }> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		throw new Error("Unauthorized");
	}

	const {
		search = "",
		status = "all",
		is_headline,
		category,
		sort = "newest",
		page = 1,
		limit = 5,
	} = params;

	const supabase = await createClient();
	let query = supabase.from("blogs").select("*", { count: "exact" });

	// Filtering by search
	if (search) {
		query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
	}

	// Filtering by status
	if (status === "published") {
		query = query.eq("published", true);
	} else if (status === "draft") {
		query = query.eq("published", false);
	}

	// Filtering by headline
	if (is_headline !== undefined) {
		query = query.eq("is_headline", is_headline);
	}

	// Filtering by category
	if (category && category !== "all") {
		query = query.eq("category", category);
	}

	// Sorting
	query = query.order("created_at", { ascending: sort === "oldest" });

	// Pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;
	query = query.range(from, to);

	const { data, error, count } = await query;

	if (error) {
		console.error("Error fetching admin blogs:", error);
		return { blogs: [], totalCount: 0 };
	}

	return {
		blogs: data as Blog[],
		totalCount: count || 0,
	};
}

/**
 * Update specific blog metadata fields (category, is_headline, etc.)
 */
export async function updateBlogMetadata(
	id: string,
	updates: Partial<Blog>,
): Promise<ActionResponse> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized" };
	}

	const supabase = await createClient();

	try {
		const { error } = await supabase.from("blogs").update(updates).eq("id", id);

		if (error) {
			console.error("Supabase error updating blog metadata:", error);
			return { success: false, message: error.message };
		}

		revalidatePath("/blog");
		revalidatePath("/admin/blog");

		return { success: true, message: "Updated successfully" };
	} catch (error: any) {
		return { success: false, message: error.message || "An error occurred" };
	}
}

/**
 * Toggle the published status of a blog post.
 */
export async function toggleBlogStatus(
	id: string,
	currentStatus: boolean,
): Promise<ActionResponse> {
	return updateBlogMetadata(id, { published: !currentStatus });
}

/**
 * Create or Update a blog post (Upsert).
 */
export async function saveBlog(
	formData: Partial<Blog>,
): Promise<ActionResponse<Blog>> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized" };
	}

	const supabase = await createClient();

	const title = formData.title || "Untitled Blog";
	const slug = formData.slug || slugify(title);

	const blogData = {
		title,
		slug,
		description: formData.description || "",
		content: formData.content || "",
		date: formData.date || new Date().toISOString().split("T")[0],
		published: formData.published ?? false,
		category: formData.category || "General",
		image_url: formData.image_url || null,
		is_headline: formData.is_headline ?? false,
	};

	try {
		let result = null;

		if (formData.id) {
			// Update existing
			result = await supabase
				.from("blogs")
				.update(blogData)
				.eq("id", formData.id)
				.select()
				.single();
		} else {
			// Create new
			result = await supabase
				.from("blogs")
				.insert([blogData])
				.select()
				.single();
		}

		if (result.error) {
			console.error("Supabase error saving blog:", result.error);
			return {
				success: false,
				message: result.error.message,
				error: result.error,
			};
		}

		revalidatePath("/blog");
		revalidatePath("/admin/blog");
		revalidatePath(`/blog/${slug}`);

		return {
			success: true,
			message: formData.id
				? "Blog updated successfully"
				: "Blog created successfully",
			data: result.data as Blog,
		};
	} catch (error: any) {
		console.error("Unexpected error saving blog:", error);
		return {
			success: false,
			message: error.message || "An unexpected error occurred",
		};
	}
}

/**
 * Delete a blog post by ID.
 */
export async function deleteBlog(id: string): Promise<ActionResponse> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { success: false, message: "Unauthorized" };
	}

	const supabase = await createClient();

	try {
		const { error } = await supabase.from("blogs").delete().eq("id", id);

		if (error) {
			console.error("Supabase error deleting blog:", error);
			return { success: false, message: error.message, error };
		}

		revalidatePath("/blog");
		revalidatePath("/admin/blog");

		return { success: true, message: "Blog deleted successfully" };
	} catch (error: any) {
		console.error("Unexpected error deleting blog:", error);
		return {
			success: false,
			message: error.message || "An unexpected error occurred",
		};
	}
}

/**
 * Get aggregate blog statistics for the admin dashboard stats bar.
 */
export async function getBlogStats(): Promise<{
	total: number;
	published: number;
	draft: number;
	headlines: number;
}> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) {
		return { total: 0, published: 0, draft: 0, headlines: 0 };
	}

	const supabase = await createClient();

	const [totalRes, publishedRes, headlineRes] = await Promise.all([
		supabase.from("blogs").select("*", { count: "exact", head: true }),
		supabase
			.from("blogs")
			.select("*", { count: "exact", head: true })
			.eq("published", true),
		supabase
			.from("blogs")
			.select("*", { count: "exact", head: true })
			.eq("is_headline", true),
	]);

	const total = totalRes.count ?? 0;
	const published = publishedRes.count ?? 0;
	const headlines = headlineRes.count ?? 0;

	return { total, published, draft: total - published, headlines };
}

/**
 * Bulk toggle publish status for a set of blog IDs.
 */
export async function bulkToggleStatus(
	ids: string[],
	publish: boolean,
): Promise<ActionResponse> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return { success: false, message: "Unauthorized" };

	if (!ids.length) return { success: false, message: "No IDs provided" };

	const supabase = await createClient();

	try {
		const { error } = await supabase
			.from("blogs")
			.update({ published: publish })
			.in("id", ids);

		if (error) return { success: false, message: error.message };

		revalidatePath("/blog");
		revalidatePath("/admin/blog");

		return {
			success: true,
			message: `${ids.length} post(s) ${publish ? "published" : "unpublished"}.`,
		};
	} catch (error: any) {
		return { success: false, message: error.message || "Unexpected error" };
	}
}

/**
 * Bulk delete a set of blog posts by ID.
 */
export async function bulkDeleteBlogs(ids: string[]): Promise<ActionResponse> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return { success: false, message: "Unauthorized" };

	if (!ids.length) return { success: false, message: "No IDs provided" };

	const supabase = await createClient();

	try {
		const { error } = await supabase.from("blogs").delete().in("id", ids);

		if (error) return { success: false, message: error.message };

		revalidatePath("/blog");
		revalidatePath("/admin/blog");

		return { success: true, message: `${ids.length} post(s) deleted.` };
	} catch (error: any) {
		return { success: false, message: error.message || "Unexpected error" };
	}
}

/**
 * Bulk update the category for a set of blog posts.
 */
export async function bulkUpdateCategory(
	ids: string[],
	category: string,
): Promise<ActionResponse> {
	const isAdmin = await checkAdmin();
	if (!isAdmin) return { success: false, message: "Unauthorized" };

	if (!ids.length) return { success: false, message: "No IDs provided" };

	const supabase = await createClient();

	try {
		const { error } = await supabase
			.from("blogs")
			.update({ category })
			.in("id", ids);

		if (error) return { success: false, message: error.message };

		revalidatePath("/blog");
		revalidatePath("/admin/blog");

		return {
			success: true,
			message: `${ids.length} post(s) moved to "${category}".`,
		};
	} catch (error: any) {
		return { success: false, message: error.message || "Unexpected error" };
	}
}
