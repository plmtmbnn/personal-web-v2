"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useEffect } from "react";

export default function BlogError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// Log error to monitoring service
		console.error("Blog list error:", error);
	}, [error]);

	return (
		<main className="min-h-screen bg-white relative overflow-x-hidden pb-32 flex items-center justify-center">
			{/* Background Ambient */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute top-[-5%] right-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-red-50/30 rounded-full blur-[120px]" />
				<div className="absolute bottom-[-5%] left-[-10%] w-[80%] lg:w-[60%] h-[60%] bg-slate-100/50 rounded-full blur-[120px]" />
			</div>

			<div className="max-w-2xl mx-auto px-6 text-center">
				<div className="bg-white border-2 border-red-100 rounded-[2.5rem] p-10 sm:p-16 shadow-xl">
					{/* Icon */}
					<div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 flex items-center justify-center">
						<AlertTriangle className="w-8 h-8 text-red-500" />
					</div>

					{/* Title */}
					<h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
						Something Went Wrong
					</h1>

					{/* Description */}
					<p className="text-base text-slate-600 mb-8 leading-relaxed">
						We encountered an error while loading the blog posts. This has been
						logged and we'll look into it.
					</p>

					{/* Error details (development only) */}
					{process.env.NODE_ENV === "development" && (
						<div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl text-left">
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
							href="/"
							className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl text-sm font-bold uppercase tracking-wider hover:border-slate-400 transition-all"
						>
							<Home className="w-4 h-4" />
							Go Home
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
