"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
	X,
	Calendar,
	Route,
	Zap,
	Clock,
	Flame,
	BarChart3,
	Check,
	ImageIcon,
	Loader2,
	Activity as ActivityIcon,
	Mountain,
	Sun,
	Moon,
	Share2,
} from "lucide-react";
import { format } from "date-fns";
import type {
	StravaRunActivity,
	StravaSplitMetric,
} from "@/services/strava/service";
import {
	calculateActivitySplits,
	formatStravaSplits,
	type ActivitySplit,
} from "../utils/splits";

interface ActivityDetailModalProps {
	activity: StravaRunActivity | null;
	onClose: () => void;
}

// ──────────────────────────────────────────────
// Shared Canvas Typography Constants
// ──────────────────────────────────────────────
const FONT = {
	hero: "900 72px 'Montserrat', sans-serif",
	heroUnit: "700 20px 'Montserrat', sans-serif",
	title: "800 16px 'Montserrat', sans-serif",
	subtitle: "700 11px 'Montserrat', sans-serif",
	label: "800 9px 'Montserrat', sans-serif",
	statValue: "900 22px 'Montserrat', sans-serif",
	statLabel: "700 9px 'Montserrat', sans-serif",
	splitKm: "900 11px 'Montserrat', sans-serif",
	splitPace: "800 10px 'Montserrat', sans-serif",
	splitHr: "700 9px 'Montserrat', sans-serif",
	watermark: "600 9px 'Montserrat', sans-serif",
	summaryBold: "900 13px 'Montserrat', sans-serif",
	badge: "900 10px 'Montserrat', sans-serif",
};

type CanvasTheme = "light" | "dark";

// ──────────────────────────────────────────────
// 2-Color Theme System: primary (text) + muted (secondary)
// ──────────────────────────────────────────────
const THEME_COLORS = {
	light: {
		primary: "#000000",
		divider: "#000000",
		barTrack: "rgba(0, 0, 0, 0.08)",
		barFill: "#000000",
	},
	dark: {
		primary: "#ffffff",
		divider: "#ffffff",
		barTrack: "rgba(255, 255, 255, 0.12)",
		barFill: "#ffffff",
	},
} as const;

