import { Fade, JackInTheBox, Zoom } from "react-awesome-reveal";
import Link from "next/link";
import { HiArrowRight, HiClock, HiNewspaper } from "react-icons/hi";
import { BlogList } from "@/app/blog/blog-list";

export const metadata = {
	title: "Blog | Polma Tambunan",
	description:
		"Thoughts, writings, and experiences on software engineering, fintech, and running.",
};

export default function BlogPage() {
	return (
		<section className="min-h-screen bg-slate-50 px-4 sm:px-6 py-20">
			<div className="max-w-6xl mx-auto space-y-16">
				{/* ===== Header ===== */}
				<div className="text-center space-y-6">
					<JackInTheBox triggerOnce>
						<h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
							Blog
						</h1>

						<p className="max-w-2xl mx-auto text-slate-600 text-lg">
							Writing about software engineering, fintech, running, and lessons
							learned along the way.
						</p>
					</JackInTheBox>
				</div>

				{/* ===== Empty State ===== */}
				{BlogList.length === 0 ? (
					<Fade triggerOnce>
						<div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
							<div className="flex justify-center mb-5">
								<div className="p-4 bg-indigo-50 rounded-full">
									<HiClock className="w-10 h-10 text-indigo-600" />
								</div>
							</div>

							<h3 className="text-xl font-semibold text-slate-900 mb-2">
								Coming Soon
							</h3>
							<p className="text-slate-600">
								I’m preparing thoughtful articles on engineering, systems, and
								endurance. Check back soon.
							</p>
						</div>
					</Fade>
				) : (
					<>
						{/* ===== Blog Grid ===== */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{BlogList.map(({ title, description, slug }, index) => (
								<Zoom triggerOnce delay={120 * index} key={slug}>
									<Link href={`/blog/${slug}`} className="group block h-full">
										<div className="h-full bg-white border border-slate-200 rounded-2xl p-6 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
											{/* Header */}
											<div className="flex items-start justify-between mb-4">
												<div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
													<HiNewspaper className="w-5 h-5" />
												</div>
												<HiArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
											</div>

											{/* Content */}
											<div className="flex-1">
												<h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
													{title}
												</h3>
												<p className="text-slate-600 line-clamp-3">
													{description}
												</p>
											</div>

											{/* Footer */}
											<div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
												<span className="font-medium group-hover:text-indigo-600 transition-colors">
													Read article
												</span>
												<div className="flex items-center gap-1">
													<HiClock className="w-4 h-4" />
													<span>5 min</span>
												</div>
											</div>
										</div>
									</Link>
								</Zoom>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
}
