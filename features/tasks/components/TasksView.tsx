"use client";

import React, { Suspense, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { startOfDay, isSameDay, isAfter, parseISO } from "date-fns";
import ComponentLoader from "@/features/tasks/components/ComponentLoader";
import QuickNav, { type TaskViewTab } from "@/features/tasks/components/QuickNav";
import { LayoutList, Target, Plus } from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Optimization: Lazy load heavy interactive/visual components.
 */
const DynamicHealthCheck = dynamic(() => import("@/features/tasks/components/HealthCheck"), {
	loading: () => <ComponentLoader height="100px" />,
	ssr: false
});

const DynamicGeneralReport = dynamic(() => import("@/features/tasks/components/GeneralReport"), {
	loading: () => <ComponentLoader height="120px" />,
	ssr: false
});

const DynamicTaskNotificationHandler = dynamic(() => import("@/features/tasks/components/TaskNotificationHandler"), {
	ssr: false
});

const DynamicTaskProgress = dynamic(() => import("@/features/tasks/components/TaskProgress"), {
	loading: () => <ComponentLoader height="80px" />,
	ssr: false
});

const DynamicTaskHeatmap = dynamic(() => import("@/features/tasks/components/TaskHeatmap"), {
	loading: () => <ComponentLoader height="150px" />,
	ssr: false
});

const DynamicTaskForm = dynamic(() => import("@/features/tasks/components/TaskForm"), {
	loading: () => <ComponentLoader height="120px" />,
	ssr: false
});

const DynamicTaskList = dynamic(() => import("@/features/tasks/components/TaskList"), {
	loading: () => (
		<div className="space-y-3">
			<ComponentLoader height="60px" />
			<ComponentLoader height="60px" />
		</div>
	),
	ssr: false
});

interface TasksViewProps {
	tasks: Task[];
}

export default function TasksView({ tasks }: TasksViewProps) {
  const searchParams = useSearchParams();
  const completedParam = searchParams.get("completed");
  const categoryParam = searchParams.get("category");
  const priorityParam = searchParams.get("priority");

  const showCompleted = completedParam === "true";
  const selectedCategory = categoryParam || null;
  const selectedPriority = priorityParam || null;

  const [mounted, setMounted] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskViewTab>("agenda");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { todayTasks, upcomingTasks, todayStats } = useMemo(() => {
    let filtered = tasks;
    if (selectedCategory) {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }
    if (selectedPriority) {
      filtered = filtered.filter((t) => t.priority === selectedPriority);
    }

    const todayRef = startOfDay(new Date());
    const todayList = filtered.filter((t) => isSameDay(parseISO(t.due_date), todayRef));
    const upcomingList = filtered.filter((t) => isAfter(parseISO(t.due_date), todayRef));

    return {
      todayTasks: showCompleted ? todayList : todayList.filter((t) => !t.is_completed),
      upcomingTasks: showCompleted ? upcomingList : upcomingList.filter((t) => !t.is_completed),
      todayStats: {
        completed: todayList.filter(t => t.is_completed).length,
        total: todayList.length
      }
    };
  }, [tasks, selectedCategory, selectedPriority, showCompleted]);

  if (!mounted) return null;

	return (
		<main className="min-h-screen bg-slate-50/50 pb-32 relative">
      {/* Mobile-Only Drawer */}
      <Suspense fallback={null}>
        <div className="lg:hidden">
          <DynamicTaskForm 
            isOpen={isFormOpen} 
            onClose={() => setIsFormOpen(false)} 
          />
        </div>
      </Suspense>

      {/* Floating Navigation Switcher */}
      <QuickNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Structural Header - Optimized for Mobile Scaling */}
      <div className="bg-white border-b border-slate-200 mb-6 sm:mb-8 pt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8">
            <div className="space-y-1 sm:space-y-2 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                <Target className="w-3.5 h-3.5" />
                Operations Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Daily Objectives
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm font-medium">
                Strategic task orchestration and execution tracking.
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center shadow-sm">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Completion</p>
                <p className="text-sm font-black text-slate-900">
                  {todayStats.completed}/{todayStats.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

			<div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 relative z-10">
				<AnimatePresence mode="wait">
          {activeTab === "analytics" ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Analytics & Status Grid */}
              <section className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
                  <Suspense fallback={<ComponentLoader height="100px" />}>
                    <DynamicHealthCheck />
                  </Suspense>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
                  <Suspense fallback={<ComponentLoader height="120px" />}>
                    <DynamicGeneralReport tasks={tasks} />
                  </Suspense>
                </div>
              </section>

              {/* Progress Section */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <Suspense fallback={<ComponentLoader height="80px" />}>
                    <DynamicTaskProgress tasks={tasks} />
                  </Suspense>
                </div>

                <Suspense fallback={<ComponentLoader height="150px" />}>
                  <DynamicTaskHeatmap tasks={tasks} />
                </Suspense>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 sm:space-y-8"
            >
              <Suspense fallback={null}>
                <DynamicTaskNotificationHandler tasks={tasks} />
              </Suspense>

              {/* Execution Engine (Task Management) */}
              <section id="agenda-section">
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
                  {/* Input Form Area - Hidden on Mobile (moved to Drawer) */}
                  <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 hidden lg:block">
                    <Suspense fallback={<ComponentLoader height="120px" />}>
                      <DynamicTaskForm />
                    </Suspense>
                  </div>

                  {/* List Area */}
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-50 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-lg sm:rounded-xl flex items-center justify-center text-emerald-600">
                          <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900">Active Agenda</h2>
                      </div>
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight">
                          Ready
                        </span>
                      </div>
                    </div>
                    
                    <Suspense fallback={
                      <div className="space-y-3">
                        <ComponentLoader height="60px" />
                        <ComponentLoader height="60px" />
                      </div>
                    }>
                      <DynamicTaskList todayTasks={todayTasks} upcomingTasks={upcomingTasks} />
                    </Suspense>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
			</div>

      {/* Mobile-Only FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-24 right-6 sm:right-8 z-40 w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl lg:hidden active:scale-90 transition-transform"
      >
        <Plus className="w-8 h-8" />
      </button>
		</main>
	);
}
