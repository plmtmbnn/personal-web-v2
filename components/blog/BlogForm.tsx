'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Blog } from '@/lib/data/blog';
import { saveBlog } from '@/lib/actions/blog';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Save, 
  Eye, 
  Edit3, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Globe,
  FileText,
  Type,
  Layout
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogFormProps {
  initialData?: Blog | null;
}

export default function BlogForm({ initialData }: BlogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Partial<Blog>>({
    defaultValues: initialData || {
      title: '',
      slug: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      published: false,
    },
  });

  const content = watch('content');
  const title = watch('title');

  const onSubmit = async (data: Partial<Blog>) => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await saveBlog({ ...data, id: initialData?.id });
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        if (!initialData) setTimeout(() => router.push('/admin/blog'), 1500);
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Header - Now Solid & Integrated */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              {initialData ? <Edit3 className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-blue-600" />}
              {initialData ? 'Edit Article' : 'New Article'}
            </h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              Content Management • Editor
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              {showPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? 'Switch to Editor' : 'Live Preview'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-200 disabled:opacity-70 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Status Toast */}
        <AnimatePresence>
          {status && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 border ${
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
              }`}
            >
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <p className="text-xs font-bold uppercase tracking-wide">{status.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Editor Area */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {!showPreview ? (
                <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* Title Input */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 ml-1">
                      <Type className="w-3.5 h-3.5" /> Headline
                    </label>
                    <input
                      {...register('title', { required: 'Title is required' })}
                      placeholder="Enter article title..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 font-bold text-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                    {errors.title && <p className="text-[10px] text-rose-600 font-bold ml-1">{errors.title.message}</p>}
                  </div>

                  {/* Slug & Description */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 ml-1">
                        <Globe className="w-3.5 h-3.5" /> Permalink
                      </label>
                      <div className="flex items-center">
                        <span className="bg-slate-50 border border-r-0 border-slate-200 px-4 py-2.5 rounded-l-xl text-xs font-mono text-slate-400 italic">/blog/</span>
                        <input
                          {...register('slug')}
                          placeholder="auto-generated"
                          className="w-full bg-white border border-slate-200 rounded-r-xl px-4 py-2.5 font-mono text-xs focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider ml-1">Summary</label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={2}
                        placeholder="Brief overview..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Markdown Content */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2 ml-1">
                      <FileText className="w-3.5 h-3.5" /> Content (Markdown)
                    </label>
                    <textarea
                      {...register('content', { required: 'Content is required' })}
                      rows={18}
                      placeholder="# Your story starts here..."
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-6 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all leading-relaxed shadow-sm"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white border border-slate-200 p-8 sm:p-12 rounded-[2rem] shadow-sm min-h-[700px] prose prose-slate max-w-none prose-headings:font-black"
                >
                  <h1 className="text-4xl sm:text-5xl font-black mb-8 border-b border-slate-100 pb-6 leading-tight tracking-tight">{title || 'Untitled'}</h1>
                  <ReactMarkdown>{content || '*Empty content*'}</ReactMarkdown>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Now Defined Cards */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900 mb-2">
                <Layout className="w-4 h-4 text-blue-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-widest">Post Settings</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Publish Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-bold text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl group hover:border-blue-200 transition-colors">
                <div className="space-y-0.5">
                  <label className="text-[10px] font-black uppercase text-slate-900 block tracking-tight">Public Visibility</label>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Staged for production</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer scale-90">
                  <input type="checkbox" {...register('published')} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <h3 className="text-[10px] font-black uppercase text-blue-700 flex items-center gap-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5" /> Pro Tip
              </h3>
              <p className="text-[11px] text-blue-600/80 font-medium leading-relaxed italic">
                Use H2 and H3 tags to structure your long-form content. Don't forget to add meaningful ALT text to your images for SEO.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// Sub-component for New Post icon logic
function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}
