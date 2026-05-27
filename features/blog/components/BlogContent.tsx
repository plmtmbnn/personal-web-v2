"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface BlogContentProps {
	content: string;
}

/**
 * BlogContent Refactor
 * Prioritizes legibility, solid boundaries, and technical clarity.
 */
export default function BlogContent({ content }: BlogContentProps) {
	return (
		<div
			className="prose prose-slate prose-lg max-w-none 
      prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight 
      prose-p:text-slate-600 prose-p:leading-relaxed
      prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
      prose-strong:text-slate-900
      prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-transparent prose-pre:p-0
      prose-img:rounded-[2.5rem] prose-img:border-4 prose-img:border-slate-50"
		>
			<ReactMarkdown
				components={{
					code({ node, inline, className, children, ...props }: any) {
						const match = /language-(\w+)/.exec(className || "");
						return !inline && match ? (
							<div className="w-full overflow-auto rounded-xl !my-8 shadow-md border border-slate-800 bg-[#282c34] max-h-[32rem]">
								<SyntaxHighlighter
									style={oneDark as any}
									language={match[1]}
									PreTag="div"
									customStyle={{
										margin: 0,
										padding: "1.5rem",
										fontSize: "0.875rem",
										lineHeight: "1.5",
										backgroundColor: "transparent",
										whiteSpace: "pre",
										wordBreak: "normal",
										overflowWrap: "normal",
									}}
									{...props}
								>
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							</div>
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
