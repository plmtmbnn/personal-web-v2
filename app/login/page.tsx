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
			<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
			<div
				className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-purple-500/5 rounded-full blur-[120px] animate-pulse"
				style={{ animationDelay: "2s" }}
			/>

			<div className="w-full max-w-md z-10 space-y-10">
				{/* Branding / Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center"
				>
					<div className="w-20 h-20 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm group hover:scale-105 transition-transform duration-500">
						<Lock className="w-10 h-10 text-slate-900 group-hover:text-accent transition-colors" />
					</div>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full mb-4 shadow-sm">
						<ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
						<span className="text-[10px] font-black uppercase tracking-widest text-slate-600">
							Secure Gateway
						</span>
					</div>
					<h1 className="text-4xl font-black tracking-tighter text-slate-900">
						Personal Portal
					</h1>
				</motion.div>

				{/* Login Card - Solid Productivity Pattern */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white p-10 sm:p-12 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[3rem] relative overflow-hidden"
				>
					<div className="relative z-10">
						<div className="text-center mb-10">
							<h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
								Welcome Back
							</h2>
							<p className="text-sm text-slate-400 font-medium">
								Identify yourself to access the command center.
							</p>
						</div>

						{/* Error Display */}
						<AnimatePresence>
							{errorMsg && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 overflow-hidden"
								>
									<ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
									<p className="text-xs text-rose-700 font-bold leading-relaxed">
										{errorMsg}
									</p>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="flex justify-center mb-10">
							<LoginButton />
						</div>

						<div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
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
						className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-accent transition-all group !no-underline"
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
