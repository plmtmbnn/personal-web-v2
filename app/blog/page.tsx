import Link from "next/link";
import Image from "next/image";
import { getBlogsStatic } from "@/features/blog/data";
import {
	ArrowRight,
	Calendar,
	BookOpen,
	Clock,
	Tag,
	Sparkles,
} from "lucide-react";
import * as motion from "framer-motion/client";

/**
 * Enhanced Dynamic Placeholder System
 */
const PLACEHOLDERS = [
	"https://plus.unsplash.com/premium_photo-1664301432574-9b4e85c2b2d3?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2072&auto=format&fit=crop", // Tech Blue
	"https://images.unsplash.com/photo-1512455011254-e2db8db4ef22?q=80&w=1195&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop", // Circuit
	"https://images.unsplash.com/photo-1522199755839-a2bacb67c546?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?q=80&w=2070&auto=format&fit=crop", // Cyber Security
	"https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop", // Minimal Workspace
];

/**
 * Deterministic Placeholder Picker
 */
const getBlogImage = (imageUrl: string | null, seed: string) => {
	if (imageUrl && imageUrl.trim() !== "") return imageUrl;

	// Use sum of char codes as simple deterministic index
	const charSum = seed
		.split("")
		.reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return PLACEHOLDERS[charSum % PLACEHOLDERS.length];
};

/**
 * Category Style Utility - Optimized for DB specific values
 */
const getCategoryStyles = (category: string) => {
	const c = category;
	if (c === "Finance" || c === "Investment")
		return "bg-emerald-50 text-emerald-700 border-emerald-100";
	if (c === "Tech") return "bg-blue-50 text-blue-700 border-blue-100";
	if (c === "Running") return "bg-rose-50 text-rose-700 border-rose-100";
	return "bg-slate-50 text-slate-700 border-slate-100";
};

