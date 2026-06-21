import { notFound } from "next/navigation";
import Image from "next/image";
import {
	getBlogBySlug,
	getBlogBySlugStatic,
	getBlogsStatic,
	getRelatedPosts,
} from "@/features/blog/data";
import BlogContent from "@/features/blog/components/BlogContent";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import * as motion from "framer-motion/client";
import { ScrollProgress } from "@/features/blog/components/ScrollProgress";
import ShareButton from "@/features/blog/components/ShareButton";
import TableOfContents from "@/features/blog/components/TableOfContents";
import RelatedPosts from "@/features/blog/components/RelatedPosts";
import BackToTop from "@/features/blog/components/BackToTop";
import type { Metadata } from "next";
import {
	createBlogMetadata,
	generateBlogPostJsonLd,
} from "@/lib/shared/metadata";
import { AUTHOR } from "@/lib/shared/constants";
import {
	getCategoryStyles,
	getReadTime,
	getWordCount,
	getBlogImage,
	parseHeadings,
} from "@/features/blog/utils";

// ─────────────────────────────────────────────
// ISR — re-generate at most every hour
// ─────────────────────────────────────────────
export const revalidate = 3600;

// ─────────────────────────────────────────────
// SEO Metadata (deduped with cache() in data.ts)
// ─────────────────────────────────────────────
export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);
	// getBlogBySlugStatic is wrapped in React cache() — no second DB trip
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

