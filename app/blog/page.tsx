import Link from "next/link";
import { BlogI } from "./blog-list";
import { getBlogs } from "@/lib/data/blog";

export default async function BlogPage() {
	const blogList: BlogI[] = await getBlogs();

	return (
		<section className="min-h-screen bg-background px-4 sm:px-6 py-20 relative overflow-hidden">
			{/* Subtle Background */}
			<div className="absolute inset-0">
				<div className="absolute top-20 right-20 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-40 animate-float"></div>
				<div
					className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-40 animate-float"
					style={{ animationDelay: "1s", animationDuration: "5s" }}
				></div>
			</div>

			<div className="max-w-6xl mx-auto space-y-16 relative z-10">
				{/* Header */}
				<div
					className={`text-center space-y-6 transition-all duration-700 opacity-100 translate-y-0`}
				>
					<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
						Blog
					</h2>
					<p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
						Writing about software engineering, fintech, running, and lessons
						learned along the way.
					</p>
				</div>

				{/* Empty State */}
				{blogList.length === 0 ? (
					<div
						className={`max-w-xl mx-auto transition-all duration-700 delay-200 opacity-100 translate-y-0`}
					>
						<div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-md hover:shadow-xl transition-all duration-300">
							<div className="flex justify-center mb-6">
								<div className="p-5 bg-indigo-50 rounded-full">
									<svg
										className="w-10 h-10 text-indigo-600"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
							</div>

							<h3 className="text-xl font-bold text-foreground mb-3">
								Coming Soon
							</h3>
							<p className="text-muted-foreground leading-relaxed">
								I'm preparing thoughtful articles on engineering, systems, and
								endurance. Check back soon.
							</p>

							<div className="mt-6 pt-6 border-t border-slate-200">
								<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
									<div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
									<span>New articles in progress</span>
								</div>
							</div>
						</div>
					</div>
				) : (
					/* Blog Grid */
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{blogList.map(({ title, description, slug }, index) => (
							<div
								key={slug}
								className={`transition-all duration-700 opacity-100 translate-y-0`}
								style={{ transitionDelay: `${(index + 2) * 120}ms` }}
							>
								<Link href={`/blog/${slug}`} className="group block h-full">
									<div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
										{/* Header */}
										<div className="flex items-start justify-between mb-4">
											<div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors duration-300">
												<svg
													className="w-5 h-5"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h20a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
													/>
												</svg>
											</div>
											<svg
												className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-300"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 7l5 5m0 0l-5 5m5-5H6"
												/>
											</svg>
										</div>

										{/* Content */}
										<div className="flex-1">
											<h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-indigo-600 transition-colors duration-300">
												{title}
											</h3>
											<p className="text-muted-foreground line-clamp-3 leading-relaxed">
												{description}
											</p>
										</div>

										{/* Footer */}
										<div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
											<span className="font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors duration-300">
												Read article
											</span>
											<div className="flex items-center gap-1 text-muted-foreground">
												<svg
													className="w-4 h-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
													/>
												</svg>
												<span>5 min</span>
											</div>
										</div>
									</div>
								</Link>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