export default async function BlogPage() {
	const allBlogs = await getBlogsStatic();

	const headlines = allBlogs.filter((blog) => blog.is_headline);
	const primaryHero = headlines[0];
	const secondaryHeadlines = headlines.slice(1, 3);

	const featuredIds = headlines.slice(0, 3).map((b) => b.id);
	const regularPosts = allBlogs.filter(
		(blog) => !featuredIds.includes(blog.id),
	);

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32">
			{/* Aesthetic Background Ambient */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-slate-100/50 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-blue-50/30 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-7xl mx-auto px-6 pt-20 sm:pt-32">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16 sm:mb-24 border-b border-slate-100 pb-12 sm:pb-16">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						className="space-y-6 max-w-3xl"
					>
						<div className="flex items-center gap-3 text-slate-900">
							<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
							<span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
								Engineering Journal
							</span>
						</div>
						<h1 className="text-5xl sm:text-8xl font-black tracking-tighter text-slate-950 leading-[0.9]">
							The <span className="gradient-text">Pulse</span>
						</h1>
						<p className="text-slate-500 text-lg sm:text-xl font-medium leading-relaxed">
							High-fidelity insights on fintech architecture, distributed
							systems, and modern engineering culture.
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className="flex items-center gap-5 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl"
					>
						<div className="text-right">
							<p className="text-2xl font-black text-slate-900">
								{allBlogs.length}
							</p>
							<p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
								Archive Size
							</p>
						</div>
						<div className="w-px h-10 bg-slate-100" />
						<div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
							<Sparkles className="w-6 h-6 text-slate-900" />
						</div>
					</motion.div>
				</div>

				{/* SECTION 1: The Primary Hero */}
				{primaryHero && (
					<section className="mb-20">
						<Link
							href={`/blog/${primaryHero.slug}`}
							className="group block relative !no-underline"
						>
							<div className="relative h-[500px] sm:h-[650px] w-full overflow-hidden rounded-[3rem] sm:rounded-[4rem] border border-slate-200 shadow-2xl transition-all duration-500">
								<Image
									src={getBlogImage(primaryHero.image_url, primaryHero.id)}
									alt={primaryHero.title}
									fill
									priority
									className="object-cover transition-transform duration-[1.5s] group-hover:scale-105"
								/>

								{/* Bottom-weighted gradient for overall depth */}
								<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

								{/* Text Background Content Area */}
								<div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-20">
									<motion.div
										className="bg-slate-950/60 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-[2.5rem] space-y-6 max-w-5xl"
										whileHover={{ backgroundColor: "rgba(2, 6, 23, 0.75)" }}
									>
										<div className="flex items-center gap-4">
											<span className="px-5 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
												Headline Story
											</span>
											<span
												className={`px-5 py-2 border text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-xl ${getCategoryStyles(primaryHero.category)}`}
											>
												{primaryHero.category}
											</span>
										</div>
										<h2 className="text-3xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1] group-hover:text-blue-200 transition-colors duration-500">
											{primaryHero.title}
										</h2>
										<p className="text-slate-300 text-base sm:text-xl font-medium line-clamp-2 opacity-90 !text-white">
											{primaryHero.description}
										</p>
										<div className="pt-4 flex items-center gap-6 text-white/40 text-[11px] font-black uppercase tracking-[0.3em]">
											<span className="flex items-center gap-2">
												<Calendar className="w-4 h-4" />{" "}
												{new Intl.DateTimeFormat("en-US", {
													dateStyle: "long",
												}).format(new Date(primaryHero.date))}
											</span>
											<span className="flex items-center gap-2">
												<Clock className="w-4 h-4" /> 8 MIN READ
											</span>
										</div>
									</motion.div>
								</div>
							</div>
						</Link>
					</section>
				)}

				{/* SECTION 2: Secondary Headlines */}
				{secondaryHeadlines.length > 0 && (
					<section className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-32">
						{secondaryHeadlines.map((post) => (
							<Link
								key={post.id}
								href={`/blog/${post.slug}`}
								className="group block relative !no-underline"
							>
								<div className="relative h-[450px] w-full overflow-hidden rounded-[2.5rem] border border-slate-200 shadow-xl transition-all duration-500">
									<Image
										src={getBlogImage(post.image_url, post.id)}
										alt={post.title}
										fill
										className="object-cover"
									/>
									<div className="absolute inset-0 bg-slate-950/40" />

									<div className="absolute bottom-6 left-6 right-6 p-8 bg-white/95 backdrop-blur-md rounded-3xl border border-white shadow-2xl transition-all duration-500 group-hover:translate-y-[-5px]">
										<span
											className={`inline-block px-3 py-1 border text-[8px] font-black uppercase tracking-widest rounded-full mb-4 backdrop-blur-xl ${getCategoryStyles(post.category)}`}
										>
											{post.category}
										</span>
										<h3 className="text-2xl font-black text-slate-950 tracking-tighter leading-tight mb-4 group-hover:text-blue-600 transition-colors">
											{post.title}
										</h3>
										<div className="flex items-center gap-4 text-slate-400 text-[9px] font-black uppercase tracking-widest">
											<Calendar className="w-3.5 h-3.5" />
											{new Intl.DateTimeFormat("en-US", {
												dateStyle: "medium",
											}).format(new Date(post.date))}
										</div>
									</div>
								</div>
							</Link>
						))}
					</section>
				)}

				{/* SECTION 3: Regular Grid */}
				<section className="space-y-12">
					<div className="flex items-center gap-6">
						<h2 className="text-xs font-black uppercase tracking-[0.6em] text-slate-400 whitespace-nowrap">
							The Pulse Grid
						</h2>
						<div className="h-px w-full bg-slate-100" />
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
						{regularPosts.map((post, index) => (
							<motion.div
								key={post.slug}
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
							>
								<Link
									href={`/blog/${post.slug}`}
									className="group block !no-underline h-full"
								>
									<div className="flex flex-col h-full bg-white border border-slate-200 hover:border-slate-300 rounded-[2.5rem] p-4 transition-all duration-500 hover:shadow-2xl">
										<div className="relative h-60 w-full mb-6 overflow-hidden rounded-[2rem] border border-slate-100">
											<Image
												src={getBlogImage(post.image_url, post.id)}
												alt={post.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-110"
											/>
											<div className="absolute top-4 left-4">
												<span
													className={`px-3 py-1 border text-[8px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-lg ${getCategoryStyles(post.category)}`}
												>
													{post.category}
												</span>
											</div>
										</div>

										<div className="flex-1 space-y-4 px-4 pb-4">
											<div className="flex items-center gap-3 text-slate-400 text-[9px] font-black uppercase tracking-widest">
												<Calendar className="w-3 h-3" />
												{new Intl.DateTimeFormat("en-US", {
													dateStyle: "medium",
												}).format(new Date(post.date))}
											</div>
											<h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
												{post.title}
											</h3>
											<p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
												{post.description}
											</p>

											<div className="pt-4 flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
												Explore Logic <ArrowRight className="w-3.5 h-3.5" />
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</section>
			</div>
		</main>
	);
}
