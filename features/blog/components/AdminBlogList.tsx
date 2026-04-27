'use client';

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Blog } from '@/features/blog/data';
import { deleteBlog, toggleBlogStatus, updateBlogMetadata } from '@/features/blog/actions';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  Search,
  Loader2,
  Eye,
  Inbox,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  Sparkles,
  ImageIcon,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CustomModal from '@/features/shared/components/CustomModal';

interface AdminBlogListProps {
  initialBlogs: Blog[];
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: 'all' | 'published' | 'draft';
  currentSort: 'newest' | 'oldest';
  currentHeadline: boolean;
}

export default function AdminBlogList({ 
  initialBlogs, 
  totalCount,
  currentPage,
  currentSearch,
  currentStatus,
  currentSort,
  currentHeadline
}: AdminBlogListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingMetadataId, setUpdatingMetadataId] = useState<string | null>(null);
  
  // Modal state
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Local state for immediate UI feedback (Search)
  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Categories aligned with DB Check Constraint
  const categories = ["Tech", "Running", "Finance", "Investment", "General"];

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
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
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

  const handleUpdateMetadata = async (id: string, updates: Partial<Blog>) => {
    setUpdatingMetadataId(id);
    const result = await updateBlogMetadata(id, updates);
    if (!result.success) {
      alert('Error: ' + result.message);
    }
    setUpdatingMetadataId(null);
  };

  const confirmDelete = async () => {
    if (!deleteModalId) return;
    
    setIsDeleting(deleteModalId);
    const result = await deleteBlog(deleteModalId);
    if (!result.success) {
      alert('Error: ' + result.message);
    }
    setDeleteModalId(null);
    setIsDeleting(null);
  };

  const totalPages = Math.ceil(totalCount / 5);

  /**
   * Helper to generate page numbers
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  /**
   * Category Color Utility - Optimized for DB specific values
   */
  const getCategoryStyles = (category: string) => {
    const c = category;
    if (c === 'Finance' || c === 'Investment') return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (c === 'Tech') return "bg-blue-50 text-blue-700 border-blue-100";
    if (c === 'Running') return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-slate-50 text-slate-700 border-slate-100";
  };

  return (
    <div className="flex flex-col bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden text-slate-900">
      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        onConfirm={confirmDelete}
        title="Purge Knowledge Entry"
        description="This action is irreversible. The entry will be permanently removed from the knowledge base and public view."
        variant="danger"
        confirmText="Confirm Purge"
        isLoading={!!isDeleting}
      />

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
            {/* Headline Filter */}
            <button
              onClick={() => updateParams({ headline: !currentHeadline ? 'true' : null, page: '1' })}
              className={`flex items-center gap-2 px-4 py-2 bg-white border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                currentHeadline 
                  ? 'border-blue-500 text-blue-600 ring-4 ring-blue-500/10' 
                  : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${currentHeadline ? 'fill-blue-600' : ''}`} />
              Headlines
            </button>

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
        {/* Loading Overlay for active data transitions */}
        <AnimatePresence>
          {isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-xl">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="px-8 py-4 text-center w-20">#</th>
              <th className="px-6 py-4">Knowledge Entry</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Headline</th>
              <th className="px-6 py-4 text-center">Status</th>
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
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {blog.image_url ? (
                          <img src={blog.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/admin/blog/editor/${blog.id}`}
                            className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate"
                          >
                            {blog.title}
                          </Link>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 truncate lowercase opacity-60">
                          /{blog.slug}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="relative inline-block group/select">
                      <select
                        disabled={!!updatingMetadataId}
                        value={blog.category || 'General'}
                        onChange={(e) => handleUpdateMetadata(blog.id, { category: e.target.value })}
                        className={`appearance-none px-3 py-1.5 pr-8 border text-[9px] font-black uppercase tracking-widest rounded-full cursor-pointer transition-all outline-none focus:ring-2 focus:ring-blue-500/20 ${getCategoryStyles(blog.category)} disabled:opacity-50`}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
                      {updatingMetadataId === blog.id && (
                        <div className="absolute -right-6 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleUpdateMetadata(blog.id, { is_headline: !blog.is_headline })}
                        className={`p-2 rounded-xl border transition-all duration-300 ${
                          blog.is_headline 
                            ? 'bg-blue-50 border-blue-100 text-blue-600 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-300 hover:text-blue-400 hover:bg-slate-50'
                        }`}
                        title={blog.is_headline ? "Headline Active" : "Set as Headline"}
                      >
                        <Sparkles className={`w-4 h-4 ${blog.is_headline ? 'fill-blue-600' : ''}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-3">
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
                        onClick={() => setDeleteModalId(blog.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Purge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-slate-400 font-bold text-sm">No entries found for this configuration.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Numeric Pagination Footer */}
      <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Showing <span className="text-slate-900">{(currentPage - 1) * 5 + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * 5, totalCount)}</span>
          <span className="mx-2 opacity-30">•</span>
          <span className="text-slate-900">{totalCount}</span> Total Results
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => updateParams({ page: String(currentPage - 1) })}
            disabled={currentPage <= 1 || isPending}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-sm mr-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Numeric Pages */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-300">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                );
              }

              const isActive = page === currentPage;
              return (
                <button
                  key={`page-${page}`}
                  onClick={() => updateParams({ page: String(page) })}
                  disabled={isPending}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all shadow-sm ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-blue-200' 
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => updateParams({ page: String(currentPage + 1) })}
            disabled={currentPage >= totalPages || isPending}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all disabled:opacity-20 disabled:pointer-events-none shadow-sm ml-2"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
