import type { CardConfig } from "../types";
import { BACKDROPS } from "./presets";
import { THEMES, tokenizeLine } from "./syntax-highlighter";

/**
 * Renders the Code Social Card to an HTML5 Canvas with High-DPI scaling.
 */
export async function renderCardToCanvas(
	config: CardConfig,
	scale = 2,
): Promise<HTMLCanvasElement> {
	const theme = THEMES[config.theme] || THEMES["one-dark"];
	const backdrop = BACKDROPS[config.backdrop] || BACKDROPS["cosmic-sunset"];

	const lines = config.code.split("\n");
	const lineHeight = config.fontSize * 1.6;
	const codePaddingX = 24;
	const codePaddingY = 20;
	const headerHeight = config.windowStyle === "none" ? 0 : 44;
	const watermarkHeight = config.showWatermark ? 28 : 0;

	// Calculate text bounds
	const longestLine = lines.reduce(
		(max, line) => Math.max(max, line.length),
		0,
	);
	const lineNumWidth = config.showLineNumbers ? 40 : 0;
	const charWidth = config.fontSize * 0.6;

	const contentWidth = Math.max(
		420,
		longestLine * charWidth + lineNumWidth + codePaddingX * 2,
	);
	const contentHeight =
		headerHeight +
		lines.length * lineHeight +
		codePaddingY * 2 +
		watermarkHeight;

	const cardPadding = config.padding;
	const totalWidth = contentWidth + cardPadding * 2;
	const totalHeight = contentHeight + cardPadding * 2;

	const canvas = document.createElement("canvas");
	canvas.width = totalWidth * scale;
	canvas.height = totalHeight * scale;
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("Could not get 2D canvas context");
	ctx.scale(scale, scale);

	// 1. Draw Backdrop
	if (config.backdrop !== "transparent") {
		const grad = ctx.createLinearGradient(0, 0, totalWidth, totalHeight);
		if (backdrop.colors.length === 2) {
			grad.addColorStop(0, backdrop.colors[0] ?? "#667eea");
			grad.addColorStop(1, backdrop.colors[1] ?? "#764ba2");
		} else if (backdrop.colors.length >= 3) {
			grad.addColorStop(0, backdrop.colors[0] ?? "#f093fb");
			grad.addColorStop(0.5, backdrop.colors[1] ?? "#f5576c");
			grad.addColorStop(1, backdrop.colors[2] ?? "#4facfe");
		}
		ctx.fillStyle = grad;
		ctx.fillRect(0, 0, totalWidth, totalHeight);
	}

	// 2. Draw Code Window Card (with Shadow & Rounded Corners)
	const cardX = cardPadding;
	const cardY = cardPadding;
	const radius = config.borderRadius;

	ctx.save();

	// Shadow
	if (config.shadow !== "none") {
		ctx.shadowColor =
			config.shadow === "glow"
				? "rgba(129, 140, 248, 0.4)"
				: "rgba(0, 0, 0, 0.45)";
		ctx.shadowBlur =
			config.shadow === "heavy" ? 36 : config.shadow === "glow" ? 28 : 16;
		ctx.shadowOffsetY = config.shadow === "heavy" ? 14 : 8;
	}

	// Rounded Card Path
	ctx.beginPath();
	ctx.moveTo(cardX + radius, cardY);
	ctx.lineTo(cardX + contentWidth - radius, cardY);
	ctx.quadraticCurveTo(
		cardX + contentWidth,
		cardY,
		cardX + contentWidth,
		cardY + radius,
	);
	ctx.lineTo(cardX + contentWidth, cardY + contentHeight - radius);
	ctx.quadraticCurveTo(
		cardX + contentWidth,
		cardY + contentHeight,
		cardX + contentWidth - radius,
		cardY + contentHeight,
	);
	ctx.lineTo(cardX + radius, cardY + contentHeight);
	ctx.quadraticCurveTo(
		cardX,
		cardY + contentHeight,
		cardX,
		cardY + contentHeight - radius,
	);
	ctx.lineTo(cardX, cardY + radius);
	ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
	ctx.closePath();

	ctx.fillStyle = theme.background;
	ctx.fill();
	ctx.restore();

	// 3. Draw Header
	if (headerHeight > 0) {
		// Header Background
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(cardX + radius, cardY);
		ctx.lineTo(cardX + contentWidth - radius, cardY);
		ctx.quadraticCurveTo(
			cardX + contentWidth,
			cardY,
			cardX + contentWidth,
			cardY + radius,
		);
		ctx.lineTo(cardX + contentWidth, cardY + headerHeight);
		ctx.lineTo(cardX, cardY + headerHeight);
		ctx.lineTo(cardX, cardY + radius);
		ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
		ctx.closePath();
		ctx.fillStyle = theme.headerBackground;
		ctx.fill();

		// Header bottom border
		ctx.strokeStyle = theme.headerBorder;
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(cardX, cardY + headerHeight);
		ctx.lineTo(cardX + contentWidth, cardY + headerHeight);
		ctx.stroke();
		ctx.restore();

		// Window Controls
		if (config.windowStyle === "mac") {
			// Traffic Lights (Red, Yellow, Green)
			const dotY = cardY + headerHeight / 2;
			const dotRadius = 5.5;

			// Close (Red)
			ctx.beginPath();
			ctx.arc(cardX + 20, dotY, dotRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#ff5f56";
			ctx.fill();

			// Minimize (Yellow)
			ctx.beginPath();
			ctx.arc(cardX + 38, dotY, dotRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#ffbd2e";
			ctx.fill();

			// Expand (Green)
			ctx.beginPath();
			ctx.arc(cardX + 56, dotY, dotRadius, 0, Math.PI * 2);
			ctx.fillStyle = "#27c93f";
			ctx.fill();
		} else if (config.windowStyle === "windows") {
			// Windows Minimise, Maximise, Close
			const btnRight = cardX + contentWidth - 20;
			const btnY = cardY + headerHeight / 2;
			ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
			ctx.lineWidth = 1.2;

			// Close X
			ctx.beginPath();
			ctx.moveTo(btnRight - 6, btnY - 4);
			ctx.lineTo(btnRight + 2, btnY + 4);
			ctx.moveTo(btnRight + 2, btnY - 4);
			ctx.lineTo(btnRight - 6, btnY + 4);
			ctx.stroke();

			// Maximize square
			ctx.strokeRect(btnRight - 22, btnY - 4, 8, 8);

			// Minimize line
			ctx.beginPath();
			ctx.moveTo(btnRight - 38, btnY + 4);
			ctx.lineTo(btnRight - 30, btnY + 4);
			ctx.stroke();
		} else if (config.windowStyle === "dots") {
			const dotY = cardY + headerHeight / 2;
			ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
			for (let d = 0; d < 3; d++) {
				ctx.beginPath();
				ctx.arc(cardX + 20 + d * 14, dotY, 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Title Text
		if (config.title) {
			ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
			ctx.font = `600 ${config.fontSize - 2}px "JetBrains Mono", "Fira Code", monospace`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(
				config.title,
				cardX + contentWidth / 2,
				cardY + headerHeight / 2,
			);
		}
	}

	// 4. Render Syntax Highlighted Code Lines
	ctx.font = `500 ${config.fontSize}px "JetBrains Mono", "Fira Code", monospace, "Consolas"`;
	ctx.textBaseline = "top";

	let currentY = cardY + headerHeight + codePaddingY;

	lines.forEach((line, idx) => {
		let currentX = cardX + codePaddingX;

		// Draw Line Number
		if (config.showLineNumbers) {
			ctx.fillStyle = theme.lineNumber;
			ctx.textAlign = "right";
			ctx.fillText(String(idx + 1), currentX + 24, currentY);
			currentX += lineNumWidth;
		}

		ctx.textAlign = "left";
		const tokens = tokenizeLine(line, config.language);

		tokens.forEach((tok) => {
			ctx.fillStyle = theme.tokens[tok.type] || theme.foreground;
			ctx.fillText(tok.text, currentX, currentY);
			currentX += ctx.measureText(tok.text).width;
		});

		currentY += lineHeight;
	});

	// 5. Draw Watermark
	if (config.showWatermark && config.watermarkText) {
		ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
		ctx.font = `600 ${config.fontSize - 3}px sans-serif`;
		ctx.textAlign = "right";
		ctx.fillText(
			config.watermarkText,
			cardX + contentWidth - codePaddingX,
			cardY + contentHeight - 14,
		);
	}

	return canvas;
}

/**
 * Exports social card as a PNG blob.
 */
export async function exportCardToPng(
	config: CardConfig,
	scale = 2,
): Promise<Blob> {
	const canvas = await renderCardToCanvas(config, scale);
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("Canvas toBlob failed"));
		}, "image/png");
	});
}

