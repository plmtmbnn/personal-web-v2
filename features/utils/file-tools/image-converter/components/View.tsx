"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
	ArrowLeft,
	Image as ImageIcon,
	Upload,
	Download,
	Trash2,
	CheckCircle2,
	AlertTriangle,
	Sparkles,
	FileImage,
	RefreshCw,
	Sliders,
	Info,
	Layers,
	FileCheck,
	ArrowRight,
} from "lucide-react";
import {
	type ConversionItem,
	FORMAT_OPTIONS,
	type SupportedFormat,
} from "../types";
import { validateRealImage } from "../utils/validation";
import {
	calculateSavings,
	convertImage,
	formatBytes,
	getConvertedFilename,
} from "../utils/converter";

const QUICK_PRESETS: Array<{
	label: string;
	format: SupportedFormat;
	quality: number;
	scale: number;
	icon: string;
	tag: string;
}> = [
	{
		label: "WebP Modern",
		format: "webp",
		quality: 85,
		scale: 1,
		icon: "🌐",
		tag: "Recommended for Web",
	},
	{
		label: "Lossless PNG",
		format: "png",
		quality: 100,
		scale: 1,
		icon: "💎",
		tag: "Crisp & Alpha",
	},
	{
		label: "JPEG Standard",
		format: "jpeg",
		quality: 80,
		scale: 1,
		icon: "📷",
		tag: "Universal Photo",
	},
	{
		label: "Favicon ICO",
		format: "ico",
		quality: 100,
		scale: 1,
		icon: "⭐",
		tag: "Web Favicons",
	},
];

