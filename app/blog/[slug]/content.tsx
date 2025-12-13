"use client";

import DOMPurify from "dompurify";

type Props = {
	html: string;
};

export default function BlogContent({ html }: Props) {
	return (
		<div
			className="prose prose-lg max-w-none
        prose-headings:text-slate-900 prose-headings:font-bold
        prose-p:text-slate-700 prose-p:leading-relaxed
        prose-a:text-indigo-600 hover:prose-a:text-indigo-500
        prose-strong:text-slate-900
        prose-code:text-purple-600 prose-code:bg-slate-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
        prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl
        prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:rounded-r
        prose-img:rounded-xl prose-img:shadow-lg"
			dangerouslySetInnerHTML={{
				__html: DOMPurify.sanitize(html),
			}}
		/>
	);
}
