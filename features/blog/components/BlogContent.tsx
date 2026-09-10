"use client";

import React, { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/prism-light";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("typescript", typescript);
SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("sql", sql);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("bash", bash);

import {
	Copy,
	Check,
	Info,
	Sparkles,
	AlertCircle,
	AlertTriangle,
	ShieldAlert,
	ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import remarkGfm from "remark-gfm";
import {
	rehypeHeadingIds,
	slugifyHeading,
	normalizeMarkdown,
} from "./TableOfContents";

const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeHeadingIds];

interface BlogContentProps {
	content: string;
}

// ─────────────────────────────────────────────
// Extract text recursively from React children
// ─────────────────────────────────────────────
function getTextFromChildren(children: React.ReactNode): string {
	if (!children) return "";
	if (typeof children === "string" || typeof children === "number") {
		return String(children);
	}
	if (Array.isArray(children)) {
		return children.map(getTextFromChildren).join("");
	}
	if (React.isValidElement(children)) {
		const props = children.props as { children?: React.ReactNode };
		return getTextFromChildren(props?.children);
	}
	return "";
}

// ─────────────────────────────────────────────
// Copy Button — per code block
// ─────────────────────────────────────────────
function CopyButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);
	const reduceMotion = useReducedMotion();

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// clipboard not available
		}
	}, [code]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			title={copied ? "Copied!" : "Copy code"}
			className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider cursor-pointer"
		>
			<AnimatePresence mode="wait" initial={false}>
				{copied ? (
					<motion.span
						key="check"
						initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="flex items-center gap-1 text-emerald-400"
					>
						<Check className="w-3 h-3" />
						Copied
					</motion.span>
				) : (
					<motion.span
						key="copy"
						initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						className="flex items-center gap-1"
					>
						<Copy className="w-3 h-3" />
						Copy
					</motion.span>
				)}
			</AnimatePresence>
		</button>
	);
}

// ─────────────────────────────────────────────
// BlogContent
// ─────────────────────────────────────────────

