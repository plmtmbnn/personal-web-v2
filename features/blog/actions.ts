'use server';

import { createClient } from '@/lib/core/supabase-server';
import { revalidatePath } from 'next/cache';
import { Blog } from '@/features/blog/data';
import { redirect } from 'next/navigation';
import { checkAdmin } from '@/features/auth/actions';

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
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

/**
 * Fetch blogs for admin with filtering, sorting, and pagination.
 */
export async function getBlogsAdmin(params: {
  search?: string;
  status?: 'all' | 'published' | 'draft';
  sort?: 'newest' | 'oldest';
  page?: number;
  limit?: number;
} = {}): Promise<{ blogs: Blog[]; totalCount: number }> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const { 
    search = '', 
    status = 'all', 
    sort = 'newest', 
    page = 1, 
    limit = 5 
  } = params;

  const supabase = await createClient();
  let query = supabase
    .from('blogs')
    .select('*', { count: 'exact' });

  // Filtering by search
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  // Filtering by status
  if (status === 'published') {
    query = query.eq('published', true);
  } else if (status === 'draft') {
    query = query.eq('published', false);
  }

  // Sorting
  query = query.order('date', { ascending: sort === 'oldest' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching admin blogs:', error);
    return { blogs: [], totalCount: 0 };
  }

  return { 
    blogs: data as Blog[], 
    totalCount: count || 0 
  };
}

/**
 * Toggle the published status of a blog post.
 */
export async function toggleBlogStatus(id: string, currentStatus: boolean): Promise<ActionResponse> {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, message: 'Unauthorized' };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from('blogs')
      .update({ published: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Supabase error toggling blog status:', error);
      return { success: false, message: error.message, error };
    }

    revalidatePath('/blog');
    revalidatePath('/admin/blog');

    return { success: true, message: 'Blog status updated successfully' };
  } catch (error: any) {
    console.error('Unexpected error toggling blog status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred' };
  }
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
