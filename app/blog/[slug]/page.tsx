import { notFound } from "next/navigation";
import { getBlogBySlug, getBlogs } from "@/lib/data/blog";
import BlogContent from "@/components/blog/BlogContent";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

type Props = {
	params: Promise<{ slug: string }>;
};

/**
 * SEO: Dynamic Metadata Generation
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const post = await getBlogBySlug(slug);

	if (!post) return { title: "Post Not Found" };

	return {
		title: `${post.title} | Blog`,
		description: post.description,
		openGraph: {
			title: post.title,
			description: post.description,
			type: "article",
			publishedTime: post.date,
		},
	};
}

/**
 * Helper: Calculate reading time
 */
const calculateReadingTime = (content: string): number => {
	const wordCount = content.split(/\s+/).filter(Boolean).length;
	return Math.ceil(wordCount / 200);
};

export default async function BlogDetailPage({ params }: Props) {
	const { slug } = await params;
	const post = await getBlogBySlug(slug);

	if (!post) {
		notFound();
	}

	const readingTime = calculateReadingTime(post.content);

	return (
		<div className="min-h-screen bg-background pb-20">
			{/* Progress Bar / Scroll Indicator placeholder could go here */}

			<header className="relative py-20 lg:py-32 overflow-hidden border-b border-border/50 bg-background-secondary/30">
				<div className="absolute inset-0 -z-10">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-indigo-500)_0%,_transparent_70%)] opacity-[0.03]" />
				</div>

				<div className="max-w-4xl mx-auto px-6">
					<Link
						href="/blog"
						className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-indigo-600 transition-colors mb-12 group"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Library
					</Link>

					<div className="space-y-6 animate-fade-in">
						<div className="flex flex-wrap items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground">
							<div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
								<Calendar className="w-3.5 h-3.5" />
								{new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
									new Date(post.date),
								)}
							</div>
							<div className="flex items-center gap-2 px-3 py-1.5 bg-background-secondary rounded-xl border border-border/50">
								<Clock className="w-3.5 h-3.5" />
								{readingTime} min read
							</div>
						</div>

						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-[1.1] tracking-tight italic">
							{post.title}
						</h1>

						<p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
							{post.description}
						</p>
					</div>
				</div>
			</header>

			<main
				className="max-w-4xl mx-auto px-6 py-16 animate-fade-in"
				style={{ animationDelay: "0.2s" }}
			>
				<div className="flex flex-col lg:flex-row gap-12">
					{/* Content */}
					<article className="flex-1 min-w-0">
						<BlogContent content={post.content} />
					</article>

					{/* Sidebar / Actions */}
					<aside className="lg:w-16 flex lg:flex-col gap-4 sticky top-32 h-fit">
						<button
							className="p-3 rounded-2xl bg-background-secondary border border-border/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
							title="Share Article"
						>
							<Share2 className="w-5 h-5" />
						</button>
					</aside>
				</div>

				<footer className="mt-24 pt-12 border-t border-border/50">
					<div className="glass-card p-8 sm:p-12 text-center bg-indigo-600 !text-white border-none overflow-hidden relative">
						<div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
						<div className="relative z-10">
							<h3 className="text-2xl sm:text-3xl font-black mb-4 italic">
								Enjoyed the read?
							</h3>
							<p className="text-indigo-100 mb-8 max-w-xl mx-auto">
								I share updates on new articles, engineering insights, and
								projects via my social channels.
							</p>
							<Link
								href="/"
								className="inline-flex px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
							>
								View Portfolio
							</Link>
						</div>
					</div>
				</footer>
			</main>
		</div>
	);
}

/**
 * Generate Static Params for build-time rendering
 */
export async function generateStaticParams() {
	const blogs = await getBlogs();
	return blogs.map((post) => ({
		slug: post.slug,
	}));
}
