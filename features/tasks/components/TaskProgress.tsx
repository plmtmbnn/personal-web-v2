'use client';

import { useEffect, useState, useTransition } from 'react';
import { CheckCircle2, Circle, Calendar, Clock, BarChart3, Loader2 } from 'lucide-react';
import { getTaskProgressMetrics } from '@/features/tasks/actions/analytics';

interface Metrics {
	today: number;
	week: number;
	month: number;
	allTime: number;
	verified: number;
	progress: number;
}

function getStatusText(progress: number, verified: number, today: number): string {
	if (progress === 100 && (verified > 0 || today > 0)) return 'All tasks complete — great work!';
	if (progress >= 50) return 'Past halfway — finish strong.';
	if (verified === 0 && today === 0) return 'No tasks started yet.';
	return 'Getting started, keep going.';
}

export default function TaskProgress() {
	const [metrics, setMetrics] = useState<Metrics | null>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		startTransition(async () => {
			const data = await getTaskProgressMetrics();
			setMetrics(data);
		});
	}, []);

	if (!metrics) {
		return (
			<div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center min-h-[160px]">
				<Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
			</div>
		);
	}

	const isComplete = metrics.progress === 100 && (metrics.verified > 0 || metrics.today > 0);

	const radius = 30;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (metrics.progress / 100) * circumference;

	const statusText = getStatusText(metrics.progress, metrics.verified, metrics.today);

	return (
		<div
			className={[
				'p-5 bg-white border rounded-2xl transition-all duration-500',
				isComplete
					? 'border-emerald-200 bg-emerald-50/30 ring-2 ring-emerald-500/10'
					: 'border-slate-200 shadow-sm',
			].join(' ')}
		>
			<div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
				{/* Progress ring + status */}
				<div className="flex items-center gap-6 flex-shrink-0">
					{/* Ring */}
					<div className="relative w-20 h-20 flex-shrink-0">
						<svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
							<circle
								cx="40" cy="40" r={radius}
								fill="transparent"
								stroke="currentColor"
								strokeWidth="7"
								className="text-slate-100"
							/>
							<circle
								cx="40" cy="40" r={radius}
								fill="transparent"
								stroke={isComplete ? '#10b981' : '#3b82f6'}
								strokeWidth="7"
								strokeDasharray={circumference}
								style={{
									strokeDashoffset: offset,
									transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
								}}
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex items-center justify-center text-[15px] font-black text-slate-900">
							{metrics.progress}%
						</div>
					</div>

					{/* Status text + badges */}
					<div className="text-left">
						<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
							Mission Progress
						</p>
						<p className={[
							'text-lg font-black tracking-tight leading-tight mb-3',
							isComplete ? 'text-emerald-700' : 'text-slate-900',
						].join(' ')}>
							{statusText}
						</p>
						<div className="flex items-center gap-2">
							<span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
								<CheckCircle2 className="w-3 h-3" />
								{metrics.verified} Verified
							</span>
							<span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-200">
								<Circle className="w-3 h-3" />
								{metrics.today} Pending
							</span>
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="hidden lg:block w-px h-16 bg-slate-100 self-center" />

				{/* Metric cards */}
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
					{[
						{ label: 'Today', value: metrics.today, icon: <Clock className="w-3 h-3" /> },
						{ label: 'This week', value: metrics.week, icon: <Calendar className="w-3 h-3" /> },
						{ label: 'This month', value: metrics.month, icon: <BarChart3 className="w-3 h-3" /> },
					].map(({ label, value, icon }) => (
						<div
							key={label}
							className="rounded-xl px-4 py-3 bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors"
						>
							<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5 flex items-center gap-1.5">
								{icon}
								{label}
							</p>
							<p className="text-xl font-black text-slate-900">
								{value}
							</p>
						</div>
					))}
					{/* Total Pending Card (High Contrast) */}
					<div className="rounded-xl px-4 py-3 bg-slate-900 border border-slate-800 shadow-lg shadow-slate-900/10 ring-1 ring-white/10">
						<p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1.5">
							Total Pending
						</p>
						<p className="text-xl font-black text-white">
							{metrics.allTime}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
