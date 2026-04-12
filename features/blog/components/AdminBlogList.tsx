'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Blog } from '@/features/blog/data';
import { deleteBlog, toggleBlogStatus } from '@/features/blog/actions';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Search,
  Loader2,
  Eye,
  Plus,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminBlogListProps {
  initialBlogs: Blog[];
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: 'all' | 'published' | 'draft';
  currentSort: 'newest' | 'oldest';
}

export default function AdminBlogList({ 
  initialBlogs, 
  totalCount,
  currentPage,
  currentSearch,
  currentStatus,
  currentSort
}: AdminBlogListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  
  // Local state for immediate UI feedback (Search)
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Debounced search update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== currentSearch) {
        updateParams({ search: searchQuery, page: '1' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === 'all' || (key === 'page' && value === '1')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleToggleStatus = async (id: string, currentPublished: boolean) => {
    setTogglingId(id);
    startTransition(async () => {
      const result = await toggleBlogStatus(id, currentPublished);
      if (!result.success) {
        alert('Error: ' + result.message);
      }
      setTogglingId(null);
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Purge this entry from the knowledge base?')) return;
    
    setIsDeleting(id);
    const result = await deleteBlog(id);
    if (!result.success) {
      alert('Error: ' + result.message);
    }
    setIsDeleting(null);
  };

  const totalPages = Math.ceil(totalCount / 5);

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
      {/* Enhanced Filtering Bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {(['all', 'published', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateParams({ status: s, page: '1' })}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    currentStatus === s 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => updateParams({ sort: currentSort === 'newest' ? 'oldest' : 'newest', page: '1' })}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {currentSort === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-4 text-center w-20">#</th>
              <th className="px-6 py-4">Knowledge Entry</th>
              <th className="px-6 py-4">Status Toggle</th>
              <th className="px-6 py-4">Publication</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialBlogs.length > 0 ? (
              initialBlogs.map((blog, idx) => (
                <tr key={blog.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-8 py-5 text-center text-[10px] font-black text-slate-300">
                    {(currentPage - 1) * 5 + idx + 1}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col max-w-[250px] sm:max-w-md">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {blog.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate lowercase opacity-60">
                        /{blog.slug}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleStatus(blog.id, blog.published)}
                        disabled={togglingId === blog.id}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                          blog.published ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            blog.published ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                        {togglingId === blog.id && (
                          <div className="absolute -right-6">
                            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                          </div>
                        )}
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${blog.published ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {blog.published ? 'Live' : 'Draft'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 whitespace-nowrap">
                      <Calendar className="w-3.5 h-3.5 opacity-40" />
                      {format(new Date(blog.date), 'MMM d, yyyy')}
                    </div>
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
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No entries found for this configuration.</p>
                    {currentSearch && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-xs font-black uppercase text-blue-600 hover:underline"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modern Pagination Footer */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages || 1}</span>
          <span className="mx-2 opacity-30">•</span>
          <span className="text-slate-900">{totalCount}</span> Total Results
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => updateParams({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1 || isPending}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Previous
          </button>
          <button
            onClick={() => updateParams({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages || isPending}
            className="flex items-center gap-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
