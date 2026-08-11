import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskStatus } from "@/features/tasks/types";
import { TASK_STATUS_CONFIG } from "@/features/tasks/constants";

interface StatusSelectorProps {
	value: TaskStatus;
	onChange: (status: TaskStatus) => void;
	disabled?: boolean;
}

export function StatusSelector({
	value,
	onChange,
	disabled,
}: StatusSelectorProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

	const currentConfig = TASK_STATUS_CONFIG[value] || TASK_STATUS_CONFIG.todo;

	useEffect(() => {
		setMounted(true);
	}, []);

	const updatePosition = () => {
		if (buttonRef.current) {
			const rect = buttonRef.current.getBoundingClientRect();
			const dropdownWidth = 192; // 12rem = 192px
			const dropdownHeight = 220; // approximate dropdown height

			let top = rect.bottom + 8;
			// If dropdown would overflow bottom of viewport, position above button
			if (
				top + dropdownHeight > window.innerHeight &&
				rect.top - dropdownHeight - 8 > 0
			) {
				top = rect.top - dropdownHeight - 8;
			}

			// Keep left within viewport margins
			let left = rect.right - dropdownWidth;
			const maxLeft = window.innerWidth - dropdownWidth - 12;
			const minLeft = 12;
			left = Math.max(minLeft, Math.min(left, maxLeft));

			setDropdownPosition({ top, left });
		}
	};

	useEffect(() => {
		if (!isOpen) return;

		updatePosition();

		const handleScrollOrResize = () => {
			updatePosition();
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		window.addEventListener("scroll", handleScrollOrResize, true);
		window.addEventListener("resize", handleScrollOrResize);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
			window.removeEventListener("scroll", handleScrollOrResize, true);
			window.removeEventListener("resize", handleScrollOrResize);
		};
	}, [isOpen]);

	const handleSelect = (status: TaskStatus, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		onChange(status);
		setIsOpen(false);
	};

	const toggleOpen = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!disabled) {
			if (!isOpen) {
				updatePosition();
			}
			setIsOpen((prev) => !prev);
		}
	};

	return (
		<>
			<button
				ref={buttonRef}
				type="button"
				onClick={toggleOpen}
				disabled={disabled}
				className={`flex items-center gap-1.5 border text-[9px] font-black uppercase tracking-wider rounded-xl pl-2.5 pr-2 py-1.5 focus:outline-none focus:ring-4 focus:ring-slate-100 transition-all mr-1 ${
					disabled
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer hover:shadow-sm"
				} ${currentConfig.color}`}
				title="Change Task Status"
			>
				<span className="text-sm leading-none">{currentConfig.emoji}</span>
				<span className="hidden sm:inline">{currentConfig.label}</span>
				<ChevronDown
					className={`w-3 h-3 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{mounted &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<motion.div
								key="status-selector-dropdown"
								ref={dropdownRef}
								initial={{ opacity: 0, y: -8, scale: 0.95 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: -8, scale: 0.95 }}
								transition={{ duration: 0.15, ease: "easeOut" }}
								style={{
									position: "fixed",
									top: `${dropdownPosition.top}px`,
									left: `${dropdownPosition.left}px`,
								}}
								className="w-48 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
							>
								<div className="py-1">
									{(
										Object.entries(TASK_STATUS_CONFIG) as [
											TaskStatus,
											(typeof TASK_STATUS_CONFIG)[TaskStatus],
										][]
									).map(([key, config]) => {
										const isSelected = key === value;
										return (
											<button
												key={key}
												type="button"
												onClick={(e) => handleSelect(key, e)}
												className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all cursor-pointer ${
													isSelected
														? `${config.color} font-bold`
														: "text-slate-700 hover:bg-slate-50"
												}`}
											>
												<span className="text-base leading-none w-4 text-center">
													{config.emoji}
												</span>
												<span className="flex-1 text-xs font-bold uppercase tracking-wide">
													{config.label}
												</span>
												{isSelected && <Check className="w-4 h-4 shrink-0" />}
											</button>
										);
									})}
								</div>
							</motion.div>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}
