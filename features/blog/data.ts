import { cache } from "react";
import { createClient } from "@/lib/core/supabase-server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { ENV_GLOBAL } from "@/lib/core/env";

export interface Blog {
	id: string;
	title: string;
	slug: string;
	description: string;
	content: string;
	date: string;
	published: boolean;
	category: string;
	image_url: string | null;
	is_headline: boolean;
}

/**
 * Direct Supabase client for build-time (static) fetching where cookies are not available.
 */
const getStaticClient = () =>
	createSupabaseClient(
		ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_URL!,
		ENV_GLOBAL.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	);

/**
 * Fetch all published blogs for static generation.
 */
export async function getBlogsStatic(): Promise<Blog[]> {
	const supabase = getStaticClient();
	try {
		const { data, error } = await supabase
			.from("blogs")
			.select("*")
			.eq("published", true)
			.order("date", { ascending: false });

		if (error) {
			console.error("Supabase error fetching blogs static:", error);
			return [];
		}

		return data as Blog[];
	} catch (error) {
		console.error("Unexpected error fetching blogs static:", error);
		return [];
	}
}

/**
 * Fetch a single published blog by slug for static generation.
 * Wrapped in React cache() to deduplicate concurrent calls within
 * the same request (e.g. generateMetadata + page render).
 */
export const getBlogBySlugStatic = cache(
	async (slug: string): Promise<Blog | null> => {
		const supabase = getStaticClient();
		try {
			const { data, error } = await supabase
				.from("blogs")
				.select("*")
				.eq("slug", slug)
				.eq("published", true)
				.single();

			if (error) {
				console.warn(`Blog not found for slug static: ${slug}`, error.message);
				return null;
			}

			return data as Blog;
		} catch (error) {
			console.error(
				`Unexpected error fetching blog by slug static: ${slug}`,
				error,
			);
			return null;
		}
	},
);

/**
 * Fetch all published blogs, ordered by date DESC. (Dynamic/Server-Side)
 */
export async function getBlogs(): Promise<Blog[]> {
	const supabase = await createClient();
	try {
		const { data, error } = await supabase
			.from("blogs")
			.select("*")
			.eq("published", true)
			.order("date", { ascending: false });

		if (error) {
			console.error("Supabase error fetching blogs:", error);
			return [];
		}

		return data as Blog[];
	} catch (error) {
		console.error("Unexpected error fetching blogs:", error);
		return [];
	}
}

/**
 * Fetch a single published blog by its unique slug. (Dynamic/Server-Side)
 * Wrapped in React cache() to deduplicate concurrent calls within
 * the same request (e.g. generateMetadata + page render).
 */
export const getBlogBySlug = cache(
	async (slug: string): Promise<Blog | null> => {
		const supabase = await createClient();
		try {
			const { data, error } = await supabase
				.from("blogs")
				.select("*")
				.eq("slug", slug)
				.eq("published", true)
				.single();

			if (error) {
				console.warn(`Blog not found for slug: ${slug}`, error.message);
				return null;
			}

			return data as Blog;
		} catch (error) {
			console.error(`Unexpected error fetching blog by slug: ${slug}`, error);
			return null;
		}
	},
);

/**
 * Fetch all blogs (published and drafts) for admin.
 */
export async function getAdminBlogs(): Promise<Blog[]> {
	const supabase = await createClient();
	try {
		const { data, error } = await supabase
			.from("blogs")
			.select("*")
			.order("date", { ascending: false });

		if (error) {
			console.error("Supabase error fetching admin blogs:", error);
			return [];
		}

		return data as Blog[];
	} catch (error) {
		console.error("Unexpected error fetching admin blogs:", error);
		return [];
	}
}

/**
 * Fetch a single blog by ID (for editing).
 */
export async function getBlogById(id: string): Promise<Blog | null> {
	const supabase = await createClient();
	try {
		const { data, error } = await supabase
			.from("blogs")
			.select("*")
			.eq("id", id)
			.single();

		if (error) {
			console.error(`Error fetching blog by ID ${id}:`, error.message);
			return null;
		}

		return data as Blog;
	} catch (error) {
		console.error(`Unexpected error fetching blog by ID: ${id}`, error);
		return null;
	}
}

/**
 * Fetch related posts from the same category, excluding the current slug.
 * Used for the "More from the Journal" section at the bottom of blog detail pages.
 */
export async function getRelatedPosts(
	currentSlug: string,
	category: string,
	limit = 3,
): Promise<Blog[]> {
	const supabase = await createClient();
	try {
		const { data, error } = await supabase
			.from("blogs")
			.select(
				"id, title, slug, description, date, category, image_url, is_headline, published, content",
			)
			.eq("published", true)
			.eq("category", category)
			.neq("slug", currentSlug)
			.order("date", { ascending: false })
			.limit(limit);

		if (error) {
			console.error("Error fetching related posts:", error.message);
			return [];
		}

		return (data as Blog[]) || [];
	} catch (error) {
		console.error("Unexpected error fetching related posts:", error);
		return [];
	}
}
