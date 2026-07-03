import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Blog } from "@/features/blog/data";
import {
	getCategoryStyles,
	getBlogImage,
	getReadTime,
} from "@/features/blog/utils";

interface RelatedPostsProps {
	posts: Blog[];
}

/**
 * RelatedPosts
 * Server component — renders up to 3 related posts from the same category.
 * Displayed at the bottom of blog detail pages.
 */
export default function RelatedPosts({ posts }: RelatedPostsProps) {
	if (!posts.length) return null;

	return (
		<section className="w-full mt-8">
			{/* Section header */}
			<div className="flex items-center gap-4 mb-8">
				<div className="flex-1 h-px bg-slate-100" />
				<span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">
					More from the Journal
				</span>
				<div className="flex-1 h-px bg-slate-100" />
			</div>

			{/* Cards grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
				{posts.map((post) => {
					const imageUrl = getBlogImage(post.image_url, post.id);
					return (
						<Link
							key={post.id}
							href={`/blog/${post.slug}`}
							className="group flex flex-col bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 !no-underline"
						>
							{/* Thumbnail */}
							<div className="relative w-full h-44 overflow-hidden">
								<Image
									src={imageUrl}
									alt={post.title}
									fill
									loading="lazy"
									className="object-cover group-hover:scale-105 transition-transform duration-500"
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
								/>
								<div className="absolute inset-0 bg-slate-950/10" />
								{/* Category badge */}
								<div className="absolute top-3 left-3">
									<span
										className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest rounded-full ${getCategoryStyles(post.category)}`}
									>
										{post.category}
									</span>
								</div>
							</div>

							{/* Content */}
							<div className="flex flex-col flex-1 p-5 gap-3">
								<h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
									{post.title}
								</h3>

								{post.description && (
									<p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
										{post.description}
									</p>
								)}

								<div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
									<div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
										<Calendar className="w-3 h-3" />
										{format(new Date(post.date), "MMM d, yyyy")}
									</div>
									<span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
										{getReadTime(post.content)}
									</span>
								</div>
							</div>

							{/* Read more arrow */}
							<div className="px-5 pb-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-blue-600 group-hover:gap-2.5 transition-all duration-200">
								Read Article
								<ArrowRight className="w-3 h-3" />
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
