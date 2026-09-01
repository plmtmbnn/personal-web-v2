import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";

/* ═══════════════════════════════════════════════════════════════════════
 * Layout Constants — Full-Bleed Photo with Airmail Border
 * ═══════════════════════════════════════════════════════════════════ */

/** Canvas logical dimensions */
const CANVAS_W = 800;
const CANVAS_H = 500;

/** Airmail border stripe config */
const AIRMAIL_BORDER = 12;
const AIRMAIL_STRIPE_W = 18;
const AIRMAIL_COLORS = ["#1E3A8A", "#FAF5EC", "#ffffffff", "#FAF5EC"] as const;

/** Inner content area (photo zone) */
const INNER_X = AIRMAIL_BORDER;
const INNER_Y = AIRMAIL_BORDER;
const INNER_W = CANVAS_W - AIRMAIL_BORDER * 2;
const INNER_H = CANVAS_H - AIRMAIL_BORDER * 2;
const INNER_RADIUS = 6;

/** Colors */
const TEXT_WHITE = "#FFFFFF";
const TEXT_SUBTITLE = "rgba(255, 255, 255, 0.85)";
const TEXT_MUTED = "rgba(255, 255, 255, 0.6)";

/** Typography */
const FONT_SERIF_HUGE = "900 46px 'Georgia', serif";
const FONT_SERIF_ITALIC = "italic 15px 'Georgia', serif";
const FONT_SANS_BOLD = "bold 15px 'Montserrat', sans-serif";
const FONT_SANS_CAPS = "bold 11px 'Montserrat', sans-serif";
const FONT_SANS_TINY = "800 10px 'Montserrat', sans-serif";

/* ═══════════════════════════════════════════════════════════════════════
 * Drawing helpers
 * ═══════════════════════════════════════════════════════════════════ */

/** Rounded rectangle path */
function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + r, y);
	ctx.lineTo(x + w - r, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + r);
	ctx.lineTo(x + w, y + h - r);
	ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	ctx.lineTo(x + r, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - r);
	ctx.lineTo(x, y + r);
	ctx.quadraticCurveTo(x, y, x + r, y);
	ctx.closePath();
}

/** Load image with CORS */
async function loadImage(url: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new window.Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = url.replace(/w=\d+/, "w=1600").replace(/h=\d+/, "h=1000");
	});
}

/** Format visit date for display */
function formatDate(visitedDate: string | undefined): string {
	if (!visitedDate) return "Pending";
	const [yr, mo] = visitedDate.split("-");
	const mn = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	return `${mn[parseInt(mo, 10) - 1]} ${yr}`;
}

/** Word-wrap text */
function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number,
): string[] {
	const words = text.split(" ");
	const lines: string[] = [];
	let cur = "";
	for (let i = 0; i < words.length; i++) {
		const test = `${cur}${words[i]} `;
		if (ctx.measureText(test).width > maxWidth && i > 0) {
			lines.push(cur.trim());
			cur = `${words[i]} `;
			if (lines.length >= maxLines) break;
		} else {
			cur = test;
		}
	}
	if (lines.length < maxLines && cur.trim()) lines.push(cur.trim());
	return lines;
}

/* ═══════════════════════════════════════════════════════════════════════
 * Section renderers
 * ═══════════════════════════════════════════════════════════════════ */

