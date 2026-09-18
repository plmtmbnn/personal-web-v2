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

	// Feature Toggle Check: If both are disabled, mark as logged in and redirect
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
			<div className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-6 text-center">
				<div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs max-w-xs w-full flex flex-col items-center gap-3">
					<Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
					<p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
						Authentication Bypassed • Redirecting...
					</p>
				</div>
			</div>
		);
	}

	const getErrorMessage = () => {
		if (message === "pending")
			return "Your account is pending administrator verification. Please contact the administrator.";
		if (message === "error" || error)
			return "An authentication error occurred. Please try again.";
		return null;
	};

	const errorMsg = getErrorMessage();

	return (
		<div className="min-h-screen lg:h-screen lg:max-h-[100dvh] lg:overflow-hidden bg-slate-50/80 bg-dot-pattern relative flex items-center justify-center p-4 sm:p-6">
			<div className="w-full max-w-md z-10 space-y-4">
				{/* Login Card - Modern Floating Card Standard */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, ease: "easeOut" }}
					className="bg-white p-7 sm:p-9 border border-slate-200/80 shadow-xs rounded-3xl sm:rounded-[2rem] space-y-6 text-center"
				>
					{/* Header Icon Squircle & Identity */}
					<div className="space-y-3">
						<div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-2xs text-indigo-600">
							<Lock className="w-6 h-6" />
						</div>

						<div>
							<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 text-indigo-700 rounded-full border border-indigo-100 shadow-2xs mb-2">
								<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
								<span className="text-[10px] font-black uppercase tracking-wider">
									Secure Gateway
								</span>
							</div>

							<h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-1.5">
								Personal Portal
							</h1>
							<p className="text-slate-500 text-xs sm:text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
								Sign in with your authorized account to access administrative
								tools and utilities.
							</p>
						</div>
					</div>

					{/* Error Display */}
					<AnimatePresence mode="wait">
						{errorMsg && (
							<motion.div
								initial={reduceMotion ? false : { opacity: 0, y: -8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								className="p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-start gap-2.5 text-left shadow-2xs"
							>
								<ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
								<p className="text-xs text-rose-800 font-bold leading-relaxed">
									{errorMsg}
								</p>
							</motion.div>
						)}
					</AnimatePresence>

					{/* Google Sign-in Action */}
					<div className="pt-1 flex justify-center">
						<LoginButton />
					</div>

					{/* System Security Features Deck */}
					<div className="pt-5 border-t border-slate-100 space-y-3">
						<div className="grid grid-cols-2 gap-2 text-center">
							<div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2">
								<span className="w-2 h-2 rounded-full bg-emerald-500" />
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
									Redis Session
								</span>
							</div>
							<div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center gap-2">
								<span className="w-2 h-2 rounded-full bg-indigo-500" />
								<span className="text-[10px] font-black uppercase tracking-wider text-slate-600">
									Supabase Auth
								</span>
							</div>
						</div>

						<div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest pt-0.5">
							<KeyRound className="w-3.5 h-3.5 text-indigo-500" />
							<span>Protected by 2FA Authenticator</span>
						</div>
					</div>
				</motion.div>

				{/* Return Link */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-center"
				>
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						<span>Back to Home</span>
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
				<div className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-6">
					<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center gap-3">
						<Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
						<span className="text-xs font-bold text-slate-600">
							Loading login portal...
						</span>
					</div>
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
