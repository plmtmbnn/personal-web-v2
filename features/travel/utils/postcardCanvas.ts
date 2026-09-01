import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";

/* ═══════════════════════════════════════════════════════════════════════
 * Layout Constants — Full-Bleed Photo with Airmail Border
 * ═══════════════════════════════════════════════════════════════════ */

/** Canvas logical dimensions */
const CANVAS_W = 800;
const CANVAS_H = 500;

/** Border config */
const BORDER_WIDTH = 16;

/** Inner content area (photo zone) */
const INNER_X = BORDER_WIDTH;
const INNER_Y = BORDER_WIDTH;
const INNER_W = CANVAS_W - BORDER_WIDTH * 2;
const INNER_H = CANVAS_H - BORDER_WIDTH * 2;
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

/** Get 2-letter ISO country code for flag CDN */
function getCountryCode(country: string): string | null {
	const codes: Record<string, string> = {
		Indonesia: "id",
		Thailand: "th",
		Vietnam: "vn",
		Japan: "jp",
		"United Kingdom": "gb",
		Netherlands: "nl",
		Iceland: "is",
		China: "cn",
		Malaysia: "my",
		Singapore: "sg",
		France: "fr",
	};
	return codes[country] || null;
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

/** Plain white border around the entire canvas */
function drawPlainBorder(ctx: CanvasRenderingContext2D) {
	ctx.save();
	ctx.fillStyle = "#FFFFFF";
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
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
	const borderColor = isVisited ? "#059669" : "#D97706";
	const textColor = isVisited ? "#047857" : "#B45309";
	const bgColor = "#FFFFFF";

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

	// Drop shadow for sticker effect
	ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
	ctx.shadowBlur = 12;
	ctx.shadowOffsetY = 4;

	// Solid background
	ctx.fillStyle = bgColor;
	ctx.fillRect(-stampW / 2, -stampH / 2, stampW, stampH);

	// Remove shadow for borders and text
	ctx.shadowColor = "transparent";

	// Outer border (thick)
	ctx.strokeStyle = borderColor;
	ctx.lineWidth = 3;
	ctx.strokeRect(-stampW / 2, -stampH / 2, stampW, stampH);

	// Inner border
	ctx.lineWidth = 1;
	ctx.strokeRect(-stampW / 2 + 4, -stampH / 2 + 4, stampW - 8, stampH - 8);

	// Bold label
	ctx.fillStyle = textColor;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(label, 0, 1);

	ctx.restore();
}

/** Draw bold "TRAVEL POSTCARD" rubber stamp */
async function drawAirMailStamp(
	ctx: CanvasRenderingContext2D,
	country: string,
) {
	ctx.save();

	const innerW = 140;
	const innerH = 76;
	const pad = 12; // white padding
	const stampW = innerW + pad * 2;
	const stampH = innerH + pad * 2;

	const stampX = INNER_X + INNER_W - stampW - 16;
	const stampY = INNER_Y + 16;

	ctx.translate(stampX + stampW / 2, stampY + stampH / 2);
	ctx.rotate(-0.06);

	// Create offscreen canvas for scalloped edge
	const offscreen = document.createElement("canvas");
	offscreen.width = stampW;
	offscreen.height = stampH;
	const octx = offscreen.getContext("2d");
	if (octx) {
		octx.fillStyle = "#FFFFFF";
		octx.fillRect(0, 0, stampW, stampH);

		octx.globalCompositeOperation = "destination-out";
		octx.fillStyle = "#000000";
		const radius = 3.5;
		const spacing = 12;
		for (let x = 0; x <= stampW; x += spacing) {
			octx.beginPath();
			octx.arc(x, 0, radius, 0, Math.PI * 2);
			octx.fill();
			octx.beginPath();
			octx.arc(x, stampH, radius, 0, Math.PI * 2);
			octx.fill();
		}
		for (let y = 0; y <= stampH; y += spacing) {
			octx.beginPath();
			octx.arc(0, y, radius, 0, Math.PI * 2);
			octx.fill();
			octx.beginPath();
			octx.arc(stampW, y, radius, 0, Math.PI * 2);
			octx.fill();
		}
	}

	// Drop shadow for sticker effect
	ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
	ctx.shadowBlur = 12;
	ctx.shadowOffsetY = 6;
	ctx.drawImage(offscreen, -stampW / 2, -stampH / 2);

	// Remove shadow for borders and text
	ctx.shadowColor = "transparent";

	// Outer red border rectangle (slate-800)
	ctx.strokeStyle = "#1E293B";
	ctx.lineWidth = 3;
	ctx.strokeRect(-innerW / 2, -innerH / 2, innerW, innerH);

	// Inner red border (slate-800)
	ctx.lineWidth = 1;
	ctx.strokeRect(-innerW / 2 + 4, -innerH / 2 + 4, innerW - 8, innerH - 8);

	// "TRAVEL" text
	ctx.fillStyle = "#1E293B";
	ctx.font = "900 14px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("TRAVEL", 0, -14);

	// "POSTCARD" text — big and bold
	ctx.font = "900 20px 'Montserrat', sans-serif";
	ctx.fillText("POSTCARD", 0, 10);

	// Flag with horizontal lines
	const countryCode = getCountryCode(country);

	const lineW = 20;
	const gap = 6;
	const bottomY = 26;

	let flagW = 14;

	if (countryCode) {
		const flagImg = await loadImage(
			`https://flagcdn.com/w40/${countryCode}.png`,
		);
		if (flagImg) {
			const imgW = 20;
			const imgH = (flagImg.height / flagImg.width) * imgW;
			flagW = imgW;
			// Draw shadow for flag to match DOM
			ctx.shadowColor = "rgba(0,0,0,0.3)";
			ctx.shadowBlur = 2;
			ctx.shadowOffsetY = 1;
			ctx.drawImage(flagImg, -imgW / 2, bottomY - imgH / 2, imgW, imgH);
			ctx.shadowColor = "transparent";
		}
	} else {
		ctx.font = "14px sans-serif";
		flagW = ctx.measureText("🌍").width;
		ctx.fillText("🌍", 0, bottomY + 5);
	}

	// Lines
	ctx.strokeStyle = "#1E293B";
	ctx.lineWidth = 2;
	ctx.beginPath();
	// Left line
	ctx.moveTo(-flagW / 2 - gap - lineW, bottomY);
	ctx.lineTo(-flagW / 2 - gap, bottomY);
	// Right line
	ctx.moveTo(flagW / 2 + gap, bottomY);
	ctx.lineTo(flagW / 2 + gap + lineW, bottomY);
	ctx.stroke();

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

	// 1. Plain border (fills edges)
	drawPlainBorder(ctx);

	// 2. Photo background (inside border)
	await drawPhotoBackground(ctx, destination);

	// 3. Gradient + content overlays
	drawGradientOverlay(ctx);
	drawStatusBadge(ctx, destination.isVisited);
	await drawAirMailStamp(ctx, destination.country);
	drawTextContent(ctx, destination);

	return canvas;
}
