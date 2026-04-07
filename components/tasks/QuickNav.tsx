"use client";

import React, { useState, useEffect } from "react";
import { LayoutDashboard, BarChart3, ListTodo } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
	{ id: "tasks-overview", label: "Overview", icon: LayoutDashboard },
	{ id: "analytics-overview", label: "Analytics", icon: BarChart3 },
	{ id: "agenda-section", label: "Agenda", icon: ListTodo },
];

export default function QuickNav() {
	const [activeSection, setActiveSection] = useState("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{ threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
		);

		for (const item of navItems) {
			const el = document.getElementById(item.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, []);

	const scrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			const offset = 100;
			const bodyRect = document.body.getBoundingClientRect().top;
			const elementRect = el.getBoundingClientRect().top;
			const elementPosition = elementRect - bodyRect;
			const offsetPosition = elementPosition - offset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth"
			});
		}
	};

	return (
		<div className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
			<nav className="pointer-events-auto flex items-center gap-1 p-1.5 bg-background/60 backdrop-blur-xl border border-border/40 rounded-full shadow-2xl">
				{navItems.map((item) => {
					const isActive = activeSection === item.id;
					return (
						<button
							key={item.id}
							onClick={() => scrollTo(item.id)}
							className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 group ${
								isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
							}`}
						>
							<item.icon className={`w-4 h-4 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
							<span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">
								{item.label}
							</span>
							
							{isActive && (
								<motion.div 
									layoutId="nav-underline"
									className="absolute bottom-1 left-4 right-4 h-0.5 bg-accent rounded-full"
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
