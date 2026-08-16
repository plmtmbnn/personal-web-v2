"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Sparkles,
	Copy,
	Check,
	Download,
	Sliders,
	FileCode2,
	Eye,
	RotateCcw,
} from "lucide-react";
import type { CardConfig, SupportedLanguage, WindowStyle } from "../types";
import {
	copyCardToClipboard,
	exportCardToPng,
	exportCardToSvg,
} from "../utils/canvas-exporter";
import { BACKDROPS, CODE_PRESETS } from "../utils/presets";
import { THEMES, tokenizeLine } from "../utils/syntax-highlighter";

export default function CodeToImageView() {
	const reduceMotion = useReducedMotion();

	const defaultPreset = CODE_PRESETS[0] || {
		code: 'console.log("Hello, World!");',
		language: "typescript" as SupportedLanguage,
		filename: "index.ts",
	};

	const [config, setConfig] = useState<CardConfig>({
		code: defaultPreset.code,
		language: defaultPreset.language,
		theme: "one-dark",
		windowStyle: "mac",
		title: defaultPreset.filename,
		showLineNumbers: true,
		showWatermark: true,
		watermarkText: "@developer",
		backdrop: "cosmic-sunset",
		padding: 48,
		shadow: "heavy",
		borderRadius: 20,
		fontSize: 14,
	});

	const [isCopied, setIsCopied] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

	const currentTheme = THEMES[config.theme] || THEMES["one-dark"];
	const currentBackdrop =
		BACKDROPS[config.backdrop] || BACKDROPS["cosmic-sunset"];

	// Tokenize code for live preview
	const tokenizedLines = useMemo(() => {
		return config.code.split("\n").map((line) => {
			return tokenizeLine(line, config.language);
		});
	}, [config.code, config.language]);

	// Load Preset
	const handleLoadPreset = (presetId: string) => {
		const preset = CODE_PRESETS.find((p) => p.id === presetId);
		if (preset) {
			setConfig((prev) => ({
				...prev,
				code: preset.code,
				language: preset.language,
				title: preset.filename,
			}));
		}
	};

	// Copy to Clipboard
	const handleCopyImage = async () => {
		setIsExporting(true);
		const success = await copyCardToClipboard(config);
		setIsExporting(false);
		if (success) {
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	// Download PNG
	const handleDownloadPng = async (scale = 2) => {
		setIsExporting(true);
		try {
			const blob = await exportCardToPng(config, scale);
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${config.title.replace(/\.[^/.]+$/, "") || "code-snippet"}-${scale}x.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} finally {
			setIsExporting(false);
		}
	};

	// Download SVG
	const handleDownloadSvg = () => {
		const svgContent = exportCardToSvg(config);
		const blob = new Blob([svgContent], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${config.title.replace(/\.[^/.]+$/, "") || "code-snippet"}.svg`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1440px] mx-auto space-y-8">
				{/* Top Breadcrumb & Badge */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
				>
					<Link
						href="/utils"
						className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors gap-2 group !no-underline"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						Back to Utilities
					</Link>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200/80 rounded-full text-xs font-bold text-slate-600 shadow-2xs">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						High-DPI Retina Rasterizer • 100% In-Browser
					</div>
				</motion.div>

				{/* Header Section */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col xl:flex-row xl:items-end justify-between gap-6"
				>
					<div className="space-y-3">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
								<Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Code Snippet to{" "}
									<span className="text-indigo-600">Aesthetic Social Card</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Transform code snippets, terminal commands, or text into
									gradient-backed social cards for Twitter/X, LinkedIn, and
									blogs.
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={handleCopyImage}
							disabled={isExporting}
							className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
						>
							{isCopied ? (
								<Check className="w-4 h-4 text-emerald-600" />
							) : (
								<Copy className="w-4 h-4" />
							)}
							<span>{isCopied ? "Copied to Clipboard!" : "Copy Image"}</span>
						</button>
						<button
							type="button"
							onClick={() => handleDownloadPng(2)}
							disabled={isExporting}
							className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
						>
							<Download className="w-4 h-4" />
							<span>Download PNG (@2x)</span>
						</button>
						<button
							type="button"
							onClick={handleDownloadSvg}
							className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
						>
							<Download className="w-4 h-4" />
							<span>SVG</span>
						</button>
					</div>
				</motion.div>

				{/* Presets Bar */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="flex items-center gap-2 overflow-x-auto p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs"
				>
					<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 whitespace-nowrap">
						Code Presets:
					</span>
					{CODE_PRESETS.map((preset) => (
						<button
							key={preset.id}
							type="button"
							onClick={() => handleLoadPreset(preset.id)}
							className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border border-slate-200/60"
						>
							{preset.title}
						</button>
					))}
				</motion.div>

				{/* ═══════════════════════════════════════════════════════════════════ */}
				{/* MAIN STUDIO WORKSPACE (CONTROLS + LIVE PREVIEW)                     */}
				{/* ═══════════════════════════════════════════════════════════════════ */}
				<div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
					{/* LEFT COLUMN: CUSTOMIZATION CONTROLS (4 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="xl:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6"
					>
						<div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
							<Sliders className="w-4 h-4 text-indigo-600" />
							<span>Card & Editor Styling</span>
						</div>

						{/* 1. Theme Selector */}
						<div className="space-y-2">
							<span className="text-xs font-bold text-slate-600 block">
								Editor Color Theme
							</span>
							<div className="grid grid-cols-2 gap-2">
								{Object.values(THEMES).map((th) => (
									<button
										key={th.id}
										type="button"
										onClick={() =>
											setConfig((prev) => ({ ...prev, theme: th.id }))
										}
										className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
											config.theme === th.id
												? "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										<span
											className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/20"
											style={{ backgroundColor: th.background }}
										/>
										<span className="truncate">{th.name}</span>
									</button>
								))}
							</div>
						</div>

						{/* 2. Backdrop Gradient Selector */}
						<div className="space-y-2">
							<span className="text-xs font-bold text-slate-600 block">
								Backdrop Gradient
							</span>
							<div className="grid grid-cols-3 gap-2">
								{Object.values(BACKDROPS).map((bg) => (
									<button
										key={bg.id}
										type="button"
										onClick={() =>
											setConfig((prev) => ({ ...prev, backdrop: bg.id }))
										}
										className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
											config.backdrop === bg.id
												? "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										<span
											className="w-full h-5 rounded-lg border border-slate-300/40"
											style={{
												background:
													bg.id === "transparent"
														? "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 8px 8px"
														: bg.gradientCss,
											}}
										/>
										<span className="truncate text-center w-full">
											{bg.name}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* 3. Window Style Selector */}
						<div className="space-y-2">
							<span className="text-xs font-bold text-slate-600 block">
								Window Frame Header
							</span>
							<div className="grid grid-cols-2 gap-2">
								{[
									{ id: "mac", label: "macOS (Traffic Lights)" },
									{ id: "windows", label: "Windows 11" },
									{ id: "dots", label: "Minimalist Dots" },
									{ id: "none", label: "Frameless / Clean" },
								].map((win) => (
									<button
										key={win.id}
										type="button"
										onClick={() =>
											setConfig((prev) => ({
												...prev,
												windowStyle: win.id as WindowStyle,
											}))
										}
										className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
											config.windowStyle === win.id
												? "border-indigo-600 bg-indigo-50/50 text-indigo-950 ring-2 ring-indigo-600/20"
												: "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
										}`}
									>
										{win.label}
									</button>
								))}
							</div>
						</div>

						{/* 4. Title, Language & Watermark */}
						<div className="space-y-3 pt-2 border-t border-slate-100">
							<div>
								<span className="text-xs font-bold text-slate-600 block mb-1">
									Window Title / Filename
								</span>
								<input
									type="text"
									value={config.title}
									onChange={(e) =>
										setConfig((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder="e.g. server.ts"
									className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>

							<div>
								<span className="text-xs font-bold text-slate-600 block mb-1">
									Syntax Language
								</span>
								<select
									value={config.language}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											language: e.target.value as SupportedLanguage,
										}))
									}
									className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
								>
									<option value="typescript">TypeScript</option>
									<option value="javascript">JavaScript</option>
									<option value="python">Python</option>
									<option value="go">Go</option>
									<option value="rust">Rust</option>
									<option value="sql">SQL</option>
									<option value="json">JSON</option>
									<option value="html">HTML / XML</option>
									<option value="css">CSS / Tailwind</option>
									<option value="shell">Shell / Bash</option>
									<option value="markdown">Markdown</option>
									<option value="text">Plain Text</option>
								</select>
							</div>

							{/* Canvas Padding Slider */}
							<div>
								<div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
									<span>Canvas Padding</span>
									<span className="font-mono">{config.padding}px</span>
								</div>
								<input
									type="range"
									min="16"
									max="80"
									step="8"
									value={config.padding}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											padding: Number(e.target.value),
										}))
									}
									className="w-full accent-indigo-600 cursor-pointer"
								/>
							</div>

							{/* Toggles */}
							<div className="space-y-2 pt-2">
								<label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
									<input
										type="checkbox"
										checked={config.showLineNumbers}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												showLineNumbers: e.target.checked,
											}))
										}
										className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
									/>
									<span>Show Line Numbers</span>
								</label>

								<label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
									<input
										type="checkbox"
										checked={config.showWatermark}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												showWatermark: e.target.checked,
											}))
										}
										className="w-4 h-4 rounded text-indigo-600 accent-indigo-600 cursor-pointer"
									/>
									<span>Show Watermark / Author Badge</span>
								</label>
							</div>
						</div>
					</motion.div>

					{/* RIGHT COLUMN: LIVE CANVAS PREVIEW & RAW EDITOR (8 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="xl:col-span-8 space-y-4"
					>
						{/* Tab Switcher: Rendered vs Raw Code Input */}
						<div className="flex items-center justify-between">
							<div className="flex items-center p-1 bg-white border border-slate-200/80 rounded-2xl gap-1 shadow-2xs">
								<button
									type="button"
									onClick={() => setActiveTab("preview")}
									className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
										activeTab === "preview"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<Eye className="w-3.5 h-3.5" />
									<span>Visual Preview</span>
								</button>
								<button
									type="button"
									onClick={() => setActiveTab("raw")}
									className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
										activeTab === "raw"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<FileCode2 className="w-3.5 h-3.5" />
									<span>Edit Code Text</span>
								</button>
							</div>

							<span className="text-xs font-mono font-bold text-slate-400">
								{config.code.split("\n").length} lines • {config.code.length}{" "}
								chars
							</span>
						</div>

						{/* 1. VISUAL PREVIEW STAGE */}
						{activeTab === "preview" && (
							<div
								className="rounded-3xl border border-slate-200/80 overflow-x-auto flex items-center justify-center transition-all duration-300 min-h-[420px]"
								style={{
									background:
										config.backdrop === "transparent"
											? "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 16px 16px"
											: currentBackdrop.gradientCss,
									padding: `${config.padding}px`,
								}}
							>
								{/* Code Window Card */}
								<div
									className="transition-all duration-300 min-w-[320px] max-w-full"
									style={{
										backgroundColor: currentTheme.background,
										borderRadius: `${config.borderRadius}px`,
										boxShadow:
											config.shadow === "heavy"
												? "0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)"
												: config.shadow === "glow"
													? "0 0 40px rgba(129, 140, 248, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)"
													: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
									}}
								>
									{/* Window Header */}
									{config.windowStyle !== "none" && (
										<div
											className="flex items-center justify-between px-5 py-3 border-b"
											style={{
												backgroundColor: currentTheme.headerBackground,
												borderColor: currentTheme.headerBorder,
												borderTopLeftRadius: `${config.borderRadius}px`,
												borderTopRightRadius: `${config.borderRadius}px`,
											}}
										>
											{/* macOS Controls */}
											{config.windowStyle === "mac" && (
												<div className="flex items-center gap-2">
													<span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
													<span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
													<span className="w-3 h-3 rounded-full bg-[#27c93f]" />
												</div>
											)}
											{/* Minimal Dots */}
											{config.windowStyle === "dots" && (
												<div className="flex items-center gap-1.5">
													<span className="w-2 h-2 rounded-full bg-white/20" />
													<span className="w-2 h-2 rounded-full bg-white/20" />
													<span className="w-2 h-2 rounded-full bg-white/20" />
												</div>
											)}
											{/* Window Title */}
											<span className="text-xs font-mono font-bold text-white/60 mx-auto truncate px-4">
												{config.title}
											</span>
											{/* Windows Controls */}
											{config.windowStyle === "windows" && (
												<div className="flex items-center gap-3 text-white/40 text-xs font-mono">
													<span>─</span>
													<span>□</span>
													<span>✕</span>
												</div>
											)}
										</div>
									)}

									{/* Code Body */}
									<div className="p-6 overflow-x-auto font-mono text-xs sm:text-sm leading-relaxed">
										{tokenizedLines.map((tokens, lIdx) => (
											<div
												key={`preview-line-${lIdx}`}
												className="flex items-start"
											>
												{config.showLineNumbers && (
													<span
														className="w-10 pr-4 text-right select-none shrink-0 text-xs"
														style={{ color: currentTheme.lineNumber }}
													>
														{lIdx + 1}
													</span>
												)}
												<div className="whitespace-pre flex-1">
													{tokens.map((tok, tIdx) => (
														<span
															key={`tok-${tIdx}`}
															style={{
																color:
																	currentTheme.tokens[tok.type] ||
																	currentTheme.foreground,
															}}
														>
															{tok.text}
														</span>
													))}
												</div>
											</div>
										))}
									</div>

									{/* Watermark */}
									{config.showWatermark && config.watermarkText && (
										<div className="px-6 pb-4 pt-1 text-right">
											<span className="text-[11px] font-sans font-bold text-white/30 tracking-wide">
												{config.watermarkText}
											</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* 2. RAW TEXTAREA EDITOR */}
						{activeTab === "raw" && (
							<div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
								<div className="flex items-center justify-between text-xs font-bold text-slate-600">
									<span>Code Content (Paste or write here)</span>
									<button
										type="button"
										onClick={() =>
											setConfig((prev) => ({
												...prev,
												code: defaultPreset.code,
											}))
										}
										className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 cursor-pointer"
									>
										<RotateCcw className="w-3.5 h-3.5" />
										<span>Reset to Default</span>
									</button>
								</div>
								<textarea
									value={config.code}
									onChange={(e) =>
										setConfig((prev) => ({ ...prev, code: e.target.value }))
									}
									rows={14}
									placeholder="Paste your source code here..."
									className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-950 font-mono text-xs sm:text-sm text-slate-100 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
								/>
							</div>
						)}
					</motion.div>
				</div>
			</div>
		</main>
	);
}
