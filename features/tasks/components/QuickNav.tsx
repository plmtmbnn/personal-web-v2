"use client";

import React from "react";
import { BarChart3, ListTodo } from "lucide-react";
import { motion } from "framer-motion";

export type TaskViewTab = "agenda" | "analytics";

interface QuickNavProps {
	activeTab: TaskViewTab;
	onTabChange: (tab: TaskViewTab) => void;
}

const navItems = [
	{ id: "agenda", label: "Agenda", icon: ListTodo },
	{ id: "analytics", label: "Analytics", icon: BarChart3 },
];

export default function QuickNav({ activeTab, onTabChange }: QuickNavProps) {
	return (
		<div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
			<nav className="pointer-events-auto flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-full shadow-2xl">
				{navItems.map((item) => {
					const isActive = activeTab === item.id;
					return (
						<button
							key={item.id}
							onClick={() => onTabChange(item.id as TaskViewTab)}
							className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-500 group ${
								isActive 
                  ? item.id === 'agenda' ? "text-emerald-600" : "text-blue-600"
                  : "text-slate-400 hover:text-slate-900"
							}`}
						>
							<item.icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
							<span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
								{item.label}
							</span>
							
							{isActive && (
								<motion.div 
									layoutId="nav-pill"
									className={`absolute inset-0 rounded-full -z-10 ${
                    item.id === 'agenda' ? "bg-emerald-50" : "bg-blue-50"
                  }`}
									transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
								/>
							)}
						</button>
					);
				})}
			</nav>
		</div>
	);
}
