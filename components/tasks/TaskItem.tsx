"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
	CheckCircle2, 
	Circle, 
	Trash2, 
	GripVertical,
	Maximize2,
	X,
	Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Task } from "@/lib/types/tasks";

interface TaskItemProps {
	task: Task;
	index: number;
	provided: any;
	snapshot: any;
	onToggle: (taskId: string, currentStatus: boolean) => void;
	onUpdate: (taskId: string, updates: Partial<Task>) => void;
	onDelete: (taskId: string) => void;
}

export default function TaskItem({ 
	task, 
	onToggle, 
	onUpdate,
	onDelete, 
	provided, 
	snapshot 
}: TaskItemProps) {
	const [isFocusMode, setIsFocusMode] = useState(false);
	const [focusSeconds, setFocusSeconds] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [editValue, setEditValue] = useState(task.title);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Lock body scroll when Focus Mode is active
	useEffect(() => {
		if (isFocusMode) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isFocusMode]);

	// Auto-resize textarea
	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [editValue, isEditing]);

	useEffect(() => {
		setEditValue(task.title);
	}, [task.title]);

	useEffect(() => {
		let interval: NodeJS.Timeout;
		if (isFocusMode) {
			interval = setInterval(() => {
				setFocusSeconds((prev) => prev + 1);
			}, 1000);
		} else {
			setFocusSeconds(0);
		}
		return () => clearInterval(interval);
	}, [isFocusMode]);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleSave = () => {
		if (editValue.trim() && editValue !== task.title) {
			onUpdate(task.id, { title: editValue.trim() });
		} else {
			setEditValue(task.title);
		}
		setIsEditing(false);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSave();
		} else if (e.key === "Escape") {
			setEditValue(task.title);
			setIsEditing(false);
		}
	};

	const taskContent = (isFocus: boolean = false) => (
		<div className="flex items-start gap-4 flex-1 min-w-0">
			<button
				onClick={() => onToggle(task.id, task.is_completed)}
				className={`mt-1 flex-shrink-0 transition-all duration-300 transform hover:scale-110 active:scale-90 ${
					task.is_completed ? "text-green-500" : "text-muted-foreground hover:text-accent"
				}`}
			>
				{task.is_completed ? (
					<CheckCircle2 className="w-7 h-7" />
				) : (
					<Circle className="w-7 h-7" />
				)}
			</button>
			<div className="flex-1 min-w-0">
				{isEditing && !isFocus ? (
					<textarea
						ref={textareaRef}
						autoFocus
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						onBlur={handleSave}
						onKeyDown={handleKeyDown}
						rows={1}
						className="w-full bg-background-secondary border border-accent/30 rounded-lg px-2 py-1 text-lg font-semibold focus:outline-none focus:ring-2 ring-accent/20 transition-all resize-none overflow-hidden block"
					/>
				) : (
					<h4
						onDoubleClick={() => !isFocus && setIsEditing(true)}
						className={`font-semibold transition-all duration-300 cursor-text select-none break-words whitespace-pre-wrap ${
							task.is_completed ? "line-through text-muted-foreground decoration-2" : ""
						} ${isFocus ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg"}`}
					>
						{task.title}
					</h4>
				)}
				<div className="flex flex-wrap items-center gap-3 mt-2">
					<span className="text-[10px] font-bold px-2 py-0.5 bg-background-secondary rounded text-muted-foreground uppercase">
						{task.category || "General"}
					</span>
					<span
						className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
							task.priority === "HIGH"
								? "text-red-600 bg-red-100 border border-red-200"
								: task.priority === "MEDIUM"
								? "text-amber-600 bg-amber-100 border border-amber-200"
								: "text-blue-600 bg-blue-100 border border-blue-200"
						}`}
					>
						{task.priority}
					</span>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* Regular List Item */}
			<div
				ref={provided.innerRef}
				{...provided.draggableProps}
				className={`glass-card group flex items-center gap-3 p-5 transition-all duration-300 ${
					snapshot.isDragging ? "shadow-2xl ring-2 ring-accent/20 bg-background/80 scale-[1.02] z-50" : ""
				} ${task.is_completed ? "opacity-50 grayscale-[0.8]" : ""}`}
			>
				<div 
					{...provided.dragHandleProps}
					className="p-1 text-muted-foreground/30 hover:text-accent transition-colors cursor-grab active:cursor-grabbing"
				>
					<GripVertical className="w-5 h-5" />
				</div>

				{taskContent()}

				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button
						onClick={() => setIsFocusMode(true)}
						className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
						title="Focus Mode"
					>
						<Maximize2 className="w-5 h-5" />
					</button>
					<button
						onClick={() => onDelete(task.id)}
						className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
						title="Delete task"
					>
						<Trash2 className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Focus Mode Full Screen Overlay */}
			<AnimatePresence>
				{isFocusMode && (
					<div className="fixed inset-0 z-[100] flex items-center justify-center">
						{/* High-blur backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsFocusMode(false)}
							className="absolute inset-0 bg-background/60 backdrop-blur-2xl"
						/>

						{/* Centered Focus Card */}
						<motion.div
							initial={{ scale: 0.8, opacity: 0, y: 40 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.8, opacity: 0, y: 40 }}
							transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
							className="relative w-full max-w-3xl p-8 md:p-12 mx-4 bg-background/40 glass shadow-2xl rounded-[3rem] border border-border/40 max-h-[85vh] overflow-y-auto"
						>
							<button 
								onClick={() => setIsFocusMode(false)}
								className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-foreground hover:bg-background-secondary rounded-2xl transition-all"
							>
								<X className="w-6 h-6" />
							</button>

							<div className="mb-12 flex items-center justify-between">
								<div className="flex items-center gap-3 text-accent bg-accent/10 px-6 py-3 rounded-2xl">
									<Timer className="w-6 h-6 animate-pulse" />
									<span className="font-mono font-black text-2xl">{formatTime(focusSeconds)}</span>
								</div>
								<span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50">Deep Focus</span>
							</div>

							<div className="space-y-12">
								<div className="w-full">
									{taskContent(true)}
								</div>
								
								<div className="h-px bg-border/20 w-full" />
								
								<div className="flex justify-center">
									<button
										onClick={() => setIsFocusMode(false)}
										className="px-12 py-5 bg-accent text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-accent/40 hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
									>
										Exit Focus Mode
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
