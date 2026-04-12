'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Blog } from '@/features/blog/data';
import { deleteBlog } from '@/features/blog/actions';
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
  Plus,
  Inbox
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
    if (!window.confirm('Purge this entry from the knowledge base?')) return;
    
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
    <div className="flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
      {/* Search & Actions Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
            {filteredBlogs.length} Articles
          </span>
          <Link 
            href="/admin/blog/editor" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100 whitespace-nowrap !no-underline"
          >
            <Plus className="w-3.5 h-3.5" />
            New Post
          </Link>
        </div>
      </div>

      {/* Table Container - Mobile Horizontal Scroll */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left min-w-[600px] sm:min-w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-6 py-4">Knowledge Entry</th>
              <th className="px-6 py-4 hidden sm:table-cell">Publication</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col max-w-[200px] sm:max-w-md">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {blog.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate lowercase">
                        /{blog.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 hidden sm:table-cell">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 opacity-40" />
                      {format(new Date(blog.date), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {blog.published ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-tighter border border-slate-200">
                        <Circle className="w-2.5 h-2.5" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/blog/${blog.slug}`}
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                        title="View Live"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/editor/${blog.id}`}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit Entry"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={isDeleting === blog.id}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                        title="Purge"
                      >
                        {isDeleting === blog.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No entries found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
