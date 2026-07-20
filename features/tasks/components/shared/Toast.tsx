"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Undo2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { UNDO_TOAST_DURATION_MS } from "@/features/tasks/constants";

interface ToastProps {
	id: string;
	title: string;
	description?: string;
	type?: "success" | "error" | "info" | "warning";
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number;
	onDismiss: (id: string) => void;
}

const Toast = ({
	id,
	title,
	description,
	type = "info",
	action,
	duration = UNDO_TOAST_DURATION_MS,
	onDismiss,
}: ToastProps) => {
	useEffect(() => {
		const timer = setTimeout(() => {
			onDismiss(id);
		}, duration);

		return () => clearTimeout(timer);
	}, [id, duration, onDismiss]);

	const getToastColors = () => {
		switch (type) {
			case "success":
				return {
					bg: "bg-emerald-50",
					border: "border-emerald-200",
					text: "text-emerald-800",
					actionBg: "bg-emerald-600 hover:bg-emerald-700",
					icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
				};
			case "error":
				return {
					bg: "bg-rose-50",
					border: "border-rose-200",
					text: "text-rose-800",
					actionBg: "bg-rose-600 hover:bg-rose-700",
					icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
				};
			case "warning":
				return {
					bg: "bg-amber-50",
					border: "border-amber-200",
					text: "text-amber-800",
					actionBg: "bg-amber-600 hover:bg-amber-700",
					icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
				};
			default:
				return {
					bg: "bg-slate-50",
					border: "border-slate-200",
					text: "text-slate-800",
					actionBg: "bg-slate-600 hover:bg-slate-700",
					icon: <AlertTriangle className="w-5 h-5 text-slate-600" />,
				};
		}
	};

	const colors = getToastColors();
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			initial={reduceMotion ? false : { opacity: 0, y: 100, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 100, scale: 0.95 }}
			transition={{ duration: 0.2, ease: "easeOut" }}
			className={`flex items-center gap-4 p-4 rounded-xl border ${colors.bg} ${colors.border} shadow-lg max-w-sm w-full`}
		>
			{colors.icon}
			<div className="flex-1">
				<h3 className={`font-semibold text-sm ${colors.text}`}>{title}</h3>
				{description && (
					<p className={`text-xs ${colors.text} opacity-80 mt-0.5`}>
						{description}
					</p>
				)}
			</div>
			{action && (
				<button
					onClick={() => {
						action.onClick();
						onDismiss(id);
					}}
					className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white ${colors.actionBg} transition-colors`}
				>
					<Undo2 className="w-3 h-3" />
					{action.label}
				</button>
			)}
			<button
				onClick={() => onDismiss(id)}
				className="text-gray-400 hover:text-gray-600 transition-colors p-1 -mr-1"
			>
				<X className="w-4 h-4" />
			</button>
		</motion.div>
	);
};

interface ToastManagerProps {
	children: React.ReactNode;
}

interface ToastConfig {
	id: string;
	title: string;
	description?: string;
	type?: "success" | "error" | "info" | "warning";
	action?: {
		label: string;
		onClick: () => void;
	};
	duration?: number;
}

const ToastManager = ({ children }: ToastManagerProps) => {
	return <>{children}</>;
};

// Create context for toast functionality
const ToastContext = React.createContext<{
	showSuccess: (
		title: string,
		description?: string,
		action?: { label: string; onClick: () => void },
	) => string;
	showError: (
		title: string,
		description?: string,
		action?: { label: string; onClick: () => void },
	) => string;
	showInfo: (
		title: string,
		description?: string,
		action?: { label: string; onClick: () => void },
	) => string;
	showWarning: (
		title: string,
		description?: string,
		action?: { label: string; onClick: () => void },
	) => string;
	dismissToast: (id: string) => void;
}>({
	showSuccess: () => "",
	showError: () => "",
	showInfo: () => "",
	showWarning: () => "",
	dismissToast: () => {},
});

/**
 * ToastProvider - Provides toast functionality to the entire application
 */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
	const [toasts, setToasts] = useState<ToastConfig[]>([]);

	const showToast = useCallback((config: Omit<ToastConfig, "id">) => {
		const id = Date.now().toString();
		const newToast = { ...config, id };

		setToasts((prev) => [newToast, ...prev]);

		return id;
	}, []);

	const dismissToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const showSuccess = useCallback(
		(
			title: string,
			description?: string,
			action?: { label: string; onClick: () => void },
		) => {
			return showToast({ title, description, type: "success", action });
		},
		[showToast],
	);

	const showError = useCallback(
		(
			title: string,
			description?: string,
			action?: { label: string; onClick: () => void },
		) => {
			return showToast({ title, description, type: "error", action });
		},
		[showToast],
	);

	const showInfo = useCallback(
		(
			title: string,
			description?: string,
			action?: { label: string; onClick: () => void },
		) => {
			return showToast({ title, description, type: "info", action });
		},
		[showToast],
	);

	const showWarning = useCallback(
		(
			title: string,
			description?: string,
			action?: { label: string; onClick: () => void },
		) => {
			return showToast({ title, description, type: "warning", action });
		},
		[showToast],
	);

	return (
		<ToastContext.Provider
			value={{ showSuccess, showError, showInfo, showWarning, dismissToast }}
		>
			<ToastManager>
				{children}
				<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
					<AnimatePresence>
						{toasts.map((toast) => (
							<Toast
								key={toast.id}
								id={toast.id}
								title={toast.title}
								description={toast.description}
								type={toast.type}
								action={toast.action}
								duration={toast.duration}
								onDismiss={dismissToast}
							/>
						))}
					</AnimatePresence>
				</div>
			</ToastManager>
		</ToastContext.Provider>
	);
};

/**
 * useToast - Hook to access toast functionality
 */
export const useToast = () => {
	const context = React.useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

/**
 * ToastContainer - Standalone component for rendering toasts
 */
export const ToastContainer = () => {
	const { dismissToast } = useToast();
	const [toasts, setToasts] = React.useState<ToastConfig[]>([]);

	React.useEffect(() => {
		// This is a workaround to access the toasts from context
		// In a real implementation, you'd use the context directly
		const checkToasts = () => {
			const toastElements = document.querySelectorAll(".toast-item");
			if (toastElements.length > 0) {
				setToasts(
					Array.from(toastElements).map((el) => ({
						id: el.id,
						title: el.getAttribute("data-title") || "",
						description: el.getAttribute("data-description") || undefined,
						type: el.getAttribute("data-type") as any,
					})),
				);
			}
		};

		const interval = setInterval(checkToasts, 100);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
			<AnimatePresence>
				{toasts.map((toast) => (
					<Toast
						key={toast.id}
						id={toast.id}
						title={toast.title}
						description={toast.description}
						type={toast.type}
						onDismiss={dismissToast}
					/>
				))}
			</AnimatePresence>
		</div>
	);
};