function getColors(theme: CanvasTheme) {
	return THEME_COLORS[theme];
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
// Canvas Exporter: Overview — High-Contrast Flat Sticker
// ──────────────────────────────────────────────
function renderOverviewImageToCanvas(
	activity: StravaRunActivity,
	derived: {
		formattedDate: string;
		formattedTime: string;
		distanceKm: string;
		formattedPace: string;
		formattedMovingDuration: string;
		hasElevation: boolean;
		hasHeartRate: boolean;
	},
	_splits: ActivitySplit[],
	theme: CanvasTheme = "light",
	scale = 2,
): HTMLCanvasElement {
	const W = 420;
	const pad = 28;
	const innerW = W - pad * 2;

	// Count stat rows: always row1 (pace+time), row2 only if elev or HR
	const hasRow2 =
		derived.hasElevation ||
		(derived.hasHeartRate && activity.average_heartrate);

	// Dynamic height calculation
	let contentH = 0;
	contentH += 68; // hero distance
	contentH += 6; // gap
	contentH += 16; // unit "KILOMETERS"
	contentH += 24; // divider gap
	contentH += 1; // divider line
	contentH += 20; // gap below divider
	contentH += 38; // stat row 1 (pace + time)
	if (hasRow2) {
		contentH += 12; // gap between stat rows
		contentH += 38; // stat row 2 (elev + HR)
	}

	const H = contentH + pad * 2;

	const canvas = document.createElement("canvas");
	canvas.width = W * scale;
	canvas.height = H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context unavailable");

	const C = getColors(theme);

	ctx.scale(scale, scale);
	ctx.clearRect(0, 0, W, H);

	let y = pad;

	// ── 1. Hero Distance
	ctx.fillStyle = C.primary;
	ctx.font = FONT.hero;
	ctx.fillText(derived.distanceKm, pad - 4, y + 62);
	y += 68 + 6;

	// ── 2. Unit label
	ctx.fillStyle = C.primary;
	ctx.font = FONT.heroUnit;
	ctx.letterSpacing = "6px";
	ctx.fillText("KILOMETERS", pad, y + 14);
	ctx.letterSpacing = "0px";
	y += 16 + 24;

	// ── 3. Horizontal divider
	ctx.strokeStyle = C.divider;
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 20;

	// ── 4. Stats Row 1: Pace + Time (always 2 columns)
	const row1ColW = innerW / 2;
	const row1Stats = [
		{ value: derived.formattedPace, label: "PACE" },
		{ value: derived.formattedMovingDuration, label: "TIME" },
	];
	row1Stats.forEach((stat, i) => {
		const sx = pad + i * row1ColW;
		ctx.fillStyle = C.primary;
		ctx.font = FONT.statValue;
		ctx.fillText(stat.value, sx, y + 18);
		ctx.fillStyle = C.primary;
		ctx.font = FONT.statLabel;
		ctx.letterSpacing = "1.5px";
		ctx.fillText(stat.label, sx, y + 34);
		ctx.letterSpacing = "0px";
	});
	y += 38;

	// ── 5. Stats Row 2: Elevation + HR (if available)
	if (hasRow2) {
		y += 12;
		const row2Stats: Array<{ value: string; label: string }> = [];

		if (derived.hasElevation) {
			row2Stats.push({
				value: `+${activity.total_elevation_gain}m`,
				label: "ELEVATION",
			});
		}
		if (derived.hasHeartRate && activity.average_heartrate) {
			const avgHr = Math.round(activity.average_heartrate);
			row2Stats.push({
				value: `${avgHr}`,
				label: "AVG HR",
			});
		}

		const row2ColW = innerW / Math.max(row2Stats.length, 1);
		row2Stats.forEach((stat, i) => {
			const sx = pad + i * row2ColW;
			ctx.fillStyle = C.primary;
			ctx.font = FONT.statValue;
			ctx.fillText(stat.value, sx, y + 18);
			ctx.fillStyle = C.primary;
			ctx.font = FONT.statLabel;
			ctx.letterSpacing = "1.5px";
			ctx.fillText(stat.label, sx, y + 34);
			ctx.letterSpacing = "0px";
		});
		y += 38;
	}

	return canvas;
}

// ──────────────────────────────────────────────
// Canvas Exporter: Splits — High-Contrast Multi-Column Pace Bars
// ──────────────────────────────────────────────
function renderSplitsImageToCanvas(
	_activity: StravaRunActivity,
	_derived: {
		formattedDate: string;
		formattedTime: string;
		distanceKm: string;
		formattedPace: string;
		formattedMovingDuration: string;
	},
	splits: ActivitySplit[],
	theme: CanvasTheme = "light",
	scale = 2,
): HTMLCanvasElement {
	const pad = 24;
	const splitRowH = 24;
	const barH = 16;
	const maxSplitsToShow = Math.min(splits.length, 40);
	const splitsToRender = splits.slice(0, maxSplitsToShow);

	// Multi-column: every 10 splits gets a new column
	const colCount = Math.max(1, Math.ceil(splitsToRender.length / 10));
	const rowsPerCol = Math.ceil(splitsToRender.length / colCount);

	// Column layout: [KM 28] [gap 4] [bar flex] [gap 6] [pace 44] [gap 4] [HR 32]
	const kmW = 28;
	const paceW = 44;
	const hrW = 34;
	const gaps = 14; // 4+6+4
	const barMaxW = 80;
	const colW = kmW + barMaxW + paceW + hrW + gaps;
	const colGap = 20;
	const innerW = colCount * colW + (colCount - 1) * colGap;
	const W = innerW + pad * 2;

	// Header height & layout
	const headerH = 14 + 8 + 1 + 12; // header text (14) + gap (8) + divider (1) + gap (12)
	const splitsBlockH = rowsPerCol * splitRowH;
	const H = pad * 2 + headerH + splitsBlockH;

	const canvas = document.createElement("canvas");
	canvas.width = W * scale;
	canvas.height = H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas context unavailable");

	const C = getColors(theme);

	ctx.scale(scale, scale);
	ctx.clearRect(0, 0, W, H);

	let y = pad;

	// ── 1. Column Headers (KM, Pace, HR/Time)
	const hasHr = splitsToRender.some((s) => Boolean(s.heartrate));
	ctx.fillStyle = C.primary;
	ctx.font = FONT.statLabel;

	for (let col = 0; col < colCount; col++) {
		const colX = pad + col * (colW + colGap);
		const barX = colX + kmW + 4;
		const paceX = barX + barMaxW + 6;
		const rightX = colX + colW;

		// KM header
		ctx.letterSpacing = "1.5px";
		ctx.fillText("KM", colX, y + 11);

		// Pace header
		ctx.fillText("PACE", paceX, y + 11);

		// HR / Time header
		ctx.textAlign = "right";
		ctx.fillText(hasHr ? "HR" : "TIME", rightX, y + 11);
		ctx.textAlign = "left";
		ctx.letterSpacing = "0px";
	}
	y += 14 + 8;

	// ── 2. Horizontal Divider
	ctx.strokeStyle = C.divider;
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 12;

	// Compute pace range for bar scaling
	const splitPaces = splitsToRender.map((s) => s.paceSeconds);
	const minPace = splitPaces.length > 0 ? Math.min(...splitPaces) : 0;
	const maxPace = splitPaces.length > 0 ? Math.max(...splitPaces) : 0;
	const paceSpread = Math.max(maxPace - minPace, 1);

	// ── 3. Splits — multi-column layout with bars
	const splitStartY = y;

	for (let col = 0; col < colCount; col++) {
		const colX = pad + col * (colW + colGap);
		const colSplits = splitsToRender.slice(
			col * rowsPerCol,
			(col + 1) * rowsPerCol,
		);

		colSplits.forEach((item, rowIdx) => {
			const rowY = splitStartY + rowIdx * splitRowH;
			const barCenterY = rowY + (splitRowH - barH) / 2;

			// KM number
			ctx.fillStyle = C.primary;
			ctx.font = FONT.splitKm;
			const kmLabel = item.distanceKm < 1 ? `${item.split}*` : `${item.split}`;
			ctx.fillText(kmLabel, colX, rowY + splitRowH / 2 + 4);

			// Bar (pace-proportional)
			const barX = colX + kmW + 4;
			const paceRatio = 1 - (item.paceSeconds - minPace) / paceSpread;
			const barWidth = Math.max(
				barMaxW * 0.3,
				Math.min(barMaxW, barMaxW * (0.3 + paceRatio * 0.7)),
			);

			// Background track
			drawCanvasRoundedRect(ctx, barX, barCenterY, barMaxW, barH, 3);
			ctx.fillStyle = C.barTrack;
			ctx.fill();

			// Active bar
			drawCanvasRoundedRect(ctx, barX, barCenterY, barWidth, barH, 3);
			ctx.fillStyle = C.barFill;
			ctx.fill();

			// Pace text (after bar)
			const paceX = barX + barMaxW + 6;
			ctx.fillStyle = C.primary;
			ctx.font = FONT.splitPace;
			ctx.fillText(item.paceFormatted, paceX, rowY + splitRowH / 2 + 4);

			// HR or moving time
			ctx.textAlign = "right";
			const rightX = colX + colW;
			ctx.fillStyle = C.primary;
			ctx.font = FONT.splitHr;
			if (item.heartrate) {
				ctx.fillText(`${item.heartrate}`, rightX, rowY + splitRowH / 2 + 4);
			} else {
				ctx.fillText(
					item.movingTimeFormatted,
					rightX,
					rowY + splitRowH / 2 + 4,
				);
			}
			ctx.textAlign = "left";
		});
	}

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
	const [copiedLink, setCopiedLink] = useState(false);
	const [isCopying, setIsCopying] = useState(false);
	const [exportTheme, setExportTheme] = useState<CanvasTheme>("light");
	const [rawSplits, setRawSplits] = useState<StravaSplitMetric[] | null>(null);
	const [isLoadingSplits, setIsLoadingSplits] = useState(false);
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = Boolean(reduceMotion);

	// Reset & fetch real Strava splits when activity opens
	useEffect(() => {
		setActiveTab("overview");
		setCopiedTab(null);
		setIsCopying(false);
		setRawSplits(null);

		if (!activity?.id) return;

		let isMounted = true;
		setIsLoadingSplits(true);

		fetch(`/api/strava/activity/${activity.id}/splits`)
			.then((res) => (res.ok ? res.json() : null))
			.then((data) => {
				if (
					isMounted &&
					data?.splits &&
					Array.isArray(data.splits) &&
					data.splits.length > 0
				) {
					setRawSplits(data.splits);
				}
			})
			.catch((err) => {
				console.warn("Could not fetch real Strava activity splits:", err);
			})
			.finally(() => {
				if (isMounted) setIsLoadingSplits(false);
			});

		return () => {
			isMounted = false;
		};
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

	// Real splits from Strava API or fallback proportional splits
	const splits = useMemo(() => {
		if (!activity) return [];
		if (rawSplits && rawSplits.length > 0) {
			return formatStravaSplits(rawSplits);
		}
		return calculateActivitySplits(activity);
	}, [activity, rawSplits]);

	// Derived metrics formatting
	const derivedData = useMemo(() => {
		if (!activity) return null;

		const localDateStr = activity.start_date_local.replace(/Z$/, "");
		const date = new Date(localDateStr);
		const formattedDate = format(date, "EEEE, MMMM d, yyyy");
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
			hasElevation,
			hasHeartRate,
		};
	}, [activity]);

	// Splits min/max bounds for bar scaling
	const splitPaces = useMemo(() => splits.map((s) => s.paceSeconds), [splits]);
	const minSplitPaceSec = splitPaces.length > 0 ? Math.min(...splitPaces) : 0;
	const maxSplitPaceSec = splitPaces.length > 0 ? Math.max(...splitPaces) : 0;
	const fastestSplit = useMemo(() => splits.find((s) => s.isFastest), [splits]);

	// Copy to clipboard as a rendered visual PNG IMAGE with transparent background
	const handleCopyImage = useCallback(
		async (type: "overview" | "splits") => {
			if (!activity || !derivedData || isCopying) return;

			setIsCopying(true);
			try {
				const canvas =
					type === "overview"
						? renderOverviewImageToCanvas(
								activity,
								derivedData,
								splits,
								exportTheme,
								2,
							)
						: renderSplitsImageToCanvas(
								activity,
								derivedData,
								splits,
								exportTheme,
								2,
							);

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
								const link = document.createElement("a");
								link.download = `strava-run-${type}-${Date.now()}.png`;
								link.href = canvas.toDataURL("image/png");
								link.click();
								setCopiedTab(type);
								setTimeout(() => setCopiedTab(null), 2200);
								resolve();
							}
						} catch (_clipErr) {
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
		[activity, derivedData, splits, isCopying, exportTheme],
	);

	// Share activity via native Web Share API or copy direct link to clipboard
	const handleShare = useCallback(async () => {
		if (!activity || !derivedData) return;

		const shareUrl =
			typeof window !== "undefined"
				? `${window.location.origin}/adventures/running?activity=${activity.id}`
				: `https://polmatambunan.my.id/adventures/running?activity=${activity.id}`;

		const shareText = `🏃 ${activity.name} • ${derivedData.distanceKm} km in ${derivedData.formattedMovingDuration} (Avg ${derivedData.formattedPace})`;

		if (typeof navigator !== "undefined" && navigator.share) {
			try {
				await navigator.share({
					title: activity.name,
					text: shareText,
					url: shareUrl,
				});
				setCopiedLink(true);
				setTimeout(() => setCopiedLink(false), 2200);
				return;
			} catch (err: unknown) {
				// User dismissed native share sheet
				if (err instanceof Error && err.name === "AbortError") {
					return;
				}
			}
		}

		// Fallback: Copy direct URL to clipboard
		try {
			if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(shareUrl);
			} else {
				const textarea = document.createElement("textarea");
				textarea.value = shareUrl;
				textarea.style.position = "fixed";
				textarea.style.opacity = "0";
				document.body.appendChild(textarea);
				textarea.select();
				document.execCommand("copy");
				document.body.removeChild(textarea);
			}
			setCopiedLink(true);
			setTimeout(() => setCopiedLink(false), 2200);
		} catch (err) {
			console.error("Failed to copy activity link:", err);
		}
	}, [activity, derivedData]);

	if (!activity || !derivedData) return null;

	const {
		formattedDate,
		formattedTime,
		distanceKm,
		paceSeconds,
		formattedPace,
		formattedMovingDuration,
		hasElevation,
		hasHeartRate,
	} = derivedData;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
				{/* Backdrop with ambient blur */}
				<motion.div
					initial={safeReduceMotion ? false : { opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
					className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
				/>

				{/* Floating Modal Frame */}
				<motion.div
					initial={
						safeReduceMotion ? false : { opacity: 0, scale: 0.95, y: 16 }
					}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.95, y: 16 }}
					transition={{ type: "spring", damping: 28, stiffness: 350 }}
					className="relative w-full max-w-md sm:max-w-lg bg-[#FAFBFD] rounded-[32px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] overflow-hidden z-10 text-slate-900"
					onClick={(e) => e.stopPropagation()}
				>
					{/* ── TOP HEADER ── */}
					<div className="p-5 pb-3.5 border-b border-slate-100/90 bg-white/70 backdrop-blur-md">
						<div className="flex items-start justify-between gap-3">
							<div className="flex items-center gap-3 min-w-0">
								{/* Icon Badge */}
								<div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center ring-4 ring-emerald-50 shrink-0 shadow-2xs">
									<ActivityIcon className="w-5 h-5 stroke-[2.5]" />
								</div>

								<div className="min-w-0 space-y-0.5">
									<div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
										<Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
										<span className="truncate">
											{formattedDate} · {formattedTime}
										</span>
									</div>
									<h3 className="text-base font-black text-slate-900 truncate leading-tight tracking-tight">
										{activity.name}
									</h3>
								</div>
							</div>

							<div className="flex items-center gap-1 shrink-0">
								<button
									type="button"
									onClick={handleShare}
									className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95"
									aria-label="Share activity"
									title={copiedLink ? "Link Copied!" : "Share activity"}
								>
									{copiedLink ? (
										<Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
									) : (
										<Share2 className="w-4 h-4" />
									)}
								</button>

								<button
									type="button"
									onClick={onClose}
									className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95"
									aria-label="Close modal"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Segmented Tab Controls & Copy Image Button */}
						<div className="flex items-center justify-between gap-2 mt-3.5 pt-0.5">
							{/* Segmented Pill Tabs */}
							<div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-2xs">
								<button
									type="button"
									onClick={() => setActiveTab("overview")}
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
										activeTab === "overview"
											? "bg-white text-slate-900 shadow-xs ring-1 ring-slate-900/5"
											: "text-slate-500 hover:text-slate-800"
									}`}
								>
									<BarChart3 className="w-3.5 h-3.5" />
									<span>Overview</span>
								</button>

								<button
									type="button"
									onClick={() => setActiveTab("splits")}
									className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
										activeTab === "splits"
											? "bg-slate-900 text-white shadow-xs"
											: "text-slate-500 hover:text-slate-800"
									}`}
								>
									<BarChart3 className="w-3.5 h-3.5" />
									<span>Splits ({splits.length} km)</span>
								</button>
							</div>

							{/* Theme Toggle + Copy Image */}
							<div className="flex items-center gap-1">
								{/* Light/Dark Theme Toggle */}
								<button
									type="button"
									onClick={() =>
										setExportTheme((t) => (t === "light" ? "dark" : "light"))
									}
									className={`p-1.5 rounded-xl transition-all active:scale-90 cursor-pointer ${
										exportTheme === "dark"
											? "bg-slate-800 text-amber-300 shadow-xs"
											: "bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100"
									}`}
									title={`Export as ${exportTheme === "light" ? "dark" : "light"} theme`}
								>
									{exportTheme === "dark" ? (
										<Moon className="w-3.5 h-3.5" />
									) : (
										<Sun className="w-3.5 h-3.5" />
									)}
								</button>

								{/* Copy Transparent PNG Image Button */}
								<button
									type="button"
									disabled={isCopying}
									onClick={() => handleCopyImage(activeTab)}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-transparent hover:bg-slate-100 text-slate-900 hover:text-indigo-600 text-xs font-black transition-all active:scale-95 cursor-pointer disabled:opacity-50 group"
									title="Copy transparent PNG sticker to clipboard"
								>
									{isCopying ? (
										<>
											<Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
											<span className="text-emerald-700 font-black text-xs">
												Generating...
											</span>
										</>
									) : copiedTab === activeTab ? (
										<>
											<Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
											<span className="text-emerald-700 font-black text-xs">
												Copied Sticker!
											</span>
										</>
									) : (
										<>
											<ImageIcon className="w-3.5 h-3.5 text-slate-800 group-hover:text-indigo-600 transition-colors stroke-[2.5]" />
											<span className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
												{activeTab === "overview"
													? "Copy Sticker"
													: "Copy Splits"}
											</span>
										</>
									)}
								</button>
							</div>
						</div>
					</div>

					{/* ── BODY CONTENT ── */}
					<div className="p-5 space-y-3.5 max-h-[calc(85vh-150px)] overflow-y-auto">
						{activeTab === "overview" ? (
							/* ── TAB 1: OVERVIEW METRICS (SIMPLE & STRAIGHT TO THE POINT) ── */
							<div className="space-y-3">
								{/* 1. Floating Hero Card (Distance & Moving Duration) */}
								<div className="relative rounded-3xl bg-white p-5 border border-slate-200/80 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.05),0_2px_6px_rgba(0,0,0,0.03)] space-y-3">
									<div className="flex items-start justify-between gap-4">
										<div className="space-y-1">
											<span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
												<Route className="w-3.5 h-3.5 text-emerald-500" />
												Total Distance
											</span>
											<div className="flex items-baseline gap-1.5">
												<span className="text-4xl font-black text-slate-950 font-mono tracking-tight leading-none">
													{distanceKm}
												</span>
												<span className="text-sm font-black text-emerald-600 font-mono">
													km
												</span>
											</div>
										</div>

										<div className="text-right space-y-1">
											<span className="text-[10.5px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1.5">
												<Clock className="w-3.5 h-3.5 text-blue-500" />
												Moving Time
											</span>
											<p className="text-2xl font-black text-slate-900 font-mono tracking-tight leading-none">
												{formattedMovingDuration}
											</p>
										</div>
									</div>

									{/* Alert / Highlight Badge */}
									<div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
										<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200/70 shadow-2xs">
											<Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
											<span>
												{fastestSplit
													? `Best Split: KM ${fastestSplit.split} at ${fastestSplit.paceFormatted}/km`
													: "Pace Consistency: Stable"}
											</span>
										</div>

										<div className="text-[11px] font-bold text-slate-400 font-mono">
											Avg {formattedPace}
										</div>
									</div>
								</div>

								{/* 2. Clean Core Metrics Grid */}
								<div
									className={`grid ${
										hasHeartRate ? "grid-cols-3" : "grid-cols-2"
									} gap-2.5`}
								>
									{/* Average Pace */}
									<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
											<Zap className="w-3.5 h-3.5 text-amber-500" />
											Avg Pace
										</span>
										<p className="text-base sm:text-lg font-black text-slate-900 font-mono">
											{formattedPace}
										</p>
									</div>

									{/* Elevation Gain */}
									<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
										<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
											<Mountain className="w-3.5 h-3.5 text-purple-500" />
											Elevation
										</span>
										<p className="text-base sm:text-lg font-black text-purple-900 font-mono">
											{hasElevation
												? `+${activity.total_elevation_gain} m`
												: "Flat"}
										</p>
									</div>

									{/* Heart Rate (if available) */}
									{hasHeartRate && (
										<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
												<Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
												Avg HR
											</span>
											<p className="text-base sm:text-lg font-black text-rose-900 font-mono">
												{Math.round(activity.average_heartrate!)}{" "}
												<span className="text-xs font-normal text-slate-400">
													bpm
												</span>
											</p>
										</div>
									)}
								</div>
							</div>
						) : (
							/* ── TAB 2: SPLITS BREAKDOWN (REAL STRAVA SPLITS) ── */
							<div className="space-y-3">
								{/* Summary Header Card */}
								<div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2 text-xs">
									<div className="flex items-center gap-1.5">
										<span className="w-2 h-2 rounded-full bg-emerald-500" />
										<span className="font-bold text-slate-500">Fastest:</span>
										<span className="font-mono font-black text-emerald-700">
											{fastestSplit
												? `KM ${fastestSplit.split} (${fastestSplit.paceFormatted}/km)`
												: "—"}
										</span>
									</div>
									<div className="flex items-center gap-1.5 font-bold text-slate-500">
										<span>Avg:</span>
										<span className="font-mono font-black text-slate-900">
											{formattedPace}
										</span>
									</div>
								</div>

								{/* Splits Vertical List */}
								{isLoadingSplits && splits.length === 0 ? (
									<div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-bold">
										<Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
										<span>Loading real Strava splits...</span>
									</div>
								) : (
									<div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
										{splits.map((item) => {
											const paceSpread = Math.max(
												maxSplitPaceSec - minSplitPaceSec,
												1,
											);
											const paceRatio =
												1 - (item.paceSeconds - minSplitPaceSec) / paceSpread;
											const barWidthPercent = Math.max(
												42,
												Math.min(100, 45 + paceRatio * 55),
											);

											const isFasterThanAvg = item.paceSeconds <= paceSeconds;
											const barBg = item.isFastest
												? "bg-emerald-500 text-white shadow-xs"
												: isFasterThanAvg
													? "bg-purple-500 text-white"
													: "bg-amber-400 text-slate-950";

											return (
												<div
													key={item.split}
													className="p-2.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs hover:shadow-xs transition-shadow flex items-center gap-3"
												>
													{/* KM Badge */}
													<div className="w-10 shrink-0 text-left">
														<span className="font-black text-slate-900 text-xs font-mono">
															KM {item.split}
														</span>
														{item.distanceKm < 1.0 && (
															<span className="text-[9px] text-slate-400 font-bold block">
																{item.distanceKm}k
															</span>
														)}
													</div>

													{/* Pill Progress Bar Container */}
													<div className="flex-1 bg-slate-100 rounded-xl h-7 relative overflow-hidden flex items-center px-2.5 border border-slate-200/60">
														<motion.div
															initial={{ width: 0 }}
															animate={{ width: `${barWidthPercent}%` }}
															transition={{
																duration: 0.35,
																delay: item.split * 0.02,
															}}
															className={`absolute left-0 top-0 bottom-0 rounded-xl ${barBg}`}
														/>

														{/* Overlaid Pace Info */}
														<div className="relative z-10 flex items-center justify-between w-full text-[11px] font-black font-mono">
															<span className="flex items-center gap-1.5 drop-shadow-2xs">
																<span>{item.paceFormatted}</span>
																<span className="text-[9px] opacity-80 font-bold">
																	/km
																</span>
																{item.isFastest && (
																	<span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 text-[8px] font-black uppercase tracking-wider shadow-xs">
																		<Zap className="w-2.5 h-2.5 fill-amber-300" />{" "}
																		Top
																	</span>
																)}
															</span>
														</div>
													</div>

													{/* Right Metric: HR or Moving Duration */}
													{item.heartrate ? (
														<div className="w-16 shrink-0 flex items-center justify-end gap-1 text-[11px] font-black text-rose-600 font-mono">
															<Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
															<span>{item.heartrate}</span>
															<span className="text-[9px] text-slate-400 font-normal">
																bpm
															</span>
														</div>
													) : (
														<div className="w-14 shrink-0 text-right text-[11px] font-bold text-slate-500 font-mono">
															{item.movingTimeFormatted}
														</div>
													)}
												</div>
											);
										})}
									</div>
								)}
							</div>
						)}
					</div>

					{/* ── FOOTER ACTIONS ── */}
					<div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
						>
							Close
						</button>

						<div className="flex items-center gap-2">
							{/* Direct Copy Activity Link Button */}
							<button
								type="button"
								onClick={handleShare}
								className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
								title="Copy direct link to this activity"
							>
								{copiedLink ? (
									<>
										<Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
										<span className="text-emerald-400">Link Copied!</span>
									</>
								) : (
									<>
										<Share2 className="w-3.5 h-3.5" />
										<span>Copy Link</span>
									</>
								)}
							</button>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