export default function ImageConverterView() {
	const reduceMotion = useReducedMotion();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [items, setItems] = useState<ConversionItem[]>([]);
	const [globalFormat, setGlobalFormat] = useState<SupportedFormat>("webp");
	const [globalQuality, setGlobalQuality] = useState<number>(85);
	const [globalScale, setGlobalScale] = useState<number>(1);
	const [globalBgColor, setGlobalBgColor] = useState<string>("#ffffff");
	const [isDragging, setIsDragging] = useState(false);
	const [isBatchConverting, setIsBatchConverting] = useState(false);

	// Process new files with validation
	const handleAddFiles = useCallback(
		async (files: FileList | File[]) => {
			const newFiles = Array.from(files);
			if (newFiles.length === 0) return;

			const initialItems: ConversionItem[] = newFiles.map((file) => {
				const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
				const previewUrl = URL.createObjectURL(file);
				return {
					id,
					file,
					originalName: file.name,
					originalSize: file.size,
					previewUrl,
					validation: {
						isValid: false,
						detectedFormat: "unknown",
					},
					status: "validating",
					targetFormat: globalFormat,
					quality: globalQuality,
					scale: globalScale,
					backgroundColor: globalBgColor,
				};
			});

			setItems((prev) => [...prev, ...initialItems]);

			// Validate each file
			for (const item of initialItems) {
				const validation = await validateRealImage(item.file);
				setItems((prev) =>
					prev.map((existing) => {
						if (existing.id !== item.id) return existing;
						return {
							...existing,
							validation,
							status: validation.isValid ? "ready" : "error",
							error: validation.error,
						};
					}),
				);
			}
		},
		[globalFormat, globalQuality, globalScale, globalBgColor],
	);

	// Clipboard paste support
	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			if (!e.clipboardData) return;
			const pastedFiles = Array.from(e.clipboardData.files);
			if (pastedFiles.length > 0) {
				e.preventDefault();
				handleAddFiles(pastedFiles);
			}
		};

		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, [handleAddFiles]);

	// Drag & Drop handlers
	const onDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const onDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			handleAddFiles(e.dataTransfer.files);
		}
	};

	// Update single item settings
	const updateItem = (id: string, updates: Partial<ConversionItem>) => {
		setItems((prev) =>
			prev.map((item) => {
				if (item.id !== id) return item;
				const updated = { ...item, ...updates };
				// Reset converted state if settings changed
				if (
					updates.targetFormat !== undefined ||
					updates.quality !== undefined ||
					updates.scale !== undefined
				) {
					if (updated.status === "converted") {
						updated.status = "ready";
					}
				}
				return updated;
			}),
		);
	};

	// Convert single item
	const handleConvertItem = async (id: string) => {
		const target = items.find((it) => it.id === id);
		if (!target?.validation.isValid) return;

		updateItem(id, { status: "converting", error: undefined });

		try {
			const result = await convertImage(target);
			updateItem(id, {
				status: "converted",
				convertedBlob: result.blob,
				convertedUrl: result.url,
				convertedSize: result.size,
			});
		} catch (err) {
			updateItem(id, {
				status: "error",
				error: err instanceof Error ? err.message : "Conversion failed.",
			});
		}
	};

	// Batch convert all ready items
	const handleConvertAll = async () => {
		const eligibleItems = items.filter(
			(it) => it.validation.isValid && it.status !== "converting",
		);
		if (eligibleItems.length === 0) return;

		setIsBatchConverting(true);

		for (const item of eligibleItems) {
			updateItem(item.id, { status: "converting", error: undefined });
			try {
				const result = await convertImage(item);
				updateItem(item.id, {
					status: "converted",
					convertedBlob: result.blob,
					convertedUrl: result.url,
					convertedSize: result.size,
				});
			} catch (err) {
				updateItem(item.id, {
					status: "error",
					error: err instanceof Error ? err.message : "Conversion failed.",
				});
			}
		}

		setIsBatchConverting(false);
	};

	// Download single converted item
	const handleDownloadItem = (item: ConversionItem) => {
		if (!item.convertedUrl) return;
		const downloadName = getConvertedFilename(
			item.originalName,
			item.targetFormat,
		);
		const a = document.createElement("a");
		a.href = item.convertedUrl;
		a.download = downloadName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	// Download all converted items sequentially
	const handleDownloadAll = () => {
		const convertedItems = items.filter(
			(it) => it.status === "converted" && it.convertedUrl,
		);
		if (convertedItems.length === 0) return;

		convertedItems.forEach((item, index) => {
			setTimeout(() => {
				handleDownloadItem(item);
			}, index * 300);
		});
	};

	// Remove single item
	const handleRemoveItem = (id: string) => {
		setItems((prev) => {
			const item = prev.find((it) => it.id === id);
			if (item) {
				URL.revokeObjectURL(item.previewUrl);
				if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
			}
			return prev.filter((it) => it.id !== id);
		});
	};

	// Clear all items
	const handleClearAll = () => {
		items.forEach((item) => {
			URL.revokeObjectURL(item.previewUrl);
			if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
		});
		setItems([]);
	};

	// Apply global format to all items
	const handleApplyGlobalFormat = (format: SupportedFormat) => {
		setGlobalFormat(format);
		setItems((prev) =>
			prev.map((item) => ({
				...item,
				targetFormat: format,
				status:
					item.status === "converted" && item.validation.isValid
						? "ready"
						: item.status,
			})),
		);
	};

	// Apply quick preset to all items
	const handleApplyPreset = (preset: (typeof QUICK_PRESETS)[0]) => {
		setGlobalFormat(preset.format);
		setGlobalQuality(preset.quality);
		setGlobalScale(preset.scale);
		setItems((prev) =>
			prev.map((item) => ({
				...item,
				targetFormat: preset.format,
				quality: preset.quality,
				scale: preset.scale,
				status:
					item.status === "converted" && item.validation.isValid
						? "ready"
						: item.status,
			})),
		);
	};

	const totalOriginalBytes = items.reduce(
		(sum, it) => sum + it.originalSize,
		0,
	);
	const convertedCount = items.filter((it) => it.status === "converted").length;
	const totalConvertedBytes = items.reduce(
		(sum, it) => sum + (it.convertedSize || 0),
		0,
	);
	const validCount = items.filter((it) => it.validation.isValid).length;

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative overflow-x-hidden pb-32 pt-24 sm:pt-32 px-4 sm:px-6 lg:px-8">
			<div className="max-w-[1400px] mx-auto space-y-8">
				{/* Breadcrumb & Navigation */}
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
						100% Client-Side • Zero Server Uploads
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
								<ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
							</div>
							<div>
								<h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
									Image Extension & Format{" "}
									<span className="text-indigo-600">Converter</span>
								</h1>
								<p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
									Convert image extensions and formats with binary magic-number
									validation, quality scaling, and batch processing.
								</p>
							</div>
						</div>
					</div>

					{/* Quick Preset Buttons */}
					<div className="flex flex-wrap items-center gap-2">
						{QUICK_PRESETS.map((preset) => (
							<button
								key={preset.label}
								type="button"
								onClick={() => handleApplyPreset(preset)}
								className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
									globalFormat === preset.format
										? "bg-slate-900 text-white border-slate-900 shadow-sm"
										: "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
								}`}
							>
								<span>{preset.icon}</span>
								<span>{preset.label}</span>
							</button>
						))}
					</div>
				</motion.div>

				{/* Global Controls Bar */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-5"
				>
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
						{/* Target Extension Selector */}
						<div className="space-y-2 flex-1">
							<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
								<Layers className="w-4 h-4 text-indigo-600" />
								<span>Select Target Extension / Format</span>
							</div>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
								{Object.values(FORMAT_OPTIONS).map((opt) => (
									<button
										key={opt.format}
										type="button"
										onClick={() => handleApplyGlobalFormat(opt.format)}
										className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
											globalFormat === opt.format
												? "border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20 shadow-xs"
												: "border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70 text-slate-700"
										}`}
									>
										<span className="text-sm font-extrabold">{opt.label}</span>
										<span className="text-[10px] font-mono text-slate-500 mt-0.5">
											{opt.extension}
										</span>
									</button>
								))}
							</div>
						</div>

						{/* Format Configuration Sliders */}
						<div className="flex flex-wrap items-center gap-4 lg:border-l lg:border-slate-200 lg:pl-6">
							{/* Quality Slider (for lossy formats) */}
							{FORMAT_OPTIONS[globalFormat]?.isLossy && (
								<div className="space-y-1.5 min-w-[150px]">
									<div className="flex items-center justify-between text-xs font-bold text-slate-700">
										<span className="flex items-center gap-1.5">
											<Sliders className="w-3.5 h-3.5 text-indigo-600" />
											Quality
										</span>
										<span className="font-mono text-indigo-600 font-extrabold">
											{globalQuality}%
										</span>
									</div>
									<input
										type="range"
										min="10"
										max="100"
										step="5"
										value={globalQuality}
										onChange={(e) => {
											const val = Number(e.target.value);
											setGlobalQuality(val);
											setItems((prev) =>
												prev.map((it) => ({ ...it, quality: val })),
											);
										}}
										className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
									/>
								</div>
							)}

							{/* Dimension Scale Selector */}
							<div className="space-y-1.5 min-w-[150px]">
								<div className="flex items-center justify-between text-xs font-bold text-slate-700">
									<span>Scale Dimensions</span>
									<span className="font-mono text-indigo-600 font-extrabold">
										{Math.round(globalScale * 100)}%
									</span>
								</div>
								<div className="flex items-center gap-1">
									{[1, 0.75, 0.5, 0.25].map((scaleVal) => (
										<button
											key={scaleVal}
											type="button"
											onClick={() => {
												setGlobalScale(scaleVal);
												setItems((prev) =>
													prev.map((it) => ({ ...it, scale: scaleVal })),
												);
											}}
											className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
												globalScale === scaleVal
													? "bg-slate-900 text-white"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200"
											}`}
										>
											{Math.round(scaleVal * 100)}%
										</button>
									))}
								</div>
							</div>

							{/* Background Color Fill for Non-Alpha Formats */}
							{!FORMAT_OPTIONS[globalFormat]?.supportsAlpha && (
								<div className="space-y-1.5">
									<span className="text-xs font-bold text-slate-700 block">
										Fill Alpha BG
									</span>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={globalBgColor}
											onChange={(e) => {
												setGlobalBgColor(e.target.value);
												setItems((prev) =>
													prev.map((it) => ({
														...it,
														backgroundColor: e.target.value,
													})),
												);
											}}
											className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
											title="Background fill for transparency"
										/>
										<span className="text-xs font-mono text-slate-500 font-bold">
											{globalBgColor}
										</span>
									</div>
								</div>
							)}
						</div>
					</div>
				</motion.div>

				{/* Drag & Drop Upload Zone */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
					onDragOver={onDragOver}
					onDragLeave={onDragLeave}
					onDrop={onDrop}
					onClick={() => fileInputRef.current?.click()}
					className={`border-2 border-dashed rounded-[2.5rem] p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-4 ${
						isDragging
							? "border-indigo-600 bg-indigo-50/50 scale-[1.008]"
							: "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50 shadow-xs"
					}`}
				>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept="image/*,.png,.jpg,.jpeg,.webp,.avif,.bmp,.ico,.gif,.svg,.tiff"
						onChange={(e) => {
							if (e.target.files) handleAddFiles(e.target.files);
							if (fileInputRef.current) fileInputRef.current.value = "";
						}}
						className="hidden"
					/>

					<div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
						<Upload className="w-8 h-8" />
					</div>

					<div className="space-y-1.5 max-w-md">
						<h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
							Drop your images here, or{" "}
							<span className="text-indigo-600 underline decoration-indigo-300">
								browse
							</span>
						</h3>
						<p className="text-xs sm:text-sm text-slate-500 font-medium">
							Supports PNG, JPG, WebP, AVIF, BMP, ICO, GIF, SVG, TIFF.
							<br className="hidden sm:inline" /> Paste anywhere using{" "}
							<kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-100 border border-slate-300 rounded text-slate-700">
								Ctrl+V
							</kbd>
						</p>
					</div>

					{/* Format Badges */}
					<div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
						{[
							"PNG",
							"JPEG",
							"WebP",
							"AVIF",
							"BMP",
							"ICO",
							"GIF",
							"SVG",
							"TIFF",
						].map((fmt) => (
							<span
								key={fmt}
								className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 border border-slate-200/80"
							>
								{fmt}
							</span>
						))}
					</div>
				</motion.div>

				{/* Items Management & Workspace */}
				{items.length > 0 && (
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, y: 15 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						{/* Batch Controls Toolbar */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
							<div className="flex items-center gap-3">
								<span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
									Queue ({items.length} file{items.length > 1 ? "s" : ""})
								</span>
								<span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
									{formatBytes(totalOriginalBytes)}
								</span>
								{convertedCount > 0 && (
									<span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
										Converted: {formatBytes(totalConvertedBytes)}
									</span>
								)}
							</div>

							<div className="flex items-center gap-2 flex-wrap">
								<button
									type="button"
									onClick={handleConvertAll}
									disabled={isBatchConverting || validCount === 0}
									className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isBatchConverting ? (
										<RefreshCw className="w-4 h-4 animate-spin" />
									) : (
										<Sparkles className="w-4 h-4" />
									)}
									{isBatchConverting ? "Converting..." : "Convert All"}
								</button>

								{convertedCount > 0 && (
									<button
										type="button"
										onClick={handleDownloadAll}
										className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase transition-all shadow-sm cursor-pointer"
									>
										<Download className="w-4 h-4" />
										Download All ({convertedCount})
									</button>
								)}

								<button
									type="button"
									onClick={handleClearAll}
									className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-500 border border-slate-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer"
									title="Clear queue"
								>
									<Trash2 className="w-4 h-4" />
									Clear All
								</button>
							</div>
						</div>

						{/* Item Cards List */}
						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{items.map((item) => {
									const savings =
										item.convertedSize && item.originalSize
											? calculateSavings(item.originalSize, item.convertedSize)
											: null;

									return (
										<motion.div
											key={item.id}
											layout
											initial={
												reduceMotion
													? false
													: { opacity: 0, y: 15, scale: 0.98 }
											}
											animate={{ opacity: 1, y: 0, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ duration: 0.25 }}
											className={`p-4 sm:p-5 bg-white rounded-3xl border transition-all shadow-xs ${
												item.validation.isValid
													? "border-slate-200/80 hover:border-slate-300"
													: "border-rose-200 bg-rose-50/20"
											}`}
										>
											<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
												{/* Left: Thumbnail & Meta */}
												<div className="flex items-center gap-4 min-w-0">
													{/* Thumbnail Preview */}
													<div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center group">
														{item.validation.isValid ? (
															// eslint-disable-next-line @next/next/no-img-element
															<img
																src={item.previewUrl}
																alt={item.originalName}
																className="w-full h-full object-cover"
															/>
														) : (
															<FileImage className="w-8 h-8 text-rose-400" />
														)}
													</div>

													{/* Filename & Validation Details */}
													<div className="space-y-1.5 min-w-0 flex-1">
														<div className="flex items-center gap-2 flex-wrap">
															<h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-xs sm:max-w-md">
																{item.originalName}
															</h4>

															{/* Validation Badge */}
															{item.status === "validating" ? (
																<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200/60 animate-pulse">
																	<RefreshCw className="w-3 h-3 animate-spin" />
																	Validating Header...
																</span>
															) : item.validation.isValid ? (
																<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
																	<CheckCircle2 className="w-3 h-3 text-emerald-600" />
																	Verified{" "}
																	{item.validation.detectedFormat.toUpperCase()}
																</span>
															) : (
																<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
																	<AlertTriangle className="w-3 h-3 text-rose-600" />
																	Invalid Image Signature
																</span>
															)}
														</div>

														<div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
															<span>
																Original:{" "}
																<strong className="font-mono text-slate-700">
																	{formatBytes(item.originalSize)}
																</strong>
															</span>
															{item.validation.dimensions && (
																<span>
																	• {item.validation.dimensions.width} ×{" "}
																	{item.validation.dimensions.height} px
																</span>
															)}
															{item.convertedSize && (
																<span className="text-indigo-600 font-bold">
																	• Converted:{" "}
																	<strong className="font-mono">
																		{formatBytes(item.convertedSize)}
																	</strong>
																</span>
															)}
															{savings && (
																<span
																	className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-[10px] ${
																		savings.isReduced
																			? "bg-emerald-100 text-emerald-800"
																			: "bg-amber-100 text-amber-800"
																	}`}
																>
																	{savings.text}
																</span>
															)}
														</div>

														{/* Error Message if non-real image */}
														{item.error && (
															<p className="text-xs text-rose-600 font-semibold mt-1">
																{item.error}
															</p>
														)}
													</div>
												</div>

												{/* Right: Controls & Conversion Actions */}
												{item.validation.isValid && (
													<div className="flex flex-wrap items-center gap-3 lg:justify-end">
														{/* Target Format Selector */}
														<div className="flex items-center gap-2">
															<span className="text-xs font-bold text-slate-500 uppercase">
																To:
															</span>
															<select
																value={item.targetFormat}
																onChange={(e) =>
																	updateItem(item.id, {
																		targetFormat: e.target
																			.value as SupportedFormat,
																	})
																}
																className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
															>
																{Object.values(FORMAT_OPTIONS).map((opt) => (
																	<option key={opt.format} value={opt.format}>
																		{opt.label} ({opt.extension})
																	</option>
																))}
															</select>
														</div>

														{/* Target Output Filename Preview */}
														<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-mono font-bold text-slate-600">
															<ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
															{getConvertedFilename(
																item.originalName,
																item.targetFormat,
															)}
														</div>

														{/* Convert Action Button */}
														{item.status === "converted" ? (
															<button
																type="button"
																onClick={() => handleDownloadItem(item)}
																className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase transition-all shadow-xs cursor-pointer"
															>
																<Download className="w-4 h-4" />
																Download
															</button>
														) : (
															<button
																type="button"
																onClick={() => handleConvertItem(item.id)}
																disabled={item.status === "converting"}
																className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold uppercase transition-all shadow-xs cursor-pointer disabled:opacity-50"
															>
																{item.status === "converting" ? (
																	<RefreshCw className="w-4 h-4 animate-spin" />
																) : (
																	<FileCheck className="w-4 h-4" />
																)}
																{item.status === "converting"
																	? "Converting..."
																	: "Convert"}
															</button>
														)}

														{/* Remove Item Button */}
														<button
															type="button"
															onClick={() => handleRemoveItem(item.id)}
															className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
															title="Remove image"
														>
															<Trash2 className="w-4 h-4" />
														</button>
													</div>
												)}
											</div>
										</motion.div>
									);
								})}
							</AnimatePresence>
						</div>
					</motion.div>
				)}

				{/* Feature Highlights & Specifications */}
				<motion.div
					initial={reduceMotion ? false : { opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4"
				>
					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
							<FileCheck className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Real Binary Validation
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Inspects true magic-number byte headers (JPEG, PNG, WebP, GIF,
							BMP, ICO, TIFF, AVIF) to reject corrupted or spoofed files.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
							<Sparkles className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Multi-Format Conversion
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							Seamlessly convert between WebP, Lossless PNG, JPEG, Favicon
							(.ico), AVIF, and BMP with custom quality and scaling controls.
						</p>
					</div>

					<div className="p-6 bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-xs">
						<div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
							<Info className="w-5 h-5" />
						</div>
						<h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
							Privacy & Client Speed
						</h4>
						<p className="text-xs text-slate-600 font-medium leading-relaxed">
							All conversions run entirely within your local browser sandbox.
							Images are never uploaded to any remote server.
						</p>
					</div>
				</motion.div>
			</div>
		</main>
	);
}
