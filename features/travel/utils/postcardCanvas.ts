import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";

/* ═══════════════════════════════════════════════════════════════════════
 * Layout Constants
 * ═══════════════════════════════════════════════════════════════════════ */

/** Canvas logical dimensions */
const CANVAS_W = 800;
const CANVAS_H = 500;

/** Border config (Front) */
const BORDER_TOP = 18;
const BORDER_SIDES = 18;
const BORDER_BOTTOM = 34; // slightly wider bottom for caption

const INNER_X = BORDER_SIDES;
const INNER_Y = BORDER_TOP;
const INNER_W = CANVAS_W - BORDER_SIDES * 2;
const INNER_H = CANVAS_H - BORDER_TOP - BORDER_BOTTOM;
const INNER_RADIUS = 2; // sharper corners for vintage feel

const VINTAGE_CREAM = "#FDFBF7";

/* ═══════════════════════════════════════════════════════════════════════
 * Drawing helpers
 * ═══════════════════════════════════════════════════════════════════════ */

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
 * ═══════════════════════════════════════════════════════════════════════ */

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

/** Draw bold "TRAVEL POSTCARD" rubber stamp */
async function drawAirMailStamp(
	ctx: CanvasRenderingContext2D,
	country: string,
	x: number,
	y: number,
) {
	ctx.save();

	const innerW = 100;
	const innerH = 120;
	const pad = 10;
	const stampW = innerW + pad * 2;
	const stampH = innerH + pad * 2;

	ctx.translate(x + stampW / 2, y + stampH / 2);
	ctx.rotate(0.04);

	// Create offscreen canvas for scalloped edge
	const offscreen = document.createElement("canvas");
	offscreen.width = stampW;
	offscreen.height = stampH;
	const octx = offscreen.getContext("2d");
	if (octx) {
		octx.fillStyle = "#EAE6DF"; // slightly darker cream for the stamp
		octx.fillRect(0, 0, stampW, stampH);

		octx.globalCompositeOperation = "destination-out";
		octx.fillStyle = "#000000";
		const radius = 3;
		const spacing = 10;
		for (let cx = 0; cx <= stampW; cx += spacing) {
			octx.beginPath();
			octx.arc(cx, 0, radius, 0, Math.PI * 2);
			octx.fill();
			octx.beginPath();
			octx.arc(cx, stampH, radius, 0, Math.PI * 2);
			octx.fill();
		}
		for (let cy = 0; cy <= stampH; cy += spacing) {
			octx.beginPath();
			octx.arc(0, cy, radius, 0, Math.PI * 2);
			octx.fill();
			octx.beginPath();
			octx.arc(stampW, cy, radius, 0, Math.PI * 2);
			octx.fill();
		}
	}

	ctx.drawImage(offscreen, -stampW / 2, -stampH / 2);

	// Outer border rectangle
	ctx.strokeStyle = "#334155";
	ctx.lineWidth = 1;
	ctx.strokeRect(-innerW / 2, -innerH / 2, innerW, innerH);

	// Flag with horizontal lines
	const countryCode = getCountryCode(country);

	if (countryCode) {
		const flagImg = await loadImage(
			`https://flagcdn.com/w80/${countryCode}.png`,
		);
		if (flagImg) {
			const imgW = 60;
			const imgH = (flagImg.height / flagImg.width) * imgW;
			ctx.drawImage(flagImg, -imgW / 2, -imgH / 2, imgW, imgH);
		}
	} else {
		ctx.font = "30px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("🌍", 0, 0);
	}

	ctx.textAlign = "left";
	ctx.fillText(
		country.substring(0, 3).toUpperCase(),
		-innerW / 2 + 6,
		innerH / 2 - 8,
	);

	ctx.restore();
}

