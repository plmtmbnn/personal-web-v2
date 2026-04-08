import { SupabaseConn } from "@/utils/supabase";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  date: string;
  published: boolean;
}

/**
 * Fetch all published blogs, ordered by date DESC.
 */
export async function getBlogs(): Promise<Blog[]> {
  try {
    const { data, error } = await SupabaseConn
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
 * Fetch a single published blog by its unique slug.
 */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    const { data, error } = await SupabaseConn
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
}
