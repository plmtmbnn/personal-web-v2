import Link from "next/link";
import { getBlogs } from "@/lib/data/blog";
import { ArrowRight, Calendar, Newspaper } from "lucide-react";

export const metadata = {
	title: "Blog | Polma Tambunan",
	description:
		"Articles on software engineering, systems, fintech, and lessons learned.",
};

export default async function BlogPage() {
	const blogList = await getBlogs();

	return (
		<section className="min-h-screen bg-background relative overflow-hidden">
			{/* Aesthetic Background */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div className="absolute top-20 right-20 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60 animate-float" />
				<div
					className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[150px] opacity-60 animate-float"
					style={{ animationDelay: "2s" }}
				/>
			</div>

			<div className="max-w-6xl mx-auto px-6 py-24 sm:py-32 relative z-10">
				{/* Header */}
				<header className="max-w-3xl mb-20 animate-fade-in">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest mb-6">
						<Newspaper className="w-3 h-3" />
						Knowledge Base
					</div>
					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-foreground mb-8 tracking-tight italic">
						Blog
					</h1>
					<p className="text-xl text-muted-foreground leading-relaxed">
						Writing about software engineering, fintech, systems, and lessons
						learned along the way.
					</p>
				</header>

				{/* Blog Grid */}
				{blogList.length === 0 ? (
					<div
						className="max-w-xl animate-fade-in"
						style={{ animationDelay: "0.2s" }}
					>
						<div className="glass p-12 text-center rounded-[2.5rem] border-2 border-dashed border-border/50">
							<div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner ring-1 ring-indigo-100">
								<Calendar className="w-10 h-10 text-indigo-600 opacity-40" />
							</div>
							<h3 className="text-2xl font-bold text-foreground mb-4 italic">
								Coming Soon
							</h3>
							<p className="text-muted-foreground text-lg leading-relaxed mb-8">
								I'm preparing thoughtful articles on engineering, systems, and
								endurance. Check back soon.
							</p>
							<div className="flex items-center justify-center gap-3 text-sm font-bold text-indigo-600 bg-indigo-50/50 py-3 rounded-2xl w-fit mx-auto px-6 ring-1 ring-indigo-100">
								<div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
								Writing in progress
							</div>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogList.map(({ title, description, slug, date }, index) => (
							<article
								key={slug}
								className="animate-fade-in"
								style={{ animationDelay: `${(index + 1) * 0.1}s` }}
							>
								<Link href={`/blog/${slug}`} className="group block h-full">
									<div className="h-full glass-card border-white/40 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 flex flex-col group-hover:border-indigo-200">
										<div className="mb-6 flex justify-between items-start">
											<div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-background-secondary px-3 py-1.5 rounded-xl border border-border/50">
												<Calendar className="w-3 h-3 text-indigo-500" />
												{new Intl.DateTimeFormat("en-US", {
													dateStyle: "medium",
												}).format(new Date(date))}
											</div>
										</div>

										<div className="flex-1">
											<h3 className="text-2xl font-black text-foreground mb-4 group-hover:text-indigo-600 transition-colors duration-300 leading-tight italic">
												{title}
											</h3>
											<p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
												{description}
											</p>
										</div>

										<div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center text-xs font-black uppercase tracking-widest">
											<span className="text-indigo-600 group-hover:gap-2 flex items-center gap-1 transition-all duration-300">
												Read Full Article <ArrowRight className="w-4 h-4" />
											</span>
										</div>
									</div>
								</Link>
							</article>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
