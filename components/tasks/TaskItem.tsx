"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  GripVertical,
  Tag,
  Edit2
} from "lucide-react";
import type { Task } from "@/lib/types/tasks";
import { motion, AnimatePresence } from "framer-motion";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { renderTextWithLinks } from "@/lib/utils/tasks";

interface TaskItemProps {
	task: Task;
  index: number;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  onToggle: (taskId: string, currentStatus: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function TaskItem({ 
  task, 
  provided, 
  snapshot, 
  onToggle, 
  onDelete,
  onUpdate 
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

	const priorityColors = {
		HIGH: "bg-rose-50 text-rose-700 border-rose-100",
		MEDIUM: "bg-amber-50 text-amber-700 border-amber-100",
		LOW: "bg-emerald-50 text-emerald-700 border-emerald-100",
	};

  // Auto-expand and focus logic
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== task.title) {
      onUpdate(task.id, { title: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(task.title);
      setIsEditing(false);
    }
  };

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			className={`group relative flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl transition-all duration-300 ${
				snapshot.isDragging ? "shadow-2xl border-emerald-500 ring-2 ring-emerald-500/10 z-50" : "hover:border-slate-300"
			} ${task.is_completed ? "bg-slate-50/50 opacity-75" : ""}`}
		>
      {/* Drag Handle */}
      <div 
        {...provided.dragHandleProps}
        className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Visual Indicator Line */}
      <div className={`absolute left-10 top-4 bottom-4 w-1 rounded-full transition-all ${
        task.is_completed ? "bg-slate-200" : task.priority === 'HIGH' ? "bg-rose-500" : task.priority === 'MEDIUM' ? "bg-amber-500" : "bg-emerald-500"
      }`} />

			<button
				onClick={() => onToggle(task.id, task.is_completed)}
				className={`flex-shrink-0 transition-all duration-300 p-1.5 rounded-xl ml-2 ${
					task.is_completed 
            ? "bg-emerald-100 text-emerald-600" 
            : "text-slate-300 hover:bg-slate-100 hover:text-slate-400"
				}`}
			>
				{task.is_completed ? (
					<CheckCircle2 className="w-6 h-6" />
				) : (
					<Circle className="w-6 h-6" />
				)}
			</button>

			<div className="flex-1 min-w-0 py-1">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            rows={1}
            className="w-full bg-slate-50 border border-emerald-500 rounded-lg px-2 py-1 text-sm font-bold text-slate-900 focus:outline-none ring-4 ring-emerald-500/10 resize-none overflow-hidden block"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className={`text-sm font-bold text-slate-900 transition-all cursor-text break-all whitespace-pre-wrap ${
              task.is_completed ? "line-through text-slate-400" : ""
            }`}
            title="Double click to edit"
          >
            {renderTextWithLinks(task.title)}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>

          {task.category && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
              <Tag className="w-2.5 h-2.5" />
              {task.category}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 ml-1">
            <Clock className="w-3 h-3" />
            <span>{task.due_date}</span>
          </div>
        </div>
			</div>

			<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
        <button
					onClick={() => setIsEditing(true)}
					className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
					title="Quick Edit"
				>
					<Edit2 className="w-4 h-4" />
				</button>
				<button
					onClick={() => onDelete(task.id)}
					className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
					title="Delete Task"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}
