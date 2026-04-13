"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Loader2, 
  Calendar, 
  Flag, 
  Type, 
  Tag, 
  Sparkles,
  X,
  Target,
  ChevronDown
} from "lucide-react";
import { addTask } from "@/features/tasks/actions/tasks";
import { useRouter } from "next/navigation";
import type { TaskPriority } from "@/features/tasks/types";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface TaskFormProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TaskForm({ isOpen, onClose }: TaskFormProps) {
	const [title, setTitle] = useState("");
	const [category, setCategory] = useState("");
	const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
	
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-expand textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  const setQuickDate = (days: number) => {
    setDueDate(format(addDays(new Date(), days), "yyyy-MM-dd"));
  };

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await addTask({
				title: title.trim(),
				priority,
				category: category.trim() || "General",
				due_date: dueDate,
			});

			setTitle("");
      setCategory("");
			setPriority("MEDIUM");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
			router.refresh();
      setIsFocused(false);
      onClose?.();
		} catch (error) {
			console.error("Task creation failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

  const categories = ["Work", "Personal", "Fintech", "Health", "Urgent", "Study", "Finance"];

	return (
    <AnimatePresence>
      {(!onClose || isOpen) && (
        <>
          {/* Backdrop for mobile */}
          {onClose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden"
            />
          )}

          <motion.div
            initial={onClose ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
            animate={onClose ? { y: 0 } : { scale: 1, opacity: 1 }}
            exit={onClose ? { y: "100%" } : { scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`${
              onClose 
                ? "fixed bottom-0 left-0 right-0 z-[60] lg:relative lg:z-0 lg:bottom-auto" 
                : "relative"
            } transition-all duration-500 ${isFocused ? 'scale-[1.01]' : 'scale-100'}`}
          >
            <form 
              onSubmit={handleSubmit} 
              className={`bg-white border-2 transition-all duration-300 ${
                onClose ? 'rounded-t-[3rem] lg:rounded-[2rem]' : 'rounded-[2rem]'
              } overflow-hidden shadow-sm ${
                isFocused ? 'border-emerald-500/40 shadow-xl shadow-emerald-500/5' : 'border-slate-200'
              }`}
            >
              {/* Drag Handle for mobile */}
              {onClose && (
                <div className="w-full flex justify-center pt-4 lg:hidden">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>
              )}

              {/* Main Content Area */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Header Label */}
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <Target className="w-3 h-3 text-emerald-500" />
                    New Objective
                  </label>
                  <div className="flex items-center gap-2">
                    {title && (
                      <button 
                        type="button" 
                        onClick={() => setTitle("")}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {onClose && (
                      <button 
                        type="button" 
                        onClick={onClose}
                        className="lg:hidden text-slate-300 hover:text-slate-900 transition-colors"
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dynamic Title Input */}
                <textarea
                  ref={textareaRef}
                  placeholder="What is the next milestone?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => !title && setIsFocused(false)}
                  rows={1}
                  disabled={isSubmitting}
                  className="w-full bg-transparent text-xl md:text-2xl font-black text-slate-900 placeholder:text-slate-200 focus:outline-none resize-none leading-tight text-base"
                />

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50">
                  {/* Category with Suggestions */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                      <Tag className="w-3 h-3" /> Category
                    </label>
                    <div className="relative group">
                      <input
                        list="category-suggestions"
                        type="text"
                        placeholder="e.g. Work"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-base md:text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none"
                      />
                      <datalist id="category-suggestions">
                        {categories.map(cat => <option key={cat} value={cat} />)}
                      </datalist>
                    </div>
                  </div>

                  {/* Due Date Picker with Quick Chips */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                      <Calendar className="w-3 h-3" /> Due Date
                    </label>
                    
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Today", days: 0 },
                        { label: "Tomorrow", days: 1 },
                        { label: "+7 Days", days: 7 }
                      ].map((chip) => (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => setQuickDate(chip.days)}
                          className="px-3 py-1.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-base md:text-xs font-bold text-slate-700 focus:bg-white focus:border-emerald-500 transition-all outline-none appearance-none"
                    />
                  </div>

                  {/* Visual Priority Selector */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5 ml-1">
                      <Flag className="w-3 h-3" /> Priority Level
                    </label>
                    <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl">
                      {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                            priority === p 
                              ? p === 'HIGH' ? 'bg-rose-500 text-white shadow-sm' :
                                p === 'MEDIUM' ? 'bg-amber-500 text-white shadow-sm' :
                                'bg-emerald-500 text-white shadow-sm'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between pb-10 lg:pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Strategic initialization.</span>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-30 active:scale-95"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Initialize
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
	);
}
