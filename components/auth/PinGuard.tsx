'use client';

import React, { useState, useEffect } from 'react';
import { ENV_GLOBAL } from '@/lib/env';

interface PinGuardProps {
	children: React.ReactNode;
}

const PIN_SESSION_KEY = 'auth_pin_session';
const SESSION_DURATION = 3600000; // 1 hour in ms

/**
 * PinGuard is a wrapper component that protects its children with a 6-digit PIN.
 * It manages session state in LocalStorage with a 1-hour expiration.
 */
export default function PinGuard({ children }: PinGuardProps) {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [pin, setPin] = useState('');
	const [error, setError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const checkSession = () => {
		const session = localStorage.getItem(PIN_SESSION_KEY);
		if (!session) return false;

		try {
			const { timestamp, authenticated } = JSON.parse(session);
			const currentTime = Date.now();
			// Check if authenticated and session hasn't expired
			if (authenticated && currentTime - timestamp < SESSION_DURATION) {
				return true;
			}
		} catch (e) {
			console.error('Failed to parse session', e);
		}
		return false;
	};

	useEffect(() => {
		// Small delay to ensure LocalStorage is checked after mount (SSR hydration)
		setIsAuthenticated(checkSession());
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (pin.length !== 6) return;

		setIsLoading(true);
		setError(false);

		// Simulate a small delay for a smoother UI experience
		setTimeout(() => {
			const requiredPin = ENV_GLOBAL.NEXT_PUBLIC_PAGE_PIN;

			if (pin === requiredPin) {
				const session = {
					timestamp: Date.now(),
					authenticated: true,
				};
				localStorage.setItem(PIN_SESSION_KEY, JSON.stringify(session));
				setIsAuthenticated(true);
			} else {
				setError(true);
				setPin('');
				// Auto-reset error after shake animation
				setTimeout(() => setError(false), 500);
			}
			setIsLoading(false);
		}, 600);
	};

	// Loading state to prevent layout shift during session check
	if (isAuthenticated === null) {
		return (
			<div className="fixed inset-0 bg-background flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	// Render children if authenticated
	if (isAuthenticated) {
		return <>{children}</>;
	}

	// Render PIN entry screen if not authenticated
	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-xl p-4">
			<div className="glass-card w-full max-w-md animate-fade-in">
				<div className="text-center mb-10">
					<div className="w-20 h-20 bg-accent/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
						<svg
							className="w-10 h-10 text-accent"
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
					<h2 className="gradient-text mb-3">Protected Content</h2>
					<p className="text-muted-foreground text-sm max-w-[240px] mx-auto">
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
						<div className="absolute inset-0 rounded-2xl pointer-events-none group-focus-within:ring-2 ring-accent/20 transition-all" />
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
