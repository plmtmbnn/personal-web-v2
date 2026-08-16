"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
	Download,
	Copy,
	Check,
	Printer,
	Code2,
	ChevronDown,
	ChevronUp,
	FileCode,
	Zap,
} from "lucide-react";
import type { QRStyleConfig } from "../types";
import { renderQRToCanvas, generateQRSVG } from "../utils/renderer";

interface QRPreviewProps {
	payloadString: string;
	config: QRStyleConfig;
	payloadType: string;
}

export default function QRPreview({
	payloadString,
	config,
	payloadType,
}: QRPreviewProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [exportSize, setExportSize] = useState<512 | 1024 | 2048>(1024);
	const [copiedImage, setCopiedImage] = useState(false);
	const [copiedPayload, setCopiedPayload] = useState(false);
	const [showPayloadInspector, setShowPayloadInspector] = useState(false);
	const [renderError, setRenderError] = useState(false);

	// Re-render QR code to canvas whenever payload or config changes
	const renderQR = useCallback(async () => {
		if (!canvasRef.current || !payloadString.trim()) {
			setRenderError(false);
			return;
		}

		try {
			const success = await renderQRToCanvas(
				canvasRef.current,
				payloadString,
				config,
				512, // display canvas resolution
			);
			setRenderError(!success);
		} catch (e) {
			console.error("Rendering error:", e);
			setRenderError(true);
		}
	}, [payloadString, config]);

	useEffect(() => {
		renderQR();
	}, [renderQR]);

	// Download PNG
	const handleDownloadPNG = async () => {
		if (!payloadString.trim()) return;

		const offscreenCanvas = document.createElement("canvas");
		const success = await renderQRToCanvas(
			offscreenCanvas,
			payloadString,
			config,
			exportSize,
		);

		if (!success) return;

		const link = document.createElement("a");
		link.download = `qrcode-${payloadType}-${Date.now()}.png`;
		link.href = offscreenCanvas.toDataURL("image/png");
		link.click();
	};

	// Download SVG
	const handleDownloadSVG = () => {
		if (!payloadString.trim()) return;

		const svgString = generateQRSVG(payloadString, config, 1024);
		if (!svgString) return;

		const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = `qrcode-${payloadType}-${Date.now()}.svg`;
		link.href = url;
		link.click();
		URL.revokeObjectURL(url);
	};

	// Copy PNG to Clipboard
	const handleCopyImage = async () => {
		if (!payloadString.trim()) return;

		try {
			const offscreenCanvas = document.createElement("canvas");
			await renderQRToCanvas(
				offscreenCanvas,
				payloadString,
				config,
				exportSize,
			);

			offscreenCanvas.toBlob(async (blob) => {
				if (!blob) return;
				await navigator.clipboard.write([
					new ClipboardItem({ "image/png": blob }),
				]);
				setCopiedImage(true);
				setTimeout(() => setCopiedImage(false), 2000);
			}, "image/png");
		} catch (e) {
			console.error("Failed to copy image to clipboard:", e);
		}
	};

	// Copy Raw Payload String
	const handleCopyPayload = () => {
		if (!payloadString.trim()) return;
		navigator.clipboard.writeText(payloadString);
		setCopiedPayload(true);
		setTimeout(() => setCopiedPayload(false), 2000);
	};

	// Print QR
	const handlePrint = () => {
		window.print();
	};

	const hasContent = payloadString.trim().length > 0;

	return (
		<div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6 lg:sticky lg:top-24">
			{/* Preview Card Header */}
			<div className="flex items-center justify-between pb-3 border-b border-slate-100">
				<div className="flex items-center gap-2">
					<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-xs font-bold uppercase tracking-wider text-slate-800">
						Live QR Output
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
						ECC: {config.errorCorrectionLevel}
					</span>
					<span className="text-[10px] font-bold text-slate-400 font-mono">
						{payloadString.length} bytes
					</span>
				</div>
			</div>

			{/* Canvas Preview Area */}
			<div className="flex flex-col items-center justify-center">
				<div
					className={`relative rounded-2xl border border-slate-200/80 p-4 transition-all flex items-center justify-center overflow-hidden max-w-[320px] sm:max-w-[360px] w-full aspect-square ${
						config.transparentBg
							? "bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]"
							: "bg-slate-50/50"
					}`}
				>
					{hasContent && !renderError ? (
						<canvas
							ref={canvasRef}
							className="max-w-full max-h-full rounded-xl shadow-xs object-contain"
							style={{
								width: "100%",
								height: "auto",
								aspectRatio:
									config.frame.style !== "none" &&
									config.frame.text.trim().length > 0
										? "1 / 1.16"
										: "1 / 1",
							}}
						/>
					) : (
						<div className="text-center p-6 space-y-2">
							<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
								<Zap className="w-6 h-6" />
							</div>
							<p className="text-xs font-bold text-slate-700">
								{renderError
									? "Payload exceeds QR capacity"
									: "Enter data to generate code"}
							</p>
							<p className="text-[11px] text-slate-400">
								{renderError
									? "Try lowering Error Correction Level or shortening text"
									: "Fill in the fields on the left"}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Export Resolution & Quick Actions */}
			<div className="space-y-4 pt-2 border-t border-slate-100">
				{/* Resolution selector */}
				<div className="flex items-center justify-between">
					<span className="text-xs font-bold text-slate-700">
						Export Resolution
					</span>
					<div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
						{(
							[
								{ label: "512px", value: 512 },
								{ label: "1024px", value: 1024 },
								{ label: "2048px (HD)", value: 2048 },
							] as const
						).map((res) => (
							<button
								key={res.value}
								type="button"
								onClick={() => setExportSize(res.value)}
								className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
									exportSize === res.value
										? "bg-white text-indigo-600 shadow-2xs"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								{res.label}
							</button>
						))}
					</div>
				</div>

				{/* Primary Download Grid */}
				<div className="grid grid-cols-2 gap-2.5">
					<button
						type="button"
						disabled={!hasContent || renderError}
						onClick={handleDownloadPNG}
						className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-xs shadow-xs shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
					>
						<Download className="w-4 h-4" />
						<span>Download PNG</span>
					</button>

					<button
						type="button"
						disabled={!hasContent || renderError}
						onClick={handleDownloadSVG}
						className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
					>
						<FileCode className="w-4 h-4" />
						<span>Vector SVG</span>
					</button>
				</div>

				{/* Secondary Utility Actions */}
				<div className="grid grid-cols-2 gap-2">
					<button
						type="button"
						disabled={!hasContent || renderError}
						onClick={handleCopyImage}
						className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
					>
						{copiedImage ? (
							<>
								<Check className="w-3.5 h-3.5 text-emerald-600" />
								<span className="text-emerald-600">Copied Image!</span>
							</>
						) : (
							<>
								<Copy className="w-3.5 h-3.5 text-slate-500" />
								<span>Copy Image</span>
							</>
						)}
					</button>

					<button
						type="button"
						disabled={!hasContent || renderError}
						onClick={handlePrint}
						className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
					>
						<Printer className="w-3.5 h-3.5 text-slate-500" />
						<span>Print Code</span>
					</button>
				</div>
			</div>

			{/* Raw Payload Inspector Accordion */}
			<div className="border-t border-slate-100 pt-3">
				<button
					type="button"
					onClick={() => setShowPayloadInspector((v) => !v)}
					className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer py-1"
				>
					<span className="inline-flex items-center gap-1.5">
						<Code2 className="w-3.5 h-3.5 text-slate-400" />
						Inspect Encoded String
					</span>
					{showPayloadInspector ? (
						<ChevronUp className="w-3.5 h-3.5" />
					) : (
						<ChevronDown className="w-3.5 h-3.5" />
					)}
				</button>

				{showPayloadInspector && (
					<div className="mt-3 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-2 break-all overflow-x-auto max-h-48 select-all">
						<div className="flex items-center justify-between pb-1 border-b border-slate-800">
							<span className="text-[10px] text-slate-400 font-sans uppercase font-bold">
								QR Encoded Payload ({payloadType})
							</span>
							<button
								type="button"
								onClick={handleCopyPayload}
								className="text-[10px] font-sans font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer"
							>
								{copiedPayload ? (
									<>
										<Check className="w-3 h-3 text-emerald-400" />
										Copied
									</>
								) : (
									<>
										<Copy className="w-3 h-3" />
										Copy Text
									</>
								)}
							</button>
						</div>
						<p className="whitespace-pre-wrap leading-relaxed">
							{payloadString || "(empty)"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
