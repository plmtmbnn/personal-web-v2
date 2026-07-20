"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	ArrowLeft,
	Globe,
	Loader2,
	AlertCircle,
	CheckCircle,
	ExternalLink,
	Sparkles,
} from "lucide-react";
import Link from "next/link";
import PinGuard from "@/features/auth/PinGuard";
import { archiveUrl } from "../actions";

export default function WebArchiverView() {
	const reduceMotion = useReducedMotion();
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [result, setResult] = useState<{
		slug: string;
		title: string;
		message: string;
	} | null>(null);

	const handleArchive = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const res = await archiveUrl(url.trim());
			if (res.success && res.slug && res.title) {
				setResult({
					slug: res.slug,
					title: res.title,
					message: res.message,
				});
				setUrl(""); // clear URL
			} else {
				setError(res.message || "Failed to archive URL.");
			}
		} catch (err: any) {
			setError(err.message || "An unexpected error occurred.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<PinGuard>
			<main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 text-slate-900 pb-20">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 relative z-10">
					{/* Breadcrumb Back */}
					<div className="space-y-6 mb-10">
						<Link
							href="/utils"
							className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-colors gap-2 group"
						>
							<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
							Developer Utilities
						</Link>

						<div className="flex items-center gap-5">
							<div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/20 active:scale-90 transition-transform">
								<Globe className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 leading-none">
									Web <span className="text-blue-600">Archiver</span>
								</h1>
								<p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mt-3">
									Read-It-Later Scraper for Second Brain
								</p>
							</div>
						</div>
					</div>

					{/* Card Container */}
					<div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm p-8 sm:p-12">
						<h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-blue-500" />
							Archive Article from URL
						</h2>

						<form onSubmit={handleArchive} className="space-y-6">
							<div>
								<label
									htmlFor="url-input"
									className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2"
								>
									Article URL
								</label>
								<div className="relative">
									<input
										id="url-input"
										type="url"
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										placeholder="https://example.com/some-interesting-article"
										className="w-full px-6 py-4 bg-slate-55 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-mono"
										required
										disabled={isLoading}
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={isLoading || !url.trim()}
								className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-blue-600 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center gap-2"
							>
								{isLoading ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Archiving Page...
									</>
								) : (
									"Scrape & Save"
								)}
							</button>
						</form>

						{/* Notification / Feedbacks */}
						<AnimatePresence mode="wait">
							{error && (
								<motion.div
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-700"
								>
									<AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
									<div>
										<h4 className="font-bold text-sm">Archiving Failed</h4>
										<p className="text-xs text-red-600 mt-1">{error}</p>
									</div>
								</motion.div>
							)}

							{result && (
								<motion.div
									initial={reduceMotion ? false : { opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-3 text-emerald-800"
								>
									<CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
									<div className="flex-1">
										<h4 className="font-bold text-sm">{result.message}</h4>
										<p className="text-xs text-emerald-600 mt-1 font-semibold">
											{result.title}
										</p>
										<div className="mt-4 flex gap-4">
											<Link
												href={`/brain/${result.slug}`}
												className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
											>
												View in Brain
												<ExternalLink className="w-3.5 h-3.5" />
											</Link>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</main>
		</PinGuard>
	);
}
