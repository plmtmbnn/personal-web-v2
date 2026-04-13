"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  GripVertical,
  Tag,
  Edit2
} from "lucide-react";
import type { Task } from "@/features/tasks/types";
import { motion, AnimatePresence } from "framer-motion";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { renderTextWithLinks } from "@/features/tasks/utils";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

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


  const PRIORITY_CONFIG = {
  HIGH:   { label: "High",   emoji: "🔴", color: "bg-rose-50   text-rose-700   border-rose-100"   },
  MEDIUM: { label: "Medium", emoji: "🟡", color: "bg-amber-50  text-amber-700  border-amber-100"  },
  LOW:    { label: "Low",    emoji: "🟢", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
} satisfies Record<"HIGH" | "MEDIUM" | "LOW", { label: string; emoji: string; color: string }>;

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

const timeLeft = useMemo(() => {
  if (!task.due_date || task.is_completed) return null;

  const today = startOfDay(new Date());
  const dueDate = startOfDay(parseISO(task.due_date));
  const diff = differenceInDays(dueDate, today);

  if (diff < 0) {
    const overdue = Math.abs(diff);
    return {
      text: overdue === 1 ? "1 day overdue" : `${overdue} days overdue`,
      emoji: "🚨",
      color: "text-red-700 bg-red-50 border-red-200",
      urgency: "overdue",
    };
  }

  if (diff === 0) {
    return {
      text: "Due today",
      emoji: "🔥",
      color: "text-red-600 bg-red-50 border-red-100",
      urgency: "critical",
    };
  }

  if (diff === 1) {
    return {
      text: "Due tomorrow",
      emoji: "⏳",
      color: "text-orange-600 bg-orange-50 border-orange-100",
      urgency: "high",
    };
  }

  if (diff <= 3) {
    return {
      text: `${diff} days left`,
      emoji: "📅",
      color: "text-amber-600 bg-amber-50 border-amber-100",
      urgency: "medium",
    };
  }

  if (diff <= 7) {
    return {
      text: `${diff} days left`,
      emoji: "🗓️",
      color: "text-blue-600 bg-blue-50 border-blue-100",
      urgency: "low",
    };
  }

  return {
    text: `${diff} days left`,
    emoji: "📆",
    color: "text-slate-500 bg-slate-100 border-slate-200",
    urgency: "none",
  };
}, [task.due_date, task.is_completed]);

const { label, emoji, color } = PRIORITY_CONFIG[task.priority];

	return (
		<div
			ref={provided.innerRef}
			{...provided.draggableProps}
			className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-4 bg-white border border-slate-200 rounded-[1.5rem] sm:rounded-2xl transition-all duration-300 ${
				snapshot.isDragging ? "shadow-2xl border-emerald-500 ring-2 ring-emerald-500/10 z-50" : "hover:border-slate-300 shadow-sm"
			} ${task.is_completed ? "bg-slate-50/50 opacity-75" : ""}`}
		>
      {/* Drag Handle & Checkbox Header Group (Mobile Only) */}
      <div className="flex items-center w-full sm:w-auto gap-1 sm:gap-0">
        <div 
          {...provided.dragHandleProps}
          className="text-slate-300 hover:text-slate-400 cursor-grab active:cursor-grabbing p-1 -ml-1 sm:ml-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <button
          onClick={() => onToggle(task.id, task.is_completed)}
          className={`flex-shrink-0 transition-all duration-300 p-2 sm:p-1.5 rounded-xl ml-1 sm:ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            task.is_completed 
              ? "bg-emerald-100 text-emerald-600" 
              : "text-slate-300 hover:bg-slate-100 hover:text-slate-400"
          }`}
        >
          {task.is_completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
        </button>
      </div>

			<div className="flex-1 w-full min-w-0 sm:py-1">
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
            className="w-full bg-slate-50 border border-emerald-500 rounded-xl px-3 py-2 text-base font-semibold text-slate-900 focus:outline-none ring-4 ring-emerald-500/10 resize-none overflow-hidden block"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className={`text-base sm:text-sm font-semibold text-slate-900 transition-all cursor-text break-words whitespace-pre-wrap ${
              task.is_completed ? "line-through text-slate-400" : ""
            }`}
            title="Double click to edit"
          >
            {renderTextWithLinks(task.title)}
          </div>
        )}
        
        {/* Metadata Badges (Visible on both, but Desktop only layout) */}
        <div className="hidden sm:flex flex-wrap items-center gap-2 mt-2">
<span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${color}`}>
  {emoji} {label}
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
          {timeLeft && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${timeLeft.color}`}>
              <span>{timeLeft.emoji}</span>
              {timeLeft.text}
            </span>
          )}
        </div>
			</div>

      {/* Action Footer Row (Mobile Focused) */}
      <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-slate-100 sm:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{task.due_date}</span>
          </div>
          {timeLeft && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight border ${timeLeft.color}`}>
              {timeLeft.emoji} {timeLeft.text}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2.5 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl active:bg-blue-50 active:text-blue-600 active:border-blue-100 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2.5 text-slate-400 bg-slate-50 border border-slate-100 rounded-xl active:bg-rose-50 active:text-rose-600 active:border-rose-100 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Only Actions */}
			<div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
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
