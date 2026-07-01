"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { List, X } from "lucide-react";
import { parseHeadings, type HeadingItem } from "@/features/blog/utils";

interface TableOfContentsProps {
	content: string;
}

/**
 * TableOfContents
 * Auto-generates a sticky, collapsible ToC from markdown headings.
 * Highlights the active section based on scroll position.
 */
export default function TableOfContents({ content }: TableOfContentsProps) {
	const [headings, setHeadings] = useState<HeadingItem[]>([]);
	const [activeId, setActiveId] = useState<string>("");
	const [isOpen, setIsOpen] = useState(true);

	// Parse headings on mount
	useEffect(() => {
		const parsed = parseHeadings(content);
		setHeadings(parsed);
	}, [content]);

	// Track active heading based on scroll
	useEffect(() => {
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-80px 0px -80% 0px",
			},
		);

		// Observe all heading elements
		headings.forEach(({ id }) => {
			const element = document.getElementById(id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	}, [headings]);

	// Don't render if no headings
	if (headings.length === 0) return null;

	const handleClick = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	return (
		<div className="hidden xl:block print:hidden">
			<div className="fixed top-32 right-8 w-72 z-30">
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: 0.5 }}
					className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
				>
					{/* Header */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors"
					>
						<div className="flex items-center gap-2">
							<List className="w-4 h-4 text-slate-600" />
							<span className="text-xs font-black uppercase tracking-widest text-slate-700">
								Contents
							</span>
						</div>
						<motion.div
							animate={{ rotate: isOpen ? 0 : 180 }}
							transition={{ duration: 0.2 }}
						>
							<X
								className={`w-4 h-4 text-slate-400 transition-transform ${
									isOpen ? "" : "rotate-45"
								}`}
							/>
						</motion.div>
					</button>

					{/* ToC List */}
					<AnimatePresence>
						{isOpen && (
							<motion.nav
								initial={{ height: 0 }}
								animate={{ height: "auto" }}
								exit={{ height: 0 }}
								transition={{ duration: 0.3 }}
								className="overflow-hidden"
							>
								<ul className="py-4 px-3 space-y-1 max-h-[60vh] overflow-y-auto no-scrollbar">
									{headings.map((heading) => {
										const isActive = activeId === heading.id;
										const indentClass =
											heading.level === 1
												? "pl-3"
												: heading.level === 2
													? "pl-5"
													: "pl-7";

										return (
											<li key={heading.id}>
												<button
													onClick={() => handleClick(heading.id)}
													className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all
                            ${indentClass}
                            ${
															isActive
																? "bg-slate-900 text-white font-bold"
																: "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
														}
                          `}
												>
													<span className="line-clamp-2">{heading.text}</span>
												</button>
											</li>
										);
									})}
								</ul>
							</motion.nav>
						)}
					</AnimatePresence>
				</motion.div>
			</div>
		</div>
	);
}
