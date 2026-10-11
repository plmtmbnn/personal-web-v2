"use client";

import { useState } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { logout } from "@/features/auth/actions";
import { LogOut, Loader2 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

interface LoginButtonProps {
	user?: {
		email?: string;
		user_metadata?: {
			avatar_url?: string;
			full_name?: string;
		};
	} | null;
}

export default function LoginButton({ user }: LoginButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [avatarError, setAvatarError] = useState(false);
	const reduceMotion = useReducedMotion();

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			let targetPath = "/admin";

			if (typeof window !== "undefined") {
				const url = new URL(window.location.href);
				const nextParam =
					url.searchParams.get("next") || url.searchParams.get("redirectTo");

				// Preserve destination if query parameter is a valid internal relative path
				if (nextParam?.startsWith("/") && !nextParam.startsWith("//")) {
					targetPath = nextParam;
				} else {
					const currentPath = window.location.pathname;
					const isProtectedPath =
						currentPath.startsWith("/admin") ||
						currentPath.startsWith("/tasks") ||
						currentPath.startsWith("/adventures/running");
					if (isProtectedPath) {
						targetPath = currentPath;
					}
				}
			}

			// Build callback URL with preserved target destination
			const callbackUrl =
				targetPath !== "/admin"
					? `${window.location.origin}/auth/callback?next=${encodeURIComponent(targetPath)}`
					: `${window.location.origin}/auth/callback`;

			const { error } = await SupabaseConn.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: callbackUrl,
					queryParams: {
						access_type: "offline",
						prompt: "consent",
					},
				},
			});

			if (error) throw error;
		} catch (error: any) {
			if (process.env.NODE_ENV === "development") {
				console.error("Login error:", error?.message);
			}
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		setIsLoading(true);
		try {
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth_pin_session");
			}
			await logout();
		} catch {
			setIsLoading(false);
		}
	};

	if (user) {
		const initialLetter =
			user.user_metadata?.full_name?.[0] || user.email?.[0] || "?";
		const avatarUrl = user.user_metadata?.avatar_url;

		return (
			<motion.div
				initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex items-center gap-3.5 p-3 sm:p-3.5 bg-white border border-slate-200/80 shadow-xs hover:shadow-md rounded-2xl group transition-[box-shadow,border-color]"
			>
				{avatarUrl && !avatarError ? (
					<img
						src={avatarUrl}
						alt={user.user_metadata?.full_name || "User Avatar"}
						referrerPolicy="no-referrer"
						onError={() => setAvatarError(true)}
						className="w-10 h-10 rounded-xl border border-indigo-200/60 object-cover shrink-0 shadow-2xs"
					/>
				) : (
					<div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm shrink-0 shadow-2xs uppercase">
						{initialLetter}
					</div>
				)}

				<div className="hidden md:block text-left min-w-0 pr-1">
					<p className="text-xs font-bold text-slate-900 tracking-tight truncate">
						{user.user_metadata?.full_name || "Verified User"}
					</p>
					<p className="text-[10px] text-slate-500 font-mono font-medium tracking-tight truncate">
						{user.email}
					</p>
				</div>

				<button
					type="button"
					onClick={handleLogout}
					disabled={isLoading}
					className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-all cursor-pointer active:scale-95 touch-manipulation shrink-0"
					title="Sign out"
					aria-label="Sign out"
				>
					{isLoading ? (
						<Loader2 className="w-4 h-4 animate-spin text-rose-600" />
					) : (
						<LogOut className="w-4 h-4" />
					)}
				</button>
			</motion.div>
		);
	}

	return (
		<motion.button
			type="button"
			onClick={handleLogin}
			disabled={isLoading}
			whileHover={reduceMotion ? undefined : { y: -1 }}
			whileTap={reduceMotion ? undefined : { scale: 0.97 }}
			className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-[background-color,transform] border border-slate-800 shadow-xs hover:shadow-md active:scale-95 disabled:opacity-70 disabled:pointer-events-none cursor-pointer touch-manipulation group"
		>
			{isLoading ? (
				<Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
			) : (
				<div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center p-0.5 shrink-0 shadow-2xs group-hover:scale-105 transition-transform duration-200">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						className="w-full h-full"
						aria-hidden="true"
					>
						<path
							fill="#EA4335"
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
						/>
						<path
							fill="#4285F4"
							d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.87h12.66c-.54 2.89-2.18 5.34-4.63 6.99l7.21 5.59C43.47 36.31 46.5 30.79 46.5 24z"
						/>
						<path
							fill="#FBBC05"
							d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"
						/>
						<path
							fill="#34A853"
							d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.21-5.59c-2 .99-4.57 1.58-7.21 1.58-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
						/>
					</svg>
				</div>
			)}
			<span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
		</motion.button>
	);
}
