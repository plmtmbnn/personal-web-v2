"use client";

import React, { Suspense, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ComponentLoader from "@/features/tasks/components/ComponentLoader";
import QuickNav from "@/features/tasks/components/QuickNav";
import { LayoutList, Zap, LayoutDashboard, Target, CheckCircle2 } from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { motion } from "framer-motion";

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

const DynamicTaskFilters = dynamic(() => import("@/features/tasks/components/TaskFilters"), {
	loading: () => <div className="h-10 bg-slate-100 rounded-xl animate-pulse mb-6" />,
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

	return (
		<main className="min-h-screen bg-slate-50/50 pb-32">
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
                  {tasks.filter(t => t.is_completed).length}/{tasks.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

			<div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 relative z-10">
				<QuickNav />

				{/* Analytics & Status Grid */}
				<section className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
            <Suspense fallback={<ComponentLoader height="100px" />}>
              <DynamicHealthCheck />
            </Suspense>
          </div>

          <section id="analytics-overview" className="scroll-mt-32">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1">
              <Suspense fallback={<ComponentLoader height="120px" />}>
                <DynamicGeneralReport />
              </Suspense>
            </div>
          </section>
				</section>

				{/* Controls Section */}
				<div className="space-y-4">
					<Suspense fallback={null}>
						<DynamicTaskNotificationHandler tasks={tasks} />
					</Suspense>
					
					<div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <Suspense fallback={<ComponentLoader height="80px" />}>
              <DynamicTaskProgress tasks={tasks} />
            </Suspense>
          </div>

					<Suspense fallback={<div className="h-10 bg-slate-100 rounded-xl animate-pulse" />}>
						<DynamicTaskFilters />
					</Suspense>
				</div>

				{/* Execution Engine (Task Management) */}
				<section id="agenda-section" className="scroll-mt-32">
          <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            {/* Input Form Area */}
            <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100">
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
                <DynamicTaskList initialTasks={tasks} />
              </Suspense>
            </div>
          </div>
				</section>

        {/* System Footer */}
        <div className="pt-8 text-center">
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
            Operational Layer • v2.4.5
          </p>
        </div>
			</div>
		</main>
	);
}
