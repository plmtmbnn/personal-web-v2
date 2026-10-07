"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownOption<T extends string | number> {
	value: T;
	label: string;
	badge?: string | number;
}

interface ScreenerDropdownProps<T extends string | number> {
	icon?: React.ComponentType<{ className?: string }>;
	value: T;
	onChange: (value: T) => void;
	options: DropdownOption<T>[];
	placeholder?: string;
	className?: string;
}

export default function ScreenerDropdown<T extends string | number>({
	icon: Icon,
	value,
	onChange,
	options,
	placeholder = "Select...",
	className = "",
}: ScreenerDropdownProps<T>) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	// Click outside listener
	useEffect(() => {
		if (!isOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				handleClose();
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleClose();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, handleClose]);

	return (
		<div ref={dropdownRef} className={`relative inline-block ${className}`}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				className={`inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50/80 border rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer select-none ${
					isOpen
						? "border-indigo-500 ring-2 ring-indigo-500/15 text-slate-900"
						: "border-slate-200/90 text-slate-700 hover:text-slate-900"
				}`}
			>
				{Icon && <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
				<span className="truncate max-w-[140px] text-left">
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
						isOpen ? "rotate-180 text-indigo-600" : ""
					}`}
				/>
			</button>

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: -4, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -4, scale: 0.98 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute right-0 sm:left-0 sm:right-auto mt-1.5 min-w-[200px] max-h-[300px] overflow-y-auto bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-40"
					>
						<div className="space-y-0.5">
							{options.map((option) => {
								const isSelected = option.value === value;
								return (
									<button
										key={String(option.value)}
										type="button"
										onClick={() => {
											onChange(option.value);
											setIsOpen(false);
										}}
										className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-left ${
											isSelected
												? "bg-indigo-50/70 text-indigo-700 font-bold"
												: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
										}`}
									>
										<span className="truncate">{option.label}</span>
										<div className="flex items-center gap-1.5 shrink-0">
											{option.badge !== undefined && (
												<span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500">
													{option.badge}
												</span>
											)}
											{isSelected && (
												<Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
											)}
										</div>
									</button>
								);
							})}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
