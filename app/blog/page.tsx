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
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32">
			{/* Aesthetic Background Ambient */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-slate-100/50 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-blue-50/30 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-7xl mx-auto px-6 pt-10 sm:pt-16">
				<BlogView allBlogs={allBlogs} />
			</div>
		</main>
	);
}
