'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Blog } from '@/lib/data/blog';
import { deleteBlog } from '@/lib/actions/blog';
import { 
  Edit, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Search,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface AdminBlogListProps {
  initialBlogs: Blog[];
}

export default function AdminBlogList({ initialBlogs }: AdminBlogListProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [search, setSearch] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    blog.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    
    setIsDeleting(id);
    try {
      const result = await deleteBlog(id);
      if (result.success) {
        setBlogs(prev => prev.filter(b => b.id !== id));
      } else {
        alert('Error deleting blog: ' + result.message);
      }
    } catch (err) {
      alert('An unexpected error occurred during deletion.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Table Header with Search */}
      <div className="p-6 border-b border-border bg-background-secondary/30 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl pl-11 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-background-secondary/50 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Blog Post</th>
              <th className="px-8 py-4">Publication Date</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-background-secondary/20 transition-all group">
                  <td className="px-8 py-6">
                    {blog.published ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase">
                        <Circle className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-foreground line-clamp-1 group-hover:text-accent transition-colors">
                        {blog.title}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground mt-1">
                        /{blog.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(blog.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-background-secondary rounded-xl transition-all"
                        title="View Live"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/editor/${blog.id}`}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-xl transition-all"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={isDeleting === blog.id}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
                        title="Delete Post"
                      >
                        {isDeleting === blog.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-background-secondary rounded-3xl flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">No blogs found</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        Try a different search or create your first post.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="p-6 bg-background-secondary/30 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <span>Total Posts: {blogs.length}</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {blogs.filter(b => b.published).length} Published
          </span>
          <span className="flex items-center gap-1.5">
            <Circle className="w-3 h-3 text-amber-500" /> {blogs.filter(b => !b.published).length} Drafts
          </span>
        </div>
      </div>
    </div>
  );
}
