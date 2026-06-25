"use client";

import { useState, useCallback } from "react";
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
import { Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogContentProps {
	content: string;
}

// ─────────────────────────────────────────────
// Copy Button — per code block
// ─────────────────────────────────────────────
function CopyButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

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
			onClick={handleCopy}
			title={copied ? "Copied!" : "Copy code"}
			className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white/60 hover:text-white transition-all text-[10px] font-bold uppercase tracking-wider"
		>
			<AnimatePresence mode="wait" initial={false}>
				{copied ? (
					<motion.span
						key="check"
						initial={{ opacity: 0, scale: 0.8 }}
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
						initial={{ opacity: 0, scale: 0.8 }}
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

/**
 * BlogContent
 * Renders Markdown with syntax-highlighted code blocks (One Dark theme),
 * per-block copy buttons, and Tailwind Typography prose styles.
 *
 * Uses the modern react-markdown v9+ code component API (no `inline` prop).
 */
export default function BlogContent({ content }: BlogContentProps) {
	return (
		<div
			className="prose prose-slate prose-lg max-w-none
        prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-900
        prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:bg-blue-50/40 prose-blockquote:not-italic
        prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:text-sm
        prose-pre:bg-transparent prose-pre:p-0
        prose-img:rounded-[2.5rem] prose-img:border-4 prose-img:border-slate-50
        prose-h2:mt-12 prose-h2:scroll-mt-24
        prose-h3:mt-8 prose-h3:scroll-mt-24"
		>
			<ReactMarkdown
				components={{
					// ── Code blocks & inline code ──────────────────────
					// Modern API: detect block vs inline by presence of language class
					code({ node, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || "");
						const codeString = String(children).replace(/\n$/, "");

						// Block code — has language class
						if (match) {
							return (
								<div className="relative w-full overflow-hidden rounded-xl !my-8 shadow-md border border-slate-800 bg-[#282c34] max-h-[32rem] group/code">
									<CopyButton code={codeString} />
									{/* Language label */}
									<div className="absolute top-3 left-3 z-10 text-[10px] font-black uppercase tracking-widest text-white/30 select-none">
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
												lineHeight: "1.6",
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

						// Inline code
						return (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},

					// ── Headings — add scroll-margin + id anchor ───────
					h2({ children, ...props }: any) {
						const text = String(children);
						const id = text
							.toLowerCase()
							.replace(/[^\w\s-]/g, "")
							.replace(/\s+/g, "-");
						return (
							<h2 id={id} {...props}>
								{children}
							</h2>
						);
					},
					h3({ children, ...props }: any) {
						const text = String(children);
						const id = text
							.toLowerCase()
							.replace(/[^\w\s-]/g, "")
							.replace(/\s+/g, "-");
						return (
							<h3 id={id} {...props}>
								{children}
							</h3>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
