import type { Destination } from "../types";

/* ═══════════════════════════════════════════════════════════════════════
 * Layout Constants — Compact Vintage Postcard with Airmail Border
 * ═══════════════════════════════════════════════════════════════════ */

/** Canvas logical dimensions (compact) */
const CANVAS_W = 800;
const CANVAS_H = 500;

/** Airmail border stripe config */
const AIRMAIL_BORDER = 9;
const AIRMAIL_STRIPE_W = 16;
const AIRMAIL_COLORS = ["#1E3A8A", "#FAF5EC", "#BE123C", "#FAF5EC"] as const;

/** Inner card */
const INNER_X = AIRMAIL_BORDER;
const INNER_Y = AIRMAIL_BORDER;
const INNER_W = CANVAS_W - AIRMAIL_BORDER * 2;
const INNER_H = CANVAS_H - AIRMAIL_BORDER * 2;
const INNER_RADIUS = 14;
const CARD_BG = "#FAF5EC";
const CARD_BORDER = "rgba(180, 140, 80, 0.22)";

/** Polaroid photo */
const POLAROID_X = INNER_X + 24;
const POLAROID_Y = INNER_Y + 30;
const POLAROID_W = 330;
const POLAROID_H = 400;
const POLAROID_PAD = 12;
const POLAROID_PHOTO_H = 295;

/** Right-side content */
const CONTENT_X = POLAROID_X + POLAROID_W + 28;
const CONTENT_W = INNER_X + INNER_W - CONTENT_X - 20;

/** Colors */
const TERRACOTTA = "#C2703E";
const BROWN_DARK = "#3D2B1F";
const BROWN_TEXT = "#5C4033";
const BROWN_LIGHT = "rgba(139, 69, 19, 0.35)";
const PAPER_LINE = "rgba(139, 69, 19, 0.08)";

/** Typography */
const FONT_SERIF_LG = "900 18px 'Georgia', serif";
const FONT_SERIF_MD = "900 15px 'Georgia', serif";
const FONT_SERIF_ITALIC = "italic 11.5px 'Georgia', serif";
const FONT_LABEL = "bold 8px 'Montserrat', sans-serif";
const FONT_BODY = "bold 10px 'Montserrat', sans-serif";
const FONT_TINY = "bold 7px 'Montserrat', sans-serif";

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
		img.src = url.replace(/w=\d+/, "w=800").replace(/h=\d+/, "h=600");
	});
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

	// Full canvas with stripe pattern
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

/** Inner card background */
function drawCardBackground(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = CARD_BG;
	drawRoundedRect(ctx, INNER_X, INNER_Y, INNER_W, INNER_H, INNER_RADIUS);
	ctx.fill();

	ctx.strokeStyle = CARD_BORDER;
	ctx.lineWidth = 1;
	drawRoundedRect(ctx, INNER_X, INNER_Y, INNER_W, INNER_H, INNER_RADIUS);
	ctx.stroke();

	// Subtle texture dots
	ctx.fillStyle = "rgba(156, 136, 116, 0.02)";
	for (let x = INNER_X; x < INNER_X + INNER_W; x += 6) {
		for (let y = INNER_Y; y < INNER_Y + INNER_H; y += 6) {
			if ((x / 6 + y / 6) % 3 === 0) ctx.fillRect(x, y, 1, 1);
		}
	}
}

