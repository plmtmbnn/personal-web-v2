"use client";

import { BarChart3, ListTodo, CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export type TaskViewTab = "agenda" | "analytics" | "review";

interface QuickNavProps {
	activeTab: TaskViewTab;
	onTabChange: (tab: TaskViewTab) => void;
}

const navItems = [
	{ id: "agenda", label: "Agenda", icon: ListTodo },
	{ id: "analytics", label: "Analytics", icon: BarChart3 },
	{ id: "review", label: "Weekly Review", icon: CalendarDays },
];

export default function QuickNav({ activeTab, onTabChange }: QuickNavProps) {
	const reduceMotion = useReducedMotion();
	return (
		<div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
			<nav className="pointer-events-auto flex items-center gap-1 p-1.5 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg shadow-slate-200/50">
				{navItems.map((item) => {
					const isActive = activeTab === item.id;
					return (
						<button
							key={item.id}
							onClick={() => onTabChange(item.id as TaskViewTab)}
							className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 group cursor-pointer ${
								isActive
									? item.id === "agenda"
										? "text-emerald-700 font-extrabold"
										: item.id === "analytics"
											? "text-indigo-700 font-extrabold"
											: "text-violet-700 font-extrabold"
									: "text-slate-600 font-bold hover:text-slate-950"
							}`}
						>
							<item.icon
								className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
							/>
							<span className="text-[10px] font-extrabold uppercase tracking-wider hidden sm:inline">
								{item.label}
							</span>

							{isActive && (
								<motion.div
									layoutId={reduceMotion ? undefined : "nav-pill"}
									className={`absolute inset-0 rounded-full -z-10 ${
										item.id === "agenda"
											? "bg-emerald-50 border border-emerald-100"
											: item.id === "analytics"
												? "bg-indigo-50 border border-indigo-100"
												: "bg-violet-50 border border-violet-100"
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
