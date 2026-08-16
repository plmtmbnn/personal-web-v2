"use client";

import type React from "react";
import { useState, useRef } from "react";
import {
	Palette,
	Shapes,
	Image as ImageIcon,
	Sliders,
	Square,
	Upload,
	Trash2,
} from "lucide-react";
import type {
	DotStyle,
	ErrorCorrectionLevel,
	EyeBallStyle,
	EyeFrameStyle,
	FrameStyle,
	QRStyleConfig,
} from "../types";
import { PRESET_LOGOS, PRESET_THEMES } from "../data/presets";

interface StyleEditorProps {
	config: QRStyleConfig;
	setConfig: React.Dispatch<React.SetStateAction<QRStyleConfig>>;
}

const SECTIONS = [
	{ id: "colors", label: "Colors & Themes", icon: Palette },
	{ id: "shapes", label: "Shapes & Eyes", icon: Shapes },
	{ id: "logo", label: "Center Logo", icon: ImageIcon },
	{ id: "frame", label: "Frame & Badge", icon: Square },
	{ id: "advanced", label: "ECC & Margin", icon: Sliders },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function StyleEditor({ config, setConfig }: StyleEditorProps) {
	const [activeSection, setActiveSection] = useState<SectionId>("colors");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 2 * 1024 * 1024) {
			alert("Please upload an image smaller than 2MB.");
			return;
		}

		const reader = new FileReader();
		reader.onload = (ev) => {
			const dataUrl = ev.target?.result as string;
			setConfig((prev) => ({
				...prev,
				errorCorrectionLevel: "H", // Auto switch to High ECC for logo clarity
				logo: {
					...prev.logo,
					type: "custom",
					customDataUrl: dataUrl,
				},
			}));
		};
		reader.readAsDataURL(file);
	};

	const applyTheme = (themeId: string) => {
		const theme = PRESET_THEMES.find((t) => t.id === themeId);
		if (!theme) return;

		setConfig((prev) => ({
			...prev,
			fgColor: theme.fgColor,
			bgColor: theme.bgColor,
			transparentBg: false,
			customEyeColors: false,
			eyeFrameColor: theme.fgColor,
			eyeBallColor: theme.fgColor,
		}));
	};

	return (
		<div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6">
			{/* Section Header Navigation */}
			<div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-100 pb-4">
				{SECTIONS.map((sec) => {
					const Icon = sec.icon;
					const isActive = activeSection === sec.id;
					return (
						<button
							key={sec.id}
							type="button"
							onClick={() => setActiveSection(sec.id)}
							className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
								isActive
									? "bg-slate-900 text-white shadow-xs"
									: "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
							}`}
						>
							<Icon className="w-3.5 h-3.5" />
							<span>{sec.label}</span>
						</button>
					);
				})}
			</div>

			{/* Colors & Themes Section */}
			{activeSection === "colors" && (
				<div className="space-y-5">
					{/* Theme Presets */}
					<div>
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
							Curated Color Presets
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{PRESET_THEMES.map((theme) => {
								const isSelected =
									config.fgColor === theme.fgColor &&
									config.bgColor === theme.bgColor &&
									!config.transparentBg;
								return (
									<button
										key={theme.id}
										type="button"
										onClick={() => applyTheme(theme.id)}
										className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
											isSelected
												? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
												: "border-slate-200 hover:border-slate-300 bg-slate-50/50"
										}`}
									>
										<div
											className="w-6 h-6 rounded-lg shrink-0 border border-black/10 flex items-center justify-center shadow-2xs"
											style={{ backgroundColor: theme.fgColor }}
										>
											<div
												className="w-2 h-2 rounded-full"
												style={{ backgroundColor: theme.bgColor }}
											/>
										</div>
										<span className="text-xs font-bold text-slate-800 truncate">
											{theme.name}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Custom Hex / Color Pickers */}
					<div className="border-t border-slate-100 pt-4 space-y-4">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
							Custom Palette
						</span>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{/* Foreground Color */}
							<div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
								<div>
									<span className="text-xs font-bold text-slate-800 block">
										Foreground / Dots
									</span>
									<span className="text-[11px] font-mono text-slate-500 uppercase">
										{config.fgColor}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={config.fgColor}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												fgColor: e.target.value,
											}))
										}
										className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent p-0"
									/>
								</div>
							</div>

							{/* Background Color */}
							<div
								className={`flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 transition-opacity ${
									config.transparentBg ? "opacity-50 pointer-events-none" : ""
								}`}
							>
								<div>
									<span className="text-xs font-bold text-slate-800 block">
										Background
									</span>
									<span className="text-[11px] font-mono text-slate-500 uppercase">
										{config.bgColor}
									</span>
								</div>
								<div className="flex items-center gap-2">
									<input
										type="color"
										value={config.bgColor}
										disabled={config.transparentBg}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												bgColor: e.target.value,
											}))
										}
										className="w-9 h-9 rounded-lg cursor-pointer border-0 bg-transparent p-0"
									/>
								</div>
							</div>
						</div>

						{/* Transparent Background Toggle */}
						<label className="flex items-center gap-2.5 cursor-pointer select-none">
							<input
								type="checkbox"
								checked={config.transparentBg}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										transparentBg: e.target.checked,
									}))
								}
								className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
							/>
							<span className="text-xs font-semibold text-slate-700">
								Transparent Background (PNG / SVG only)
							</span>
						</label>

						{/* Custom Eye Colors Toggle */}
						<div className="border-t border-slate-100 pt-3 space-y-3">
							<label className="flex items-center gap-2.5 cursor-pointer select-none">
								<input
									type="checkbox"
									checked={config.customEyeColors}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											customEyeColors: e.target.checked,
										}))
									}
									className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
								/>
								<span className="text-xs font-semibold text-slate-700">
									Customize Corner Eye Colors Independently
								</span>
							</label>

							{config.customEyeColors && (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6">
									<div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
										<span className="text-xs font-medium text-slate-700">
											Eye Outer Frame
										</span>
										<input
											type="color"
											value={config.eyeFrameColor}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													eyeFrameColor: e.target.value,
												}))
											}
											className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
										/>
									</div>
									<div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
										<span className="text-xs font-medium text-slate-700">
											Eye Center Ball
										</span>
										<input
											type="color"
											value={config.eyeBallColor}
											onChange={(e) =>
												setConfig((prev) => ({
													...prev,
													eyeBallColor: e.target.value,
												}))
											}
											className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
										/>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Shapes & Eyes Section */}
			{activeSection === "shapes" && (
				<div className="space-y-6">
					{/* Dot Style */}
					<div>
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
							Matrix Dot Pattern
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{[
								{ id: "square", label: "Classic Square" },
								{ id: "rounded", label: "Smooth Rounded" },
								{ id: "dots", label: "Circular Dots" },
								{ id: "classy", label: "Classy Squircle" },
							].map((dot) => (
								<button
									key={dot.id}
									type="button"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											dotStyle: dot.id as DotStyle,
										}))
									}
									className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
										config.dotStyle === dot.id
											? "border-indigo-600 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-600/20"
											: "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100"
									}`}
								>
									{dot.label}
								</button>
							))}
						</div>
					</div>

					{/* Eye Frame Style */}
					<div className="border-t border-slate-100 pt-4">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
							Corner Eye Frame (Outer)
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{[
								{ id: "square", label: "Square" },
								{ id: "rounded", label: "Rounded" },
								{ id: "circle", label: "Circle" },
								{ id: "leaf", label: "Leaf / Teardrop" },
							].map((eye) => (
								<button
									key={eye.id}
									type="button"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											eyeFrameStyle: eye.id as EyeFrameStyle,
										}))
									}
									className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
										config.eyeFrameStyle === eye.id
											? "border-indigo-600 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-600/20"
											: "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100"
									}`}
								>
									{eye.label}
								</button>
							))}
						</div>
					</div>

					{/* Eye Inner Ball Style */}
					<div className="border-t border-slate-100 pt-4">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
							Corner Eye Ball (Inner)
						</span>
						<div className="grid grid-cols-3 gap-2.5">
							{[
								{ id: "square", label: "Square Ball" },
								{ id: "rounded", label: "Rounded Ball" },
								{ id: "circle", label: "Circle Ball" },
							].map((ball) => (
								<button
									key={ball.id}
									type="button"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											eyeBallStyle: ball.id as EyeBallStyle,
										}))
									}
									className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
										config.eyeBallStyle === ball.id
											? "border-indigo-600 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-600/20"
											: "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100"
									}`}
								>
									{ball.label}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Center Logo Section */}
			{activeSection === "logo" && (
				<div className="space-y-5">
					<div className="flex items-center justify-between">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
							Center Icon / Branding
						</span>
						{config.logo.type !== "none" && (
							<button
								type="button"
								onClick={() =>
									setConfig((prev) => ({
										...prev,
										logo: { ...prev.logo, type: "none" },
									}))
								}
								className="text-[11px] font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 cursor-pointer"
							>
								<Trash2 className="w-3 h-3" />
								Remove Logo
							</button>
						)}
					</div>

					{/* Logo Type Selector */}
					<div className="grid grid-cols-3 gap-2.5">
						<button
							type="button"
							onClick={() =>
								setConfig((prev) => ({
									...prev,
									logo: { ...prev.logo, type: "none" },
								}))
							}
							className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
								config.logo.type === "none"
									? "border-indigo-600 bg-indigo-50 text-indigo-700"
									: "border-slate-200 text-slate-600 hover:bg-slate-50"
							}`}
						>
							No Logo
						</button>
						<button
							type="button"
							onClick={() =>
								setConfig((prev) => ({
									...prev,
									errorCorrectionLevel: "H",
									logo: {
										...prev.logo,
										type: "preset",
										presetId: prev.logo.presetId || "globe",
									},
								}))
							}
							className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
								config.logo.type === "preset"
									? "border-indigo-600 bg-indigo-50 text-indigo-700"
									: "border-slate-200 text-slate-600 hover:bg-slate-50"
							}`}
						>
							Preset Icon
						</button>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className={`p-3 rounded-xl border text-center font-bold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer ${
								config.logo.type === "custom"
									? "border-indigo-600 bg-indigo-50 text-indigo-700"
									: "border-slate-200 text-slate-600 hover:bg-slate-50"
							}`}
						>
							<Upload className="w-3.5 h-3.5" />
							Upload Custom
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/png,image/jpeg,image/svg+xml"
							onChange={handleImageUpload}
							className="hidden"
						/>
					</div>

					{/* Preset Logos Grid */}
					{config.logo.type === "preset" && (
						<div className="space-y-2 border-t border-slate-100 pt-4">
							<span className="text-[11px] font-bold uppercase text-slate-500 block">
								Select Preset Icon
							</span>
							<div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
								{PRESET_LOGOS.map((logo) => {
									const isSelected = config.logo.presetId === logo.id;
									return (
										<button
											key={logo.id}
											type="button"
											onClick={() =>
												setConfig((prev) => ({
													...prev,
													errorCorrectionLevel: "H",
													logo: {
														...prev.logo,
														type: "preset",
														presetId: logo.id,
													},
												}))
											}
											className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
												isSelected
													? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20 text-indigo-600"
													: "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100"
											}`}
											title={logo.name}
										>
											<svg
												className="w-5 h-5 fill-current"
												viewBox={logo.viewBox || "0 0 24 24"}
											>
												<path d={logo.svgPath} />
											</svg>
											<span className="text-[9px] font-bold truncate max-w-full">
												{logo.name}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					)}

					{/* Custom Image Preview & Reselect */}
					{config.logo.type === "custom" && config.logo.customDataUrl && (
						<div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
							<img
								src={config.logo.customDataUrl}
								alt="Custom logo"
								className="w-12 h-12 rounded-lg object-contain bg-white border border-slate-200 p-1"
							/>
							<div className="flex-1 min-w-0">
								<span className="text-xs font-bold text-slate-800 block">
									Custom Image Loaded
								</span>
								<span className="text-[11px] text-slate-500">
									High Error Correction Level (H - 30%) enabled
								</span>
							</div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
							>
								Change
							</button>
						</div>
					)}

					{/* Logo Size Ratio Slider */}
					{config.logo.type !== "none" && (
						<div className="space-y-2 border-t border-slate-100 pt-3">
							<div className="flex items-center justify-between">
								<span className="text-xs font-bold text-slate-700">
									Logo Scale / Size
								</span>
								<span className="text-xs font-mono text-slate-500">
									{Math.round(config.logo.sizeRatio * 100)}%
								</span>
							</div>
							<input
								type="range"
								min="0.15"
								max="0.28"
								step="0.01"
								value={config.logo.sizeRatio}
								onChange={(e) =>
									setConfig((prev) => ({
										...prev,
										logo: {
											...prev.logo,
											sizeRatio: Number.parseFloat(e.target.value),
										},
									}))
								}
								className="w-full accent-indigo-600 cursor-pointer"
							/>
						</div>
					)}
				</div>
			)}

			{/* Frame & Banner Section */}
			{activeSection === "frame" && (
				<div className="space-y-5">
					<div>
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
							Frame Style & Banner
						</span>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{[
								{ id: "none", label: "No Frame" },
								{ id: "bottom-banner", label: "Bottom Banner" },
								{ id: "top-badge", label: "Top Badge" },
								{ id: "card", label: "Card Frame" },
							].map((frame) => (
								<button
									key={frame.id}
									type="button"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											frame: {
												...prev.frame,
												style: frame.id as FrameStyle,
											},
										}))
									}
									className={`p-3 rounded-xl border text-center font-bold text-xs cursor-pointer ${
										config.frame.style === frame.id
											? "border-indigo-600 bg-indigo-50/60 text-indigo-700 ring-2 ring-indigo-600/20"
											: "border-slate-200 text-slate-700 bg-slate-50/50 hover:bg-slate-100"
									}`}
								>
									{frame.label}
								</button>
							))}
						</div>
					</div>

					{config.frame.style !== "none" && (
						<div className="space-y-4 border-t border-slate-100 pt-4">
							<div className="space-y-1.5">
								<label
									htmlFor="qr-frame-text"
									className="block text-xs font-bold uppercase tracking-wider text-slate-700"
								>
									Frame Callout Text
								</label>
								<input
									id="qr-frame-text"
									type="text"
									value={config.frame.text}
									onChange={(e) =>
										setConfig((prev) => ({
											...prev,
											frame: {
												...prev.frame,
												text: e.target.value,
											},
										}))
									}
									placeholder="SCAN ME"
									maxLength={24}
									className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
									<span className="text-xs font-medium text-slate-700">
										Banner Color
									</span>
									<input
										type="color"
										value={config.frame.bgColor || config.fgColor}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												frame: {
													...prev.frame,
													bgColor: e.target.value,
												},
											}))
										}
										className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
									/>
								</div>
								<div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
									<span className="text-xs font-medium text-slate-700">
										Text Color
									</span>
									<input
										type="color"
										value={config.frame.textColor}
										onChange={(e) =>
											setConfig((prev) => ({
												...prev,
												frame: {
													...prev.frame,
													textColor: e.target.value,
												},
											}))
										}
										className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0"
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Advanced: Error Correction & Margin */}
			{activeSection === "advanced" && (
				<div className="space-y-6">
					{/* Error Correction Level */}
					<div>
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
							Error Correction Capability (ECC)
						</span>
						<p className="text-xs text-slate-500 mb-3">
							Higher redundancy preserves scannability even if part of the QR
							code is obscured, dirty, or covered by a logo.
						</p>
						<div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
							{[
								{ id: "L", label: "Low (7%)", desc: "Smallest size" },
								{ id: "M", label: "Medium (15%)", desc: "Standard" },
								{ id: "Q", label: "Quartile (25%)", desc: "High recovery" },
								{ id: "H", label: "High (30%)", desc: "Best for logos" },
							].map((ecc) => (
								<button
									key={ecc.id}
									type="button"
									onClick={() =>
										setConfig((prev) => ({
											...prev,
											errorCorrectionLevel: ecc.id as ErrorCorrectionLevel,
										}))
									}
									className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
										config.errorCorrectionLevel === ecc.id
											? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
											: "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
									}`}
								>
									<span className="text-xs font-bold text-slate-900 block">
										{ecc.label}
									</span>
									<span className="text-[11px] text-slate-500">{ecc.desc}</span>
								</button>
							))}
						</div>
					</div>

					{/* Quiet Zone / Margin */}
					<div className="border-t border-slate-100 pt-4 space-y-2">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-slate-700">
								Quiet Zone Margin (Modules)
							</span>
							<span className="text-xs font-mono font-bold text-slate-700">
								{config.margin} blocks
							</span>
						</div>
						<input
							type="range"
							min="0"
							max="6"
							step="1"
							value={config.margin}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									margin: Number.parseInt(e.target.value, 10),
								}))
							}
							className="w-full accent-indigo-600 cursor-pointer"
						/>
						<p className="text-[11px] text-slate-500">
							Recommended margin is 2 to 4 blocks for maximum reader
							compatibility.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