/** Tilted Polaroid photo with tape accent */
async function drawPolaroidPhoto(
	ctx: CanvasRenderingContext2D,
	destination: Destination,
) {
	ctx.save();

	// Slight tilt
	const cx = POLAROID_X + POLAROID_W / 2;
	const cy = POLAROID_Y + POLAROID_H / 2;
	ctx.translate(cx, cy);
	ctx.rotate(-0.02);
	ctx.translate(-cx, -cy);

	// Shadow
	ctx.shadowColor = "rgba(139, 69, 19, 0.08)";
	ctx.shadowBlur = 14;
	ctx.shadowOffsetY = 5;
	ctx.fillStyle = "#FFFFFF";
	drawRoundedRect(ctx, POLAROID_X, POLAROID_Y, POLAROID_W, POLAROID_H, 6);
	ctx.fill();
	ctx.shadowBlur = 0;
	ctx.shadowOffsetY = 0;

	// Border
	ctx.strokeStyle = "rgba(180, 140, 80, 0.2)";
	ctx.lineWidth = 1;
	drawRoundedRect(ctx, POLAROID_X, POLAROID_Y, POLAROID_W, POLAROID_H, 6);
	ctx.stroke();

	// Photo
	const px = POLAROID_X + POLAROID_PAD;
	const py = POLAROID_Y + POLAROID_PAD;
	const pw = POLAROID_W - POLAROID_PAD * 2;
	const ph = POLAROID_PHOTO_H;

	const img = await loadImage(destination.imageUrl);
	ctx.save();
	ctx.beginPath();
	ctx.rect(px, py, pw, ph);
	ctx.clip();

	if (img) {
		if (!destination.isVisited)
			ctx.filter = "grayscale(100%) contrast(105%) brightness(95%)";
		const ir = img.width / img.height;
		const pr = pw / ph;
		let sx: number, sy: number, sw: number, sh: number;
		if (ir > pr) {
			sh = img.height;
			sw = sh * pr;
			sx = (img.width - sw) / 2;
			sy = 0;
		} else {
			sw = img.width;
			sh = sw / pr;
			sx = 0;
			sy = (img.height - sh) / 2;
		}
		ctx.drawImage(img, sx, sy, sw, sh, px, py, pw, ph);
		ctx.filter = "none";
	} else {
		ctx.fillStyle = destination.isVisited ? "#059669" : "#D97706";
		ctx.fillRect(px, py, pw, ph);
		ctx.fillStyle = "#FFF";
		ctx.font = "bold 16px 'Montserrat', sans-serif";
		ctx.textAlign = "center";
		ctx.fillText(destination.name, px + pw / 2, py + ph / 2);
		ctx.textAlign = "left";
	}

	// Bottom gradient
	const g = ctx.createLinearGradient(px, py + ph - 60, px, py + ph);
	g.addColorStop(0, "rgba(0,0,0,0)");
	g.addColorStop(1, "rgba(0,0,0,0.15)");
	ctx.fillStyle = g;
	ctx.fillRect(px, py + ph - 60, pw, 60);
	ctx.restore();

	// Status badge
	const badgeBg = destination.isVisited
		? "rgba(16, 185, 129, 0.9)"
		: "rgba(245, 158, 11, 0.9)";
	ctx.save();
	ctx.fillStyle = badgeBg;
	drawRoundedRect(ctx, px + 8, py + 8, 80, 20, 10);
	ctx.fill();
	ctx.fillStyle = "#FFF";
	ctx.font = "900 8px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(
		destination.isVisited ? "✓ VISITED" : "★ WISHLIST",
		px + 48,
		py + 22,
	);
	ctx.textAlign = "left";
	ctx.restore();

	// Caption
	const capY = py + ph + 14;
	ctx.fillStyle = BROWN_DARK;
	ctx.font = FONT_SERIF_MD;
	ctx.fillText(destination.name, px + 2, capY);

	ctx.fillStyle = `${TERRACOTTA}80`;
	ctx.font = "600 9px 'Montserrat', sans-serif";
	ctx.fillText(
		`📍 ${destination.location}, ${destination.country}`,
		px + 2,
		capY + 15,
	);

	// Date stamp
	if (destination.visitedDate) {
		const [yr, mo] = destination.visitedDate.split("-");
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
		const ds = `${mn[parseInt(mo, 10) - 1]} ${yr}`.toUpperCase();
		const dsW = 60;
		const dsH = 16;
		const dsX = POLAROID_X + POLAROID_W - POLAROID_PAD - dsW - 2;
		const dsY = capY + 2;
		ctx.strokeStyle = `${TERRACOTTA}30`;
		ctx.lineWidth = 1;
		ctx.strokeRect(dsX, dsY, dsW, dsH);
		ctx.fillStyle = "#FFF8F0";
		ctx.fillRect(dsX + 0.5, dsY + 0.5, dsW - 1, dsH - 1);
		ctx.fillStyle = TERRACOTTA;
		ctx.font = "900 7px 'Courier New', monospace";
		ctx.textAlign = "center";
		ctx.fillText(ds, dsX + dsW / 2, dsY + 12);
		ctx.textAlign = "left";
	}

	// Tape accent
	ctx.save();
	const tw = 60;
	const th = 18;
	const tx = POLAROID_X + (POLAROID_W - tw) / 2;
	const ty = POLAROID_Y - 8;
	ctx.translate(tx + tw / 2, ty + th / 2);
	ctx.rotate(0.015);
	ctx.translate(-(tx + tw / 2), -(ty + th / 2));
	ctx.fillStyle = "rgba(218, 195, 150, 0.5)";
	ctx.fillRect(tx, ty, tw, th);
	ctx.strokeStyle = "rgba(180, 150, 100, 0.3)";
	ctx.lineWidth = 0.5;
	ctx.strokeRect(tx, ty, tw, th);
	ctx.restore();

	ctx.restore(); // tilt
}

