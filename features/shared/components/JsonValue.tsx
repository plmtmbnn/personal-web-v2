"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, ClipboardCheck } from "lucide-react";

export function JsonValue({ value, label }: { value: any; label?: string }) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [isCopied, setIsCopied] = useState(false);

	const type = typeof value;
	const isObject = value !== null && type === "object";
	const isArray = Array.isArray(value);

	const copyToClipboard = (e: React.MouseEvent) => {
		e.stopPropagation();
		const text =
			typeof value === "string" ? value : JSON.stringify(value, null, 2);
		navigator.clipboard.writeText(text);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 1500);
	};

	if (isObject) {
		const keys = Object.keys(value);
		const isEmpty = keys.length === 0;
		const bracketOpen = isArray ? "[" : "{";
		const bracketClose = isArray ? "]" : "}";

		return (
			<div className="font-mono text-sm leading-relaxed group/node">
				<div
					className="flex items-center gap-1 cursor-pointer hover:bg-slate-100/50 rounded px-1 -ml-1 transition-colors"
					onClick={() => setIsExpanded(!isExpanded)}
				>
					{!isEmpty && (
						<span className="text-slate-400">
							{isExpanded ? (
								<ChevronDown className="w-3.5 h-3.5" />
							) : (
								<ChevronRight className="w-3.5 h-3.5" />
							)}
						</span>
					)}
					{label && <span className="text-blue-600 font-bold">{label}: </span>}
					<span className="text-slate-400 font-black">{bracketOpen}</span>
					{!isExpanded && (
						<span className="text-slate-400 text-xs italic bg-slate-100 px-1 rounded mx-1">
							{keys.length} items
						</span>
					)}
					{!isExpanded && (
						<span className="text-slate-400 font-black">{bracketClose}</span>
					)}

					<button
						onClick={copyToClipboard}
						className="opacity-0 group-hover/node:opacity-100 ml-2 p-1 text-slate-300 hover:text-blue-500 transition-all active:scale-90"
						title="Copy value"
					>
						{isCopied ? (
							<ClipboardCheck className="w-3.5 h-3.5" />
						) : (
							<Copy className="w-3.5 h-3.5" />
						)}
					</button>
				</div>

				{isExpanded && !isEmpty && (
					<div className="pl-6 border-l border-slate-100 ml-1.5 mt-1 space-y-1">
						{keys.map((key) => (
							<JsonValue
								key={key}
								label={isArray ? undefined : key}
								value={value[key]}
							/>
						))}
					</div>
				)}

				{isExpanded && (
					<div className="text-slate-400 font-black mt-1">{bracketClose}</div>
				)}
			</div>
		);
	}

	return (
		<div className="font-mono text-sm leading-relaxed flex items-center gap-2 group/val hover:bg-slate-50 rounded px-1 -ml-1 transition-colors py-0.5">
			{label && <span className="text-blue-500 font-bold">{label}: </span>}
			<span
				className={`
				${type === "string" ? "text-emerald-600" : ""}
				${type === "number" ? "text-orange-500" : ""}
				${type === "boolean" ? "text-purple-600" : ""}
				${value === null ? "text-slate-400 italic" : ""}
				font-medium break-all
			`}
			>
				{type === "string" ? `"${value}"` : String(value)}
			</span>

			<button
				onClick={copyToClipboard}
				className="opacity-0 group-hover/val:opacity-100 p-1 text-slate-300 hover:text-blue-500 transition-all active:scale-90"
			>
				{isCopied ? (
					<ClipboardCheck className="w-3 h-3" />
				) : (
					<Copy className="w-3 h-3" />
				)}
			</button>
		</div>
	);
}