/** Classic airmail diagonal stripe border around the entire canvas */
function drawAirmailBorder(ctx: CanvasRenderingContext2D) {
	ctx.save();

	const totalStripes = Math.ceil(
		((CANVAS_W + CANVAS_H) * 2) / AIRMAIL_STRIPE_W,
	);

	// Top border
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, CANVAS_W, AIRMAIL_BORDER);
	ctx.clip();
	for (let i = -10; i < totalStripes; i++) {
		ctx.fillStyle = AIRMAIL_COLORS[((i % 4) + 4) % 4];
		ctx.beginPath();
		const x = i * AIRMAIL_STRIPE_W;
		ctx.moveTo(x, 0);
		ctx.lineTo(x + AIRMAIL_STRIPE_W, 0);
		ctx.lineTo(x + AIRMAIL_STRIPE_W - AIRMAIL_BORDER, AIRMAIL_BORDER);
		ctx.lineTo(x - AIRMAIL_BORDER, AIRMAIL_BORDER);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();

	// Bottom border
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, CANVAS_H - AIRMAIL_BORDER, CANVAS_W, AIRMAIL_BORDER);
	ctx.clip();
	for (let i = -10; i < totalStripes; i++) {
		ctx.fillStyle = AIRMAIL_COLORS[((i % 4) + 4) % 4];
		ctx.beginPath();
		const x = i * AIRMAIL_STRIPE_W;
		ctx.moveTo(x - AIRMAIL_BORDER, CANVAS_H - AIRMAIL_BORDER);
		ctx.lineTo(
			x + AIRMAIL_STRIPE_W - AIRMAIL_BORDER,
			CANVAS_H - AIRMAIL_BORDER,
		);
		ctx.lineTo(x + AIRMAIL_STRIPE_W, CANVAS_H);
		ctx.lineTo(x, CANVAS_H);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();

	// Left border
	ctx.save();
	ctx.beginPath();
	ctx.rect(0, 0, AIRMAIL_BORDER, CANVAS_H);
	ctx.clip();
	for (let i = -10; i < totalStripes; i++) {
		ctx.fillStyle = AIRMAIL_COLORS[((i % 4) + 4) % 4];
		ctx.beginPath();
		const y = i * AIRMAIL_STRIPE_W;
		ctx.moveTo(0, y);
		ctx.lineTo(AIRMAIL_BORDER, y - AIRMAIL_BORDER);
		ctx.lineTo(AIRMAIL_BORDER, y + AIRMAIL_STRIPE_W - AIRMAIL_BORDER);
		ctx.lineTo(0, y + AIRMAIL_STRIPE_W);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();

	// Right border
	ctx.save();
	ctx.beginPath();
	ctx.rect(CANVAS_W - AIRMAIL_BORDER, 0, AIRMAIL_BORDER, CANVAS_H);
	ctx.clip();
	for (let i = -10; i < totalStripes; i++) {
		ctx.fillStyle = AIRMAIL_COLORS[((i % 4) + 4) % 4];
		ctx.beginPath();
		const y = i * AIRMAIL_STRIPE_W;
		ctx.moveTo(CANVAS_W - AIRMAIL_BORDER, y - AIRMAIL_BORDER);
		ctx.lineTo(CANVAS_W, y);
		ctx.lineTo(CANVAS_W, y + AIRMAIL_STRIPE_W);
		ctx.lineTo(
			CANVAS_W - AIRMAIL_BORDER,
			y + AIRMAIL_STRIPE_W - AIRMAIL_BORDER,
		);
		ctx.closePath();
		ctx.fill();
	}
	ctx.restore();

	ctx.restore();
}

/** Draw full-bleed photo inside the inner area */
async function drawPhotoBackground(
	ctx: CanvasRenderingContext2D,
	destination: Destination,
) {
	const img = await loadImage(destination.imageUrl);

	ctx.save();
	drawRoundedRect(ctx, INNER_X, INNER_Y, INNER_W, INNER_H, INNER_RADIUS);
	ctx.clip();

	if (img) {
		if (!destination.isVisited)
			ctx.filter = "grayscale(100%) contrast(105%) brightness(95%)";

		const ir = img.width / img.height;
		const cr = INNER_W / INNER_H;
		let sx: number, sy: number, sw: number, sh: number;

		if (ir > cr) {
			sh = img.height;
			sw = sh * cr;
			sx = (img.width - sw) / 2;
			sy = 0;
		} else {
			sw = img.width;
			sh = sw / cr;
			sx = 0;
			sy = (img.height - sh) / 2;
		}

		ctx.drawImage(img, sx, sy, sw, sh, INNER_X, INNER_Y, INNER_W, INNER_H);
		ctx.filter = "none";
	} else {
		ctx.fillStyle = destination.isVisited ? "#059669" : "#D97706";
		ctx.fillRect(INNER_X, INNER_Y, INNER_W, INNER_H);
	}
	ctx.restore();
}

/** Draw dramatic dark gradient at the bottom */
function drawGradientOverlay(ctx: CanvasRenderingContext2D) {
	ctx.save();
	drawRoundedRect(ctx, INNER_X, INNER_Y, INNER_W, INNER_H, INNER_RADIUS);
	ctx.clip();

	const gradient = ctx.createLinearGradient(
		0,
		INNER_Y + INNER_H * 0.35,
		0,
		INNER_Y + INNER_H,
	);
	gradient.addColorStop(0, "rgba(0,0,0,0)");
	gradient.addColorStop(0.4, "rgba(0,0,0,0.6)");
	gradient.addColorStop(1, "rgba(10,10,10,0.95)");

	ctx.fillStyle = gradient;
	ctx.fillRect(INNER_X, INNER_Y, INNER_W, INNER_H);
	ctx.restore();
}

/** Draw bold single-word status stamp top-left */
function drawStatusBadge(ctx: CanvasRenderingContext2D, isVisited: boolean) {
	ctx.save();

	const label = isVisited ? "VISITED" : "WISHLIST";
	const color = isVisited ? "#059669" : "#D97706";

	ctx.font = "900 20px 'Montserrat', sans-serif";
	const tw = ctx.measureText(label).width;
	const padX = 14;
	const padY = 8;
	const stampW = tw + padX * 2;
	const stampH = 20 + padY * 2;
	const stampX = INNER_X + 22;
	const stampY = INNER_Y + 18;

	ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
	ctx.rotate(-0.06);

	ctx.strokeStyle = color;

	// Outer border (thick)
	ctx.lineWidth = 3;
	ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);

	// Inner border
	ctx.lineWidth = 1;
	ctx.strokeRect(-stampW / 2 + 4, -stampH / 2 + 4, stampW - 8, stampH - 8);

	// Bold label
	ctx.fillStyle = color;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, 0, 1);

	ctx.restore();
}

