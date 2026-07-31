import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden flex items-center justify-center p-4 py-24 sm:py-32">
			<div className="w-full max-w-xl mx-auto relative z-10">
				<div className="bg-white border border-slate-200/80 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/50 text-center space-y-8">
					{/* Icon & 404 Badge */}
					<div className="flex flex-col items-center gap-4">
						<div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
							<Compass className="w-8 h-8 text-indigo-600" />
						</div>
						<span className="text-6xl sm:text-8xl font-extrabold text-slate-900 tracking-tighter">
							404
						</span>
					</div>

					{/* Message */}
					<div className="space-y-2">
						<div className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
							Route Not Found
						</div>
						<h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
							Page Off the Radar
						</h1>
						<p className="text-slate-600 text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed">
							The requested location does not exist or has been relocated within
							the intelligence platform.
						</p>
					</div>

					{/* Action Button */}
					<div className="pt-2 flex justify-center">
						<Link
							href="/"
							className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95 cursor-pointer !no-underline"
						>
							<ArrowLeft className="w-4 h-4 text-white" />
							<span>Return to Command Dashboard</span>
						</Link>
					</div>
				</div>
			</div>
		</main>
	);
}
