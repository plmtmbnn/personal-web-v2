import { notFound } from "next/navigation";
import Image from "next/image";
import {
	getBlogBySlug,
	getBlogsStatic,
	getRelatedPosts,
} from "@/features/blog/data";
import BlogContent from "@/features/blog/components/BlogContent";
import TableOfContents from "@/features/blog/components/TableOfContents";
import QuickSharePill from "@/features/blog/components/QuickSharePill";
import {
	ArrowLeft,
	AlertTriangle,
	Lock,
	Calendar,
	Clock,
	BookOpen,
	Compass,
	Mail,
	Briefcase,
	ArrowUp,
} from "lucide-react";
import PinGuard from "@/features/auth/PinGuard";
import Link from "next/link";
import {
	div as motionDiv,
	article as motionArticle,
} from "framer-motion/client";

const motion = {
	div: motionDiv,
	article: motionArticle,
};
import BlogAnalyticsTracker from "@/features/blog/components/BlogAnalyticsTracker";
import ShareButton from "@/features/blog/components/ShareButton";
import RelatedPosts from "@/features/blog/components/RelatedPosts";
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
	const post = await getBlogBySlug(slug);

	if (!post) return { title: "Entry Not Found" };

	return createBlogMetadata({
		title: post.published ? post.title : `[Draft] ${post.title}`,
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

	// Fetch post (deduped with generateMetadata via React cache)
	const post = await getBlogBySlug(slug);
	if (!post) return notFound();

	// Fetch related posts from matching category
	const related = await getRelatedPosts(slug, post.category, 3);

	const formattedDate = new Intl.DateTimeFormat("en-US", {
		dateStyle: "long",
	}).format(new Date(post.date));

	const heroImage = getBlogImage(post.image_url, post.id);
	const readTime = getReadTime(post.content);
	const readTimeMinutes = Number.parseInt(
		readTime.replace(" MIN READ", ""),
		10,
	);
	const wordCount = getWordCount(post.content);
	const jsonLd = generateBlogPostJsonLd({
		title: post.title,
		description: post.description,
		slug: post.slug,
		image: post.image_url || undefined,
		publishedTime: post.date,
		author: AUTHOR.name,
		wordCount,
	});

	return (
		<>
			{/* JSON-LD Structured Data — Google Rich Results */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>

			{/* Skip to content link for accessibility */}
			<a
				href="#article-content"
				className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-xl focus:shadow-lg"
			>
				Skip to article content
			</a>

			{!post.published && (
				<div className="bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider text-center py-2.5 px-4 sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
					<AlertTriangle className="w-4 h-4 text-slate-950 flex-shrink-0" />
					<span>
						Draft Preview Mode — This entry is currently unpublished and only
						visible to authorized admins.
					</span>
				</div>
			)}

			<main
				id="top"
				className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 print:overflow-visible print:pb-0"
			>
				<BlogAnalyticsTracker
					slug={post.slug}
					title={post.title}
					readTime={readTimeMinutes}
				/>

				{/* ═══════════════════════════════════════
				    HERO BANNER & ELEVATED HEADER CARD
				═══════════════════════════════════════ */}
				<section className="relative w-full">
					{/* Proportional Hero Image Banner */}
					<div className="relative w-full h-[36vh] sm:h-[44vh] min-h-[260px] sm:min-h-[380px] max-h-[500px] print:hidden overflow-hidden">
						<Image
							src={heroImage}
							alt={post.title}
							fill
							priority
							className="object-cover"
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1400px"
						/>
						{/* Clean bottom gradient blend into the page */}
						<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-slate-950/20" />
					</div>

					{/* Overlapping Floating Header Card */}
					<div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-20 -mt-16 sm:-mt-28">
						<motion.div
							initial={{ opacity: 0, y: 25 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
							className="bg-white border border-slate-200/80 p-6 sm:p-10 lg:p-12 rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-slate-200/50 space-y-6"
						>
							{/* Top Action Bar: Breadcrumb + Category + PIN + Share */}
							<div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
								<div className="flex items-center gap-3">
									<Link
										href="/blog"
										className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition-colors gap-1.5 group !no-underline"
									>
										<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
										<span>Back to Insights</span>
									</Link>

									<span
										className={`px-3 py-1 border text-[9.5px] font-extrabold uppercase tracking-wider rounded-full shadow-2xs ${getCategoryStyles(post.category)}`}
									>
										{post.category}
									</span>

									{post.is_private && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-[9.5px] font-extrabold uppercase tracking-wider rounded-full shadow-2xs">
											<Lock className="w-3 h-3" />
											PIN Protected
										</span>
									)}
								</div>

								{/* Quick Share / Copy Pill */}
								<div className="print:hidden">
									<QuickSharePill title={post.title} />
								</div>
							</div>

							{/* Title */}
							<h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.14]">
								{post.title}
							</h1>

							{/* Description / Lede */}
							{post.description && (
								<p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl">
									{post.description}
								</p>
							)}

							{/* Metadata Strip */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-slate-100">
								{/* Author */}
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-extrabold text-xs shadow-xs select-none">
										{AUTHOR.name
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</div>
									<div>
										<p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 leading-none">
											Author
										</p>
										<p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
											{AUTHOR.name}
										</p>
									</div>
								</div>

								{/* Metrics & Date Pills */}
								<div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
									{/* Date */}
									<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
										<Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
										<span>{formattedDate}</span>
									</div>

									{/* Read time */}
									<div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
										<Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
										<span>{readTime}</span>
									</div>

									{/* Word count */}
									<div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-600 text-xs font-medium">
										<BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
										<span>{wordCount.toLocaleString()} words</span>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</section>

				{/* ═══════════════════════════════════════
				    ARTICLE BODY & READING CONTAINER
				═══════════════════════════════════════ */}
				<section className="max-w-4xl mx-auto px-4 sm:px-6 relative mt-8 sm:mt-12 space-y-10">
					{/* Floating Reading Stage */}
					<div className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 lg:p-14 shadow-xs sm:shadow-sm">
						{/* Table of Contents / Article Outline */}
						<TableOfContents content={post.content} />

						{/* Article Markdown */}
						{post.is_private ? (
							<PinGuard>
								<motion.article
									id="article-content"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.2 }}
									className="w-full print:shadow-none"
									aria-label={`Article: ${post.title}`}
								>
									<BlogContent content={post.content} />
								</motion.article>
							</PinGuard>
						) : (
							<motion.article
								id="article-content"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
								className="w-full print:shadow-none"
								aria-label={`Article: ${post.title}`}
							>
								<BlogContent content={post.content} />
							</motion.article>
						)}
					</div>

					{/* ── Author Signature Block ── */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6 print:hidden"
					>
						<div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center font-extrabold text-base shrink-0 shadow-sm">
							{AUTHOR.name
								.split(" ")
								.map((n) => n[0])
								.join("")}
						</div>
						<div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
								<div>
									<h4 className="text-base font-extrabold text-slate-900 tracking-tight">
										Written by {AUTHOR.name}
									</h4>
									<p className="text-xs text-emerald-600 font-bold">
										Software Engineer & Endurance Runner
									</p>
								</div>
								<div className="flex items-center justify-center sm:justify-start gap-2">
									<Link
										href="/portfolio"
										className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10.5px] font-bold text-slate-600 transition-colors !no-underline"
									>
										<Briefcase className="w-3 h-3 text-slate-400" />
										<span>Work</span>
									</Link>
									<Link
										href="/adventures"
										className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10.5px] font-bold text-slate-600 transition-colors !no-underline"
									>
										<Compass className="w-3 h-3 text-slate-400" />
										<span>Adventures</span>
									</Link>
									<Link
										href="/contact"
										className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[10.5px] font-bold text-slate-600 transition-colors !no-underline"
									>
										<Mail className="w-3 h-3 text-slate-400" />
										<span>Contact</span>
									</Link>
								</div>
							</div>
							<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
								Writing about fintech architecture, distributed systems, and the
								discipline of distance running. Focused on building
								high-reliability systems with clean aesthetics.
							</p>
						</div>
					</motion.div>

					{/* ── Share Block ── */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="w-full print:hidden"
					>
						<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center gap-5 text-center">
							<div>
								<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-2">
									Spread the Knowledge
								</span>
								<h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
									Enjoyed this article? Share it with your network.
								</h3>
							</div>
							<div className="w-full max-w-md">
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
							className="mt-12 print:hidden"
						>
							<RelatedPosts posts={related} />
						</motion.div>
					)}

					{/* ── Return Anchor & Back to Top ── */}
					<div className="mt-16 flex flex-wrap items-center justify-center gap-3 print:hidden">
						<Link
							href="/blog"
							className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-all shadow-xs hover:shadow-sm active:scale-95 !no-underline cursor-pointer"
						>
							<ArrowLeft className="w-4 h-4 text-slate-400" />
							<span>Return to Journal Index</span>
						</Link>
						<a
							href="#top"
							className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 transition-all shadow-xs hover:shadow-sm active:scale-95 !no-underline cursor-pointer"
						>
							<ArrowUp className="w-4 h-4 text-slate-400" />
							<span>Back to Top</span>
						</a>
					</div>
				</section>
			</main>
		</>
	);
}