export default function BlogContent({ content }: BlogContentProps) {
	const normalizedContent = normalizeMarkdown(content);

	return (
		<div
			className="prose prose-slate prose-lg max-w-none
        prose-headings:font-extrabold prose-headings:text-slate-950 prose-headings:tracking-tight
        prose-p:text-slate-700 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-[17px]
        prose-a:text-emerald-700 prose-a:font-bold prose-a:underline prose-a:underline-offset-4 prose-a:decoration-emerald-300 hover:prose-a:decoration-emerald-600 hover:prose-a:text-emerald-800 transition-colors
        prose-strong:text-slate-950 prose-strong:font-bold
        prose-li:text-slate-700 prose-li:marker:text-emerald-500
        prose-code:text-slate-800 prose-code:bg-slate-100 prose-code:border prose-code:border-slate-200/80 prose-code:px-2 prose-code:py-0.5 prose-code:rounded-lg prose-code:font-mono prose-code:text-xs sm:prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-transparent prose-pre:p-0
        prose-img:rounded-3xl prose-img:border border-slate-200/80 shadow-xs
        prose-h2:mt-12 prose-h2:mb-4 prose-h2:scroll-mt-28 prose-h2:text-2xl sm:prose-h2:text-3xl
        prose-h3:mt-8 prose-h3:mb-3 prose-h3:scroll-mt-28 prose-h3:text-xl sm:prose-h3:text-2xl"
		>
			<ReactMarkdown
				remarkPlugins={REMARK_PLUGINS}
				rehypePlugins={REHYPE_PLUGINS}
				components={{
					// ── Code blocks & inline code ──────────────────────
					code({ className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || "");
						const codeString = String(children).replace(/\n$/, "");

						if (match) {
							return (
								<div className="relative w-full overflow-hidden rounded-2xl !my-8 shadow-sm border border-slate-800 bg-[#282c34] max-h-[32rem] group/code not-prose">
									<CopyButton code={codeString} />
									<div className="absolute top-3 left-3 z-10 text-[10px] font-black uppercase tracking-widest text-white/40 select-none">
										{match[1]}
									</div>
									<div className="overflow-auto max-h-[32rem]">
										<SyntaxHighlighter
											style={oneDark as any}
											language={match[1]}
											PreTag="div"
											customStyle={{
												margin: 0,
												padding: "3.5rem 1.5rem 1.5rem",
												fontSize: "0.875rem",
												lineHeight: "1.65",
												backgroundColor: "transparent",
												whiteSpace: "pre",
												wordBreak: "normal",
												overflowWrap: "normal",
											}}
											{...props}
										>
											{codeString}
										</SyntaxHighlighter>
									</div>
								</div>
							);
						}

						const text = codeString.trim();
						const isUrl = /^(https?:\/\/|www\.)[^\s]+$/i.test(text);

						if (isUrl) {
							const href = text.startsWith("www.") ? `https://${text}` : text;
							return (
								<a
									href={href}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-slate-200/80 hover:border-emerald-300 font-mono text-xs sm:text-sm font-medium transition-colors !no-underline group/codelink"
								>
									<code className={className} {...props}>
										{children}
									</code>
									<ExternalLink className="w-3 h-3 shrink-0 opacity-60 group-hover/codelink:opacity-100 transition-opacity text-emerald-600" />
								</a>
							);
						}

						return (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},

					// ── Headings — add scroll-margin + id anchor ───────
					h2({ id, children, ...props }: any) {
						const text = getTextFromChildren(children);
						const headingId = id || slugifyHeading(text);
						return (
							<h2
								id={headingId}
								className="group/heading flex items-center justify-between border-b border-slate-100 pb-2.5"
								{...props}
							>
								<span>{children}</span>
								{headingId && (
									<a
										href={`#${headingId}`}
										className="opacity-0 group-hover/heading:opacity-100 text-slate-300 hover:text-emerald-600 transition-opacity ml-2 text-lg font-normal select-none !no-underline"
										aria-label={`Direct link to ${text}`}
									>
										#
									</a>
								)}
							</h2>
						);
					},
					h3({ id, children, ...props }: any) {
						const text = getTextFromChildren(children);
						const headingId = id || slugifyHeading(text);
						return (
							<h3
								id={headingId}
								className="group/heading flex items-center justify-between"
								{...props}
							>
								<span>{children}</span>
								{headingId && (
									<a
										href={`#${headingId}`}
										className="opacity-0 group-hover/heading:opacity-100 text-slate-300 hover:text-emerald-600 transition-opacity ml-2 text-base font-normal select-none !no-underline"
										aria-label={`Direct link to ${text}`}
									>
										#
									</a>
								)}
							</h3>
						);
					},

					// ── Blockquotes & GitHub Alert Callouts ────────────
					blockquote({ children, ...props }: any) {
						const text = getTextFromChildren(children).trim();

						// Detect [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
						const alertMatch = text.match(
							/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i,
						);

						if (alertMatch) {
							const type = alertMatch[1].toUpperCase();
							// Strip the alert tag from the beginning
							const contentText = text.replace(
								/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
								"",
							);

							const configs: Record<
								string,
								{
									label: string;
									icon: typeof Info;
									cardClass: string;
									titleClass: string;
								}
							> = {
								NOTE: {
									label: "Note",
									icon: Info,
									cardClass: "bg-blue-50/70 border-blue-200/80 text-blue-950",
									titleClass: "text-blue-700",
								},
								TIP: {
									label: "Tip",
									icon: Sparkles,
									cardClass:
										"bg-emerald-50/70 border-emerald-200/80 text-emerald-950",
									titleClass: "text-emerald-700",
								},
								IMPORTANT: {
									label: "Important",
									icon: AlertCircle,
									cardClass:
										"bg-purple-50/70 border-purple-200/80 text-purple-950",
									titleClass: "text-purple-700",
								},
								WARNING: {
									label: "Warning",
									icon: AlertTriangle,
									cardClass:
										"bg-amber-50/70 border-amber-200/80 text-amber-950",
									titleClass: "text-amber-700",
								},
								CAUTION: {
									label: "Caution",
									icon: ShieldAlert,
									cardClass: "bg-rose-50/70 border-rose-200/80 text-rose-950",
									titleClass: "text-rose-700",
								},
							};

							const config = configs[type] || configs.NOTE;
							const AlertIcon = config.icon;

							return (
								<div
									className={`not-prose my-6 p-4 sm:p-5 rounded-2xl border shadow-2xs ${config.cardClass}`}
								>
									<div className="flex items-center gap-2 mb-1.5 font-bold text-xs uppercase tracking-wider">
										<AlertIcon
											className={`w-4 h-4 shrink-0 ${config.titleClass}`}
										/>
										<span className={config.titleClass}>{config.label}</span>
									</div>
									<div className="text-sm leading-relaxed pl-6 font-medium">
										{contentText}
									</div>
								</div>
							);
						}

						// Standard styled blockquote
						return (
							<blockquote
								className="my-6 border-l-4 border-emerald-500 bg-emerald-50/30 rounded-r-2xl py-3.5 px-5 text-slate-800 font-medium not-italic"
								{...props}
							>
								{children}
							</blockquote>
						);
					},

					// ── Tables — responsive wrapper with zebra styles ─
					table({ node, children, ...props }: any) {
						return (
							<div className="not-prose overflow-x-auto my-8 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xs bg-white">
								<table
									className="min-w-full divide-y divide-slate-200 text-sm"
									{...props}
								>
									{children}
								</table>
							</div>
						);
					},
					thead({ node, children, ...props }: any) {
						return (
							<thead
								className="bg-slate-50/80 border-b border-slate-200"
								{...props}
							>
								{children}
							</thead>
						);
					},
					tbody({ node, children, ...props }: any) {
						return (
							<tbody className="divide-y divide-slate-100 bg-white" {...props}>
								{children}
							</tbody>
						);
					},
					tr({ node, children, ...props }: any) {
						return (
							<tr
								className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-0"
								{...props}
							>
								{children}
							</tr>
						);
					},
					th({ node, children, ...props }: any) {
						return (
							<th
								className="px-4 py-3.5 text-xs font-black text-slate-800 uppercase tracking-wider whitespace-nowrap"
								{...props}
							>
								{children}
							</th>
						);
					},
					td({ node, children, ...props }: any) {
						return (
							<td
								className="px-4 py-3 text-slate-600 text-sm font-medium"
								{...props}
							>
								{children}
							</td>
						);
					},

					// ── Horizontal Rule ───────────────────────────────
					hr({ node, ...props }: any) {
						return (
							<div
								className="my-10 flex items-center justify-center gap-2"
								{...props}
							>
								<span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
								<span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
								<span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
							</div>
						);
					},

					// ── Links — secure external links ──────────────────
					a({ node, href, children, ...props }: any) {
						const isExternal =
							href?.startsWith("http://") ||
							href?.startsWith("https://") ||
							href?.startsWith("www.");
						let finalHref = href;
						if (finalHref?.startsWith("www.")) {
							finalHref = `https://${finalHref}`;
						} else if (finalHref?.startsWith("http://www.")) {
							finalHref = finalHref.replace("http://www.", "https://www.");
						}
						return (
							<a
								href={finalHref}
								target={isExternal ? "_blank" : undefined}
								rel={isExternal ? "noopener noreferrer" : undefined}
								{...props}
							>
								{children}
							</a>
						);
					},

					// ── Images — native lazy loading + async decode ────
					img({ src, alt, ...props }: any) {
						return (
							<img
								src={src as string}
								alt={alt as string}
								loading="lazy"
								decoding="async"
								className="rounded-3xl border border-slate-200/80 shadow-xs"
								{...props}
							/>
						);
					},
				}}
			>
				{normalizedContent}
			</ReactMarkdown>
		</div>
	);
}
