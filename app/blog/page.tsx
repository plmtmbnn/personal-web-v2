import Link from "next/link";
import { getBlogsStatic } from "@/features/blog/data";
import { ArrowRight, Calendar, Newspaper, Clock, BookOpen } from "lucide-react";
import * as motion from "framer-motion/client";

export default async function BlogPage() {
	const blogs = await getBlogsStatic();

	return (
		<main className="min-h-screen bg-background relative overflow-x-hidden pb-32">
			{/* Aesthetic Background Ambience - Optimized for performance */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[70%] lg:w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[80px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[70%] lg:w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[80px]" />
			</div>

			<div className="max-w-6xl mx-auto px-6 pt-20 sm:pt-32">
				{/* Header Section - Responsive Scaling */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 sm:mb-20 border-b border-white/5 pb-12 sm:pb-16">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-4 sm:space-y-6 text-center sm:text-left"
					>
						<div className="flex items-center justify-center sm:justify-start gap-3 text-accent mb-2">
							<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
							<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em]">
								Digital Library
							</span>
						</div>
						<h1 className="text-4xl sm:text-7xl font-black tracking-tighter text-foreground leading-[0.95] sm:leading-[0.9]">
							Curated <span className="gradient-text">Insights</span>
						</h1>
						<p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto sm:mx-0 font-medium leading-relaxed">
							Thoughtful articles on software architecture, fintech ecosystems,
							and engineering leadership.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center self-center sm:self-auto gap-4 px-5 py-2.5 sm:px-6 sm:py-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
					>
						<div className="text-right">
							<p className="text-lg sm:text-xl font-black text-foreground">
								{blogs.length}
							</p>
							<p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
								Articles
							</p>
						</div>
						<div className="w-px h-6 sm:h-8 bg-white/10" />
						<Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
					</motion.div>
				</div>

				{/* Blog Grid - Optimized Whitespace */}
				{blogs.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="max-w-2xl mx-auto text-center py-20"
					>
						<div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-8 border border-white/10 shadow-2xl">
							<Clock className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/20" />
						</div>
						<h3 className="text-xl sm:text-2xl font-black text-foreground mb-3 sm:mb-4">
							Preparation in Progress
						</h3>
						<p className="text-sm sm:text-muted-foreground font-medium px-4">
							I&apos;m currently architecting some deep-dives into engineering.
							Check back soon for the first release.
						</p>
					</motion.div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
						{blogs.map((post, index) => (
							<motion.div
								key={post.slug}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: Math.min(index * 0.05, 0.3),
									duration: 0.4,
								}}
								className="group relative h-full"
							>
								<Link
									href={`/blog/${post.slug}`}
									className="block h-full !no-underline"
								>
									{/* Interactive Card - Defined Boundaries */}
									<div className="h-full relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white/5 border-2 border-white/10 shadow-2xl transition-all duration-500 group-hover:border-accent/30 group-hover:-translate-y-2 backdrop-blur-xl p-6 sm:p-10 flex flex-col justify-between">
										<div className="space-y-4 sm:space-y-6">
											{/* Meta Info */}
											<div className="flex items-center gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
												<div className="flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-accent">
													<Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
													{new Intl.DateTimeFormat("en-US", {
														dateStyle: "medium",
													}).format(new Date(post.date))}
												</div>
											</div>

											{/* Title & Description */}
											<div className="space-y-3 sm:space-y-4">
												<h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:text-accent transition-colors leading-[1.15] sm:leading-[1.1]">
													{post.title}
												</h3>
												<p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3">
													{post.description}
												</p>
											</div>
										</div>

										{/* Footer Link */}
										<div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/5 flex items-center justify-between">
											<span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-accent">
												Read Article
											</span>
											<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500 group-hover:rotate-[-45deg]">
												<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
