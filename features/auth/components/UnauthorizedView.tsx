"use client";

import { useSearchParams } from "next/navigation";
import { Lock, Clock, ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

interface UnauthorizedViewProps {
	initialMessage?: string;
}

export default function UnauthorizedView({
	initialMessage,
}: UnauthorizedViewProps) {
	const reduceMotion = useReducedMotion();
	const searchParams = useSearchParams();
	const message = initialMessage ?? searchParams.get("message");

	const isPending = message === "pending";
	const isSessionError = message === "session_error";
	const isExchangeError =
		message === "exchange_failed" || message === "no_code";

	const getDetails = () => {
		if (isPending) {
			return {
				httpCode: "HTTP 403",
				title: "Verification Pending",
				description:
					"Your account has been registered but is awaiting administrator verification. Access will be unlocked once approved.",
				statusBadge: "Pending Review",
				statusBadgeStyle: "text-amber-700 bg-amber-50 border-amber-200/70",
				dotColor: "bg-amber-500 animate-pulse",
				requirement: "Manual Profile Approval",
				icon: Clock,
				iconContainerStyle: "bg-amber-50 border-amber-100/80 text-amber-600",
				primaryAction: {
					href: "/",
					label: "Return to Home",
					icon: ArrowLeft,
				},
				secondaryAction: {
					href: "/login",
					label: "Switch Account",
					icon: Lock,
				},
			};
		}

		if (isSessionError) {
			return {
				httpCode: "HTTP 500",
				title: "Session Error",
				description:
					"A secure in-memory session could not be established. Please retry signing in with your administrator account.",
				statusBadge: "Session Fault",
				statusBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200/70",
				dotColor: "bg-rose-500",
				requirement: "Redis Session Layer",
				icon: ShieldAlert,
				iconContainerStyle: "bg-rose-50 border-rose-100/80 text-rose-600",
				primaryAction: {
					href: "/login",
					label: "Retry Sign In",
					icon: Lock,
				},
				secondaryAction: {
					href: "/",
					label: "Return to Home",
					icon: ArrowLeft,
				},
			};
		}

		if (isExchangeError) {
			return {
				httpCode: "HTTP 400",
				title: "Auth Handshake Failed",
				description:
					"The authentication token exchange could not be completed with the provider. Please initiate a fresh login.",
				statusBadge: "OAuth Exchange Failed",
				statusBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200/70",
				dotColor: "bg-rose-500",
				requirement: "Valid PKCE Handshake",
				icon: ShieldAlert,
				iconContainerStyle: "bg-rose-50 border-rose-100/80 text-rose-600",
				primaryAction: {
					href: "/login",
					label: "Return to Login",
					icon: Lock,
				},
				secondaryAction: {
					href: "/",
					label: "Return to Home",
					icon: ArrowLeft,
				},
			};
		}

		// Default unauthorized state
		return {
			httpCode: "HTTP 403",
			title: "Access Restricted",
			description:
				"This portal requires verified administrator authorization. Sign in with an approved account to proceed.",
			statusBadge: "Access Denied",
			statusBadgeStyle: "text-rose-700 bg-rose-50 border-rose-200/70",
			dotColor: "bg-rose-500",
			requirement: "Elevated Admin Privileges",
			icon: Lock,
			iconContainerStyle: "bg-rose-50 border-rose-100/80 text-rose-600",
			primaryAction: {
				href: "/login",
				label: "Sign In with Admin Account",
				icon: Lock,
			},
			secondaryAction: {
				href: "/",
				label: "Return to Home",
				icon: ArrowLeft,
			},
		};
	};

	const config = getDetails();
	const IconComponent = config.icon;
	const PrimaryIcon = config.primaryAction.icon;
	const SecondaryIcon = config.secondaryAction.icon;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern flex items-center justify-center p-4 pb-28 sm:pb-36">
			<div className="max-w-md w-full">
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 12 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					transition={{ duration: 0.25, ease: "easeOut" }}
					className="bg-white border border-slate-200/80 rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 shadow-xs sm:shadow-md space-y-6"
				>
					{/* Clean Top Header & Status Row */}
					<div className="flex items-center justify-between pb-4 border-b border-slate-100">
						<div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
							<Link
								href="/"
								className="hover:text-slate-900 transition-colors !no-underline"
							>
								Home
							</Link>
							<span className="text-slate-300">/</span>
							<span className="text-slate-900 font-bold">Unauthorized</span>
						</div>
						<span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
							{config.httpCode}
						</span>
					</div>

					{/* Hero Identity Stage */}
					<div className="text-center space-y-3.5">
						<div
							className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto shadow-2xs ${config.iconContainerStyle}`}
						>
							<IconComponent className="w-6 h-6" />
						</div>

						<div className="space-y-1">
							<h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
								{config.title}
							</h1>
							<p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
								{config.description}
							</p>
						</div>

						{/* Security Telemetry Diagnostics Tray */}
						<div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 text-left space-y-2">
							<div className="flex items-center justify-between gap-2">
								<span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
									Diagnosis
								</span>
								<span
									className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${config.statusBadgeStyle}`}
								>
									<span
										className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`}
									/>
									<span>{config.statusBadge}</span>
								</span>
							</div>

							<div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/50">
								<span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 shrink-0">
									Required
								</span>
								<span className="text-xs font-mono font-semibold text-slate-700 truncate">
									{config.requirement}
								</span>
							</div>
						</div>
					</div>

					{/* Action Buttons Hierarchy */}
					<div className="pt-1 space-y-2.5">
						<Link
							href={config.primaryAction.href}
							className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-slate-900 hover:bg-slate-800 !text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs active:scale-95 transition-all !no-underline"
						>
							<PrimaryIcon className="w-4 h-4 !text-white" />
							<span className="!text-white">{config.primaryAction.label}</span>
						</Link>

						<Link
							href={config.secondaryAction.href}
							className="flex items-center justify-center gap-2 w-full px-5 py-2.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all !no-underline"
						>
							<SecondaryIcon className="w-4 h-4 text-slate-500" />
							<span>{config.secondaryAction.label}</span>
						</Link>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