/** Draw bold "VIA AIR MAIL" rubber stamp — iconic postcard signature */
function drawAirMailStamp(ctx: CanvasRenderingContext2D) {
	ctx.save();

	const stampW = 140;
	const stampH = 72;
	const stampX = INNER_X + INNER_W - stampW - 24;
	const stampY = INNER_Y + 20;

	ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
	ctx.rotate(-0.06);

	// Outer red border rectangle
	ctx.strokeStyle = "#F2F2F2";
	ctx.lineWidth = 3;
	ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);

	// Inner red border
	ctx.lineWidth = 1;
	ctx.strokeRect(-stampW / 2 + 4, -stampH / 2 + 4, stampW - 8, stampH - 8);

	// "VIA" text
	ctx.fillStyle = "#F2F2F2";
	ctx.font = "900 14px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("VIA", 0, -14);

	// "AIR MAIL" text — big and bold
	ctx.font = "900 22px 'Montserrat', sans-serif";
	ctx.fillText("AIR MAIL", 0, 10);

	// Horizontal lines below (classic postal lines)
	ctx.strokeStyle = "#F2F2F2";
	ctx.lineWidth = 2;
	for (let i = 0; i < 3; i++) {
		const lineY = 20 + i * 5;
		const lineHalfW = 52 - i * 8;
		ctx.beginPath();
		ctx.moveTo(-lineHalfW, lineY);
		ctx.lineTo(lineHalfW, lineY);
		ctx.stroke();
	}

	ctx.restore();
}

/** Draw editorial text overlay on the gradient */
function drawTextContent(
	ctx: CanvasRenderingContext2D,
	destination: Destination,
) {
	const padX = INNER_X + 28;
	let curY = INNER_Y + INNER_H - 170;

	ctx.textAlign = "left";

	// 1. Route type + Expedition
	ctx.fillStyle = TEXT_MUTED;
	ctx.font = FONT_SANS_CAPS;
	ctx.letterSpacing = "2px";
	const routeTag =
		destination.type === "domestic" ? "✦ DOMESTIC" : "✦ INTERNATIONAL";
	const expText = ` · EXPEDITION #${destination.id.padStart(4, "0")}`;
	ctx.fillText(routeTag + expText, padX, curY);
	ctx.letterSpacing = "0px";

	// 2. Destination name
	curY += 52;
	ctx.fillStyle = TEXT_WHITE;
	ctx.font = FONT_SERIF_HUGE;
	ctx.fillText(destination.name, padX, curY);

	// 3. Location subtitle
	curY += 26;
	ctx.fillStyle = TEXT_SUBTITLE;
	ctx.font = FONT_SANS_BOLD;
	ctx.fillText(`${destination.location}, ${destination.country}`, padX, curY);

	// 4. Description quote
	curY += 30;
	ctx.fillStyle = TEXT_WHITE;
	ctx.font = FONT_SERIF_ITALIC;
	const maxWidth = INNER_W - 56;
	const lines = wrapText(ctx, `"${destination.description}"`, maxWidth, 2);
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], padX, curY + i * 22);
	}

	// 5. Footer
	curY = INNER_Y + INNER_H - 26;

	ctx.strokeStyle = "rgba(255,255,255,0.15)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(padX, curY - 14);
	ctx.lineTo(INNER_X + INNER_W - 28, curY - 14);
	ctx.stroke();

	ctx.fillStyle = TEXT_MUTED;
	ctx.font = FONT_SANS_TINY;
	ctx.letterSpacing = "1.5px";
	const dateStr = formatDate(destination.visitedDate).toUpperCase();
	ctx.fillText(`${AUTHOR.name.toUpperCase()} · ${dateStr}`, padX, curY);
	ctx.letterSpacing = "0px";
}

/* ═══════════════════════════════════════════════════════════════════════
 * Public export
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * Render the editorial postcard with airmail border to canvas
 * for high-resolution PNG sticker export.
 */
export async function renderPostcardToCanvas(
	destination: Destination,
	scale = 2,
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement("canvas");
	canvas.width = CANVAS_W * scale;
	canvas.height = CANVAS_H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context unavailable");

	ctx.scale(scale, scale);

	// 1. Airmail border (fills edges)
	drawAirmailBorder(ctx);

	// 2. Photo background (inside border)
	await drawPhotoBackground(ctx, destination);

	// 3. Gradient + content overlays
	drawGradientOverlay(ctx);
	drawStatusBadge(ctx, destination.isVisited);
	drawAirMailStamp(ctx);
	drawTextContent(ctx, destination);

	return canvas;
}
