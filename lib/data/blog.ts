import { BlogI } from "@/app/blog/blog-list";
import { SupabaseConn } from "@/utils/supabase";

/* List blogs */
export async function getBlogs(): Promise<BlogI[]> {
  const { data, error } = await SupabaseConn
    .from("blogs")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });

  if (error) {
    console.log(error);    
    throw new Error("Failed to fetch blogs");
  }
    
  return data as BlogI[];
}

/* Single blog by slug */
export async function getBlogBySlug(
  slug: string
): Promise<BlogI | null> {
  const { data, error } = await SupabaseConn
    .from("blogs")
    .select("title, slug, description, date, content")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) return null;

  return data as BlogI;
}
