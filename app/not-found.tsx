"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-6">
			<div className="max-w-md w-full">
				<div className="bg-white border border-slate-200/80 rounded-3xl p-10 shadow-lg text-center space-y-6">
					{/* 404 Number */}
					<div className="space-y-3">
						<div className="text-7xl sm:text-8xl font-extrabold text-slate-900 tracking-tighter">
							404
						</div>
						<h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
							Page Not Found
						</h1>
						<p className="text-sm text-slate-600 font-medium leading-relaxed">
							The page you're looking for doesn't exist or has been moved.
						</p>
					</div>

					{/* Actions */}
					<div className="pt-4 space-y-3">
						<Link
							href="/"
							className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-95 !no-underline"
						>
							<Home className="w-4 h-4 text-white" />
							<span className="text-white">Go to Home</span>
						</Link>
						<button
							onClick={() => window.history.back()}
							className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all duration-200 active:scale-95"
						>
							<ArrowLeft className="w-4 h-4" />
							Go Back
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
