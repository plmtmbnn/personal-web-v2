"use client";

import Link from "next/link";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-4 sm:p-6">
			<div className="max-w-md w-full">
				<div className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2rem] p-7 sm:p-10 shadow-xs text-center space-y-6">
					{/* Status Pill & 404 Hero */}
					<div className="space-y-3">
						<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200/80 shadow-2xs">
							<FileQuestion className="w-3.5 h-3.5 text-slate-500" />
							<span className="text-[10px] font-black uppercase tracking-wider">
								Error 404 • Missing Resource
							</span>
						</div>

						<div className="text-7xl sm:text-8xl font-black text-slate-900 tracking-tight select-none">
							404
						</div>

						<div>
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
								Page Not Found
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
								The page you are looking for does not exist or has been moved.
							</p>
						</div>
					</div>

					{/* Dual Actions */}
					<div className="pt-2 space-y-2.5">
						<Link
							href="/"
							className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs active:scale-95 transition-[background-color,transform] !no-underline"
						>
							<Home className="w-4 h-4 !text-white" />
							<span className="!text-white">Go to Home</span>
						</Link>
						<button
							type="button"
							onClick={() => window.history.back()}
							className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-[background-color,transform] cursor-pointer"
						>
							<ArrowLeft className="w-4 h-4 text-slate-500" />
							<span>Go Back</span>
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
