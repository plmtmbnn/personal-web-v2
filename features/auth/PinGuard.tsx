"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { ENV_GLOBAL } from "@/lib/core/env";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	ShieldCheck,
	Lock,
	ShieldAlert,
	Loader2,
	ArrowRight,
} from "lucide-react";

interface PinGuardProps {
	children: React.ReactNode;
}

const PIN_SESSION_KEY = "auth_pin_session";
const SESSION_DURATION = 3600000 * 12; // 12 hours in ms

/**
 * PinGuard: Protects content with a 6-digit PIN.
 * Integrated with the "Solid Productivity" UI pattern.
 */
export default function PinGuard({ children }: PinGuardProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);

	const inputRef = useRef<HTMLInputElement>(null);
	const reduceMotion = useReducedMotion();

	const isPinGuardDisabled =
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD === "false" ||
		ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "false";

	const checkSession = useCallback(() => {
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

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();
			if (pin.length !== 6 || isLoading) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await fetch("/api/verify-pin", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ pin }),
				});

				const data = await response.json();

				if (response.ok && data.authenticated) {
					const session = {
						timestamp: Date.now(),
						authenticated: true,
					};
					localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
					setIsAuthenticated(true);
				} else {
					setError(data.error || "Incorrect Authenticator Code");
					setPin(""); // Clear form on mismatch
				}
			} catch (_err) {
				setError("Network error, please try again.");
			} finally {
				setIsLoading(false);
			}
		},
		[pin, isLoading],
	);

	useEffect(() => {
		if (isPinGuardDisabled) return;
		setIsAuthenticated(checkSession());
	}, [checkSession, isPinGuardDisabled]);

	// Auto-verify when 6 digits are entered
	useEffect(() => {
		if (isPinGuardDisabled) return;
		if (pin.length === 6 && !isLoading) {
			handleSubmit();
		}
	}, [pin, isLoading, handleSubmit, isPinGuardDisabled]);

	// Focus input once the secure screen is rendered
	useEffect(() => {
		if (isAuthenticated === false) {
			inputRef.current?.focus();
		}
	}, [isAuthenticated]);

	// Feature Toggle: Bypass PinGuard if disabled
	if (isPinGuardDisabled) {
		return <>{children}</>;
	}

	if (isAuthenticated === null) {
		return (
			<div className="fixed inset-0 bg-slate-50/50 backdrop-blur-md flex flex-col items-center justify-center p-6 sm:p-12 z-[100]">
				<div className="bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md p-10 rounded-3xl space-y-8 relative overflow-hidden">
					<div className="space-y-6 flex flex-col items-center">
						<div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
						<div className="space-y-3 flex flex-col items-center w-full">
							<div className="w-48 h-5 bg-slate-100 rounded-full animate-pulse" />
							<div className="w-32 h-3 bg-slate-50 rounded-full animate-pulse" />
						</div>
					</div>
					<div className="w-full h-14 bg-slate-50 rounded-2xl animate-pulse" />
					<div className="w-full h-12 bg-slate-50 rounded-2xl animate-pulse" />
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/80 backdrop-blur-md p-4 overflow-hidden"
			onClick={() => inputRef.current?.focus()}
		>
			{/* Ambient background accent */}
			<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

			<motion.div
				initial={reduceMotion ? false : { opacity: 0, y: 15 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, ease: "easeOut" }}
				onClick={(e) => {
					// Prevent closing focus when clicking container elements
					e.stopPropagation();
					inputRef.current?.focus();
				}}
				className="bg-white border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.04)] w-full max-w-md rounded-3xl p-8 sm:p-10 relative z-10"
			>
				{/* Dark Header Accent Card - Contrast Mastery Pattern */}
				<div className="bg-slate-900 text-white rounded-2xl p-6 text-center mb-8 relative overflow-hidden shadow-md">
					<div className="absolute inset-0 bg-emerald-500/10 pointer-events-none" />

					<motion.div
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						transition={{ duration: 0.5, type: "spring" }}
						className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center mx-auto mb-4"
					>
						<Lock className="w-5 h-5 text-emerald-400" />
					</motion.div>

					<div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full mb-3 border border-emerald-500/20">
						<ShieldCheck className="w-3 h-3" />
						<span className="text-[9px] font-black uppercase tracking-widest">
							Secure Access
						</span>
					</div>

					<h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
						Protected Administration
					</h2>
					<p className="text-slate-400 text-xs max-w-[260px] mx-auto leading-relaxed">
						Please supply your 6-digit Authenticator Code to authorize this
						session.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="relative group">
						{/* Hidden input to capture keyboard/numeric entry */}
						<input
							ref={inputRef}
							type="text"
							pattern="[0-9]*"
							inputMode="numeric"
							maxLength={6}
							value={pin}
							onChange={(e) => {
								const val = e.target.value.replace(/\D/g, "");
								if (val.length <= 6) {
									setPin(val);
								}
							}}
							onFocus={() => setIsFocused(true)}
							onBlur={() => setIsFocused(false)}
							className="sr-only"
							disabled={isLoading}
						/>

						{/* 6-box Visual Grid */}
						<div className="flex justify-between gap-2 max-w-sm mx-auto mb-6">
							{Array.from({ length: 6 }).map((_, i) => {
								const digit = pin[i];
								const isActive = isFocused && i === pin.length;
								return (
									<motion.div
										key={i}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
										className={`w-11 h-14 sm:w-12 sm:h-16 rounded-xl border flex items-center justify-center text-xl font-bold transition-all duration-200 relative ${
											isActive
												? "border-emerald-500 bg-white shadow-[0_0_12px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/30"
												: digit
													? "border-slate-300 bg-slate-50 text-slate-900"
													: "border-slate-200 bg-slate-50/50 text-slate-300"
										} ${
											error
												? "border-rose-500 bg-rose-50/30 text-rose-600 animate-shake"
												: ""
										}`}
									>
										{digit ? (
											<motion.span
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												className="w-2.5 h-2.5 rounded-full bg-slate-800"
											/>
										) : isActive ? (
											<motion.div
												animate={{ opacity: [1, 0, 1] }}
												transition={{ repeat: Infinity, duration: 1 }}
												className="w-0.5 h-5 bg-emerald-500"
											/>
										) : null}
									</motion.div>
								);
							})}
						</div>

						<div className="h-4 relative">
							<AnimatePresence>
								{error && (
									<motion.div
										initial={reduceMotion ? false : { opacity: 0, y: -5 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0 }}
										className="absolute inset-0 text-center"
									>
										<p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
											<ShieldAlert className="w-3 h-3" />
											{error}
										</p>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>

					<button
						type="submit"
						disabled={pin.length !== 6 || isLoading}
						className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
							pin.length === 6 && !isLoading
								? "bg-slate-900 text-white shadow-md hover:bg-slate-800 active:scale-[0.98]"
								: "bg-slate-100 text-slate-400 cursor-not-allowed"
						}`}
					>
						{isLoading ? (
							<Loader2 className="w-4 h-4 animate-spin" />
						) : (
							<>
								<span>Unlock System</span>
								<ArrowRight className="w-3.5 h-3.5" />
							</>
						)}
					</button>
				</form>

				<div className="mt-6 text-center pt-5 border-t border-slate-100">
					<small className="text-slate-400 text-[9px] uppercase tracking-[0.3em] font-medium">
						Encrypted Session • 12 Hours
					</small>
				</div>
			</motion.div>
		</div>
	);
}
