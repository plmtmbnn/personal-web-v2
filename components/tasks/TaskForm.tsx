'use client';

import { useState } from 'react';
import { PlusCircle, Calendar, Tag, AlertTriangle } from 'lucide-react';
import { TaskPriority } from '@/lib/types/tasks';
import { addTask } from '@/lib/actions/tasks';

export default function TaskForm() {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		
		const payload = {
			title: formData.get('title') as string,
			priority: formData.get('priority') as TaskPriority,
			category: formData.get('category') as string,
			due_date: formData.get('due_date') as string,
		};

		if (!payload.title) return;

		setIsLoading(true);
		try {
			await addTask(payload);
			(e.target as HTMLFormElement).reset();
			setIsOpen(false);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) {
		return (
			<button
				onClick={() => setIsOpen(true)}
				className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground hover:border-accent hover:text-accent transition-all duration-300 flex items-center justify-center gap-2 group"
			>
				<PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
				<span className="font-medium">Add New Daily Task</span>
			</button>
		);
	}

	return (
		<div className="glass-card animate-fade-in mb-8">
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					autoFocus
					name="title"
					placeholder="What needs to be done?"
					className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40"
					required
				/>

				<div className="flex flex-wrap gap-3 pt-4 border-t border-border">
					<div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary rounded-lg border border-border">
						<AlertTriangle className="w-4 h-4 text-muted-foreground" />
						<select 
							name="priority" 
							className="bg-transparent text-sm focus:outline-none cursor-pointer"
							defaultValue="MEDIUM"
						>
							<option value="LOW">Low</option>
							<option value="MEDIUM">Medium</option>
							<option value="HIGH">High</option>
						</select>
					</div>

					<div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary rounded-lg border border-border">
						<Tag className="w-4 h-4 text-muted-foreground" />
						<input
							name="category"
							placeholder="Category"
							className="bg-transparent text-sm focus:outline-none w-24"
							defaultValue="Work"
						/>
					</div>

					<div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary rounded-lg border border-border">
						<Calendar className="w-4 h-4 text-muted-foreground" />
						<input
							type="date"
							name="due_date"
							className="bg-transparent text-sm focus:outline-none"
							defaultValue={new Date().toISOString().split('T')[0]}
						/>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isLoading}
						className="btn-primary py-2 px-6 text-sm"
					>
						{isLoading ? 'Creating...' : 'Create Task'}
					</button>
				</div>
			</form>
		</div>
	);
}
