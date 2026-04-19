import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogBySlugStatic, getBlogsStatic } from "@/features/blog/data";
import BlogContent from "@/features/blog/components/BlogContent";
import { ArrowLeft, Calendar, Tag, User, BookOpen } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { ScrollProgress } from "@/features/blog/components/ScrollProgress";
import ShareButton from "@/features/blog/components/ShareButton";
import type { Metadata } from "next";

/**
 * SEO Metadata Generation
 */
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = await getBlogBySlugStatic(slug);

	if (!post) return { title: "Entry Not Found" };

	return {
		title: `${post.title} | Engineering Journal`,
		description: post.description,
		openGraph: {
			title: post.title,
			description: post.description,
			type: "article",
			publishedTime: post.date,
			images: post.image_url ? [{ url: post.image_url }] : [],
		},
	};
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
	const c = (category || "General").toLowerCase();
	if (c.includes("fintech") || c.includes("finance"))
		return "bg-emerald-50 text-emerald-700 border-emerald-100";
	if (c.includes("arch") || c.includes("tech"))
		return "bg-blue-50 text-blue-700 border-blue-100";
	if (c.includes("lead") || c.includes("manage"))
		return "bg-purple-50 text-purple-700 border-purple-100";
	return "bg-slate-50 text-slate-700 border-slate-100";
};

export default async function BlogDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = await getBlogBySlugStatic(slug);

	if (!post) return notFound();

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
	}).format(new Date(post.date));

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32">
			<ScrollProgress />

			{/* Hero Section with High-Contrast Header */}
			<section className="relative w-full">
				{post.image_url ? (
					<div className="relative w-full h-[50vh] min-h-[400px]">
						<Image
							src={post.image_url}
							alt={post.title}
							fill
							priority
							className="object-cover"
						/>
						<div className="absolute inset-0 bg-slate-950/20" />
					</div>
				) : (
					<div className="h-32 bg-slate-50 border-b border-slate-100" />
				)}

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
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-16">
					<motion.article
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="prose prose-slate prose-lg sm:prose-xl max-w-none 
							prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-950
							prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
							prose-strong:text-slate-900 prose-strong:font-black
							prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
							prose-code:text-indigo-600 prose-code:bg-slate-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-lg prose-code:before:content-none prose-code:after:content-none
							prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-[2rem]
							prose-img:rounded-[2.5rem] prose-img:border-4 prose-img:border-slate-50 shadow-2xl shadow-slate-100"
					>
						<BlogContent content={post.content} />
					</motion.article>

					{/* Side Utility Bar */}
					<aside className="hidden lg:block w-64 pt-8">
						<div className="sticky top-32 space-y-12">
							<div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-6">
								<p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
									Actions
								</p>
								<ShareButton title={post.title} />
							</div>

							<div className="px-8 space-y-4">
								<p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
									Topic Area
								</p>
								<div className="flex items-center gap-3 text-slate-900 font-bold">
									<BookOpen className="w-5 h-5 text-slate-950" />
									<span className="text-sm tracking-tight">
										{post.category}
									</span>
								</div>
							</div>
						</div>
					</aside>
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
