import { getBlogsStatic } from "@/features/blog/data";
import BlogView from "@/features/blog/components/BlogView";
import { createMetadata } from "@/lib/shared/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = createMetadata({
	title: "The Pulse | Engineering Journal",
	description:
		"High-fidelity insights on fintech architecture, distributed systems, and modern engineering culture.",
	path: "/blog",
	keywords: [
		"Engineering Blog",
		"Fintech Insights",
		"Software Architecture",
		"Jakarta Tech",
		"Distributed Systems",
	],
});

export default async function BlogPage() {
	const allBlogs = await getBlogsStatic();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<BlogView allBlogs={allBlogs} />
			</div>
		</main>
	);
}
