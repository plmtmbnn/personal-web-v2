"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, RouteOff } from "lucide-react";

export default function NotFound() {
	const pathname = usePathname();

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-4 pb-28 sm:pb-36">
			<div className="max-w-md w-full">
				<div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs sm:shadow-md space-y-6">
					{/* Clean Header & Telemetry Status Row */}
					<div className="flex items-center justify-between pb-4 border-b border-slate-100">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
							<Link
								href="/"
								className="hover:text-slate-900 transition-colors !no-underline"
							>
								Home
							</Link>
							<span className="text-slate-300">/</span>
							<span className="text-slate-900 font-bold">404</span>
						</div>
						<span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
							HTTP 404
						</span>
					</div>

					{/* Hero Identity Stage */}
					<div className="text-center space-y-3.5">
						<div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/80 text-rose-600 flex items-center justify-center mx-auto shadow-2xs">
							<RouteOff className="w-6 h-6" />
						</div>

						<div className="space-y-1">
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
								Route Not Found
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
								The requested path does not exist or has been relocated within
								the system.
							</p>
						</div>

						{/* Concrete Path Telemetry */}
						{pathname && (
							<div className="bg-slate-50 border border-slate-200/70 rounded-xl px-3.5 py-2 text-left flex items-center gap-2 overflow-hidden">
								<span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
									Path
								</span>
								<code className="text-xs font-mono font-semibold text-slate-800 truncate">
									{pathname}
								</code>
							</div>
						)}
					</div>

					{/* Single Unambiguous Recovery Action */}
					<div className="pt-1">
						<Link
							href="/"
							className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs active:scale-95 transition-all !no-underline"
						>
							<ArrowLeft className="w-4 h-4 !text-white" />
							<span className="!text-white">Return to Home</span>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
