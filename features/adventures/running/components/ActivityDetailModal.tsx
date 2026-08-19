"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	Calendar,
	Route,
	Zap,
	Clock,
	Mountain,
	Flame,
	Gauge,
	ExternalLink,
	Timer,
	BarChart3,
	LayoutGrid,
	Check,
	ImageIcon,
	Loader2,
} from "lucide-react";
import { format } from "date-fns";
import type { StravaRunActivity } from "@/services/strava/service";
import { calculateActivitySplits, type ActivitySplit } from "../utils/splits";

interface ActivityDetailModalProps {
	activity: StravaRunActivity | null;
	onClose: () => void;
}

// ──────────────────────────────────────────────
// Helper: Draw Rounded Rect on Canvas 2D
// ──────────────────────────────────────────────
function drawCanvasRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

// ──────────────────────────────────────────────
// Canvas Exporter: Overview Social Image Card
// ──────────────────────────────────────────────
function renderOverviewImageToCanvas(
	activity: StravaRunActivity,
	derived: {
		formattedDate: string;
		formattedTime: string;
		distanceKm: string;
		formattedPace: string;
		formattedMovingDuration: string;
		formattedElapsedDuration: string;
		avgSpeedKmh: string;
		hasElevation: boolean;
		hasHeartRate: boolean;
	},
	scale = 2,
): HTMLCanvasElement {
	const width = 560;
	const height = 400;

	const canvas = document.createElement("canvas");
	canvas.width = width * scale;
	canvas.height = height * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context unavailable");

	ctx.scale(scale, scale);

	// 1. Base Outer Card Background with Gradient & Rounded Corners
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.fillStyle = "#ffffff";
	ctx.fill();

	// Ambient subtle top emerald gradient
	const topGrad = ctx.createLinearGradient(0, 0, width, 180);
	topGrad.addColorStop(0, "rgba(236, 253, 245, 0.9)"); // emerald-50
	topGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.fillStyle = topGrad;
	ctx.fill();

	// Outer Border
	ctx.strokeStyle = "#e2e8f0"; // slate-200
	ctx.lineWidth = 1.5;
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.stroke();

	// 2. Header: Tag & Title & Date
	const padX = 28;
	let curY = 32;

	// Tag Pill
	drawCanvasRoundedRect(ctx, padX, curY, 142, 22, 11);
	ctx.fillStyle = "#dcfce7"; // emerald-100
	ctx.fill();
	ctx.strokeStyle = "#86efac"; // emerald-300
	ctx.lineWidth = 1;
	drawCanvasRoundedRect(ctx, padX, curY, 142, 22, 11);
	ctx.stroke();

	// Tag Dot
	ctx.beginPath();
	ctx.arc(padX + 11, curY + 11, 3.5, 0, Math.PI * 2);
	ctx.fillStyle = "#059669"; // emerald-600
	ctx.fill();

	// Tag Text
	ctx.fillStyle = "#065f46"; // emerald-800
	ctx.font =
		"800 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("RUNNING ACTIVITY", padX + 20, curY + 14.5);

	// Date on Right
	ctx.fillStyle = "#64748b"; // slate-500
	ctx.font =
		"700 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.textAlign = "right";
	ctx.fillText(
		`${derived.formattedDate} · ${derived.formattedTime}`,
		width - padX,
		curY + 15,
	);
	ctx.textAlign = "left";

	curY += 34;

	// Activity Title
	ctx.fillStyle = "#0f172a"; // slate-900
	ctx.font =
		"900 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	const titleText =
		activity.name.length > 34
			? `${activity.name.slice(0, 32)}...`
			: activity.name;
	ctx.fillText(titleText, padX, curY + 16);

	curY += 32;

	// 3. Highlight Strip (Distance, Pace, Time)
	const stripH = 92;
	const stripW = width - padX * 2;
	drawCanvasRoundedRect(ctx, padX, curY, stripW, stripH, 20);
	const stripGrad = ctx.createLinearGradient(
		padX,
		curY,
		padX + stripW,
		curY + stripH,
	);
	stripGrad.addColorStop(0, "#ecfdf5"); // emerald-50
	stripGrad.addColorStop(1, "#f0fdf4");
	ctx.fillStyle = stripGrad;
	ctx.fill();
	ctx.strokeStyle = "#a7f3d0"; // emerald-200
	ctx.lineWidth = 1.2;
	drawCanvasRoundedRect(ctx, padX, curY, stripW, stripH, 20);
	ctx.stroke();

	const colW = stripW / 3;

	// Col 1: Distance
	ctx.fillStyle = "#047857"; // emerald-700
	ctx.font =
		"800 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("DISTANCE", padX + 16, curY + 28);
	ctx.fillStyle = "#064e3b"; // emerald-950
	ctx.font = "900 28px 'JetBrains Mono', monospace";
	ctx.fillText(derived.distanceKm, padX + 16, curY + 64);
	const distWidth = ctx.measureText(derived.distanceKm).width;
	ctx.fillStyle = "#047857";
	ctx.font = "800 12px 'JetBrains Mono', monospace";
	ctx.fillText("KM", padX + 18 + distWidth, curY + 62);

	// Divider 1
	ctx.strokeStyle = "#cbd5e1";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(padX + colW, curY + 18);
	ctx.lineTo(padX + colW, curY + stripH - 18);
	ctx.stroke();

	// Col 2: Pace
	ctx.fillStyle = "#b45309"; // amber-700
	ctx.font =
		"800 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("AVG PACE", padX + colW + 16, curY + 28);
	ctx.fillStyle = "#064e3b";
	ctx.font = "900 22px 'JetBrains Mono', monospace";
	ctx.fillText(derived.formattedPace, padX + colW + 16, curY + 62);

	// Divider 2
	ctx.beginPath();
	ctx.moveTo(padX + colW * 2, curY + 18);
	ctx.lineTo(padX + colW * 2, curY + stripH - 18);
	ctx.stroke();

	// Col 3: Time
	ctx.fillStyle = "#1d4ed8"; // blue-700
	ctx.font =
		"800 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("MOVING TIME", padX + colW * 2 + 16, curY + 28);
	ctx.fillStyle = "#064e3b";
	ctx.font = "900 22px 'JetBrains Mono', monospace";
	ctx.fillText(
		derived.formattedMovingDuration,
		padX + colW * 2 + 16,
		curY + 62,
	);

	curY += stripH + 16;

	// 4. Secondary Metric Grid (4 Boxes)
	const secGridY = curY;
	const secBoxW = (stripW - 12 * 3) / 4;
	const secBoxH = 68;

	const secondaryStats = [
		{
			label: "AVG SPEED",
			val: `${derived.avgSpeedKmh} km/h`,
			labelColor: "#0f766e",
		},
		{
			label: "ELAPSED",
			val: derived.formattedElapsedDuration,
			labelColor: "#475569",
		},
		{
			label: "CLIMB",
			val: derived.hasElevation ? `+${activity.total_elevation_gain} m` : "0 m",
			labelColor: "#6b21a8",
		},
		{
			label: "AVG HR",
			val: derived.hasHeartRate
				? `${Math.round(activity.average_heartrate!)} bpm`
				: "—",
			labelColor: "#be123c",
		},
	];

	secondaryStats.forEach((stat, idx) => {
		const bx = padX + idx * (secBoxW + 12);
		drawCanvasRoundedRect(ctx, bx, secGridY, secBoxW, secBoxH, 14);
		ctx.fillStyle = "#f8fafc";
		ctx.fill();
		ctx.strokeStyle = "#e2e8f0";
		ctx.lineWidth = 1;
		drawCanvasRoundedRect(ctx, bx, secGridY, secBoxW, secBoxH, 14);
		ctx.stroke();

		ctx.fillStyle = stat.labelColor;
		ctx.font =
			"800 9px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
		ctx.fillText(stat.label, bx + 10, secGridY + 22);

		ctx.fillStyle = "#0f172a";
		ctx.font = "800 13px 'JetBrains Mono', monospace";
		ctx.fillText(stat.val, bx + 10, secGridY + 48);
	});

	// 5. Watermark Footer
	ctx.fillStyle = "#94a3b8"; // slate-400
	ctx.font =
		"700 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("Strava Verified Activity", padX, height - 20);

	ctx.fillStyle = "#059669"; // emerald-600
	ctx.font =
		"800 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.textAlign = "right";
	ctx.fillText("polmatambunan.com", width - padX, height - 20);
	ctx.textAlign = "left";

	return canvas;
}

