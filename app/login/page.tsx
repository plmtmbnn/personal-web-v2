"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
	ShieldAlert,
	Loader2,
	ShieldCheck,
	ArrowLeft,
	Lock,
	KeyRound,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import LoginButton from "@/features/auth/components/LoginButton";
import { ENV_GLOBAL } from "@/lib/core/env";
import Link from "next/link";

/**
 * Login Page Content
 */
function LoginContent() {
	const reduceMotion = useReducedMotion();
	const searchParams = useSearchParams();
	const router = useRouter();
	const error = searchParams.get("error");
	const message = searchParams.get("message");

	// Feature Toggle Check: If both are disabled, mark as logined and redirect
	useEffect(() => {
		if (
			!ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH &&
			!ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD
		) {
			router.push("/admin");
		}
	}, [router]);

	if (
		!ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH &&
		!ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD
	) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
				<div className="flex flex-col items-center gap-4">
					<Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
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
		<div className="min-h-screen lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden bg-slate-50/80 bg-dot-pattern relative flex items-center justify-center p-4 sm:p-6">
			{/* Aesthetic Ambient Glows */}
			<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
			<div
				className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse"
				style={{ animationDelay: "2s" }}
			/>

			<div className="w-full max-w-md z-10 space-y-5">
				{/* Login Card - Solid Productivity Pattern */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: "easeOut" }}
					className="bg-white p-7 sm:p-9 border border-slate-200/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] relative overflow-hidden space-y-6"
				>
					{/* Dark Header Accent Card - Contrast Mastery Pattern */}
					<div className="bg-slate-950 text-white rounded-3xl p-6 text-center relative overflow-hidden shadow-xl border border-slate-800">
						{/* Ambient Glow in dark header */}
						<div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
						<div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

						<motion.div
							initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
							className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-black/20"
						>
							<Lock className="w-6 h-6 text-indigo-400" />
						</motion.div>

						<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full mb-3 border border-indigo-500/30 shadow-xs">
							<ShieldCheck className="w-3.5 h-3.5" />
							<span className="text-[9px] font-black uppercase tracking-[0.2em]">
								Secure Gateway
							</span>
						</div>

						<h2 className="text-2xl font-black tracking-tight text-white mb-1.5">
							Personal Portal
						</h2>
						<p className="text-slate-400 text-xs max-w-[270px] mx-auto leading-relaxed font-medium">
							Identify yourself to access the admin command center & system
							utilities.
						</p>
					</div>

					{/* Error Display */}
					<AnimatePresence mode="wait">
						{errorMsg && (
							<motion.div
								initial={reduceMotion ? false : { opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								className="p-4 bg-rose-50/90 border border-rose-200/80 rounded-2xl flex items-start gap-3 shadow-xs"
							>
								<ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
								<p className="text-xs text-rose-800 font-bold leading-relaxed">
									{errorMsg}
								</p>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Google Sign-in Hero Container */}
					<div className="space-y-3 pt-1">
						<div className="flex justify-center">
							<LoginButton />
						</div>
					</div>

					{/* System Security Features Deck */}
					<div className="pt-5 border-t border-slate-100 space-y-3">
						<div className="grid grid-cols-2 gap-2 text-center">
							<div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center justify-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
									Redis Session
								</span>
							</div>
							<div className="p-2.5 bg-slate-50/80 border border-slate-100 rounded-2xl flex items-center justify-center gap-2">
								<span className="w-2 h-2 rounded-full bg-indigo-500" />
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
									Supabase Auth
								</span>
							</div>
						</div>

						<div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest pt-1">
							<KeyRound className="w-3 h-3 text-indigo-500" />
							<span>Protected by 2FA Authenticator</span>
						</div>
					</div>
				</motion.div>

				{/* Return Link */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
					className="text-center"
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Return to Main Portal
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
