"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RotateCw } from "lucide-react";

export default function ErrorStateFallback() {
	const router = useRouter();

	return (
		<div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-[2rem] shadow-sm text-center">
			<div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
				<AlertCircle className="w-6 h-6 text-rose-600" />
			</div>
			<h3 className="text-lg font-bold text-slate-900 mb-2">
				Failed to Load Blog Entries
			</h3>
			<p className="text-sm text-slate-500 max-w-sm mb-6">
				An error occurred while fetching the knowledge base content. Please
				check your connection and try again.
			</p>
			<button
				onClick={() => router.refresh()}
				className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer"
			>
				<RotateCw className="w-4 h-4" />
				Retry Loading
			</button>
		</div>
	);
}