// ──────────────────────────────────────────────
// Canvas Exporter: Splits Social Image Card
// ──────────────────────────────────────────────
function renderSplitsImageToCanvas(
	activity: StravaRunActivity,
	derived: {
		formattedDate: string;
		distanceKm: string;
		formattedPace: string;
		formattedMovingDuration: string;
	},
	splits: ActivitySplit[],
	scale = 2,
): HTMLCanvasElement {
	const width = 560;
	const splitRowH = 28;
	const maxSplitsToShow = Math.min(splits.length, 25);
	const splitsListH = maxSplitsToShow * splitRowH;
	const height = Math.max(380, 160 + splitsListH + 48);

	const canvas = document.createElement("canvas");
	canvas.width = width * scale;
	canvas.height = height * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context unavailable");

	ctx.scale(scale, scale);

	// 1. Outer Card Background
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.fillStyle = "#ffffff";
	ctx.fill();

	// Top Gradient
	const topGrad = ctx.createLinearGradient(0, 0, width, 160);
	topGrad.addColorStop(0, "rgba(236, 253, 245, 0.8)");
	topGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.fillStyle = topGrad;
	ctx.fill();

	// Outer Border
	ctx.strokeStyle = "#e2e8f0";
	ctx.lineWidth = 1.5;
	drawCanvasRoundedRect(ctx, 0, 0, width, height, 28);
	ctx.stroke();

	const padX = 28;
	let curY = 28;

	// Title & Date Header
	ctx.fillStyle = "#0f172a";
	ctx.font =
		"900 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	const titleText =
		activity.name.length > 28
			? `${activity.name.slice(0, 26)}...`
			: activity.name;
	ctx.fillText(`${titleText} — Splits`, padX, curY + 14);

	ctx.fillStyle = "#64748b";
	ctx.font =
		"700 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.textAlign = "right";
	ctx.fillText(derived.formattedDate, width - padX, curY + 14);
	ctx.textAlign = "left";

	curY += 28;

	// Summary Banner
	const sumW = width - padX * 2;
	drawCanvasRoundedRect(ctx, padX, curY, sumW, 36, 12);
	ctx.fillStyle = "#ecfdf5";
	ctx.fill();
	ctx.strokeStyle = "#a7f3d0";
	ctx.lineWidth = 1;
	drawCanvasRoundedRect(ctx, padX, curY, sumW, 36, 12);
	ctx.stroke();

	ctx.fillStyle = "#065f46";
	ctx.font = "800 11.5px 'JetBrains Mono', monospace";
	ctx.fillText(
		`TOTAL: ${derived.distanceKm} KM @ ${derived.formattedPace} (${derived.formattedMovingDuration})`,
		padX + 14,
		curY + 22.5,
	);

	const fastestSplit = splits.find((s) => s.isFastest);
	if (fastestSplit) {
		ctx.fillStyle = "#047857";
		ctx.font = "800 10.5px 'JetBrains Mono', monospace";
		ctx.textAlign = "right";
		ctx.fillText(
			`⚡ FASTEST: KM ${fastestSplit.split} (${fastestSplit.paceFormatted})`,
			width - padX - 14,
			curY + 22.5,
		);
		ctx.textAlign = "left";
	}

	curY += 48;

	// Splits Calculations
	const splitPaces = splits.map((s) => s.paceSeconds);
	const minPace = splitPaces.length > 0 ? Math.min(...splitPaces) : 0;
	const maxPace = splitPaces.length > 0 ? Math.max(...splitPaces) : 0;
	const paceSpread = Math.max(maxPace - minPace, 1);
	const avgPaceSec =
		activity.distance > 0
			? activity.moving_time / (activity.distance / 1000)
			: 0;

	// Render Splits Rows
	splits.slice(0, maxSplitsToShow).forEach((item) => {
		const rowY = curY;

		// KM Label
		ctx.fillStyle = "#334155";
		ctx.font = "800 11px 'JetBrains Mono', monospace";
		ctx.fillText(
			`KM ${item.split}${item.distanceKm < 1 ? ` (${item.distanceKm}k)` : ""}`,
			padX,
			rowY + 15,
		);

		// Bar Track
		const barStartX = padX + 76;
		const barMaxW = sumW - 146;
		const paceRatio = 1 - (item.paceSeconds - minPace) / paceSpread;
		const barWidth = Math.max(
			barMaxW * 0.45,
			Math.min(barMaxW, barMaxW * (0.45 + paceRatio * 0.55)),
		);

		// Bar Fill
		drawCanvasRoundedRect(ctx, barStartX, rowY + 3, barWidth, 18, 6);
		if (item.isFastest) {
			ctx.fillStyle = "#10b981"; // emerald-500
		} else if (item.paceSeconds <= avgPaceSec) {
			ctx.fillStyle = "#34d399"; // emerald-400
		} else {
			ctx.fillStyle = "#fbbf24"; // amber-400
		}
		ctx.fill();

		// Pace text inside bar
		ctx.fillStyle = "#0f172a";
		ctx.font = "900 10.5px 'JetBrains Mono', monospace";
		ctx.fillText(`${item.paceFormatted}/km`, barStartX + 8, rowY + 16);

		if (item.isFastest) {
			ctx.fillStyle = "#064e3b";
			ctx.font = "900 8.5px sans-serif";
			ctx.fillText("★ TOP", barStartX + barWidth - 36, rowY + 15.5);
		}

		// HR or Time on Right
		if (item.heartrate) {
			ctx.fillStyle = "#e11d48"; // rose-600
			ctx.font = "800 10.5px 'JetBrains Mono', monospace";
			ctx.textAlign = "right";
			ctx.fillText(`${item.heartrate} bpm`, width - padX, rowY + 15);
			ctx.textAlign = "left";
		} else {
			ctx.fillStyle = "#64748b";
			ctx.font = "700 10.5px 'JetBrains Mono', monospace";
			ctx.textAlign = "right";
			ctx.fillText(item.movingTimeFormatted, width - padX, rowY + 15);
			ctx.textAlign = "left";
		}

		curY += splitRowH;
	});

	// Watermark Footer
	ctx.fillStyle = "#94a3b8";
	ctx.font =
		"700 10px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.fillText("Strava Verified Activity", padX, height - 16);

	ctx.fillStyle = "#059669";
	ctx.font =
		"800 10.5px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
	ctx.textAlign = "right";
	ctx.fillText("polmatambunan.com", width - padX, height - 16);
	ctx.textAlign = "left";

	return canvas;
}

