"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, ShieldAlert, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import LoginButton from "@/components/auth/LoginButton";
import { ENV_GLOBAL } from "@/lib/core/env";

/**
 * Login Page Content
 */
function LoginContent() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");
	const message = searchParams.get("message");

	// Feature Toggle Check: If Google Auth is disabled, inform the user or redirect
	if (ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false") {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
				<div className="max-w-md">
					<ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
					<h1 className="text-2xl font-bold mb-2">Auth Disabled</h1>
					<p className="text-muted-foreground">
						Google Authentication is currently disabled via feature toggle.
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
		<div className="min-h-screen bg-background relative flex items-center justify-center p-6 overflow-hidden">
			{/* Aesthetic Background Elements */}
			<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
			<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="w-full max-w-md z-10"
			>
				{/* Branding / Header */}
				<div className="text-center mb-10">
					<div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-accent/20">
						<LogIn className="w-10 h-10 text-accent" />
					</div>
					<h1 className="text-3xl font-black tracking-tight mb-2">
						Personal Portal
					</h1>
					<p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.3em]">
						Secure Access
					</p>
				</div>

				{/* Login Card */}
				<div className="glass-card p-10 border-2 border-white/5 shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-[2.5rem]">
					<div className="relative z-10">
						<div className="text-center mb-8">
							<h2 className="text-xl font-bold mb-2">Welcome Back</h2>
							<p className="text-sm text-muted-foreground">
								Sign in to access your dashboard.
							</p>
						</div>

						{/* Error Display */}
						{errorMsg && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
							>
								<ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
								<p className="text-xs text-red-600 font-bold leading-relaxed">
									{errorMsg}
								</p>
							</motion.div>
						)}

						<div className="flex justify-center">
							<LoginButton />
						</div>

						<p className="mt-8 text-center text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
							Secure Auth • Custom Redis Session
						</p>
					</div>
				</div>

				<div className="mt-12 text-center">
					<a
						href="/"
						className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors underline decoration-border underline-offset-4"
					>
						Return to Home
					</a>
				</div>
			</motion.div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-background flex items-center justify-center">
					<Loader2 className="w-10 h-10 text-accent animate-spin" />
				</div>
			}
		>
			<LoginContent />
		</Suspense>
	);
}
