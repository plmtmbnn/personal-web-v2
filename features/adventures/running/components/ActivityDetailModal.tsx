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
	ExternalLink,
	BarChart3,
	Check,
	ImageIcon,
	Loader2,
	Activity as ActivityIcon,
	Mountain,
	Sun,
	Moon,
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
// Shared Canvas Typography Constants
// ──────────────────────────────────────────────
const FONT = {
	hero: "900 72px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	heroUnit: "700 24px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	title: "800 18px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	subtitle: "700 11px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	label: "800 9px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	statValue: "900 22px 'SF Mono', 'JetBrains Mono', monospace",
	statLabel: "700 9px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	splitKm: "900 12px 'SF Mono', 'JetBrains Mono', monospace",
	splitPace: "800 10px 'SF Mono', 'JetBrains Mono', monospace",
	splitBarPace: "800 9px 'SF Mono', 'JetBrains Mono', monospace",
	watermark: "600 9px 'SF Pro Display', 'Inter', system-ui, sans-serif",
	summaryBold: "900 13px 'SF Mono', 'JetBrains Mono', monospace",
	summaryAccent: "900 12px 'SF Mono', 'JetBrains Mono', monospace",
	badge: "900 10px 'SF Pro Display', 'Inter', system-ui, sans-serif",
};

type CanvasTheme = "light" | "dark";

const THEME_COLORS = {
	light: {
		black: "#0a0a0a",
		dark: "#18181b",
		mid: "#71717a",
		light: "#a1a1aa",
		faint: "#d4d4d8",
		accent: "#10b981",
		accentDark: "#059669",
		fastest: "#10b981",
		aboveAvg: "#8b5cf6",
		belowAvg: "#f59e0b",
		heart: "#ef4444",
		white: "#ffffff",
		barTrack: "rgba(0, 0, 0, 0.04)",
	},
	dark: {
		black: "#f5f5f5",
		dark: "#e4e4e7",
		mid: "#a1a1aa",
		light: "#71717a",
		faint: "#3f3f46",
		accent: "#34d399",
		accentDark: "#6ee7b7",
		fastest: "#34d399",
		aboveAvg: "#a78bfa",
		belowAvg: "#fbbf24",
		heart: "#f87171",
		white: "#18181b",
		barTrack: "rgba(255, 255, 255, 0.08)",
	},
} as const;

function getColors(theme: CanvasTheme) {
	return THEME_COLORS[theme];
}

// ──────────────────────────────────────────────
// Canvas Exporter: Overview — Bold Minimal Instagram Sticker
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
	splits: ActivitySplit[],
	theme: CanvasTheme = "light",
	scale = 2,
): HTMLCanvasElement {
	const W = 420;
	const pad = 28;
	const innerW = W - pad * 2;

	// Dynamic height calculation
	let contentH = 0;
	contentH += 14; // top label
	contentH += 8; // gap
	contentH += 68; // hero distance
	contentH += 6; // gap
	contentH += 16; // unit "KILOMETERS"
	contentH += 24; // divider gap
	contentH += 1; // divider line
	contentH += 20; // gap below divider
	// Stats row (pace + time + optionally elevation/HR)
	contentH += 38; // stat block height
	contentH += 20; // gap
	contentH += 1; // second divider
	contentH += 16; // gap below divider
	contentH += 14; // title line
	contentH += 6; // gap
	contentH += 12; // date line
	contentH += 20; // bottom spacing
	contentH += 10; // watermark

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

	// ── 1. Top Label: "RUN"
	ctx.fillStyle = C.accent;
	ctx.font = FONT.label;
	ctx.letterSpacing = "3px";
	ctx.fillText("RUN", pad, y + 9);
	ctx.letterSpacing = "0px";
	y += 14 + 8;

	// ── 2. Hero Distance (massive)
	ctx.fillStyle = C.black;
	ctx.font = FONT.hero;
	ctx.fillText(derived.distanceKm, pad - 4, y + 62);
	y += 68 + 6;

	// ── 3. Unit label
	ctx.fillStyle = C.mid;
	ctx.font = FONT.heroUnit;
	ctx.letterSpacing = "6px";
	ctx.fillText("KILOMETERS", pad, y + 14);
	ctx.letterSpacing = "0px";
	y += 16 + 24;

	// ── 4. Horizontal divider
	ctx.strokeStyle = C.faint;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 20;

	// ── 5. Stats Row
	const stats: Array<{ value: string; label: string; color?: string }> = [
		{ value: derived.formattedPace, label: "PACE" },
		{ value: derived.formattedMovingDuration, label: "TIME" },
	];

	if (derived.hasElevation) {
		stats.push({
			value: `+${activity.total_elevation_gain}m`,
			label: "ELEV",
		});
	}
	if (derived.hasHeartRate && activity.average_heartrate) {
		stats.push({
			value: `${Math.round(activity.average_heartrate)}`,
			label: "AVG HR",
			color: C.heart,
		});
	}

	const statColW = innerW / stats.length;
	stats.forEach((stat, i) => {
		const sx = pad + i * statColW;
		// Value
		ctx.fillStyle = stat.color || C.dark;
		ctx.font = FONT.statValue;
		ctx.fillText(stat.value, sx, y + 18);
		// Label
		ctx.fillStyle = C.light;
		ctx.font = FONT.statLabel;
		ctx.letterSpacing = "1.5px";
		ctx.fillText(stat.label, sx, y + 34);
		ctx.letterSpacing = "0px";
	});
	y += 38 + 20;

	// ── 6. Second divider
	ctx.strokeStyle = C.faint;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 16;

	// ── 7. Activity Title
	ctx.fillStyle = C.dark;
	ctx.font = FONT.title;
	const titleText =
		activity.name.length > 30
			? `${activity.name.slice(0, 28)}…`
			: activity.name;
	ctx.fillText(titleText, pad, y + 12);
	y += 14 + 6;

	// ── 8. Date & Best Split
	const fastest = splits.find((s) => s.isFastest);
	ctx.fillStyle = C.mid;
	ctx.font = FONT.subtitle;
	const dateLine = `${derived.formattedDate} · ${derived.formattedTime}`;
	ctx.fillText(dateLine, pad, y + 10);

	if (fastest) {
		ctx.textAlign = "right";
		ctx.fillStyle = C.accentDark;
		ctx.font = FONT.badge;
		ctx.fillText(`⚡ ${fastest.paceFormatted}/km`, pad + innerW, y + 10);
		ctx.textAlign = "left";
	}
	y += 12 + 20;

	// ── 9. Watermark
	ctx.textAlign = "right";
	ctx.fillStyle = C.light;
	ctx.font = FONT.watermark;
	ctx.fillText("polmatambunan.my.id", pad + innerW, y + 8);
	ctx.textAlign = "left";

	return canvas;
}

