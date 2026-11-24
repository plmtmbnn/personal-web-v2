"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, HelpCircle } from "lucide-react";

interface CustomModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	onConfirm?: () => void;
	confirmText?: string;
	cancelText?: string;
	variant?: "danger" | "success" | "info" | "warning";
	isLoading?: boolean;
}

export default function CustomModal({
	isOpen,
	onClose,
	title,
	description,
	onConfirm,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "info",
	isLoading = false,
}: CustomModalProps) {
	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	const variantStyles = {
		danger: {
			icon: AlertCircle,
			iconColor: "text-rose-500",
			iconBg: "bg-rose-50",
			buttonBg: "bg-rose-600 hover:bg-rose-700",
			borderColor: "border-rose-100",
		},
		success: {
			icon: CheckCircle2,
			iconColor: "text-emerald-500",
			iconBg: "bg-emerald-50",
			buttonBg: "bg-emerald-600 hover:bg-emerald-700",
			borderColor: "border-emerald-100",
		},
		warning: {
			icon: HelpCircle,
			iconColor: "text-amber-500",
			iconBg: "bg-amber-50",
			buttonBg: "bg-amber-600 hover:bg-amber-700",
			borderColor: "border-amber-100",
		},
		info: {
			icon: Info,
			iconColor: "text-blue-500",
			iconBg: "bg-blue-50",
			buttonBg: "bg-slate-900 hover:bg-slate-800",
			borderColor: "border-blue-100",
		},
	};

	const currentVariant = variantStyles[variant];
	const Icon = currentVariant.icon;
	const reduceMotion = useReducedMotion();
	const titleId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;
	const setDialogRef = useCallback((node: HTMLDivElement | null) => {
		dialogRef.current = node;
		if (node)
			queueMicrotask(() =>
				node.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus(),
			);
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const previousFocus = document.activeElement as HTMLElement | null;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onCloseRef.current();
			const enabled = dialogRef.current?.querySelectorAll<HTMLButtonElement>(
				"button:not(:disabled)",
			);
			if (event.key !== "Tab" || !enabled?.length) return;
			const first = enabled[0];
			const last = enabled[enabled.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			previousFocus?.focus();
		};
	}, [isOpen]);

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
					{/* Backdrop */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
					/>

					{/* Modal Content */}
					<motion.div
						ref={setDialogRef}
						role="dialog"
						aria-modal="true"
						aria-labelledby={titleId}
						initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="relative w-full max-w-md bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden z-10"
					>
						<div className="p-8 sm:p-10">
							<div className="flex flex-col items-center text-center">
								{/* Icon Header */}
								<div
									className={`w-16 h-16 ${currentVariant.iconBg} rounded-3xl flex items-center justify-center mb-6 border ${currentVariant.borderColor}`}
								>
									<Icon className={`w-8 h-8 ${currentVariant.iconColor}`} />
								</div>

								<h3
									id={titleId}
									className="text-xl font-black text-slate-900 tracking-tight mb-2"
								>
									{title}
								</h3>
								{description && (
									<p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
										{description}
									</p>
								)}

								<div className="flex flex-col sm:flex-row gap-3 w-full">
									<button
										onClick={onClose}
										className="flex-1 min-h-11 px-6 py-3.5 bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-indigo-600"
									>
										{cancelText}
									</button>
									{onConfirm && (
										<button
											onClick={onConfirm}
											disabled={isLoading}
											className={`flex-1 min-h-11 px-6 py-3.5 ${currentVariant.buttonBg} text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg transition-colors active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-indigo-600`}
										>
											{isLoading ? (
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											) : (
												confirmText
											)}
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Decorative bottom bar */}
						<div
							className={`h-1.5 w-full ${currentVariant.iconBg.replace("50", "500")}`}
						/>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}
