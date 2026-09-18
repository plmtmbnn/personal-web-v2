"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldX, ShieldAlert, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

function UnauthorizedContent() {
	const searchParams = useSearchParams();
	const message = searchParams.get("message");

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-4 sm:p-6">
			<div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2rem] p-7 sm:p-9 shadow-xs text-center space-y-6">
				{/* Icon & Identity */}
				<div className="space-y-3">
					<div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-2xs text-rose-600">
						<ShieldX className="w-7 h-7" />
					</div>

					<div>
						<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-100 shadow-2xs mb-2">
							<ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
							<span className="text-[10px] font-black uppercase tracking-wider">
								Access Control
							</span>
						</div>

						<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
							Access Denied
						</h1>

						<p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
							{message === "pending"
								? "Your account has been registered but is pending administrator verification. Access will be unlocked once approved."
								: "Your credentials could not be verified for this restricted portal. Please sign in with an authorized administrator account."}
						</p>
					</div>
				</div>

				{/* Dual Action Buttons */}
				<div className="pt-2 space-y-2.5">
					<Link
						href="/login"
						className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs active:scale-95 transition-[background-color,transform] !no-underline"
					>
						<ArrowLeft className="w-4 h-4 !text-white" />
						<span className="!text-white">Back to Login</span>
					</Link>
					<Link
						href="/"
						className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-[background-color,transform] !no-underline"
					>
						<Home className="w-4 h-4 text-slate-500" />
						<span>Back to Home</span>
					</Link>
				</div>
			</div>
		</main>
	);
}

export default function UnauthorizedPage() {
	return (
		<Suspense fallback={null}>
			<UnauthorizedContent />
		</Suspense>
	);
}