// ──────────────────────────────────────────────
// Canvas Exporter: Splits — Bold Chart-Style Instagram Sticker
// ──────────────────────────────────────────────
function renderSplitsImageToCanvas(
	activity: StravaRunActivity,
	derived: {
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
	const W = 420;
	const pad = 28;
	const innerW = W - pad * 2;
	const maxSplitsToShow = Math.min(splits.length, 20);
	const splitRowH = 28;

	// Dynamic height
	let contentH = 0;
	contentH += 9; // label
	contentH += 8; // gap
	contentH += 18; // title
	contentH += 14; // gap
	contentH += 14; // summary line
	contentH += 18; // gap
	contentH += 1; // divider
	contentH += 14; // gap below divider
	contentH += maxSplitsToShow * splitRowH; // split rows
	contentH += 16; // gap
	contentH += 1; // bottom divider
	contentH += 14; // gap
	contentH += 10; // watermark

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

	// ── 1. Label "KM SPLITS"
	ctx.fillStyle = C.accent;
	ctx.font = FONT.label;
	ctx.letterSpacing = "3px";
	ctx.fillText("KM SPLITS", pad, y + 9);
	ctx.letterSpacing = "0px";
	y += 9 + 8;

	// ── 2. Activity Title
	ctx.fillStyle = C.dark;
	ctx.font = FONT.title;
	const titleText =
		activity.name.length > 34
			? `${activity.name.slice(0, 32)}…`
			: activity.name;
	ctx.fillText(titleText, pad, y + 14);
	y += 18 + 14;

	// ── 3. Summary Line: distance · avg pace · time
	ctx.fillStyle = C.dark;
	ctx.font = FONT.summaryBold;
	ctx.fillText(`${derived.distanceKm} km`, pad, y + 11);
	const distMetricW = ctx.measureText(`${derived.distanceKm} km`).width;

	ctx.fillStyle = C.mid;
	ctx.font = FONT.subtitle;
	ctx.fillText(
		`  ·  ${derived.formattedPace}  ·  ${derived.formattedMovingDuration}`,
		pad + distMetricW,
		y + 11,
	);

	// Best split on right
	const fastest = splits.find((s) => s.isFastest);
	if (fastest) {
		ctx.textAlign = "right";
		ctx.fillStyle = C.accentDark;
		ctx.font = FONT.summaryAccent;
		ctx.fillText(`⚡ ${fastest.paceFormatted}/km`, pad + innerW, y + 11);
		ctx.textAlign = "left";
	}
	y += 14 + 18;

	// ── 4. Divider
	ctx.strokeStyle = C.faint;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 14;

	// ── 5. Splits List
	const splitPaces = splits.map((s) => s.paceSeconds);
	const minPace = splitPaces.length > 0 ? Math.min(...splitPaces) : 0;
	const maxPace = splitPaces.length > 0 ? Math.max(...splitPaces) : 0;
	const paceSpread = Math.max(maxPace - minPace, 1);
	const avgPaceSec =
		activity.distance > 0
			? activity.moving_time / (activity.distance / 1000)
			: 0;

	const kmLabelW = 42;
	const paceTextW = 56;
	const rightMetricW = 58;
	const barGap = 8;
	const barMaxW = innerW - kmLabelW - paceTextW - rightMetricW - barGap * 3;
	const barH = 18;

	splits.slice(0, maxSplitsToShow).forEach((item) => {
		const rowY = y;
		const barCenterY = rowY + (splitRowH - barH) / 2;

		// KM number (left-aligned, monospace)
		ctx.fillStyle = C.mid;
		ctx.font = FONT.splitKm;
		const kmText = item.distanceKm < 1 ? `${item.split}*` : `${item.split}`;
		ctx.fillText(kmText, pad, rowY + splitRowH / 2 + 4);

		// Pace text
		const paceX = pad + kmLabelW + barGap;
		ctx.fillStyle = item.isFastest ? C.fastest : C.dark;
		ctx.font = FONT.splitPace;
		ctx.fillText(item.paceFormatted, paceX, rowY + splitRowH / 2 + 4);

		// Bar
		const barX = paceX + paceTextW;
		const paceRatio = 1 - (item.paceSeconds - minPace) / paceSpread;
		const barWidth = Math.max(
			barMaxW * 0.35,
			Math.min(barMaxW, barMaxW * (0.35 + paceRatio * 0.65)),
		);

		// Background track
		drawCanvasRoundedRect(ctx, barX, barCenterY, barMaxW, barH, 4);
		ctx.fillStyle = C.barTrack;
		ctx.fill();

		// Active bar
		drawCanvasRoundedRect(ctx, barX, barCenterY, barWidth, barH, 4);
		if (item.isFastest) {
			ctx.fillStyle = C.fastest;
		} else if (item.paceSeconds <= avgPaceSec) {
			ctx.fillStyle = C.aboveAvg;
		} else {
			ctx.fillStyle = C.belowAvg;
		}
		ctx.fill();

		// "⚡" badge inside bar for fastest
		if (item.isFastest && barWidth > 30) {
			ctx.fillStyle = C.white;
			ctx.font = "800 8px sans-serif";
			ctx.textAlign = "right";
			ctx.fillText("⚡", barX + barWidth - 4, barCenterY + 12);
			ctx.textAlign = "left";
		}

		// Right metric: HR or duration
		ctx.textAlign = "right";
		if (item.heartrate) {
			ctx.fillStyle = C.heart;
			ctx.font = FONT.splitPace;
			ctx.fillText(`${item.heartrate}`, pad + innerW, rowY + splitRowH / 2 + 4);
		} else {
			ctx.fillStyle = C.light;
			ctx.font = FONT.splitPace;
			ctx.fillText(
				item.movingTimeFormatted,
				pad + innerW,
				rowY + splitRowH / 2 + 4,
			);
		}
		ctx.textAlign = "left";

		y += splitRowH;
	});

	y += 16;

	// ── 6. Bottom divider
	ctx.strokeStyle = C.faint;
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(pad, y);
	ctx.lineTo(pad + innerW, y);
	ctx.stroke();
	y += 1 + 14;

	// ── 7. Watermark + date
	ctx.fillStyle = C.light;
	ctx.font = FONT.watermark;
	ctx.fillText(derived.formattedDate, pad, y + 8);

	ctx.textAlign = "right";
	ctx.fillText("polmatambunan.my.id", pad + innerW, y + 8);
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
	const [exportTheme, setExportTheme] = useState<CanvasTheme>("light");
	const [rawSplits, setRawSplits] = useState<StravaSplitMetric[] | null>(null);
	const [isLoadingSplits, setIsLoadingSplits] = useState(false);
	const reduceMotion = useReducedMotion();
	const safeReduceMotion = reduceMotion !== null && reduceMotion !== undefined;

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

							<button
								type="button"
								onClick={onClose}
								className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95"
								aria-label="Close modal"
							>
								<X className="w-4 h-4" />
							</button>
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
							{/* Direct Strava Link */}
							<a
								href={`https://www.strava.com/activities/${activity.id}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#FC5200] hover:bg-[#E04800] text-white text-xs font-black shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer !no-underline"
							>
								<span>Strava</span>
								<ExternalLink className="w-3.5 h-3.5" />
							</a>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
}