export default function ActivityDetailModal({
	activity,
	onClose,
}: ActivityDetailModalProps) {
	const [activeTab, setActiveTab] = useState<"overview" | "splits">("overview");
	const [copiedTab, setCopiedTab] = useState<"overview" | "splits" | null>(
		null,
	);
	const [isCopying, setIsCopying] = useState(false);
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;

	// Reset tab and feedback on activity change
	useEffect(() => {
		setActiveTab("overview");
		setCopiedTab(null);
		setIsCopying(false);
	}, [activity?.id]);

	// Escape key listener & body scroll lock
	useEffect(() => {
		if (!activity) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [activity, onClose]);

	const splits = useMemo(() => {
		if (!activity) return [];
		return calculateActivitySplits(activity);
	}, [activity]);

	// Formatters & calculations
	const derivedData = useMemo(() => {
		if (!activity) return null;

		const localDateStr = activity.start_date_local.replace(/Z$/, "");
		const date = new Date(localDateStr);
		const formattedDate = format(date, "EEE, MMM d, yyyy");
		const formattedTime = format(date, "h:mm a");
		const distanceKm = (activity.distance / 1000).toFixed(2);

		const paceSeconds =
			activity.distance > 0
				? activity.moving_time / (activity.distance / 1000)
				: 0;
		const paceMin = Math.floor(paceSeconds / 60);
		const paceSec = Math.floor(paceSeconds % 60)
			.toString()
			.padStart(2, "0");
		const formattedPace =
			activity.distance > 0 ? `${paceMin}:${paceSec}/km` : "—";

		const moveHrs = Math.floor(activity.moving_time / 3600);
		const moveMins = Math.floor((activity.moving_time % 3600) / 60);
		const moveSecs = activity.moving_time % 60;
		const formattedMovingDuration =
			moveHrs > 0 ? `${moveHrs}h ${moveMins}m` : `${moveMins}m ${moveSecs}s`;

		const elapsedHrs = Math.floor(activity.elapsed_time / 3600);
		const elapsedMins = Math.floor((activity.elapsed_time % 3600) / 60);
		const elapsedSecs = activity.elapsed_time % 60;
		const formattedElapsedDuration =
			elapsedHrs > 0
				? `${elapsedHrs}h ${elapsedMins}m`
				: `${elapsedMins}m ${elapsedSecs}s`;

		const avgSpeedKmh =
			activity.average_speed > 0
				? (activity.average_speed * 3.6).toFixed(1)
				: "—";

		const hasElevation =
			typeof activity.total_elevation_gain === "number" &&
			activity.total_elevation_gain > 0;
		const hasHeartRate = Boolean(
			activity.has_heartrate &&
				activity.average_heartrate &&
				activity.average_heartrate > 0,
		);

		return {
			formattedDate,
			formattedTime,
			distanceKm,
			paceSeconds,
			formattedPace,
			formattedMovingDuration,
			formattedElapsedDuration,
			avgSpeedKmh,
			hasElevation,
			hasHeartRate,
		};
	}, [activity]);

	// Splits min/max bounds for bar scaling
	const splitPaces = useMemo(() => splits.map((s) => s.paceSeconds), [splits]);
	const minSplitPaceSec = splitPaces.length > 0 ? Math.min(...splitPaces) : 0;
	const maxSplitPaceSec = splitPaces.length > 0 ? Math.max(...splitPaces) : 0;
	const fastestSplit = useMemo(() => splits.find((s) => s.isFastest), [splits]);

	// Copy to clipboard as a rendered visual PNG IMAGE
	const handleCopyImage = useCallback(
		async (type: "overview" | "splits") => {
			if (!activity || !derivedData || isCopying) return;

			setIsCopying(true);
			try {
				const canvas =
					type === "overview"
						? renderOverviewImageToCanvas(activity, derivedData, 2)
						: renderSplitsImageToCanvas(activity, derivedData, splits, 2);

				await new Promise<void>((resolve, reject) => {
					canvas.toBlob(async (blob) => {
						if (!blob) {
							reject(new Error("Canvas toBlob generation failed"));
							return;
						}

						try {
							if (
								typeof ClipboardItem !== "undefined" &&
								navigator.clipboard?.write
							) {
								await navigator.clipboard.write([
									new ClipboardItem({ "image/png": blob }),
								]);
								setCopiedTab(type);
								setTimeout(() => setCopiedTab(null), 2200);
								resolve();
							} else {
								// Fallback: Download image if clipboard image writing is not supported
								const link = document.createElement("a");
								link.download = `strava-run-${type}-${Date.now()}.png`;
								link.href = canvas.toDataURL("image/png");
								link.click();
								setCopiedTab(type);
								setTimeout(() => setCopiedTab(null), 2200);
								resolve();
							}
						} catch (_clipErr) {
							// Clipboard write fallback to download
							const link = document.createElement("a");
							link.download = `strava-run-${type}-${Date.now()}.png`;
							link.href = canvas.toDataURL("image/png");
							link.click();
							setCopiedTab(type);
							setTimeout(() => setCopiedTab(null), 2200);
							resolve();
						}
					}, "image/png");
				});
			} catch (err) {
				console.error("Failed to copy activity image to clipboard:", err);
			} finally {
				setIsCopying(false);
			}
		},
		[activity, derivedData, splits, isCopying],
	);

	if (!activity || !derivedData) return null;

	const {
		formattedDate,
		formattedTime,
		distanceKm,
		paceSeconds,
		formattedPace,
		formattedMovingDuration,
		formattedElapsedDuration,
		avgSpeedKmh,
		hasElevation,
		hasHeartRate,
	} = derivedData;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
				{/* Backdrop */}
				<motion.div
					initial={safeReduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
				/>

				{/* Pure Light Glassmorphic Floating Card */}
				<motion.div
					initial={
						safeReduceMotion ? false : { opacity: 0, scale: 0.96, y: 12 }
					}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.96, y: 12 }}
					transition={{ type: "spring", damping: 26, stiffness: 340 }}
					className="relative w-full max-w-md bg-white/95 rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 text-slate-900 backdrop-blur-2xl"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="px-5 pt-4 pb-3 border-b border-slate-100 bg-slate-50/70 space-y-2.5 backdrop-blur-md">
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 space-y-0.5">
								<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
									<Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									<span>
										{formattedDate} · {formattedTime}
									</span>
								</div>
								<h3 className="text-base sm:text-lg font-black text-slate-900 truncate leading-snug tracking-tight">
									{activity.name}
								</h3>
							</div>

							<button
								type="button"
								onClick={onClose}
								className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
								aria-label="Close modal"
							>
								<X className="w-4 h-4" />
							</button>
						</div>

						{/* Segmented Tab Controls & Copy Image Button */}
						<div className="flex items-center justify-between gap-2">
							{/* Tab Switcher */}
							<div className="flex items-center gap-1 p-0.5 bg-slate-200/60 rounded-xl border border-slate-200/60 w-fit backdrop-blur-md">
								<button
									type="button"
									onClick={() => setActiveTab("overview")}
									className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
										activeTab === "overview"
											? "bg-white text-slate-900 shadow-2xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<LayoutGrid className="w-3 h-3" />
									<span>Overview</span>
								</button>

								<button
									type="button"
									onClick={() => setActiveTab("splits")}
									className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold transition-all cursor-pointer ${
										activeTab === "splits"
											? "bg-emerald-600 text-white shadow-2xs"
											: "text-slate-600 hover:text-slate-900"
									}`}
								>
									<BarChart3 className="w-3 h-3" />
									<span>Splits ({splits.length} KM)</span>
								</button>
							</div>

							{/* Copy as Image Action Button */}
							<button
								type="button"
								disabled={isCopying}
								onClick={() => handleCopyImage(activeTab)}
								className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-[10.5px] font-extrabold transition-all active:scale-95 shadow-2xs cursor-pointer disabled:opacity-60"
								title={
									activeTab === "overview"
										? "Copy overview as PNG image"
										: "Copy splits breakdown as PNG image"
								}
							>
								{isCopying ? (
									<>
										<Loader2 className="w-3 h-3 text-emerald-600 animate-spin" />
										<span className="text-emerald-700">Exporting...</span>
									</>
								) : copiedTab === activeTab ? (
									<>
										<Check className="w-3 h-3 text-emerald-600" />
										<span className="text-emerald-700 font-bold">
											Copied Image!
										</span>
									</>
								) : (
									<>
										<ImageIcon className="w-3 h-3 text-slate-500" />
										<span>
											{activeTab === "overview"
												? "Copy Image"
												: "Copy Splits Image"}
										</span>
									</>
								)}
							</button>
						</div>
					</div>

					{/* Body Content */}
					<div className="p-4 sm:p-5">
						{activeTab === "overview" ? (
							/* ── TAB 1: OVERVIEW METRICS (LIGHT GLASSMORPHISM) ── */
							<div className="space-y-3">
								{/* Top Highlight Strip (3 Core Metrics) */}
								<div className="grid grid-cols-3 gap-2 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-slate-50 border border-emerald-200/80 shadow-2xs">
									<div className="space-y-0.5 min-w-0">
										<span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
											<Route className="w-3 h-3 text-emerald-600 shrink-0" />
											Distance
										</span>
										<div className="flex items-baseline gap-0.5">
											<span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono leading-tight">
												{distanceKm}
											</span>
											<span className="text-[10px] font-black text-emerald-700">
												KM
											</span>
										</div>
									</div>

									<div className="space-y-0.5 min-w-0 border-l border-emerald-200/70 pl-2.5">
										<span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
											<Zap className="w-3 h-3 text-amber-500 shrink-0" />
											Pace
										</span>
										<p className="text-sm sm:text-base font-black text-emerald-950 font-mono leading-tight truncate">
											{formattedPace}
										</p>
									</div>

									<div className="space-y-0.5 min-w-0 border-l border-emerald-200/70 pl-2.5">
										<span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
											<Clock className="w-3 h-3 text-blue-600 shrink-0" />
											Time
										</span>
										<p className="text-sm sm:text-base font-black text-emerald-950 font-mono leading-tight truncate">
											{formattedMovingDuration}
										</p>
									</div>
								</div>

								{/* Secondary Metrics Grid */}
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
									{/* Speed */}
									<div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
										<span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
											<Gauge className="w-3 h-3 text-emerald-600 shrink-0" />
											Avg Speed
										</span>
										<p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 font-mono">
											{avgSpeedKmh}{" "}
											<span className="text-[9px] font-bold text-slate-500">
												km/h
											</span>
										</p>
									</div>

									{/* Elapsed Time */}
									<div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
										<span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
											<Timer className="w-3 h-3 text-slate-500 shrink-0" />
											Elapsed
										</span>
										<p className="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 font-mono truncate">
											{formattedElapsedDuration}
										</p>
									</div>

									{/* Elevation (if > 0) */}
									{hasElevation && (
										<div className="p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs">
											<span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
												<Mountain className="w-3 h-3 text-purple-600 shrink-0" />
												Climb
											</span>
											<p className="text-xs sm:text-sm font-extrabold text-purple-900 mt-0.5 font-mono">
												+{activity.total_elevation_gain}
												<span className="text-[9px] font-bold text-slate-500">
													{" "}
													m
												</span>
											</p>
										</div>
									)}

									{/* Heart Rate (if present) */}
									{hasHeartRate && (
										<div
											className={`p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 shadow-2xs ${
												!hasElevation ? "col-span-2 sm:col-span-1" : ""
											}`}
										>
											<span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
												<Flame className="w-3 h-3 text-rose-500 animate-pulse shrink-0" />
												Heart Rate
											</span>
											<p className="text-xs sm:text-sm font-extrabold text-rose-900 mt-0.5 font-mono">
												{Math.round(activity.average_heartrate!)}{" "}
												<span className="text-[9px] font-bold text-slate-500">
													bpm
												</span>
											</p>
										</div>
									)}
								</div>
							</div>
						) : (
							/* ── TAB 2: SPLITS BAR CHART (LIGHT GLASSMORPHISM) ── */
							<div className="space-y-2.5">
								{/* Splits Summary Pill */}
								<div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-100/90 text-[10px] shadow-2xs">
									<div className="flex items-center gap-1 font-bold text-slate-700">
										<span>Fastest:</span>
										<span className="text-emerald-800 font-extrabold font-mono">
											{fastestSplit
												? `KM ${fastestSplit.split} (${fastestSplit.paceFormatted}/km)`
												: "—"}
										</span>
									</div>
									<div className="flex items-center gap-1 font-bold text-slate-700">
										<span>Avg:</span>
										<span className="text-slate-900 font-extrabold font-mono">
											{formattedPace}
										</span>
									</div>
								</div>

								{/* Splits Horizontal Bar Chart */}
								<div className="space-y-1.5 max-h-[185px] overflow-y-auto pr-1">
									{splits.map((item) => {
										const paceSpread = Math.max(
											maxSplitPaceSec - minSplitPaceSec,
											1,
										);
										const paceRatio =
											1 - (item.paceSeconds - minSplitPaceSec) / paceSpread;
										const barWidthPercent = Math.max(
											45,
											Math.min(100, 48 + paceRatio * 52),
										);

										const isFasterThanAvg = item.paceSeconds <= paceSeconds;
										const barColorClass = item.isFastest
											? "bg-emerald-500 shadow-2xs"
											: isFasterThanAvg
												? "bg-emerald-400/90"
												: "bg-amber-400/90";

										return (
											<div
												key={item.split}
												className="flex items-center gap-2 py-0.5 text-xs group"
											>
												{/* KM Number */}
												<div className="w-7 shrink-0 text-left">
													<span className="font-extrabold text-slate-700 text-[11px] font-mono">
														{item.split}
													</span>
													<span className="text-[8.5px] text-slate-400 font-bold uppercase ml-0.5">
														k
													</span>
												</div>

												{/* Horizontal Bar Container */}
												<div className="flex-1 bg-slate-100 rounded-lg h-5.5 relative overflow-hidden flex items-center px-2 border border-slate-200/50">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${barWidthPercent}%` }}
														transition={{
															duration: 0.4,
															delay: item.split * 0.02,
														}}
														className={`absolute left-0 top-0 bottom-0 rounded-lg ${barColorClass}`}
													/>

													{/* Pace info overlaid */}
													<div className="relative z-10 flex items-center justify-between w-full text-[10.5px] font-extrabold font-mono px-0.5">
														<span className="text-slate-950 flex items-center gap-1 drop-shadow-2xs">
															<span>{item.paceFormatted}</span>
															<span className="text-[8.5px] text-slate-700 font-bold">
																/km
															</span>
															{item.isFastest && (
																<span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-emerald-900 text-white text-[7px] font-black uppercase tracking-wider shadow-2xs">
																	<Zap className="w-2 h-2 text-amber-300" /> Top
																</span>
															)}
														</span>
														{item.distanceKm < 1.0 && (
															<span className="text-[8.5px] text-slate-600 font-semibold">
																({item.distanceKm}k)
															</span>
														)}
													</div>
												</div>

												{/* Heart Rate on Split */}
												{item.heartrate ? (
													<div className="w-14 shrink-0 flex items-center justify-end gap-1 text-[10.5px] font-black text-rose-600 font-mono">
														<Flame className="w-3 h-3 text-rose-500 shrink-0" />
														<span>{item.heartrate}</span>
													</div>
												) : (
													<div className="w-12 shrink-0 text-right text-[10px] font-bold text-slate-500 font-mono">
														{item.movingTimeFormatted}
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 backdrop-blur-md">
						<button
							type="button"
							onClick={onClose}
							className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
						>
							Close
						</button>

						<div className="flex items-center gap-2">
							{/* Copy Image Button */}
							<button
								type="button"
								disabled={isCopying}
								onClick={() => handleCopyImage(activeTab)}
								className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 text-xs font-extrabold shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-60"
							>
								{isCopying ? (
									<>
										<Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
										<span>Generating Image...</span>
									</>
								) : copiedTab === activeTab ? (
									<>
										<Check className="w-3.5 h-3.5 text-emerald-600" />
										<span className="text-emerald-700 font-bold">
											Copied Image!
										</span>
									</>
								) : (
									<>
										<ImageIcon className="w-3.5 h-3.5 text-slate-500" />
										<span>
											{activeTab === "overview"
												? "Copy Image"
												: "Copy Splits Image"}
										</span>
									</>
								)}
							</button>

							<a
								href={`https://www.strava.com/activities/${activity.id}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer !no-underline"
							>
								<span>View on Strava</span>
								<ExternalLink className="w-3 h-3" />
							</a>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
