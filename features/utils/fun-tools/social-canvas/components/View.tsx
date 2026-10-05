"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
	ImageIcon,
	Download,
	Upload,
	Type,
	FileText,
	Image as ImageIcon2,
	LayoutGrid,
} from "lucide-react";
import UtilHeader from "@/features/utils/components/UtilHeader";
import { CanvasRenderer, type CanvasRendererRef } from "./CanvasRenderer";
import {
	type AspectRatio,
	type CanvasInputs,
	type TemplateId,
	type TemplateCategory,
	TEMPLATES,
	TEMPLATE_GROUPS,
} from "../types";

export default function SocialCanvasView() {
	const reduceMotion = useReducedMotion();
	const canvasRendererRef = useRef<CanvasRendererRef>(null);

	const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
	const [selectedGroup, setSelectedGroup] = useState<TemplateCategory | "all">(
		"all",
	);
	const [inputs, setInputs] = useState<CanvasInputs>({
		title: "",
		description: "",
		imageSource: null,
		avatarSource: null,
		template: "hero-overlay",
		aspectRatio: "1:1",
	});

	const activeTemplate =
		TEMPLATES.find((t) => t.id === inputs.template) || TEMPLATES[0];
	const fields = activeTemplate.fields;

	const handleFileUpload = (
		e: React.ChangeEvent<HTMLInputElement>,
		field: "imageSource" | "avatarSource",
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			if (typeof event.target?.result === "string") {
				setInputs((prev) => ({
					...prev,
					[field]: event.target!.result as string,
				}));
			}
		};
		reader.readAsDataURL(file);
	};

	// Handle Paste Event for Images
	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			if (e.clipboardData?.items) {
				for (let i = 0; i < e.clipboardData.items.length; i++) {
					if (e.clipboardData.items[i].type.indexOf("image") !== -1) {
						const blob = e.clipboardData.items[i].getAsFile();
						if (blob) {
							const reader = new FileReader();
							reader.onload = (event) => {
								if (typeof event.target?.result === "string") {
									setInputs((prev) => ({
										...prev,
										imageSource: event.target!.result as string,
									}));
								}
							};
							reader.readAsDataURL(blob);
						}
					}
				}
			}
		};
		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, []);

	// Handle Export
	const handleExport = () => {
		if (canvasRendererRef.current) {
			const dataUrl = canvasRendererRef.current.exportCanvas();
			if (dataUrl) {
				const link = document.createElement("a");
				link.download = `social-canvas-${inputs.template}-${Date.now()}.png`;
				link.href = dataUrl;
				link.click();
			}
		}
	};

	return (
		<main className="min-h-screen bg-slate-50/80 bg-dot-pattern relative pb-32 sm:pb-36 overflow-x-hidden">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 relative z-10 space-y-6 sm:space-y-8">
				<UtilHeader
					title="Faceless Social Canvas"
					description="Generate clean, high-fidelity social media images and templates tailored for faceless accounts."
					icon={ImageIcon}
					category={{
						color: "purple",
					}}
					actions={
						<div className="w-full space-y-3">
							{/* Category Filter Tabs */}
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
								<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
									Group:
								</span>
								<button
									type="button"
									onClick={() => setSelectedGroup("all")}
									className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 ${
										selectedGroup === "all"
											? "bg-slate-900 text-white shadow-xs"
											: "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
									}`}
								>
									<span>All Templates</span>
									<span
										className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
											selectedGroup === "all"
												? "bg-slate-800 text-slate-300"
												: "bg-slate-100 text-slate-500"
										}`}
									>
										{TEMPLATES.length}
									</span>
								</button>
								{TEMPLATE_GROUPS.map((grp) => {
									const count = TEMPLATES.filter(
										(t) => t.group === grp.id,
									).length;
									const isCurrentGroup = selectedGroup === grp.id;
									const hasActiveTemplate = activeTemplate.group === grp.id;
									return (
										<button
											key={grp.id}
											type="button"
											onClick={() => setSelectedGroup(grp.id)}
											className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 touch-manipulation cursor-pointer active:scale-95 ${
												isCurrentGroup
													? "bg-slate-900 text-white shadow-xs"
													: "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
											}`}
										>
											<span>{grp.label}</span>
											<span
												className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
													isCurrentGroup
														? "bg-slate-800 text-slate-300"
														: "bg-slate-100 text-slate-500"
												}`}
											>
												{count}
											</span>
											{hasActiveTemplate && selectedGroup !== grp.id && (
												<span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
											)}
										</button>
									);
								})}
							</div>

							{/* Template Buttons (Grouped View or Filtered View) */}
							{selectedGroup === "all" ? (
								<div className="space-y-2.5 pt-1">
									{TEMPLATE_GROUPS.map((grp) => {
										const groupTemplates = TEMPLATES.filter(
											(t) => t.group === grp.id,
										);
										return (
											<div key={grp.id} className="space-y-1.5">
												<div className="flex items-center gap-2">
													<span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
														{grp.label}
													</span>
													<div className="h-[1px] flex-1 bg-slate-100" />
												</div>
												<div className="flex flex-wrap items-center gap-2">
													{groupTemplates.map((tpl) => (
														<button
															key={tpl.id}
															type="button"
															onClick={() =>
																setInputs((prev) => ({
																	...prev,
																	template: tpl.id,
																}))
															}
															className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer active:scale-95 ${
																inputs.template === tpl.id
																	? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/10"
																	: "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
															}`}
														>
															{tpl.label}
														</button>
													))}
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex flex-wrap items-center gap-2 pt-1">
									{TEMPLATES.filter((t) => t.group === selectedGroup).map(
										(tpl) => (
											<button
												key={tpl.id}
												type="button"
												onClick={() =>
													setInputs((prev) => ({ ...prev, template: tpl.id }))
												}
												className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer active:scale-95 ${
													inputs.template === tpl.id
														? "bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/10"
														: "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
												}`}
											>
												{tpl.label}
											</button>
										),
									)}
								</div>
							)}
						</div>
					}
				/>

				{/* Mobile Mode Switcher (Editor vs Canvas Preview) */}
				<div className="flex lg:hidden items-center p-1 bg-slate-200/80 rounded-2xl gap-1">
					<button
						type="button"
						onClick={() => setMobileTab("editor")}
						className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all touch-manipulation cursor-pointer ${
							mobileTab === "editor"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<Type className="w-3.5 h-3.5" />
						<span>Editor & Inputs</span>
					</button>
					<button
						type="button"
						onClick={() => setMobileTab("preview")}
						className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all touch-manipulation cursor-pointer ${
							mobileTab === "preview"
								? "bg-white text-slate-900 shadow-xs"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<ImageIcon className="w-3.5 h-3.5" />
						<span>Live Preview</span>
						<span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
							{inputs.aspectRatio}
						</span>
					</button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
					{/* Left Column: Input Form (5 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: -16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
						className={`lg:col-span-5 space-y-6 ${mobileTab === "editor" ? "block" : "hidden lg:block"}`}
					>
						<div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
							{/* Template Selector with optgroup */}
							<div className="space-y-1.5">
								<div className="flex items-center justify-between">
									<label
										htmlFor="template-select"
										className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
									>
										<LayoutGrid className="w-3.5 h-3.5" />
										Template
									</label>
									<span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-md">
										{
											TEMPLATE_GROUPS.find((g) => g.id === activeTemplate.group)
												?.label
										}
									</span>
								</div>
								<select
									id="template-select"
									value={inputs.template}
									onChange={(e) => {
										const nextId = e.target.value as TemplateId;
										setInputs((prev) => ({ ...prev, template: nextId }));
										const found = TEMPLATES.find((t) => t.id === nextId);
										if (found && selectedGroup !== "all") {
											setSelectedGroup(found.group);
										}
									}}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer transition-all"
								>
									{TEMPLATE_GROUPS.map((grp) => (
										<optgroup key={grp.id} label={grp.label}>
											{TEMPLATES.filter((t) => t.group === grp.id).map(
												(tpl) => (
													<option key={tpl.id} value={tpl.id}>
														{tpl.label}
													</option>
												),
											)}
										</optgroup>
									))}
								</select>
							</div>

							{/* Aspect Ratio Selector (Now at the top) */}
							<div className="space-y-2">
								<span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
									Canvas Ratio
								</span>
								<div className="grid grid-cols-4 gap-2">
									{(["1:1", "4:5", "9:16", "16:9"] as AspectRatio[]).map(
										(ratio) => (
											<button
												key={ratio}
												type="button"
												onClick={() =>
													setInputs((prev) => ({ ...prev, aspectRatio: ratio }))
												}
												className={`py-2 rounded-xl text-xs font-bold transition-all border ${
													inputs.aspectRatio === ratio
														? "bg-slate-900 text-white border-slate-900 shadow-xs"
														: "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
												}`}
											>
												{ratio}
											</button>
										),
									)}
								</div>
							</div>

							{/* Theme Selector (Conditional) */}
							{fields.hasTheme && (
								<div className="space-y-2">
									<span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
										Text Color Theme
									</span>
									<div className="grid grid-cols-2 gap-2">
										<button
											type="button"
											onClick={() =>
												setInputs((prev) => ({ ...prev, theme: "dark" }))
											}
											className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
												inputs.theme !== "light"
													? "bg-slate-900 text-white border-slate-900 shadow-xs"
													: "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
											}`}
										>
											<div className="w-3 h-3 rounded-full bg-slate-900 ring-2 ring-white/20" />
											Dark Text
										</button>
										<button
											type="button"
											onClick={() =>
												setInputs((prev) => ({ ...prev, theme: "light" }))
											}
											className={`py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
												inputs.theme === "light"
													? "bg-slate-900 text-white border-slate-900 shadow-xs"
													: "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
											}`}
										>
											<div className="w-3 h-3 rounded-full bg-white ring-2 ring-slate-200" />
											Light Text
										</button>
									</div>
								</div>
							)}

							{/* Title Input */}
							<div className="space-y-1.5">
								<label
									htmlFor="canvas-title-input"
									className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
								>
									<Type className="w-3.5 h-3.5" />
									{fields.titleLabel}
								</label>
								<input
									id="canvas-title-input"
									type="text"
									value={inputs.title}
									onChange={(e) =>
										setInputs((prev) => ({ ...prev, title: e.target.value }))
									}
									placeholder={`Enter ${fields.titleLabel.toLowerCase()}...`}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
								/>
							</div>

							{/* Description Input */}
							<div className="space-y-1.5">
								<label
									htmlFor="canvas-desc-input"
									className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
								>
									<FileText className="w-3.5 h-3.5" />
									{fields.descriptionLabel}
								</label>
								<textarea
									id="canvas-desc-input"
									value={inputs.description}
									onChange={(e) =>
										setInputs((prev) => ({
											...prev,
											description: e.target.value,
										}))
									}
									placeholder={`Enter ${fields.descriptionLabel.toLowerCase()}...`}
									rows={4}
									className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
								/>
							</div>

							{/* Dynamic Avatar Upload Zone (if required) */}
							{fields.hasAvatar && (
								<div className="space-y-1.5">
									<label
										htmlFor="avatar-file-input"
										className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
									>
										<ImageIcon2 className="w-3.5 h-3.5" />
										Avatar Image
									</label>
									<div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center transition-colors hover:border-slate-300 group">
										<input
											id="avatar-file-input"
											type="file"
											accept="image/*"
											onChange={(e) => handleFileUpload(e, "avatarSource")}
											className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
										/>
										<Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-purple-500 transition-colors" />
										<p className="text-sm font-bold text-slate-700">
											Click to upload avatar
										</p>
										{inputs.avatarSource && (
											<div className="mt-4 p-2 bg-white rounded-lg shadow-xs border border-slate-100 flex items-center gap-2">
												<div className="w-2 h-2 rounded-full bg-emerald-500" />
												<span className="text-xs font-bold text-slate-700">
													Avatar Loaded
												</span>
											</div>
										)}
									</div>
									{/* Avatar Panning Controls */}
									{inputs.avatarSource && (
										<div className="mt-2 space-y-4 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<label
														htmlFor="avatar-pan-x"
														className="text-xs font-bold text-slate-700 cursor-pointer"
													>
														Avatar Pan X
													</label>
													<span className="text-xs font-medium text-slate-500 font-mono">
														{Math.round((inputs.avatarOffsetX ?? 0.5) * 100)}%
													</span>
												</div>
												<input
													id="avatar-pan-x"
													type="range"
													min="0"
													max="1"
													step="0.01"
													value={inputs.avatarOffsetX ?? 0.5}
													onChange={(e) =>
														setInputs((prev) => ({
															...prev,
															avatarOffsetX: parseFloat(e.target.value),
														}))
													}
													className="w-full accent-slate-900 cursor-pointer"
												/>
											</div>
											<div className="space-y-2">
												<div className="flex items-center justify-between">
													<label
														htmlFor="avatar-pan-y"
														className="text-xs font-bold text-slate-700 cursor-pointer"
													>
														Avatar Pan Y
													</label>
													<span className="text-xs font-medium text-slate-500 font-mono">
														{Math.round((inputs.avatarOffsetY ?? 0.5) * 100)}%
													</span>
												</div>
												<input
													id="avatar-pan-y"
													type="range"
													min="0"
													max="1"
													step="0.01"
													value={inputs.avatarOffsetY ?? 0.5}
													onChange={(e) =>
														setInputs((prev) => ({
															...prev,
															avatarOffsetY: parseFloat(e.target.value),
														}))
													}
													className="w-full accent-slate-900 cursor-pointer"
												/>
											</div>
										</div>
									)}
								</div>
							)}

							{/* Image Upload/Paste Zone */}
							<div className="space-y-1.5">
								<label
									htmlFor="image-file-input"
									className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer"
								>
									<ImageIcon2 className="w-3.5 h-3.5" />
									{fields.imageLabel}
								</label>
								<div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6 flex flex-col items-center justify-center text-center transition-colors hover:border-slate-300 group">
									<input
										id="image-file-input"
										type="file"
										accept="image/*"
										onChange={(e) => handleFileUpload(e, "imageSource")}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
									/>
									<Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-purple-500 transition-colors" />
									<p className="text-sm font-bold text-slate-700">
										Click or tap to upload image
									</p>
									<p className="text-xs font-medium text-slate-500 mt-1">
										<span className="hidden sm:inline">
											Or press{" "}
											<kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-600 shadow-sm mx-1">
												Ctrl+V
											</kbd>{" "}
											to paste from clipboard
										</span>
										<span className="sm:hidden">
											Photo library & camera supported
										</span>
									</p>
									{inputs.imageSource && (
										<div className="mt-4 p-2 bg-white rounded-lg shadow-xs border border-slate-100 flex items-center gap-2">
											<div className="w-2 h-2 rounded-full bg-emerald-500" />
											<span className="text-xs font-bold text-slate-700">
												Image Loaded
											</span>
										</div>
									)}
								</div>

								{/* Image Panning Controls */}
								{inputs.imageSource && (
									<div className="mt-2 space-y-4 bg-slate-50/50 border border-slate-200 rounded-2xl p-4">
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<label
													htmlFor="image-pan-x"
													className="text-xs font-bold text-slate-700 cursor-pointer"
												>
													Pan Horizontal (X)
												</label>
												<span className="text-xs font-medium text-slate-500 font-mono">
													{Math.round((inputs.imageOffsetX ?? 0.5) * 100)}%
												</span>
											</div>
											<input
												id="image-pan-x"
												type="range"
												min="0"
												max="1"
												step="0.01"
												value={inputs.imageOffsetX ?? 0.5}
												onChange={(e) =>
													setInputs((prev) => ({
														...prev,
														imageOffsetX: parseFloat(e.target.value),
													}))
												}
												className="w-full accent-slate-900 cursor-pointer"
											/>
										</div>
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<label
													htmlFor="image-pan-y"
													className="text-xs font-bold text-slate-700 cursor-pointer"
												>
													Pan Vertical (Y)
												</label>
												<span className="text-xs font-medium text-slate-500 font-mono">
													{Math.round((inputs.imageOffsetY ?? 0.5) * 100)}%
												</span>
											</div>
											<input
												id="image-pan-y"
												type="range"
												min="0"
												max="1"
												step="0.01"
												value={inputs.imageOffsetY ?? 0.5}
												onChange={(e) =>
													setInputs((prev) => ({
														...prev,
														imageOffsetY: parseFloat(e.target.value),
													}))
												}
												className="w-full accent-slate-900 cursor-pointer"
											/>
										</div>
									</div>
								)}
							</div>

							{/* Mobile Preview Trigger Button */}
							<div className="pt-2 lg:hidden">
								<button
									type="button"
									onClick={() => setMobileTab("preview")}
									className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95 touch-manipulation cursor-pointer"
								>
									<ImageIcon className="w-4 h-4" />
									<span>View Live Canvas Preview ({inputs.aspectRatio}) →</span>
								</button>
							</div>
						</div>
					</motion.div>

					{/* Right Column: Canvas Preview (7 cols) */}
					<motion.div
						initial={reduceMotion ? false : { opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
						className={`lg:col-span-7 space-y-4 flex flex-col ${mobileTab === "preview" ? "block" : "hidden lg:flex"}`}
					>
						<div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col flex-1">
							{/* Dedicated Canvas Preview Header Bar */}
							<div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-white">
								<div className="flex items-center gap-2 min-w-0">
									<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
									<span className="text-xs font-bold text-slate-800 tracking-tight truncate">
										{activeTemplate.label}
									</span>
									<span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold shrink-0">
										{inputs.aspectRatio}
									</span>
								</div>
								<button
									type="button"
									onClick={handleExport}
									className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs text-xs font-bold transition-all active:scale-95 touch-manipulation shrink-0 cursor-pointer"
								>
									<Download className="w-3.5 h-3.5" />
									<span>Export Image</span>
								</button>
							</div>

							{/* Canvas Stage Container */}
							<div className="p-3 sm:p-5 flex-1 flex items-center justify-center bg-slate-50/50">
								<CanvasRenderer ref={canvasRendererRef} inputs={inputs} />
							</div>
						</div>

						{/* Mobile Back to Editor Button */}
						<div className="lg:hidden">
							<button
								type="button"
								onClick={() => setMobileTab("editor")}
								className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-200 shadow-2xs transition-all active:scale-95 touch-manipulation cursor-pointer"
							>
								<Type className="w-3.5 h-3.5" />
								<span>← Back to Editor Controls</span>
							</button>
						</div>
					</motion.div>
				</div>
			</div>
		</main>
	);
}
