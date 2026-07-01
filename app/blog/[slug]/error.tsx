"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function BlogDetailError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to monitoring service
		console.error("Blog detail error:", error);
	}, [error]);

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32">
			{/* Background Ambient */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-red-50/30 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-slate-100/50 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32">
				{/* Breadcrumb */}
				<div className="mb-8">
					<Link
						href="/blog"
						className="inline-flex items-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-slate-950 transition-colors gap-2 !no-underline"
					>
						<ArrowLeft className="w-3.5 h-3.5" />
						Back to Journal
					</Link>
				</div>

				{/* Error Card */}
				<div className="bg-white border-2 border-red-100 rounded-[2.5rem] sm:rounded-[3.5rem] p-10 sm:p-16 shadow-xl text-center">
					{/* Icon */}
					<div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
						<AlertTriangle className="w-8 h-8 text-red-500" />
					</div>

					{/* Title */}
					<h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
						Failed to Load Article
					</h1>

					{/* Description */}
					<p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto">
						We couldn't render this blog post. The issue has been logged and
						we'll investigate it.
					</p>

					{/* Error details (development only) */}
					{process.env.NODE_ENV === "development" && (
						<div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-left max-w-2xl mx-auto">
							<p className="text-xs font-mono text-red-800 break-all">
								{error.message}
							</p>
							{error.digest && (
								<p className="text-xs font-mono text-red-600 mt-2">
									Digest: {error.digest}
								</p>
							)}
						</div>
					)}

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							onClick={reset}
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md"
						>
							<RefreshCw className="w-4 h-4" />
							Try Again
						</button>
						<Link
							href="/blog"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold uppercase tracking-wider hover:border-slate-400 transition-all"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Journal
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