// ─────────────────────────────────────────────
// Static Params
// ─────────────────────────────────────────────
export async function generateStaticParams() {
	const blogs = await getBlogsStatic();
	return blogs.map((blog) => ({ slug: blog.slug }));
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default async function BlogDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const resolvedParams = await params;
	const slug = decodeURIComponent(resolvedParams.slug);

	// Step 1: fetch post (getBlogBySlug is cache()-deduped with generateMetadata)
	const post = await getBlogBySlug(slug);
	if (!post) return notFound();

	// Step 2: fetch related posts using the real category (parallel with other derived data)
	const related = await getRelatedPosts(slug, post.category, 3);

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
	}).format(new Date(post.date));

	const heroImage = getBlogImage(post.image_url, post.id);
	const readTime = getReadTime(post.content);
	const wordCount = getWordCount(post.content);
	const headings = parseHeadings(post.content);
	const jsonLd = generateBlogPostJsonLd({
		title: post.title,
		description: post.description,
		slug: post.slug,
		image: post.image_url || undefined,
		publishedTime: post.date,
		author: AUTHOR.name,
	});

	return (
		<>
			{/* JSON-LD Structured Data — Google Rich Results */}
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			<main
				id="top"
				className="min-h-screen bg-white relative overflow-x-hidden pb-32 print:overflow-visible print:pb-0"
			>
				<ScrollProgress />
				<BackToTop />

				{/* ═══════════════════════════════════════
				    HERO SECTION
				═══════════════════════════════════════ */}
				<section className="relative w-full">
					{/* Hero Image */}
					<div className="relative w-full h-[52vh] min-h-[420px] print:hidden">
						<Image
							src={heroImage}
							alt={post.title}
							fill
							priority
							className="object-cover"
							sizes="100vw"
						/>
						{/* Improved overlay — was 20% (invisible), now 45% for card contrast */}
						<div className="absolute inset-0 bg-slate-950/45" />
					</div>

					{/* Overlapping Header Card */}
					<div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-20 -mt-24 sm:-mt-44">
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className="bg-white border border-slate-200 p-7 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/60"
						>
							{/* Breadcrumb + category */}
							<div className="flex flex-wrap items-center gap-4 mb-6">
								<Link
									href="/blog"
									className="inline-flex items-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors gap-2 !no-underline"
								>
									<ArrowLeft className="w-3.5 h-3.5" />
									Back to Journal
								</Link>
								<div className="w-px h-4 bg-slate-200" />
								<span
									className={`px-4 py-1.5 border text-[9px] font-black uppercase tracking-widest rounded-full ${getCategoryStyles(post.category)}`}
								>
									{post.category}
								</span>
							</div>

							{/* Title */}
							<h1 className="text-3xl sm:text-5xl xl:text-6xl font-black text-slate-950 tracking-tighter leading-[1.05] max-w-4xl mb-4">
								{post.title}
							</h1>

							{/* Description / subtitle — now visible! */}
							{post.description && (
								<p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mb-8">
									{post.description}
								</p>
							)}

							{/* Meta row */}
							<div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-6 border-t border-slate-100">
								{/* Author — sourced from AUTHOR constant, not hardcoded */}
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-md text-sm font-black select-none">
										{AUTHOR.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
									<div>
										<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
											Written By
										</p>
										<p className="text-sm font-bold text-slate-900">
											{AUTHOR.name}
										</p>
									</div>
								</div>

								<div className="hidden sm:block w-px h-10 bg-slate-100" />

								{/* Date */}
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Published
									</p>
									<p className="text-sm font-bold text-slate-600 uppercase">
										{formattedDate}
									</p>
								</div>

								<div className="hidden sm:block w-px h-10 bg-slate-100" />

								{/* Read time */}
								<div>
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Reading Time
									</p>
									<p className="text-sm font-bold text-slate-600 uppercase">
										{readTime}
									</p>
								</div>

								{/* Word count badge */}
								<div className="hidden sm:block">
									<p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
										Words
									</p>
									<p className="text-sm font-bold text-slate-600">
										{wordCount.toLocaleString()}
									</p>
								</div>
							</div>
						</motion.div>
					</div>
				</section>

				{/* ═══════════════════════════════════════
				    MAIN CONTENT — Article + TOC
				═══════════════════════════════════════ */}
				<section className="max-w-5xl mx-auto px-4 sm:px-6 relative mt-12 sm:mt-20">
					{/* Mobile TOC — above article */}
					{headings.length > 2 && <TableOfContents headings={headings} />}

					{/* Desktop layout: article + sticky TOC sidebar */}
					<div className="flex gap-12 items-start">
						{/* Article body */}
						<motion.article
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3 }}
							className="flex-1 min-w-0 shadow-xl shadow-slate-100 print:shadow-none"
						>
							<BlogContent content={post.content} />
						</motion.article>

						{/* Desktop-only sticky TOC sidebar */}
						{headings.length > 2 && <TableOfContents headings={headings} />}
					</div>

					{/* ── Share Block ── */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="w-full max-w-2xl mx-auto mt-16 print:hidden"
					>
						<div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center gap-6 text-center">
							<div>
								<p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">
									Found this useful?
								</p>
								<p className="text-lg font-black text-slate-900 tracking-tight">
									Share this Story
								</p>
							</div>
							<div className="w-full max-w-sm">
								<ShareButton title={post.title} />
							</div>
						</div>
					</motion.div>

					{/* ── Related Posts ── */}
					{related.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 24 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-80px" }}
							className="mt-16 print:hidden"
						>
							<RelatedPosts posts={related} />
						</motion.div>
					)}

					{/* ── Return Anchor ── */}
					<div className="mt-20 flex flex-col items-center gap-3 print:hidden">
						<Link
							href="/blog"
							className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-slate-950 hover:border-slate-400 transition-all shadow-sm"
						>
							<ArrowLeft className="w-3.5 h-3.5" />
							Return to Journal Index
						</Link>
					</div>
				</section>
			</main>

			{/* Print styles — applied globally for this page */}
			<style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:pb-0 { padding-bottom: 0 !important; }
          body { color: #000 !important; background: #fff !important; }
          article { max-height: none !important; overflow: visible !important; }
          pre, code { max-height: none !important; white-space: pre-wrap !important; }
        }
      `}</style>
		</>
	);
}
