"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
	id: string;
	message: string;
	variant: ToastVariant;
}

interface ToastContextValue {
	toast: (message: string, variant?: ToastVariant) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useAdminToast() {
	const ctx = useContext(ToastContext);
	if (!ctx)
		throw new Error("useAdminToast must be used inside AdminToastProvider");
	return ctx;
}

// ─────────────────────────────────────────────
// Variant Config
// ─────────────────────────────────────────────
const VARIANT_CONFIG: Record<
	ToastVariant,
	{
		icon: React.ElementType;
		iconColor: string;
		bg: string;
		border: string;
		bar: string;
	}
> = {
	success: {
		icon: CheckCircle2,
		iconColor: "text-emerald-600",
		bg: "bg-white",
		border: "border-emerald-200",
		bar: "bg-emerald-500",
	},
	error: {
		icon: XCircle,
		iconColor: "text-rose-600",
		bg: "bg-white",
		border: "border-rose-200",
		bar: "bg-rose-500",
	},
	info: {
		icon: Info,
		iconColor: "text-blue-600",
		bg: "bg-white",
		border: "border-blue-200",
		bar: "bg-blue-500",
	},
	warning: {
		icon: AlertTriangle,
		iconColor: "text-amber-600",
		bg: "bg-white",
		border: "border-amber-200",
		bar: "bg-amber-500",
	},
};

// ─────────────────────────────────────────────
// Single Toast Item
// ─────────────────────────────────────────────
function ToastItem({
	toast,
	onDismiss,
}: {
	toast: Toast;
	onDismiss: (id: string) => void;
}) {
	const cfg = VARIANT_CONFIG[toast.variant];
	const Icon = cfg.icon;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 24, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: -12, scale: 0.96 }}
			transition={{ type: "spring", stiffness: 380, damping: 28 }}
			className={`relative flex items-start gap-3 w-80 ${cfg.bg} border ${cfg.border} rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden`}
		>
			{/* Left accent bar */}
			<div
				className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-2xl`}
			/>

			<div className="flex items-start gap-3 px-4 py-3.5 pl-5 w-full">
				<Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.iconColor}`} />
				<p className="text-sm font-semibold text-slate-800 leading-snug flex-1 pr-2">
					{toast.message}
				</p>
				<button
					onClick={() => onDismiss(toast.id)}
					className="flex-shrink-0 p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
				>
					<X className="w-3.5 h-3.5" />
				</button>
			</div>
		</motion.div>
	);
}

// ─────────────────────────────────────────────
// Provider + Toaster
// ─────────────────────────────────────────────
export function AdminToastProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const dismiss = useCallback((id: string) => {
		setToasts((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const toast = useCallback(
		(message: string, variant: ToastVariant = "info") => {
			const id = `toast-${Date.now()}-${Math.random()}`;
			setToasts((prev) => [...prev, { id, message, variant }]);
			// Auto-dismiss after 4 s
			setTimeout(() => dismiss(id), 4000);
		},
		[dismiss],
	);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			{/* Portal: fixed bottom-right */}
			<div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
				<AnimatePresence mode="popLayout">
					{toasts.map((t) => (
						<div key={t.id} className="pointer-events-auto">
							<ToastItem toast={t} onDismiss={dismiss} />
						</div>
					))}
				</AnimatePresence>
			</div>
		</ToastContext.Provider>
	);
}
