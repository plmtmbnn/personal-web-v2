"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { getBlogBySlug, type Blog } from "@/features/blog/data";
import BlogContent from "@/features/blog/components/BlogContent";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Helper: Calculate reading time
 */
const calculateReadingTime = (content: string): number => {
	const wordCount = content.split(/\s+/).filter(Boolean).length;
	return Math.ceil(wordCount / 200);
};

export default function BlogDetailPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const [post, setPost] = useState<Blog | null>(null);
	const [mounted, setMounted] = useState(false);
	const { scrollYProgress } = useScroll();
	const scaleX = useSpring(scrollYProgress, {
		stiffness: 100,
		damping: 30,
		restDelta: 0.001,
	});

	useEffect(() => {
		const fetchPost = async () => {
			const { slug } = await params;
			const data = await getBlogBySlug(slug);
			if (!data) return notFound();
			setPost(data);
			setMounted(true);
		};
		fetchPost();
	}, [params]);

	if (!mounted || !post) return null;

	const readingTime = calculateReadingTime(post.content);

	return (
		<main className="min-h-screen bg-background relative overflow-x-hidden pb-32">
			{/* Progress Bar */}
			<motion.div
				className="fixed top-0 left-0 right-0 h-1 bg-accent z-50 origin-left"
				style={{ scaleX }}
			/>

			{/* Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[70%] lg:w-[50%] h-[50%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-5%] left-[-10%] w-[70%] lg:w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-4xl mx-auto px-6 pt-20 sm:pt-32">
				{/* Navigation */}
				<motion.div
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="mb-8 sm:mb-12"
				>
					<Link
						href="/blog"
						className="inline-flex items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors gap-2 group !no-underline py-2"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Library
					</Link>
				</motion.div>

				{/* Post Header - Mobile Optimized */}
				<header className="space-y-8 sm:space-y-10 mb-12 sm:mb-20">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4 sm:space-y-6"
					>
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
							<div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-accent">
								<Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
								{new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
									new Date(post.date),
								)}
							</div>
							<div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-full">
								<Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
								{readingTime} min read
							</div>
						</div>

						<h1 className="text-3xl sm:text-6xl xl:text-7xl font-black text-foreground leading-[1.1] sm:leading-[1] tracking-tighter">
							{post.title}
						</h1>

						<p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl font-medium">
							{post.description}
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.4 }}
						className="flex items-center gap-4 pt-8 sm:pt-10 border-t border-white/5"
					>
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent flex items-center justify-center text-white font-black text-[10px] sm:text-xs">
								PT
							</div>
							<div>
								<p className="text-[10px] sm:text-xs font-black text-foreground uppercase tracking-widest leading-none">
									Polma Tambunan
								</p>
								<p className="text-[8px] sm:text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">
									Author • Fintech Engineer
								</p>
							</div>
						</div>
					</motion.div>
				</header>

				{/* Main Content Area - Responsive Spacing */}
				<motion.article
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="relative"
				>
					<div className="glass-card p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10">
						<BlogContent content={post.content} />
					</div>

					{/* Decorative Side Badge - Hidden on mobile for focus */}
					<div className="absolute top-20 -right-24 hidden xl:flex flex-col gap-4 items-center">
						<div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
						<div className="p-3 bg-white/5 rounded-2xl border border-white/10 rotate-90 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20">
							Engineering Journal
						</div>
						<div className="w-px h-20 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
					</div>
				</motion.article>
			</div>
		</main>
	);
}