/** Right-side journal content */
function drawJournalContent(
	ctx: CanvasRenderingContext2D,
	destination: Destination,
) {
	const isVisited = destination.isVisited;
	let curY = INNER_Y + 40;

	// Route type
	ctx.fillStyle = `${TERRACOTTA}70`;
	ctx.font = FONT_LABEL;
	ctx.letterSpacing = "1px";
	ctx.fillText(
		destination.type === "domestic" ? "✦ DOMESTIC" : "✦ INTERNATIONAL",
		CONTENT_X,
		curY,
	);
	ctx.letterSpacing = "0px";

	// Destination name
	curY += 20;
	ctx.fillStyle = BROWN_DARK;
	ctx.font = FONT_SERIF_LG;
	ctx.fillText(destination.name, CONTENT_X, curY);

	// Location
	curY += 15;
	ctx.fillStyle = `${TERRACOTTA}60`;
	ctx.font = "600 9px 'Montserrat', sans-serif";
	ctx.fillText(
		`${destination.location}, ${destination.country}`,
		CONTENT_X,
		curY,
	);

	// Expedition #
	curY += 14;
	ctx.fillStyle = BROWN_LIGHT;
	ctx.font = FONT_TINY;
	ctx.letterSpacing = "1px";
	ctx.fillText(
		`EXPEDITION #${destination.id.padStart(4, "0")}`,
		CONTENT_X,
		curY,
	);
	ctx.letterSpacing = "0px";

	// Quote card
	curY += 16;
	const qH = 62;
	ctx.fillStyle = "rgba(255,255,255,0.4)";
	drawRoundedRect(ctx, CONTENT_X - 2, curY, CONTENT_W + 4, qH, 8);
	ctx.fill();
	ctx.strokeStyle = PAPER_LINE;
	ctx.lineWidth = 1;
	drawRoundedRect(ctx, CONTENT_X - 2, curY, CONTENT_W + 4, qH, 8);
	ctx.stroke();

	ctx.fillStyle = BROWN_TEXT;
	ctx.font = FONT_SERIF_ITALIC;
	const lines = wrapText(
		ctx,
		`"${destination.description}"`,
		CONTENT_W - 12,
		3,
	);
	for (let i = 0; i < lines.length; i++) {
		ctx.fillText(lines[i], CONTENT_X + 6, curY + 17 + i * 18);
	}

	// Field Notes
	curY += qH + 14;
	ctx.strokeStyle = "rgba(139, 69, 19, 0.1)";
	ctx.beginPath();
	ctx.moveTo(CONTENT_X, curY);
	ctx.lineTo(CONTENT_X + 16, curY);
	ctx.stroke();
	ctx.fillStyle = BROWN_LIGHT;
	ctx.font = FONT_LABEL;
	ctx.letterSpacing = "1px";
	ctx.fillText("FIELD NOTES", CONTENT_X + 20, curY + 3);
	ctx.letterSpacing = "0px";
	ctx.beginPath();
	ctx.moveTo(CONTENT_X + 88, curY);
	ctx.lineTo(CONTENT_X + CONTENT_W, curY);
	ctx.stroke();

	curY += 12;
	const fields = [
		{ label: "TRAVELER", value: "Fellow World Explorer" },
		{ label: "VIA", value: destination.location },
		{ label: "COUNTRY", value: destination.country },
	];
	for (const f of fields) {
		ctx.strokeStyle = PAPER_LINE;
		ctx.beginPath();
		ctx.moveTo(CONTENT_X, curY + 14);
		ctx.lineTo(CONTENT_X + CONTENT_W, curY + 14);
		ctx.stroke();
		ctx.fillStyle = BROWN_LIGHT;
		ctx.font = "bold 7px 'Montserrat', sans-serif";
		ctx.letterSpacing = "0.5px";
		ctx.fillText(f.label, CONTENT_X, curY + 10);
		ctx.letterSpacing = "0px";
		ctx.fillStyle = BROWN_DARK;
		ctx.font = FONT_BODY;
		ctx.fillText(f.value, CONTENT_X + 58, curY + 10);
		curY += 20;
	}

	// Visa stamp
	curY += 4;
	ctx.save();
	const vW = 110;
	const vH = 50;
	ctx.translate(CONTENT_X + vW / 2, curY + vH / 2);
	ctx.rotate(-0.03);
	const vBg = isVisited ? "rgba(236,253,245,0.6)" : "rgba(255,251,235,0.6)";
	const vBd = isVisited ? "rgba(5,150,105,0.4)" : "rgba(217,119,6,0.4)";
	const vTx = isVisited ? "#065F46" : "#92400E";
	ctx.fillStyle = vBg;
	drawRoundedRect(ctx, -vW / 2, -vH / 2, vW, vH, 6);
	ctx.fill();
	ctx.strokeStyle = vBd;
	ctx.lineWidth = 1.5;
	ctx.setLineDash([4, 3]);
	drawRoundedRect(ctx, -vW / 2, -vH / 2, vW, vH, 6);
	ctx.stroke();
	ctx.setLineDash([]);
	ctx.fillStyle = vTx;
	ctx.font = "900 6px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.fillText("★ PASSPORT CONTROL ★", 0, -12);
	ctx.font = "900 10px 'Montserrat', sans-serif";
	ctx.fillText(isVisited ? "ENTRY GRANTED" : "ON RADAR", 0, 2);
	ctx.font = FONT_TINY;
	ctx.globalAlpha = 0.55;
	ctx.fillText(destination.visitedDate || "Pending", 0, 14);
	ctx.globalAlpha = 1;
	ctx.textAlign = "left";
	ctx.restore();

	// Circular postmark
	ctx.save();
	const pmX = CONTENT_X + CONTENT_W - 32;
	const pmY = curY + 25;
	const pmR = 22;
	const pmC = isVisited ? "rgba(5,150,105,0.3)" : "rgba(217,119,6,0.3)";
	const pmT = isVisited ? "#065F46" : "#92400E";
	ctx.translate(pmX, pmY);
	ctx.rotate(-0.2);
	ctx.globalAlpha = 0.5;
	ctx.strokeStyle = pmC;
	ctx.lineWidth = 1.5;
	ctx.beginPath();
	ctx.arc(0, 0, pmR, 0, Math.PI * 2);
	ctx.stroke();
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.arc(0, 0, pmR - 4, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fillStyle = pmT;
	ctx.font = "900 5px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	const cl =
		destination.country.length > 9
			? destination.country.slice(0, 9)
			: destination.country;
	ctx.fillText(cl.toUpperCase(), 0, -6);
	ctx.font = "bold 7px 'Montserrat', sans-serif";
	ctx.fillText(destination.visitedDate || "2026", 0, 4);
	ctx.font = "800 4px 'Montserrat', sans-serif";
	ctx.fillText("AIR MAIL", 0, 11);
	ctx.textAlign = "left";
	ctx.globalAlpha = 1;
	ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════════
 * Public export
 * ═══════════════════════════════════════════════════════════════════ */

/**
 * Render the compact vintage postcard with airmail border to canvas
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

	drawAirmailBorder(ctx);
	drawCardBackground(ctx);
	await drawPolaroidPhoto(ctx, destination);
	drawJournalContent(ctx, destination);

	return canvas;
}
