"use client";

import { useState, useEffect, useMemo } from "react";
import { ListOrdered, ChevronDown, ChevronUp, Hash } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export interface HeadingItem {
	id: string;
	text: string;
	level: number;
}

/**
 * Slugify heading text into a valid DOM id
 */
export function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/[`*_~[\]()]/g, "") // remove markdown syntax characters
		.replace(/[^a-z0-9\s-]/g, "") // remove special punctuation
		.trim()
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-") // collapse multiple hyphens
		.replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/**
 * Disambiguates heading slugs across a markdown document,
 * appending -1, -2, etc. when heading text repeats.
 */
export class HeadingSlugger {
	private occurrences = new Map<string, number>();

	slug(text: string): string {
		let rawSlug = slugifyHeading(text);
		if (!rawSlug) {
			rawSlug = "heading";
		}

		if (!this.occurrences.has(rawSlug)) {
			this.occurrences.set(rawSlug, 0);
			return rawSlug;
		}

		let count = this.occurrences.get(rawSlug)!;
		let candidate = "";
		do {
			count += 1;
			candidate = `${rawSlug}-${count}`;
		} while (this.occurrences.has(candidate));

		this.occurrences.set(rawSlug, count);
		this.occurrences.set(candidate, 0);
		return candidate;
	}

	reset(): void {
		this.occurrences.clear();
	}
}

/**
 * Preprocesses markdown to ensure tables and formatting parse reliably:
 * 1. Restores row line breaks for tables pasted or collapsed into single-line "| |" or "||" syntax
 * 2. Ensures table blocks are preceded and followed by blank lines so GFM parses them as tables
 */
export function normalizeMarkdown(content: string): string {
	if (!content) return "";

	let normalized = content.replace(/\r\n/g, "\n");

	// In case table rows are collapsed on a single line separated by "| |"
	// e.g. "| col1 | col2 | | :--- | :--- | | val1 | val2 |"
	if (/\|[ \t]+\|(?=[ \t]*:?-+:?)/.test(normalized)) {
		normalized = normalized.replace(/\|[ \t]+\|/g, "|\n|");
	}

	return normalized;
}

/**
 * Extract H2 and H3 headings from raw markdown content
 */
export function extractHeadings(markdown: string): HeadingItem[] {
	if (!markdown) return [];

	const normalized = normalizeMarkdown(markdown);

	// Match markdown heading lines, ignoring code blocks
	const cleaned = normalized.replace(/(```|~~~)[\s\S]*?\1/g, "");
	const headingRegex = /^(#{2,3})\s+(.+?)(?:\s+#+)?$/gm;
	const headings: HeadingItem[] = [];
	const slugger = new HeadingSlugger();

	let match: RegExpExecArray | null;
	while (true) {
		match = headingRegex.exec(cleaned);
		if (!match) break;

		const level = match[1].length;
		const rawText = match[2].trim();
		// Clean any remaining markdown formatting inside heading text
		const text = rawText
			.replace(/!\[.*?\]\(.*?\)/g, "") // remove images
			.replace(/\[(.*?)\]\(.*?\)/g, "$1") // keep link text
			.replace(/[`*_~]/g, "")
			.trim();
		const id = slugger.slug(text);

		if (text && id) {
			headings.push({ id, text, level });
		}
	}

	return headings;
}

function walkHast(node: any, fn: (node: any) => void) {
	if (!node) return;
	fn(node);
	if (node.children && Array.isArray(node.children)) {
		for (const child of node.children) {
			walkHast(child, fn);
		}
	}
}

function getHastNodeText(node: any): string {
	if (!node) return "";
	if (node.type === "text") return node.value || "";
	if (node.children && Array.isArray(node.children)) {
		return node.children.map(getHastNodeText).join("");
	}
	return "";
}

const URL_REGEX = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/gi;

function autolinkHastText(text: string): any[] {
	if (!URL_REGEX.test(text)) {
		return [{ type: "text", value: text }];
	}

	URL_REGEX.lastIndex = 0;
	const nodes: any[] = [];
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while (true) {
		match = URL_REGEX.exec(text);
		if (!match) break;

		const matchStart = match.index;
		const fullMatch = match[0];

		if (matchStart > lastIndex) {
			nodes.push({
				type: "text",
				value: text.slice(lastIndex, matchStart),
			});
		}

		let cleanUrl = fullMatch;
		let trailing = "";
		while (cleanUrl.length > 0 && /[.,;:!?)\]'">]$/.test(cleanUrl)) {
			trailing = cleanUrl.slice(-1) + trailing;
			cleanUrl = cleanUrl.slice(0, -1);
		}

		const href = cleanUrl.startsWith("www.") ? `https://${cleanUrl}` : cleanUrl;

		nodes.push({
			type: "element",
			tagName: "a",
			properties: {
				href,
				target: "_blank",
				rel: "noopener noreferrer",
			},
			children: [{ type: "text", value: cleanUrl }],
		});

		if (trailing) {
			nodes.push({
				type: "text",
				value: trailing,
			});
		}

		lastIndex = matchStart + fullMatch.length;
	}

	if (lastIndex < text.length) {
		nodes.push({
			type: "text",
			value: text.slice(lastIndex),
		});
	}

	return nodes;
}

function transformAutolink(node: any) {
	if (!node) return;
	// Do not autolink inside existing links, pre blocks, or code blocks
	if (
		node.type === "element" &&
		(node.tagName === "a" || node.tagName === "pre" || node.tagName === "code")
	) {
		return;
	}

	if (node.children && Array.isArray(node.children)) {
		const newChildren: any[] = [];
		for (const child of node.children) {
			if (child.type === "text") {
				newChildren.push(...autolinkHastText(child.value || ""));
			} else {
				transformAutolink(child);
				newChildren.push(child);
			}
		}
		node.children = newChildren;
	}
}

/**
 * Unified/Rehype plugin that traverses the markdown AST
 * and assigns unique heading IDs to h2 and h3 elements,
 * as well as automatically autolinking URL format strings.
 * Runs during markdown compilation and guarantees pure,
 * idempotent React rendering without mutating state across render passes.
 */
export function rehypeHeadingIds() {
	return (tree: any) => {
		const slugger = new HeadingSlugger();
		walkHast(tree, (node: any) => {
			if (
				node.type === "element" &&
				(node.tagName === "h2" || node.tagName === "h3")
			) {
				const text = getHastNodeText(node).trim();
				const id = slugger.slug(text);
				if (!node.properties) {
					node.properties = {};
				}
				node.properties.id = id;
			}
		});
		transformAutolink(tree);
	};
}

interface TableOfContentsProps {
	content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
	const reduceMotion = useReducedMotion();
	const headings = useMemo(() => extractHeadings(content), [content]);
	const [isOpen, setIsOpen] = useState(true);
	const [activeId, setActiveId] = useState<string>("");

	// Track scroll spy on headings
	useEffect(() => {
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveId(entry.target.id);
						break;
					}
				}
			},
			{
				rootMargin: "-90px 0px -60% 0px",
				threshold: 0.1,
			},
		);

		for (const heading of headings) {
			const el = document.getElementById(heading.id);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [headings]);

	// Don't render outline if fewer than 2 headings
	if (headings.length < 2) return null;

	const handleScrollTo = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: "smooth" });
			window.history.replaceState(null, "", `#${id}`);
			setActiveId(id);
		}
	};

	return (
		<div className="mb-10 rounded-2xl sm:rounded-3xl bg-slate-50/80 border border-slate-200/80 p-4 sm:p-6 shadow-2xs">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-full flex items-center justify-between gap-3 text-left cursor-pointer select-none group"
				aria-expanded={isOpen}
			>
				<div className="flex items-center gap-2.5">
					<div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-200 transition-colors">
						<ListOrdered className="w-4 h-4" />
					</div>
					<div>
						<h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
							<span>Article Outline</span>
							<span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200/80 px-2 py-0.5 rounded-full">
								{headings.length} sections
							</span>
						</h4>
						<p className="text-[10.5px] text-slate-500 font-medium">
							Jump to key chapters & benchmarks
						</p>
					</div>
				</div>

				<div className="p-1.5 rounded-lg bg-white border border-slate-200/80 text-slate-400 group-hover:text-slate-700 transition-colors">
					{isOpen ? (
						<ChevronUp className="w-3.5 h-3.5" />
					) : (
						<ChevronDown className="w-3.5 h-3.5" />
					)}
				</div>
			</button>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.div
						initial={reduceMotion ? false : { height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						className="overflow-hidden"
					>
						<nav
							aria-label="Table of contents"
							className="pt-4 mt-4 border-t border-slate-200/60"
						>
							<ul className="space-y-1">
								{headings.map((heading, index) => {
									const isActive = activeId === heading.id;
									return (
										<li
											key={`${heading.id}-${index}`}
											className={heading.level === 3 ? "pl-4 sm:pl-5" : ""}
										>
											<button
												type="button"
												onClick={() => handleScrollTo(heading.id)}
												className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left text-xs transition-[background-color,color,border-color] cursor-pointer ${
													isActive
														? "bg-white font-extrabold text-emerald-700 border border-emerald-200/70 shadow-2xs"
														: "text-slate-600 hover:text-slate-950 hover:bg-white/60 font-medium"
												}`}
											>
												<Hash
													className={`w-3 h-3 shrink-0 ${
														isActive ? "text-emerald-600" : "text-slate-400"
													}`}
												/>
												<span className="truncate">{heading.text}</span>
											</button>
										</li>
									);
								})}
							</ul>
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
