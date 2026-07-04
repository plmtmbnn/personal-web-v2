"use client";

import { useState } from "react";
import { SupabaseConn } from "@/lib/core/supabase";
import { logout } from "@/features/auth/actions";
import { LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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

	const handleLogin = async () => {
		setIsLoading(true);
		try {
			const { error } = await SupabaseConn.auth.signInWithOAuth({
				provider: "google",
				options: {
					// PKCE flow is triggered by redirecting to a server-side route
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: "offline",
						prompt: "consent",
					},
				},
			});

			if (error) throw error;
		} catch (error: any) {
			console.error("Login error:", error.message);
			setIsLoading(false);
		}
	};

	if (user) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				animate={{ opacity: 1, scale: 1 }}
				className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 shadow-sm rounded-3xl group transition-all"
			>
				{user.user_metadata?.avatar_url ? (
					<img
						src={user.user_metadata.avatar_url}
						alt="Avatar"
						className="w-12 h-12 rounded-2xl border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-colors"
					/>
				) : (
					<div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
						{user.user_metadata?.full_name?.[0] || user.email?.[0] || "?"}
					</div>
				)}
				<div className="hidden md:block text-left">
					<p className="text-xs font-black uppercase tracking-tight text-slate-800">
						{user.user_metadata?.full_name || "Verified User"}
					</p>
					<p className="text-[10px] text-slate-400 font-bold tracking-tight">
						{user.email}
					</p>
				</div>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={async () => {
						setIsLoading(true);
						await logout();
					}}
					disabled={isLoading}
					className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
					title="Logout"
				>
					{isLoading ? (
						<Loader2 className="w-5 h-5 animate-spin" />
					) : (
						<LogOut className="w-5 h-5" />
					)}
				</motion.button>
			</motion.div>
		);
	}

	return (
		<motion.button
			onClick={handleLogin}
			disabled={isLoading}
			whileHover={{
				y: -2,
				boxShadow:
					"0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
			}}
			whileTap={{ scale: 0.97 }}
			className="flex items-center gap-4 px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl font-black transition-all border border-slate-800 disabled:opacity-70 disabled:pointer-events-none group relative overflow-hidden"
		>
			{isLoading ? (
				<Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
			) : (
				<div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-300">
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