/**
 * Copies the card directly to the operating system clipboard.
 */
export async function copyCardToClipboard(
	config: CardConfig,
): Promise<boolean> {
	try {
		const blob = await exportCardToPng(config, 2);
		if (typeof ClipboardItem !== "undefined" && navigator.clipboard) {
			await navigator.clipboard.write([
				new ClipboardItem({ "image/png": blob }),
			]);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

/**
 * Generates standalone SVG markup of the card.
 */
export function exportCardToSvg(config: CardConfig): string {
	const theme = THEMES[config.theme] || THEMES["one-dark"];
	const backdrop = BACKDROPS[config.backdrop] || BACKDROPS["cosmic-sunset"];
	const lines = config.code.split("\n");
	const lineHeight = config.fontSize * 1.6;
	const codePaddingX = 24;
	const codePaddingY = 20;
	const headerHeight = config.windowStyle === "none" ? 0 : 44;
	const watermarkHeight = config.showWatermark ? 28 : 0;
	const lineNumWidth = config.showLineNumbers ? 40 : 0;
	const longestLine = lines.reduce(
		(max, line) => Math.max(max, line.length),
		0,
	);
	const charWidth = config.fontSize * 0.6;

	const contentWidth = Math.max(
		420,
		longestLine * charWidth + lineNumWidth + codePaddingX * 2,
	);
	const contentHeight =
		headerHeight +
		lines.length * lineHeight +
		codePaddingY * 2 +
		watermarkHeight;
	const totalWidth = contentWidth + config.padding * 2;
	const totalHeight = contentHeight + config.padding * 2;

	let textSpans = "";
	lines.forEach((line, idx) => {
		const y =
			config.padding + headerHeight + codePaddingY + (idx + 1) * lineHeight;
		let lineSpans = "";

		if (config.showLineNumbers) {
			lineSpans += `<tspan fill="${theme.lineNumber}" x="${config.padding + codePaddingX + 24}" text-anchor="end">${idx + 1}</tspan>`;
		}

		let curX = config.padding + codePaddingX + lineNumWidth;
		const tokens = tokenizeLine(line, config.language);
		tokens.forEach((tok) => {
			const color = theme.tokens[tok.type] || theme.foreground;
			const escaped = tok.text
				.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;");
			lineSpans += `<tspan fill="${color}" x="${curX}">${escaped}</tspan>`;
			curX += tok.text.length * charWidth;
		});

		textSpans += `<text y="${y}" font-family="monospace" font-size="${config.fontSize}">${lineSpans}</text>\n`;
	});

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${backdrop.colors[0] || "#667eea"}" />
      <stop offset="100%" stop-color="${backdrop.colors[backdrop.colors.length - 1] || "#764ba2"}" />
    </linearGradient>
  </defs>
  <rect width="${totalWidth}" height="${totalHeight}" fill="${config.backdrop === "transparent" ? "transparent" : "url(#bgGrad)"}" />
  <rect x="${config.padding}" y="${config.padding}" width="${contentWidth}" height="${contentHeight}" rx="${config.borderRadius}" fill="${theme.background}" />
  ${textSpans}
</svg>`;
}
