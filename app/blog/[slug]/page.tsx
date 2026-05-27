import { notFound } from "next/navigation";
import Image from "next/image";
import {
	getBlogBySlug,
	getBlogBySlugStatic,
	getBlogsStatic,
} from "@/features/blog/data";
import BlogContent from "@/features/blog/components/BlogContent";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { ScrollProgress } from "@/features/blog/components/ScrollProgress";
import ShareButton from "@/features/blog/components/ShareButton";
import type { Metadata } from "next";

import { createBlogMetadata } from "@/lib/shared/metadata";

/**
 * SEO Metadata Generation
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);
	const post = await getBlogBySlugStatic(slug);

	if (!post) return { title: "Entry Not Found" };

	return createBlogMetadata({
		title: post.title,
		description: post.description,
		slug: post.slug,
		image: post.image_url || undefined,
		publishedTime: post.date,
		tags: [post.category, "engineering", "journal"],
	});
}

/**
 * Static Route Generation
 */
export async function generateStaticParams() {
	const blogs = await getBlogsStatic();
	return blogs.map((blog) => ({
		slug: blog.slug,
	}));
}

/**
 * Reading Time Calculation
 */
const getReadTime = (content: string) => {
	const words = (content || "").split(/\s+/).length;
	const minutes = Math.ceil(words / 200);
	return `${minutes} MIN READ`;
};

/**
 * Category Style Utility - Professional Palette
 */
const getCategoryStyles = (category: string) => {
	const c = category;
	if (c === "Finance" || c === "Investment")
		return "bg-emerald-50 text-emerald-700 border-emerald-100";
	if (c === "Tech") return "bg-blue-50 text-blue-700 border-blue-100";
	if (c === "Running") return "bg-rose-50 text-rose-700 border-rose-100";
	return "bg-slate-50 text-slate-700 border-slate-100";
};

/**
 * Deterministic Placeholder Picker (Sync with List Page)
 */
const PLACEHOLDERS = [
	"https://plus.unsplash.com/premium_photo-1664301432574-9b4e85c2b2d3?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2072&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1512455011254-e2db8db4ef22?q=80&w=1195&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop",
	"https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop",
];

const getBlogImage = (imageUrl: string | null, seed: string) => {
	if (imageUrl && imageUrl.trim() !== "") return imageUrl;
	const charSum = seed
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return PLACEHOLDERS[charSum % PLACEHOLDERS.length];
};

export default async function BlogDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);
	const post = await getBlogBySlug(slug);

	if (!post) return notFound();

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
	}).format(new Date(post.date));

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32">
			<ScrollProgress />

			{/* Hero Section with High-Contrast Header */}
			<section className="relative w-full">
				<div className="relative w-full h-[50vh] min-h-[400px]">
					<Image
						src={getBlogImage(post.image_url, post.id)}
						alt={post.title}
						fill
						priority
						className="object-cover"
					/>
					<div className="absolute inset-0 bg-slate-950/20" />
				</div>

				<div className="max-w-5xl mx-auto px-6 relative z-20 -mt-24 sm:-mt-40">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white border border-slate-200 p-8 sm:p-16 rounded-[3rem] sm:rounded-[4rem] shadow-2xl space-y-10"
					>
						<div className="flex flex-wrap items-center gap-4">
							<Link
								href="/blog"
								className="inline-flex items-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors gap-2 !no-underline"
							>
								<ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
							</Link>
							<div className="w-px h-4 bg-slate-200" />
							<span
								className={`px-4 py-2 border text-[9px] font-black uppercase tracking-widest rounded-full ${getCategoryStyles(post.category)}`}
							>
								{post.category}
							</span>
						</div>

						<h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-slate-950 tracking-tighter leading-[1] max-w-5xl">
							{post.title}
						</h1>

						<div className="flex flex-col sm:flex-row sm:items-center gap-8 pt-4">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-white shadow-xl">
									<User className="w-6 h-6" />
								</div>
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Written By
									</p>
									<p className="text-sm font-bold text-slate-900">
										Polma Tambunan
									</p>
								</div>
							</div>
							<div className="hidden sm:block w-px h-10 bg-slate-100" />
							<div className="flex gap-8">
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Published
									</p>
									<p className="text-sm font-bold text-slate-600 uppercase">
										{formattedDate}
									</p>
								</div>
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Reading Time
									</p>
									<p className="text-sm font-bold text-slate-600 uppercase">
										{getReadTime(post.content)}
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Main Article Content */}
			<section className="max-w-5xl mx-auto px-6 relative mt-16 sm:mt-24">
				<div className="flex flex-col gap-16">
					<motion.article
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="max-w-none shadow-2xl shadow-slate-100"
					>
						<BlogContent content={post.content} />
					</motion.article>

					{/* Post Actions & Utility Bar - Enhanced Bottom Layout */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="w-full max-w-4xl mx-auto"
					>
						<div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-8 sm:p-12 flex flex-col items-center justify-center space-y-6 text-center">
							<div className="space-y-4">
								<p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
									Share this Story
								</p>
								<div className="bg-white border border-slate-100 p-3 rounded-[2rem] shadow-sm w-fit mx-auto">
									<ShareButton title={post.title} />
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Simple Return Anchor */}
				<div className="mt-32 flex flex-col items-center">
					<Link
						href="/blog"
						className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-950 transition-colors"
					>
						Return to Index
					</Link>
				</div>
			</section>
		</main>
	);
}
