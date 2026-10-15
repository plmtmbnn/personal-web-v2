"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface PinInputFormProps {
	onSuccess: () => void;
	autoFocus?: boolean;
}

export default function PinInputForm({
	onSuccess,
	autoFocus = true,
}: PinInputFormProps) {
	const [pin, setPin] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const reduceMotion = useReducedMotion();

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

				if (response.status === 429) {
					setError(
						data.error || "Too many attempts. Locked out for 10 minutes.",
					);
					setPin("");
					setTimeout(() => inputRef.current?.focus(), 100);
				} else if (response.ok && data.authenticated) {
					// In backward-compatibility with client-only storage
					if (typeof window !== "undefined") {
						localStorage.setItem(
							"auth_pin_session",
							JSON.stringify({
								timestamp: Date.now(),
								authenticated: true,
							}),
						);
					}
					onSuccess();
				} else {
					setError(data.error || "Incorrect Authenticator Code");
					setPin("");
					setTimeout(() => inputRef.current?.focus(), 100);
				}
			} catch (_err) {
				setError("Network error. Please try again.");
				setTimeout(() => inputRef.current?.focus(), 100);
			} finally {
				setIsLoading(false);
			}
		},
		[pin, isLoading, onSuccess],
	);

	// Auto-submit when 6 digits are typed
	useEffect(() => {
		if (pin.length === 6 && !isLoading) {
			handleSubmit();
		}
	}, [pin, isLoading, handleSubmit]);

	// Auto-focus input on mount
	useEffect(() => {
		if (autoFocus) {
			inputRef.current?.focus();
		}
	}, [autoFocus]);

	return (
		<div className="w-full space-y-5">
			<form onSubmit={handleSubmit} className="space-y-5">
				{/* Hidden input to capture numeric keyboard entry */}
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
							if (error) setError(null);
						}
					}}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					className="sr-only"
					disabled={isLoading}
					aria-label="Enter 6-digit Authenticator PIN"
				/>

				{/* 6-box Visual Tiles */}
				<div
					className="flex justify-center gap-2 sm:gap-2.5 cursor-pointer select-none"
					onClick={() => inputRef.current?.focus()}
				>
					{Array.from({ length: 6 }).map((_, i) => {
						const digit = pin[i];
						const isActive = isFocused && i === pin.length;

						return (
							<motion.div
								key={i}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className={`w-11 h-14 sm:w-12 sm:h-16 rounded-2xl border flex items-center justify-center text-xl font-mono font-black transition-all duration-200 relative ${
									isActive
										? "border-indigo-500 bg-white shadow-sm ring-2 ring-indigo-500/20"
										: digit
											? "border-slate-300 bg-slate-50 text-slate-900 shadow-2xs"
											: "border-slate-200/80 bg-slate-50/60 text-slate-300"
								} ${
									error ? "border-rose-400 bg-rose-50/30 text-rose-600" : ""
								}`}
							>
								{digit ? (
									<motion.span
										initial={reduceMotion ? false : { scale: 0.5 }}
										animate={{ scale: 1 }}
										className="w-2.5 h-2.5 rounded-full bg-slate-900"
									/>
								) : isActive ? (
									<motion.div
										animate={{ opacity: [1, 0, 1] }}
										transition={{ repeat: Infinity, duration: 1 }}
										className="w-0.5 h-6 bg-indigo-600 rounded-full"
									/>
								) : (
									<span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
								)}
							</motion.div>
						);
					})}
				</div>

				{/* Verification Status Feedback */}
				<AnimatePresence mode="wait">
					{error && (
						<motion.div
							initial={reduceMotion ? false : { opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-2 text-left shadow-2xs"
						>
							<ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
							<p className="text-xs text-rose-800 font-bold leading-tight">
								{error}
							</p>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Primary Verify Button */}
				<button
					type="submit"
					disabled={pin.length !== 6 || isLoading}
					className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-800 shadow-xs hover:shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer touch-manipulation"
				>
					{isLoading ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
							<span>Verifying Code...</span>
						</>
					) : (
						<>
							<CheckCircle2 className="w-4 h-4 text-emerald-400" />
							<span>Verify & Authorize</span>
						</>
					)}
				</button>
			</form>
		</div>
	);
}
