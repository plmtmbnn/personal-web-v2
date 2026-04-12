'use client';

import React, { useState, useEffect } from 'react';
import { ENV_GLOBAL } from '@/lib/core/env';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

interface PinGuardProps {
	children: React.ReactNode;
}

const PIN_SESSION_KEY = 'auth_pin_session';
const SESSION_DURATION = 3600000 * 6; // 6 hour in ms

/**
 * PinGuard: Protects content with a 6-digit PIN.
 * Integrated with the "Solid Productivity" UI pattern.
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

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (pin.length !== 6 || isLoading) return;

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
				setPin(''); // Clear form on mismatch
			}
		} catch (err) {
			setError('Network error, please try again.');
		} finally {
			setIsLoading(false);
		}
	};

  // Auto-verify when 6 digits are entered
  useEffect(() => {
    if (pin.length === 6 && !isLoading) {
      handleSubmit();
    }
  }, [pin]);

	if (isAuthenticated === null) {
		return (
			<div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-12">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
				<div className="bg-white border border-slate-200 shadow-xl w-full max-w-md p-10 rounded-[2.5rem] space-y-10 relative overflow-hidden">
					<div className="space-y-6 flex flex-col items-center">
						<div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl animate-pulse" />
						<div className="space-y-3 flex flex-col items-center w-full">
							<div className="w-48 h-6 bg-slate-50 rounded-full animate-pulse" />
							<div className="w-32 h-3 bg-slate-50 rounded-full animate-pulse" />
						</div>
					</div>
					<div className="w-full h-16 bg-slate-50 rounded-2xl animate-pulse" />
					<div className="w-full h-12 bg-slate-50 rounded-2xl animate-pulse" />
				</div>
			</div>
		);
	}

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/90 backdrop-blur-md p-4 overflow-hidden">
			{/* Background Ambient Glows */}
			<div className="absolute top-[-5%] right-[-5%] w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse" />
			<div className="absolute bottom-[-5%] left-[-5%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

			<motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-md rounded-[3rem] p-10 sm:p-12 relative z-10"
      >
				<div className="text-center mb-10">
					<div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm text-slate-900 group">
						<Lock className="w-10 h-10 group-hover:text-emerald-500 transition-colors duration-500" />
					</div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full mb-4 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Secure Area</span>
          </div>
					<h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Protected Content</h2>
					<p className="text-slate-400 text-sm max-w-[240px] mx-auto leading-relaxed font-medium">
						This sector is restricted. Please provide the operational access PIN.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-10">
					<div className="relative group">
						<input
							type="password"
							maxLength={6}
							inputMode="numeric"
							value={pin}
							onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
							placeholder="••••••"
							className={`w-full text-center text-4xl tracking-[0.5em] py-6 bg-slate-50 border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 ${
								error
									? 'border-rose-500 animate-shake shadow-[0_0_20px_rgba(239,68,68,0.1)] text-rose-600'
									: 'border-slate-100 focus:border-emerald-500 text-slate-900'
							}`}
							autoFocus
							disabled={isLoading}
						/>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-8 left-0 right-0 text-center"
                >
                  <p className="text-xs text-rose-600 font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <ShieldAlert className="w-3 h-3" />
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
					</div>

					<button
						type="submit"
						disabled={pin.length !== 6 || isLoading}
						className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 ${
							pin.length === 6 && !isLoading
								? 'bg-slate-900 text-white shadow-xl hover:bg-emerald-600 hover:-translate-y-1 active:scale-95'
								: 'bg-slate-100 text-slate-300 cursor-not-allowed'
						}`}
					>
						{isLoading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								<span>Unlock Sector</span>
								<ArrowRight className="w-4 h-4" />
							</>
						)}
					</button>
				</form>

				<div className="mt-12 text-center pt-8 border-t border-slate-50">
					<small className="text-slate-300 text-[9px] uppercase tracking-[0.4em] font-black">
						Encrypted Session • 360 Min
					</small>
				</div>
			</motion.div>
		</div>
	);
}
