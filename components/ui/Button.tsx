/**
 * Reusable Button Component
 * Standardized button styles for consistency across the app.
 */
import React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "outline" | "ghost" | "danger" | "emerald";
	size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className = "", variant = "default", size = "md", ...props },
		ref,
	) => {
		const baseClasses =
			"inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";

		const variantClasses: Record<string, string> = {
			default:
				"bg-slate-900 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 rounded-xl",
			outline:
				"border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl",
			ghost:
				"bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl",
			danger:
				"bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/10 rounded-xl",
			emerald:
				"bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 rounded-xl",
		};

		const sizeClasses: Record<string, string> = {
			sm: "px-3 py-1.5 text-[9px]",
			md: "px-4 py-2 text-xs",
			lg: "px-6 py-3 text-sm",
		};

		return (
			<button
				ref={ref}
				className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${sizeClasses[size] || sizeClasses.md} ${className}`}
				{...props}
			/>
		);
	},
);

Button.displayName = "Button";
