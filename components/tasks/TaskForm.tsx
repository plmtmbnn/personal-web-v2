"use client";

import React, { useState } from "react";
import { Plus, Loader2, Calendar, Flag, Type } from "lucide-react";
import { addTask } from "@/lib/actions/tasks";
import { useRouter } from "next/navigation";
import type { TaskPriority } from "@/lib/types/tasks";

export default function TaskForm() {
	const [title, setTitle] = useState("");
	const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			await addTask({
				title: title.trim(),
				priority,
				category: "General",
				due_date: new Date().toISOString().split("T")[0],
			});

			setTitle("");
			setPriority("MEDIUM");
			router.refresh();
		} catch (error) {
			console.error("Task creation failed:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2 ml-1">
          <Type className="w-3 h-3" /> New Task
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="What needs to be accomplished?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-300 shadow-sm"
          />
          
          <div className="flex gap-2">
            <div className="relative group">
              <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={isSubmitting}
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-8 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm min-w-[120px]"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High Priority</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 disabled:opacity-50 disabled:grayscale active:scale-95"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </div>
      </div>
		</form>
	);
}
