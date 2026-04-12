'use client';

import React, { useState, useEffect } from 'react';
import { ENV_GLOBAL } from '@/lib/core/env';

interface PinGuardProps {
	children: React.ReactNode;
}

const PIN_SESSION_KEY = 'auth_pin_session';
const SESSION_DURATION = 3600000 * 6; // 6 hour in ms

/**
 * PinGuard: Protecs content with a 6-digit PIN.
 * Integrated with server-side API, Rate Limiting, and Feature Toggles.
 */
export default function PinGuard({ children }: PinGuardProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [pin, setPin] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

  // Feature Toggle: Bypass PinGuard if disabled
  if (ENV_GLOBAL?.NEXT_PUBLIC_ENABLE_PINGUARD === "false") {
    return <>{children}</>;
  }

	const checkSession = () => {
		const session = localStorage.getItem(PIN_SESSION_KEY);
		if (!session) return false;

		try {
			const { timestamp, authenticated } = JSON.parse(session);
			const currentTime = Date.now();
			if (authenticated && currentTime - timestamp < SESSION_DURATION) {
				return true;
			}
		} catch (e) {
			console.error('Failed to parse session', e);
		}
		return false;
	};

	useEffect(() => {
		setIsAuthenticated(checkSession());
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (pin.length !== 6) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch('/api/verify-pin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
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
				setError(data.error || 'Incorrect PIN');
				setPin('');
				setTimeout(() => setError(null), 3000);
			}
		} catch (err) {
			setError('Network error, please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	if (isAuthenticated === null) {
		return (
			<div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-6 sm:p-12">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div className="glass-card w-full max-w-md space-y-10 relative overflow-hidden">
					<div className="space-y-6 flex flex-col items-center">
						<div className="w-20 h-20 bg-white/5 rounded-3xl animate-pulse" />
						<div className="space-y-3 flex flex-col items-center w-full">
							<div className="w-48 h-6 bg-white/5 rounded-full animate-pulse" />
							<div className="w-32 h-3 bg-white/5 rounded-full animate-pulse" />
						</div>
					</div>
					<div className="w-full h-16 bg-white/5 rounded-2xl animate-pulse" />
					<div className="w-full h-12 bg-white/5 rounded-2xl animate-pulse" />
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
			<div className="glass-card w-full max-w-md animate-fade-in">
				<div className="text-center mb-10">
					<div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner text-accent">
						<svg
							className="w-10 h-10"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h2 className="gradient-text mb-3 tracking-tighter font-black">Protected Content</h2>
					<p className="text-muted-foreground text-sm max-w-[240px] mx-auto leading-relaxed">
						This page is restricted. Please enter the access PIN.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-8">
					<div className="relative group">
						<input
							type="password"
							maxLength={6}
							inputMode="numeric"
							value={pin}
							onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
							placeholder="••••••"
							className={`w-full text-center text-4xl tracking-[0.5em] py-5 bg-background-secondary border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-accent/10 transition-all duration-300 ${
								error
									? 'border-red-500 animate-shake shadow-[0_0_20px_rgba(239,68,68,0.2)]'
									: 'border-border focus:border-accent shadow-sm'
							}`}
							autoFocus
							disabled={isLoading}
						/>
						{error && (
							<p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-red-500 font-bold animate-fade-in">
								{error}
							</p>
						)}
					</div>

					<button
						type="submit"
						disabled={pin.length !== 6 || isLoading}
						className={`w-full py-4 rounded-2xl font-bold transition-all duration-500 flex items-center justify-center gap-3 ${
							pin.length === 6 && !isLoading
								? 'bg-accent text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98]'
								: 'bg-muted-foreground/10 text-muted-foreground cursor-not-allowed'
						}`}
					>
						{isLoading ? (
							<div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
						) : (
							<>
								<span>Unlock Page</span>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 7l5 5m0 0l-5 5m5-5H6"
									/>
								</svg>
							</>
						)}
					</button>
				</form>

				<div className="mt-8 text-center">
					<small className="text-muted-foreground/60 text-[10px] uppercase tracking-widest font-medium">
						Secure Session • 60 min
					</small>
				</div>
			</div>
		</div>
	);
}
