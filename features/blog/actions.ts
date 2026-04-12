'use server';

import { createClient } from '@/lib/core/supabase-server';
import { revalidatePath } from 'next/cache';
import { Blog } from '@/features/blog/data';
import { redirect } from 'next/navigation';

export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

/**
 * Authorization Helper: Checks if the current user is an admin.
 */
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return false;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return !!profile.is_admin;
}

/**
 * Utility to generate a URL-friendly slug.
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

/**
 * Fetch all blogs for admin (ordered by date DESC).
 */
export async function getBlogsAdmin(): Promise<Blog[]> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching admin blogs:', error);
    return [];
  }

  return data as Blog[];
}

/**
 * Create or Update a blog post (Upsert).
 */
export async function saveBlog(formData: Partial<Blog>): Promise<ActionResponse<Blog>> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = await createClient();
  
  const title = formData.title || 'Untitled Blog';
  const slug = formData.slug || slugify(title);
  
  const blogData = {
    title,
    slug,
    description: formData.description || '',
    content: formData.content || '',
    date: formData.date || new Date().toISOString().split('T')[0],
    published: formData.published ?? false,
  };

  try {
    let result;
    
    if (formData.id) {
      // Update existing
      result = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', formData.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('blogs')
        .insert([blogData])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Supabase error saving blog:', result.error);
      return { success: false, message: result.error.message, error: result.error };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');
    revalidatePath(`/blog/${slug}`);

    return { 
      success: true, 
      message: formData.id ? 'Blog updated successfully' : 'Blog created successfully',
      data: result.data as Blog 
    };
  } catch (error: any) {
    console.error('Unexpected error saving blog:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
}

/**
 * Delete a blog post by ID.
 */
export async function deleteBlog(id: string): Promise<ActionResponse> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting blog:', error);
      return { success: false, message: error.message, error };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');

    return { success: true, message: 'Blog deleted successfully' };
  } catch (error: any) {
    console.error('Unexpected error deleting blog:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
}
