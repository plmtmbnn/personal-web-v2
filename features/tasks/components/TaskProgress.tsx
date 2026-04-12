'use client';

import React from 'react';
import { Trophy, CheckCircle2, Circle } from 'lucide-react';
import { calculateProgress } from '@/features/tasks/utils';
import { Task } from '@/features/tasks/types';

interface TaskProgressProps {
	tasks: Task[];
}

export default function TaskProgress({ tasks }: TaskProgressProps) {
	const progress = calculateProgress(tasks);
	const isComplete = progress === 100 && tasks.length > 0;

	// Circle constants
	const radius = 36;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (progress / 100) * circumference;

	return (
		<div className={`p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all duration-500 ${
			isComplete ? 'ring-2 ring-emerald-500/20 bg-emerald-50/30 border-emerald-200' : ''
		}`}>
			<div className="flex flex-col sm:flex-row items-center gap-6">
				{/* Circular Progress SVG */}
				<div className="relative w-20 h-20 flex-shrink-0">
					<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
						<circle
							cx="50" cy="50" r={radius} fill="transparent"
							stroke={isComplete ? '#10b981' : '#3b82f6'}
							strokeWidth="8"
							strokeDasharray={circumference}
							style={{ 
								strokeDashoffset: offset,
								transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'
							}}
							strokeLinecap="round"
						/>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center font-black text-slate-900 text-lg">
						{progress}%
					</div>
				</div>

				<div className="flex-1 text-center sm:text-left">
					<div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
						<h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
							Mission Progress
						</h3>
						{isComplete && (
							<span className="flex items-center gap-1 text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
								<Trophy className="w-3 h-3" /> Objective Met
							</span>
						)}
					</div>
					
					<p className={`text-xl font-black transition-colors tracking-tight ${isComplete ? 'text-emerald-700' : 'text-slate-900'}`}>
						{isComplete 
							? "Total Synchronization Achieved! 🎉" 
							: progress >= 50 
								? "Threshold surpassed. Finish strong." 
								: tasks.length === 0 
									? "Awaiting new objectives." 
									: "Execution in progress..."}
					</p>
					
					<div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
							<CheckCircle2 className="w-3.5 h-3.5" />
							<span className="text-[10px] font-bold uppercase">{tasks.filter(t => t.is_completed).length} Verified</span>
						</div>
						<div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200">
							<Circle className="w-3.5 h-3.5" />
							<span className="text-[10px] font-bold uppercase">{tasks.filter(t => !t.is_completed).length} Pending</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
