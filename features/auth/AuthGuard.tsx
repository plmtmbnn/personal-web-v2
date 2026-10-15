"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { getAuthMode, type AuthMode } from "./types";
import { SupabaseConn } from "@/lib/core/supabase";
import PinInputForm from "./components/PinInputForm";
import Link from "next/link";

interface AuthGuardProps {
	mode?: AuthMode; // "login_only" | "pin_only" | "serial" | "disabled"
	children: React.ReactNode;
}

const PIN_SESSION_KEY = "auth_pin_session";
const SESSION_DURATION = 3600000 * 12; // 12 hours in ms

/**
 * useAuthGuard: Custom React hook for client-side authentication status.
 * Accepts a single parameter: "login_only" | "pin_only" | "serial" | "disabled"
 */
export function useAuthGuard(explicitMode?: AuthMode) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [serialStep, setSerialStep] = useState<"login" | "pin">("login");
	const mode = explicitMode || getAuthMode();
	const isBypassed = mode === "disabled";

	const checkPinSession = useCallback(() => {
		if (typeof window === "undefined") return false;
		const session = localStorage.getItem(PIN_SESSION_KEY);
		if (!session) return false;

		try {
			const { timestamp, authenticated } = JSON.parse(session);
			const currentTime = Date.now();
			if (authenticated && currentTime - timestamp < SESSION_DURATION) {
				return true;
			}
		} catch (e) {
			console.error("Failed to parse session", e);
		}
		return false;
	}, []);

	useEffect(() => {
		if (isBypassed) {
			setIsAuthenticated(true);
			return;
		}

		if (mode === "login_only") {
			SupabaseConn.auth
				.getUser()
				.then(({ data: { user } }) => {
					setIsAuthenticated(Boolean(user));
				})
				.catch(() => setIsAuthenticated(false));
			return;
		}

		if (mode === "serial") {
			SupabaseConn.auth
				.getUser()
				.then(({ data: { user } }) => {
					if (!user) {
						setIsAuthenticated(false);
						setSerialStep("login");
					} else {
						const hasPin = checkPinSession();
						setIsAuthenticated(hasPin);
						setSerialStep("pin");
					}
				})
				.catch(() => {
					setIsAuthenticated(false);
					setSerialStep("login");
				});
			return;
		}

		// pin_only mode
		setIsAuthenticated(checkPinSession());
	}, [checkPinSession, isBypassed, mode]);

	return {
		isAuthenticated,
		isLoading: isAuthenticated === null,
		serialStep,
		mode,
		isBypassed,
		setIsAuthenticated,
	};
}

/**
 * AuthGuard: General Client-Side Wrapper Component.
 * Supports per-component custom security with a single prop:
 *   <AuthGuard mode="pin_only">
 *   <AuthGuard mode="login_only">
 *   <AuthGuard mode="serial">
 *   <AuthGuard mode="disabled">
 */
export default function AuthGuard({
	mode: explicitMode,
	children,
}: AuthGuardProps) {
	const [currentPath, setCurrentPath] = useState<string>("/login");
	const reduceMotion = useReducedMotion();

	const { isAuthenticated, serialStep, mode, isBypassed, setIsAuthenticated } =
		useAuthGuard(explicitMode);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setCurrentPath(window.location.pathname);
		}
	}, []);

	if (isBypassed || isAuthenticated) {
		return <>{children}</>;
	}

	if (isAuthenticated === null) {
		return (
			<div className="fixed inset-0 bg-slate-50/70 backdrop-blur-xs flex items-center justify-center p-6 z-[100]">
				<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center gap-3">
					<Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
					<span className="text-xs font-bold text-slate-600">
						Verifying authorization...
					</span>
				</div>
			</div>
		);
	}

	const showLoginAction =
		mode === "login_only" || (mode === "serial" && serialStep === "login");

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 bg-dot-pattern backdrop-blur-xs p-4 overflow-y-auto">
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.35, ease: "easeOut" }}
				className="bg-white border border-slate-200/80 shadow-xl shadow-slate-200/50 w-full max-w-md rounded-3xl sm:rounded-[2rem] p-7 sm:p-9 text-center space-y-6 relative z-10"
			>
				{/* Header Squircle */}
				<div className="space-y-3">
					<div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-2xs text-indigo-600">
						<Lock className="w-6 h-6" />
					</div>

					<div>
						<div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 text-indigo-700 rounded-full border border-indigo-100 shadow-2xs mb-2">
							<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
							<span className="text-[10px] font-black uppercase tracking-wider">
								{mode === "serial"
									? serialStep === "login"
										? "Step 1 of 2 • Google Account"
										: "Step 2 of 2 • Authenticator PIN"
									: mode === "login_only"
										? "Login Required"
										: "PIN Protected"}
							</span>
						</div>

						<h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1.5">
							{showLoginAction ? "Sign In Required" : "Authenticator Code"}
						</h2>
						<p className="text-slate-500 text-xs sm:text-sm max-w-[280px] mx-auto leading-relaxed font-medium">
							{showLoginAction
								? "This content is restricted. Please sign in with your authorized account to proceed."
								: "Please enter your 6-digit Authenticator code to unlock this content."}
						</p>
					</div>
				</div>

				<div className="pt-1">
					{showLoginAction ? (
						<Link
							href={`/login?mode=${mode}&next=${encodeURIComponent(currentPath)}`}
							className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 shadow-xs hover:shadow-md active:scale-95 !no-underline"
						>
							<span>Sign In with Google</span>
							<ArrowRight className="w-4 h-4 text-indigo-300" />
						</Link>
					) : (
						<PinInputForm onSuccess={() => setIsAuthenticated(true)} />
					)}
				</div>
			</motion.div>
		</div>
	);
}