/** Draw vintage postmark circles */
function drawPostmark(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(-0.2);

	ctx.strokeStyle = "rgba(51, 65, 85, 0.6)"; // slate-700 with opacity
	ctx.lineWidth = 1.5;

	// Outer circle
	ctx.beginPath();
	ctx.arc(0, 0, 45, 0, Math.PI * 2);
	ctx.stroke();

	// Inner circle
	ctx.beginPath();
	ctx.arc(0, 0, 30, 0, Math.PI * 2);
	ctx.stroke();

	// Date Text
	ctx.fillStyle = "rgba(51, 65, 85, 0.7)";
	ctx.font = "bold 10px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("POST OFF.", 0, -12);

	// Wavy lines exiting the postmark
	ctx.beginPath();
	for (let i = 0; i < 4; i++) {
		const lineY = -15 + i * 10;
		ctx.moveTo(45, lineY);
		// Draw a wave
		ctx.bezierCurveTo(70, lineY - 10, 80, lineY + 10, 105, lineY);
		ctx.bezierCurveTo(130, lineY - 10, 140, lineY + 10, 165, lineY);
	}
	ctx.stroke();

	ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════
 * Public export
 * ═══════════════════════════════════════════════════════════════════════ */

/**
 * Render the Front side of the postcard (Image + Caption)
 */
export async function renderPostcardFrontToCanvas(
	destination: Destination,
	scale = 2,
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement("canvas");
	canvas.width = CANVAS_W * scale;
	canvas.height = CANVAS_H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context unavailable");

	ctx.scale(scale, scale);

	// 1. Vintage cream border
	ctx.save();
	ctx.fillStyle = VINTAGE_CREAM;
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
	ctx.restore();

	// 2. Photo background (inside border)
	await drawPhotoBackground(ctx, destination);

	// 3. Caption at the bottom
	ctx.save();
	ctx.fillStyle = "#64748B"; // slate-500
	ctx.font = "bold 9px 'Montserrat', sans-serif";
	ctx.textAlign = "left";
	ctx.letterSpacing = "2px";
	const routeTag = destination.type === "domestic" ? "DOMESTIC" : "INTL";

	// Add text slightly below the image
	const textY = INNER_Y + INNER_H + 18;
	ctx.fillText(
		`${routeTag} — ${destination.name.toUpperCase()}`,
		INNER_X + 2,
		textY,
	);

	ctx.textAlign = "right";
	ctx.fillText(
		destination.location.toUpperCase(),
		INNER_X + INNER_W - 2,
		textY,
	);
	ctx.restore();

	return canvas;
}

/**
 * Render the Back side of the postcard (Handwriting + Stamp)
 */
export async function renderPostcardBackToCanvas(
	destination: Destination,
	scale = 2,
): Promise<HTMLCanvasElement> {
	const canvas = document.createElement("canvas");
	canvas.width = CANVAS_W * scale;
	canvas.height = CANVAS_H * scale;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context unavailable");

	ctx.scale(scale, scale);

	// Ensure the Caveat font is loaded before rendering
	if (typeof document !== "undefined" && document.fonts) {
		await document.fonts.ready;
	}

	// Resolve the actual font family name from the CSS variable
	let caveatFontFamily = "'Caveat', cursive";
	if (typeof document !== "undefined") {
		const dummy = document.createElement("span");
		dummy.style.fontFamily = "var(--font-caveat), 'Caveat', cursive";
		document.body.appendChild(dummy);
		const computed = window.getComputedStyle(dummy).fontFamily;
		if (computed) caveatFontFamily = computed;
		document.body.removeChild(dummy);
	}

	// 1. Textured cream background
	ctx.save();
	ctx.fillStyle = VINTAGE_CREAM;
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
	ctx.restore();

	// 2. Vertical Divider
	const midX = CANVAS_W / 2;
	ctx.save();
	ctx.strokeStyle = "rgba(0,0,0,0.15)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(midX, 40);
	ctx.lineTo(midX, CANVAS_H - 40);
	ctx.stroke();

	// Tiny text near divider
	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.font = "8px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.translate(midX - 10, CANVAS_H / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText("C-C.CO   TRAVEL SERIES", 0, 0);
	ctx.restore();

	// 3. Left Side: Handwritten description
	ctx.save();
	ctx.fillStyle = "#1c1917"; // very dark stone for ink
	ctx.font = `44px ${caveatFontFamily}`;
	const leftPad = 40;
	const maxTextWidth = midX - leftPad * 2 - 10;

	// Date
	ctx.fillText(formatDate(destination.visitedDate), leftPad, 60);

	// Body
	ctx.font = `38px ${caveatFontFamily}`;
	const description =
		destination.description ||
		"What a lovely place. The views were breathtaking and I can't wait to visit again someday.";
	const lines = wrapText(ctx, description, maxTextWidth, 10);
	let curY = 120;
	for (let i = 0; i < lines.length; i++) {
		// slight rotation per line for realism
		ctx.save();
		ctx.translate(leftPad, curY);
		ctx.rotate(Math.random() * 0.02 - 0.01);
		ctx.fillText(lines[i], 0, 0);
		ctx.restore();
		curY += 46;
	}

	// Sign off
	curY += 40;
	ctx.font = `44px ${caveatFontFamily}`;
	ctx.save();
	ctx.translate(leftPad, curY);
	ctx.rotate(-0.02);
	ctx.fillText(`${AUTHOR.name}`, 0, 0);
	ctx.restore();
	ctx.restore();

	// 4. Right Side: Address Lines
	ctx.save();
	const rightPad = midX + 40;
	const lineStartX = rightPad;
	const lineEndX = CANVAS_W - 40;
	let lineY = CANVAS_H / 2 + 30;

	ctx.strokeStyle = "rgba(0,0,0,0.12)";
	ctx.lineWidth = 1.5;

	const addressLines = [
		destination.name,
		destination.location,
		destination.country.toUpperCase(),
	];

	ctx.fillStyle = "#1c1917";
	ctx.font = `46px ${caveatFontFamily}`;

	for (let i = 0; i < 4; i++) {
		// Draw line
		ctx.beginPath();
		ctx.moveTo(lineStartX, lineY);
		ctx.lineTo(lineEndX, lineY);
		ctx.stroke();

		// Draw text slightly misaligned for realism
		if (i < addressLines.length) {
			ctx.save();
			ctx.translate(lineStartX + 20, lineY - 8);
			ctx.rotate(-0.02);
			ctx.fillText(addressLines[i], 0, 0);
			ctx.restore();
		}

		lineY += 50;
	}

	// Address label
	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.font = "10px 'Montserrat', sans-serif";
	ctx.fillText("This space for address only", lineStartX, CANVAS_H / 2 - 20);
	ctx.restore();

	// 5. Right Side: Stamp & Postmark
	const stampX = CANVAS_W - 40 - 120;
	const stampY = 40;
	await drawAirMailStamp(ctx, destination.country, stampX, stampY);

	// Draw Postmark overlapping the stamp
	drawPostmark(ctx, stampX + 20, stampY + 60);

	return canvas;
}
