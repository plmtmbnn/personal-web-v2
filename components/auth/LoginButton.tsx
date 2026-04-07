'use client';

import React, { useState } from 'react';
import { SupabaseConn } from '@/utils/supabase';
import { logout } from '@/lib/actions/auth';
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
			className="flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-2xl font-black shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all border border-gray-200 disabled:opacity-70 disabled:pointer-events-none"
		>
			{isLoading ? (
				<Loader2 className="w-5 h-5 animate-spin text-accent" />
			) : (
				<svg className="w-5 h-5" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.3 3.28-8.17 3.28-11.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 3.84-.98 5.12-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.55 1.06-2.73 0-5.04-1.84-5.87-4.31H.46v2.87C2.28 20.6 6.88 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M6.13 14.32c-.21-.66-.33-1.36-.33-2.07s.12-1.41.33-2.07V7.31H.46C.17 8.71 0 10.19 0 12s.17 3.29.46 4.69l5.67-2.37z"
					/>
					<path
						fill="currentColor"
						d="M12 4.75c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.45 1.49 14.96 0 12 0 6.88 0 2.28 2.4 0 6.69l5.67 2.37c.83-2.47 3.14-4.31 5.87-4.31z"
					/>
				</svg>
			)}
			<span>{isLoading ? 'Connecting...' : 'Continue with Google'}</span>
		</button>
	);
}
