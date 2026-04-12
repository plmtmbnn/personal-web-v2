'use client';

import React, { useState } from 'react';
import { SupabaseConn } from '@/lib/core/supabase';
import { logout } from '@/features/auth/actions';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

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
				provider: 'google',
				options: {
					// PKCE flow is triggered by redirecting to a server-side route
					redirectTo: `${window.location.origin}/auth/callback`,
					queryParams: {
						access_type: 'offline',
						prompt: 'consent',
					},
				},
			});

			if (error) throw error;
		} catch (error: any) {
			console.error('Login error:', error.message);
			setIsLoading(false);
		}
	};

	if (user) {
		return (
			<div className="flex items-center gap-4 p-2 bg-background-secondary rounded-2xl border border-border/50 shadow-sm">
				{user.user_metadata?.avatar_url && (
					<img
						src={user.user_metadata.avatar_url}
						alt="Avatar"
						className="w-10 h-10 rounded-xl border-2 border-accent/20"
					/>
				)}
				<div className="hidden md:block">
					<p className="text-xs font-black uppercase tracking-tighter text-foreground">
						{user.user_metadata?.full_name || 'Verified User'}
					</p>
					<p className="text-[10px] text-muted-foreground font-medium">
						{user.email}
					</p>
				</div>
				<button
					onClick={() => logout()}
					className="p-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
					title="Logout"
				>
					<LogOut className="w-5 h-5" />
				</button>
			</div>
		);
	}

	return (
		<button
			onClick={handleLogin}
			disabled={isLoading}
			className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-black shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all border border-slate-200 disabled:opacity-70 disabled:pointer-events-none"
		>
			{isLoading ? (
				<Loader2 className="w-5 h-5 animate-spin text-accent" />
			) : (
				<svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 50 50"
          className="flex-shrink-0"
        >
          <path d="M 25.996094 48 C 13.3125 48 2.992188 37.683594 2.992188 25 C 2.992188 12.316406 13.3125 2 25.996094 2 C 31.742188 2 37.242188 4.128906 41.488281 7.996094 L 42.261719 8.703125 L 34.675781 16.289063 L 33.972656 15.6875 C 31.746094 13.78125 28.914063 12.730469 25.996094 12.730469 C 19.230469 12.730469 13.722656 18.234375 13.722656 25 C 13.722656 31.765625 19.230469 37.269531 25.996094 37.269531 C 30.875 37.269531 34.730469 34.777344 36.546875 30.53125 L 24.996094 30.53125 L 24.996094 20.175781 L 47.546875 20.207031 L 47.714844 21 C 48.890625 26.582031 47.949219 34.792969 43.183594 40.667969 C 39.238281 45.53125 33.457031 48 25.996094 48 Z"></path>
        </svg>
			)}
			<span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
		</button>
	);
}
