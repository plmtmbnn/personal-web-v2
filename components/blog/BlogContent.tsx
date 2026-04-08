"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface BlogContentProps {
	content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
	return (
		<div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 prose-pre:bg-transparent prose-pre:p-0">
			<ReactMarkdown
				components={{
					code({ node, inline, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || "");
						return !inline && match ? (
							<SyntaxHighlighter
								style={vscDarkPlus as any}
								language={match[1]}
								PreTag="div"
								className="rounded-xl !my-6 shadow-xl"
								{...props}
							>
								{String(children).replace(/\n$/, "")}
							</SyntaxHighlighter>
						) : (
							<code className={className} {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
