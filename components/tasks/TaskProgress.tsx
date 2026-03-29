'use client';

import React from 'react';
import { Trophy, CheckCircle2, Circle } from 'lucide-react';
import { calculateProgress } from '@/lib/utils/tasks';
import { Task } from '@/lib/types/tasks';

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
		<div className={`glass-card p-6 mb-8 transition-all duration-500 ${
			isComplete ? 'ring-2 ring-green-500/50 bg-green-500/5' : ''
		}`}>
			<div className="flex items-center gap-6">
				{/* Circular Progress SVG */}
				<div className="relative w-20 h-20 flex-shrink-0">
					<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
						{/* Background Circle */}
						<circle
							cx="50"
							cy="50"
							r={radius}
							fill="transparent"
							stroke="currentColor"
							strokeWidth="8"
							className="text-muted-foreground/10"
						/>
						{/* Progress Circle */}
						<circle
							cx="50"
							cy="50"
							r={radius}
							fill="transparent"
							stroke={isComplete ? '#22c55e' : 'var(--accent)'}
							strokeWidth="8"
							strokeDasharray={circumference}
							style={{ 
								strokeDashoffset: offset,
								transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s'
							}}
							strokeLinecap="round"
						/>
					</svg>
					<div className="absolute inset-0 flex items-center justify-center font-bold text-lg">
						{progress}%
					</div>
				</div>

				{/* Text Information */}
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
							Goal Progress
						</h3>
						{isComplete && (
							<span className="flex items-center gap-1 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full animate-bounce">
								<Trophy className="w-3 h-3" /> EXCELLENT
							</span>
						)}
					</div>
					
					<p className={`text-xl font-bold transition-colors ${isComplete ? 'text-green-600' : ''}`}>
						{isComplete 
							? "You've crushed it! All tasks done. 🎉" 
							: progress >= 50 
								? "Over halfway there! Keep pushing." 
								: tasks.length === 0 
									? "No tasks found for this view." 
									: "Let's get some work done!"}
					</p>
					
					<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-1">
							<CheckCircle2 className="w-4 h-4 text-green-500" />
							{tasks.filter(t => t.is_completed).length} Done
						</span>
						<span className="flex items-center gap-1">
							<Circle className="w-4 h-4" />
							{tasks.filter(t => !t.is_completed).length} Pending
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
