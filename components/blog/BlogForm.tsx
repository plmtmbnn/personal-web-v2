'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Blog } from '@/lib/data/blog';
import { saveBlog } from '@/lib/actions/blog';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Eye, Edit3, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
      const result = await saveBlog({
        ...data,
        id: initialData?.id,
      });

      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        if (!initialData) {
          // If creating new, redirect after a short delay
          setTimeout(() => {
            router.push('/admin/blog');
          }, 1500);
        }
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Status Message */}
        {status && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              {initialData ? 'Edit Blog' : 'Create New Blog'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">
              Admin Portal • Editor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border/50 rounded-xl font-bold text-sm hover:bg-background-tertiary transition-all"
            >
              {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Back to Editor' : 'Live Preview'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-xl font-bold text-sm shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {!showPreview ? (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground ml-1">
                    Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter blog title..."
                    className="w-full bg-background-secondary border border-border/50 rounded-2xl px-5 py-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                  {errors.title && <p className="text-xs text-red-500 font-bold ml-1">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground ml-1">
                    Slug
                  </label>
                  <input
                    {...register('slug')}
                    placeholder="leave-blank-to-auto-generate"
                    className="w-full bg-background-secondary border border-border/50 rounded-2xl px-5 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground font-medium ml-1">
                    URL-friendly unique identifier. Auto-generated from title if blank.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground ml-1">
                    Short Description
                  </label>
                  <textarea
                    {...register('description', { required: 'Description is required' })}
                    rows={3}
                    placeholder="Briefly describe what this blog is about..."
                    className="w-full bg-background-secondary border border-border/50 rounded-2xl px-5 py-4 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                  />
                  {errors.description && <p className="text-xs text-red-500 font-bold ml-1">{errors.description.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground ml-1">
                    Markdown Content
                  </label>
                  <textarea
                    {...register('content', { required: 'Content is required' })}
                    rows={15}
                    placeholder="Write your blog post in Markdown..."
                    className="w-full bg-background-secondary border border-border/50 rounded-2xl px-5 py-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                  {errors.content && <p className="text-xs text-red-500 font-bold ml-1">{errors.content.message}</p>}
                </div>
              </>
            ) : (
              <div className="glass-card p-8 rounded-3xl min-h-[600px] prose prose-invert max-w-none">
                <h1 className="mb-4">{title || 'Untitled Post'}</h1>
                <ReactMarkdown>{content || '_No content written yet..._'}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border-2 border-white/5 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-tighter text-muted-foreground ml-1">
                  Publication Date
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full bg-background-secondary border border-border/50 rounded-xl px-4 py-3 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background-secondary rounded-2xl border border-border/50">
                <div>
                  <label className="text-xs font-black uppercase tracking-tighter text-foreground block">
                    Published Status
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    Make visible on the public site
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('published')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10">
              <h3 className="text-xs font-black uppercase tracking-tighter text-accent mb-3 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> Tip
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                Use standard Markdown for formatting. You can add code blocks, images, and links. 
                Don't forget to set a publication date for future posts.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
