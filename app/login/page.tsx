"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	ShieldAlert,
	Loader2,
	ShieldCheck,
	ArrowLeft,
	Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoginButton from "@/features/auth/components/LoginButton";
import { ENV_GLOBAL } from "@/lib/core/env";
import Link from "next/link";
import { useEffect } from "react";

/**
 * Login Page Content
 */
function LoginContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const error = searchParams.get("error");
	const message = searchParams.get("message");

	// Feature Toggle Check: If either is disabled, mark as logined and redirect
	useEffect(() => {
		if (
			ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false" ||
			ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD === "false"
		) {
			router.push("/admin");
		}
	}, [router]);

	if (
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false" ||
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD === "false"
	) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
					<p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">
						Authentication Bypassed • Redirecting...
					</p>
				</div>
			</div>
		);
	}

	const getErrorMessage = () => {
		if (message === "pending")
			return "Your account is pending verification. Please contact the administrator.";
		if (message === "error" || error)
			return "An authentication error occurred. Please try again.";
		return null;
	};

	const errorMsg = getErrorMessage();

	return (
		<div className="min-h-screen bg-slate-50/50 relative flex items-center justify-center p-6 overflow-hidden">
			{/* Aesthetic Ambient Glows */}
			<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[120px] animate-pulse" />
			<div
				className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
				style={{ animationDelay: "2s" }}
			/>

			<div className="w-full max-w-md z-10 space-y-6">
				{/* Login Card - Solid Productivity Pattern */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, ease: "easeOut" }}
					className="bg-white p-8 sm:p-10 border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-3xl relative overflow-hidden"
				>
					<div className="relative z-10">
						{/* Dark Header Accent Card - Contrast Mastery Pattern */}
						<div className="bg-slate-900 text-white rounded-2xl p-6 text-center mb-8 relative overflow-hidden shadow-md">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none" />

							<motion.div
								initial={{ scale: 0.8 }}
								animate={{ scale: 1 }}
								transition={{ duration: 0.5, type: "spring" }}
								className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-4"
							>
								<Lock className="w-5 h-5 text-indigo-400" />
							</motion.div>

							<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full mb-3 border border-indigo-500/20">
								<ShieldCheck className="w-3 h-3" />
								<span className="text-[9px] font-black uppercase tracking-widest">
									Secure Gateway
								</span>
							</div>

							<h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
								Personal Portal
							</h2>
							<p className="text-slate-400 text-xs max-w-[260px] mx-auto leading-relaxed">
								Identify yourself to access the command center.
							</p>
						</div>

						{/* Error Display */}
						<AnimatePresence>
							{errorMsg && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3"
								>
									<ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
									<p className="text-xs text-rose-700 font-bold leading-relaxed">
										{errorMsg}
									</p>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="flex justify-center py-4 mb-6">
							<LoginButton />
						</div>

						<div className="pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
										Redis Active
									</span>
								</div>
								<div className="w-px h-3 bg-slate-200" />
								<div className="flex items-center gap-1.5">
									<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
									<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
										Supabase Verified
									</span>
								</div>
							</div>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-center"
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Return to Portal
					</Link>
				</motion.div>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-slate-50 flex items-center justify-center">
					<Loader2 className="w-10 h-10 text-accent animate-spin" />
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
