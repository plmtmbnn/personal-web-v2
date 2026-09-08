"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";

export interface InfoTooltipProps {
	text: string;
	position?: "top" | "bottom";
	align?: "center" | "left" | "right";
	size?: "xs" | "sm" | "md";
	iconColor?: string;
	className?: string;
	ariaLabel?: string;
}

export default function InfoTooltip({
	text,
	position = "top",
	align = "center",
	size = "sm",
	iconColor,
	className = "",
	ariaLabel = "More information",
}: InfoTooltipProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
		};
	}, [isOpen]);

	const iconSizeClass =
		size === "xs" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

	const defaultIconColor =
		iconColor ||
		"text-slate-400 hover:text-slate-600 group-hover/tip:text-slate-600";

	const alignClasses =
		align === "right"
			? "right-0 left-auto"
			: align === "left"
				? "left-0"
				: "left-0 sm:left-1/2 sm:-translate-x-1/2";

	const arrowAlignClasses =
		align === "right"
			? "right-3 left-auto"
			: align === "left"
				? "left-3"
				: "left-3 sm:left-1/2 sm:-translate-x-1/2";

	return (
		<span
			ref={containerRef}
			className={`group/tip relative inline-flex items-center align-middle ${className}`}
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
			onClick={(e) => e.stopPropagation()}
		>
			<button
				type="button"
				aria-label={ariaLabel}
				aria-expanded={isOpen}
				onClick={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setIsOpen((prev) => !prev);
				}}
				className={`p-1 -m-1 rounded-md ${defaultIconColor} focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 transition-colors flex items-center justify-center cursor-pointer touch-manipulation`}
			>
				<Info className={`${iconSizeClass} shrink-0`} />
			</button>
			<span
				role="tooltip"
				className={`absolute ${
					position === "top" ? "bottom-full mb-2" : "top-full mt-2"
				} ${alignClasses} w-48 sm:w-56 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl transition-all duration-150 z-50 shadow-xl border border-slate-800 leading-snug text-left normal-case tracking-normal ${
					isOpen
						? "opacity-100 pointer-events-auto visible scale-100"
						: "opacity-0 pointer-events-none invisible scale-95"
				}`}
			>
				{text}
				<span
					className={`absolute ${
						position === "top"
							? "top-full border-t-slate-900"
							: "bottom-full border-b-slate-900"
					} ${arrowAlignClasses} border-4 border-transparent`}
				/>
			</span>
		</span>
	);
}
