'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { format, addDays, startOfToday, parseISO } from 'date-fns';
import { Calendar, Filter, Eye, EyeOff } from 'lucide-react';

export default function TaskFilters() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Current Filter Values from URL
	const currentDate = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
	const currentPriority = searchParams.get('priority') || 'ALL';
	const showCompleted = searchParams.get('completed') === 'true';

	const updateParams = (newParams: Record<string, string | null>) => {
		const params = new URLSearchParams(searchParams.toString());
		Object.entries(newParams).forEach(([key, value]) => {
			if (value === null) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
		});
		router.push(`?${params.toString()}`);
	};

	const quickDates = [
		{ label: 'Yesterday', date: format(addDays(new Date(), -1), 'yyyy-MM-dd') },
		{ label: 'Today', date: format(new Date(), 'yyyy-MM-dd') },
		{ label: 'Tomorrow', date: format(addDays(new Date(), 1), 'yyyy-MM-dd') },
	];

	return (
		<div className="space-y-6 mb-8 bg-background-secondary p-4 rounded-3xl border border-border/50">
			{/* Date Selection */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex items-center gap-2">
					<Calendar className="w-5 h-5 text-accent" />
					<h3 className="font-bold">Timeline</h3>
				</div>
				<div className="flex flex-wrap gap-2">
					{quickDates.map((d) => (
						<button
							key={d.label}
							onClick={() => updateParams({ date: d.date })}
							className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
								currentDate === d.date
									? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105'
									: 'bg-background hover:bg-border/30 text-muted-foreground'
							}`}
						>
							{d.label}
						</button>
					))}
					<input
						type="date"
						value={currentDate}
						onChange={(e) => updateParams({ date: e.target.value })}
						className="px-3 py-1.5 rounded-xl text-sm bg-background border border-border/50 focus:outline-none focus:ring-2 ring-accent/10"
					/>
				</div>
			</div>

			<div className="h-px bg-border/40" />

			{/* Filters Row */}
			<div className="flex flex-wrap items-center gap-6">
				{/* Priority Filter */}
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-muted-foreground">
						<Filter className="w-4 h-4" />
						<span className="text-xs uppercase font-bold tracking-tighter">Priority</span>
					</div>
					<div className="flex bg-background p-1 rounded-xl border border-border/50 shadow-sm">
						{['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((p) => (
							<button
								key={p}
								onClick={() => updateParams({ priority: p === 'ALL' ? null : p })}
								className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
									currentPriority === p
										? 'bg-accent text-white shadow-sm'
										: 'text-muted-foreground hover:bg-border/20'
								}`}
							>
								{p}
							</button>
						))}
					</div>
				</div>

				{/* Completion Toggle */}
				<div className="flex items-center gap-3 ml-auto">
					<button
						onClick={() => updateParams({ completed: showCompleted ? null : 'true' })}
						className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
							showCompleted
								? 'bg-green-500/10 border-green-500/30 text-green-600'
								: 'bg-background border-border/50 text-muted-foreground'
						}`}
					>
						{showCompleted ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
						{showCompleted ? 'Showing All' : 'Hide Completed'}
					</button>
				</div>
			</div>
		</div>
	);
}
