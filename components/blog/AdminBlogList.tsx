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
  Loader2,
  FileText,
  Eye,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

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
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Deletion failed.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Search & Actions Bar - Now Solid & High Contrast */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight whitespace-nowrap bg-slate-100 px-3 py-1.5 rounded-lg">
            {filteredBlogs.length} Articles
          </span>
        </div>
      </div>

      {/* Table - Optimized for focus and utility */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Title / Slug</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col max-w-md">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {blog.title}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 mt-0.5">
                        /{blog.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                      {format(new Date(blog.date), 'MMM d, yyyy')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {blog.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold border border-slate-200">
                        <Circle className="w-3 h-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/editor/${blog.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={isDeleting === blog.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Delete"
                      >
                        {isDeleting === blog.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium text-sm">
                  No articles found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
