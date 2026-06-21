"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, ChevronDown } from "lucide-react";
import type { HeadingItem } from "@/features/blog/utils";

interface TableOfContentsProps {
	headings: HeadingItem[];
}

/**
 * TableOfContents
 * Renders a sticky sidebar on desktop and a collapsible accordion on mobile.
 * Highlights the currently visible section via IntersectionObserver.
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
	const [activeId, setActiveId] = useState<string>("");
	const [mobileOpen, setMobileOpen] = useState(false);

	// Track active heading via IntersectionObserver
	useEffect(() => {
		if (!headings.length) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-20% 0% -70% 0%",
				threshold: 0,
			},
		);

		for (const heading of headings) {
			const el = document.getElementById(heading.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [headings]);

	if (!headings.length) return null;

	const handleClick = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
			setActiveId(id);
			setMobileOpen(false);
		}
	};

	const HeadingList = () => (
		<ul className="space-y-1">
			{headings.map((heading) => {
				const isActive = activeId === heading.id;
				return (
					<li
						key={heading.id}
						style={{
							paddingLeft:
								heading.level === 1 ? 0 : heading.level === 2 ? 0 : 16,
						}}
					>
						<button
							onClick={() => handleClick(heading.id)}
							className={`w-full text-left text-[11px] font-semibold leading-snug py-1.5 px-2 rounded-lg transition-all duration-200 ${
								isActive
									? "text-blue-600 bg-blue-50 font-bold"
									: "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
							} ${heading.level === 3 ? "text-[10px] font-medium" : ""}`}
						>
							{heading.level === 3 && (
								<span className="inline-block w-2 h-px bg-current mr-1.5 mb-0.5 opacity-50" />
							)}
							{heading.text}
						</button>
					</li>
				);
			})}
		</ul>
	);

	return (
		<>
			{/* ── Desktop: sticky sidebar ── */}
			<aside className="hidden xl:block w-64 flex-shrink-0 self-start sticky top-24">
				<div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
					<div className="flex items-center gap-2 mb-4">
						<List className="w-3.5 h-3.5 text-slate-400" />
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
							Contents
						</span>
					</div>
					<HeadingList />
				</div>
			</aside>

			{/* ── Mobile: collapsible accordion ── */}
			<div className="xl:hidden mb-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
				<button
					onClick={() => setMobileOpen((v) => !v)}
					className="w-full flex items-center justify-between px-5 py-4"
				>
					<div className="flex items-center gap-2">
						<List className="w-3.5 h-3.5 text-slate-400" />
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
							Table of Contents
						</span>
					</div>
					<motion.div
						animate={{ rotate: mobileOpen ? 180 : 0 }}
						transition={{ duration: 0.2 }}
					>
						<ChevronDown className="w-4 h-4 text-slate-400" />
					</motion.div>
				</button>

				<AnimatePresence initial={false}>
					{mobileOpen && (
						<motion.div
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: "auto", opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.22, ease: "easeInOut" }}
							className="overflow-hidden"
						>
							<div className="px-5 pb-5 border-t border-slate-100 pt-3">
								<HeadingList />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</>
	);
}
