import { AUTHOR } from "@/lib/shared/constants";
import type { Destination } from "../types";

const CANVAS_W = 800;
const CANVAS_H = 500;

const BORDER_TOP = 18;
const BORDER_SIDES = 18;
// Wider bottom margin reserves space for the route and location caption.
const BORDER_BOTTOM = 34;

const INNER_X = BORDER_SIDES;
const INNER_Y = BORDER_TOP;
const INNER_W = CANVAS_W - BORDER_SIDES * 2;
const INNER_H = CANVAS_H - BORDER_TOP - BORDER_BOTTOM;
const INNER_RADIUS = 2;

const VINTAGE_CREAM = "#FDFBF7";

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

// crossOrigin="anonymous" prevents external images from tainting the canvas before PNG export.
async function loadImage(url: string): Promise<HTMLImageElement | null> {
	return new Promise((resolve) => {
		const img = new window.Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = url.replace(/w=\d+/, "w=1600").replace(/h=\d+/, "h=1000");
	});
}

export function formatVisitDate(visitedDate: string | undefined): string {
	if (!visitedDate) return "Logged";
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

export function getCountryCode(country: string): string | null {
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

async function drawPhotoBackground(
	ctx: CanvasRenderingContext2D,
	destination: Destination,
) {
	const img = await loadImage(destination.imageUrl);

	ctx.save();
	drawRoundedRect(ctx, INNER_X, INNER_Y, INNER_W, INNER_H, INNER_RADIUS);
	ctx.clip();

	if (img) {
		const ir = img.width / img.height;
		const cr = INNER_W / INNER_H;
		let sx: number;
		let sy: number;
		let sw: number;
		let sh: number;

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
	} else {
		ctx.fillStyle = "#059669";
		ctx.fillRect(INNER_X, INNER_Y, INNER_W, INNER_H);
	}
	ctx.restore();
}

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

	// Offscreen canvas punches scalloped perforations along the stamp perimeter using destination-out.
	const offscreen = document.createElement("canvas");
	offscreen.width = stampW;
	offscreen.height = stampH;
	const octx = offscreen.getContext("2d");
	if (octx) {
		octx.fillStyle = "#EAE6DF";
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

	ctx.strokeStyle = "#334155";
	ctx.lineWidth = 1;
	ctx.strokeRect(-innerW / 2, -innerH / 2, innerW, innerH);

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
		ctx.fillStyle = "#334155";
		ctx.font = "bold 14px 'Montserrat', sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("POST", 0, 0);
	}

	ctx.fillStyle = "#1E293B";
	ctx.font = "bold 9px 'Montserrat', sans-serif";
	ctx.textAlign = "left";
	ctx.fillText(
		country.substring(0, 3).toUpperCase(),
		-innerW / 2 + 6,
		innerH / 2 - 8,
	);

	ctx.restore();
}

function drawPostmark(ctx: CanvasRenderingContext2D, x: number, y: number) {
	ctx.save();
	ctx.translate(x, y);
	ctx.rotate(-0.2);

	ctx.strokeStyle = "rgba(51, 65, 85, 0.6)";
	ctx.lineWidth = 1.5;

	ctx.beginPath();
	ctx.arc(0, 0, 45, 0, Math.PI * 2);
	ctx.stroke();

	ctx.beginPath();
	ctx.arc(0, 0, 30, 0, Math.PI * 2);
	ctx.stroke();

	ctx.fillStyle = "rgba(51, 65, 85, 0.7)";
	ctx.font = "bold 10px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText("POST OFF.", 0, -12);

	ctx.beginPath();
	for (let i = 0; i < 4; i++) {
		const lineY = -15 + i * 10;
		ctx.moveTo(45, lineY);
		ctx.bezierCurveTo(70, lineY - 10, 80, lineY + 10, 105, lineY);
		ctx.bezierCurveTo(130, lineY - 10, 140, lineY + 10, 165, lineY);
	}
	ctx.stroke();

	ctx.restore();
}

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

	ctx.save();
	ctx.fillStyle = VINTAGE_CREAM;
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
	ctx.restore();

	await drawPhotoBackground(ctx, destination);

	ctx.save();
	ctx.fillStyle = "#64748B";
	ctx.font = "bold 9px 'Montserrat', sans-serif";
	ctx.textAlign = "left";
	ctx.letterSpacing = "2px";
	const routeTag = destination.type === "domestic" ? "DOMESTIC" : "INTL";

	const textY = INNER_Y + INNER_H + 18;
	ctx.fillText(
		`${routeTag} / ${destination.name.toUpperCase()}`,
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

	if (typeof document !== "undefined" && document.fonts) {
		await document.fonts.ready;
	}

	// Canvas 2D cannot parse CSS variables directly, so resolve the computed font family from DOM.
	let caveatFontFamily = "'Caveat', cursive";
	if (typeof document !== "undefined") {
		const dummy = document.createElement("span");
		dummy.style.fontFamily = "var(--font-caveat), 'Caveat', cursive";
		document.body.appendChild(dummy);
		const computed = window.getComputedStyle(dummy).fontFamily;
		if (computed) caveatFontFamily = computed;
		document.body.removeChild(dummy);
	}

	ctx.save();
	ctx.fillStyle = VINTAGE_CREAM;
	ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
	ctx.restore();

	const midX = CANVAS_W / 2;
	ctx.save();
	ctx.strokeStyle = "rgba(0,0,0,0.15)";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(midX, 40);
	ctx.lineTo(midX, CANVAS_H - 40);
	ctx.stroke();

	ctx.fillStyle = "rgba(0,0,0,0.3)";
	ctx.font = "8px 'Montserrat', sans-serif";
	ctx.textAlign = "center";
	ctx.translate(midX - 10, CANVAS_H / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText("POLMA TAMBUNAN / FIELD DISPATCH", 0, 0);
	ctx.restore();

	ctx.save();
	ctx.fillStyle = "#1c1917";
	ctx.font = `44px ${caveatFontFamily}`;
	const leftPad = 40;
	const maxTextWidth = midX - leftPad * 2 - 10;

	ctx.fillText(formatVisitDate(destination.visitedDate), leftPad, 60);

	ctx.font = `38px ${caveatFontFamily}`;
	const description =
		destination.description ||
		"Memorable miles and quiet corners worth returning to.";
	const lines = wrapText(ctx, description, maxTextWidth, 10);
	let curY = 120;
	for (let i = 0; i < lines.length; i++) {
		ctx.save();
		ctx.translate(leftPad, curY);
		ctx.rotate(Math.random() * 0.02 - 0.01);
		ctx.fillText(lines[i], 0, 0);
		ctx.restore();
		curY += 46;
	}

	curY += 40;
	ctx.font = `44px ${caveatFontFamily}`;
	ctx.save();
	ctx.translate(leftPad, curY);
	ctx.rotate(-0.02);
	ctx.fillText(`${AUTHOR.name}`, 0, 0);
	ctx.restore();
	ctx.restore();

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
		ctx.beginPath();
		ctx.moveTo(lineStartX, lineY);
		ctx.lineTo(lineEndX, lineY);
		ctx.stroke();

		if (i < addressLines.length) {
			ctx.save();
			ctx.translate(lineStartX + 20, lineY - 8);
			ctx.rotate(-0.02);
			ctx.fillText(addressLines[i], 0, 0);
			ctx.restore();
		}

		lineY += 50;
	}

	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.font = "10px 'Montserrat', sans-serif";
	ctx.fillText("This space for address only", lineStartX, CANVAS_H / 2 - 20);
	ctx.restore();

	const stampX = CANVAS_W - 40 - 120;
	const stampY = 40;
	await drawAirMailStamp(ctx, destination.country, stampX, stampY);
	drawPostmark(ctx, stampX + 20, stampY + 60);

	return canvas;
}
