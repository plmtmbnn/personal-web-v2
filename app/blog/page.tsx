"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogs, Blog } from "@/lib/data/blog";
import {
	ArrowRight,
	Calendar,
	Newspaper,
	Clock,
	Search,
	BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPage() {
	const [blogs, setBlogs] = useState<Blog[]>([]);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const fetchBlogs = async () => {
			const data = await getBlogs();
			setBlogs(data);
			setMounted(true);
		};
		fetchBlogs();
	}, []);

	if (!mounted) return null;

	return (
		<main className="min-h-screen bg-background relative overflow-hidden pb-32">
			{/* Aesthetic Background Ambience */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
				<div
					className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-24 sm:pt-32">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 border-b border-white/5 pb-16">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-6"
					>
						<div className="flex items-center gap-3 text-accent mb-2">
							<BookOpen className="w-6 h-6" />
							<span className="text-[10px] font-black uppercase tracking-[0.4em]">
								Digital Library
							</span>
						</div>
						<h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground">
							Curated <span className="gradient-text">Insights</span>
						</h1>
						<p className="text-muted-foreground text-lg max-w-xl font-medium leading-relaxed">
							Thoughtful articles on software architecture, fintech ecosystems,
							and engineering leadership.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center gap-4 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
					>
						<div className="text-right">
							<p className="text-xl font-black text-foreground">
								{blogs.length}
							</p>
							<p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
								Articles
							</p>
						</div>
						<div className="w-px h-8 bg-white/10" />
						<Newspaper className="w-5 h-5 text-accent" />
					</motion.div>
				</div>

				{/* Blog Grid */}
				{blogs.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="max-w-2xl mx-auto text-center py-20"
					>
						<div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10 shadow-2xl">
							<Clock className="w-10 h-10 text-muted-foreground/20" />
						</div>
						<h3 className="text-2xl font-black text-foreground mb-4">
							Preparation in Progress
						</h3>
						<p className="text-muted-foreground font-medium">
							I'm currently architecting some deep-dives into engineering. Check
							back soon for the first release.
						</p>
					</motion.div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogs.map((post, index) => (
							<motion.div
								key={post.slug}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1, duration: 0.6 }}
								className="group relative h-full"
							>
								<Link
									href={`/blog/${post.slug}`}
									className="block h-full !no-underline"
								>
									{/* Interactive Card */}
									<div className="h-full relative overflow-hidden rounded-[2.5rem] bg-white/5 border-2 border-white/5 shadow-2xl transition-all duration-500 group-hover:border-accent/30 group-hover:-translate-y-2 backdrop-blur-xl p-8 sm:p-10 flex flex-col justify-between">
										<div className="space-y-6">
											{/* Meta Info */}
											<div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
												<div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-accent">
													<Calendar className="w-3 h-3" />
													{new Intl.DateTimeFormat("en-US", {
														dateStyle: "medium",
													}).format(new Date(post.date))}
												</div>
											</div>

											{/* Title & Description */}
											<div className="space-y-4">
												<h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-accent transition-colors leading-[1.1]">
													{post.title}
												</h3>
												<p className="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">
													{post.description}
												</p>
											</div>
										</div>

										{/* Footer Link */}
										<div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
											<span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">
												Read Article
											</span>
											<div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 group-hover:rotate-[-45deg]">
												<ArrowRight className="w-5 h-5" />
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
