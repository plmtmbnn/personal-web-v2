"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import type { AspectRatio, CanvasInputs } from "../types";

export interface CanvasRendererRef {
	exportCanvas: () => string | null;
}

interface CanvasRendererProps {
	inputs: CanvasInputs;
}

export const getDimensions = (ratio: AspectRatio) => {
	switch (ratio) {
		case "1:1":
			return { width: 1080, height: 1080 };
		case "4:5":
			return { width: 1080, height: 1350 };
		case "9:16":
			return { width: 1080, height: 1920 };
		case "16:9":
			return { width: 1920, height: 1080 };
		default:
			return { width: 1080, height: 1080 };
	}
};

// Helper to wrap text on canvas, supporting newlines and massive unbroken words
export function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number,
	align: "left" | "center" | "right" = "left",
): number {
	let currentY = y;

	const drawLine = (lineText: string) => {
		if (align === "center") {
			ctx.textAlign = "center";
			ctx.fillText(lineText, x + maxWidth / 2, currentY);
		} else if (align === "right") {
			ctx.textAlign = "right";
			ctx.fillText(lineText, x + maxWidth, currentY);
		} else {
			ctx.textAlign = "left";
			ctx.fillText(lineText, x, currentY);
		}
		currentY += lineHeight;
	};

	const paragraphs = text.split("\n");

	for (const p of paragraphs) {
		if (!p) {
			currentY += lineHeight;
			continue;
		}

		let currentLine = "";
		const words = p.split(" ");

		for (let i = 0; i < words.length; i++) {
			let word = words[i];

			// Break down massive words that exceed maxWidth
			while (ctx.measureText(word).width > maxWidth) {
				if (currentLine) {
					drawLine(currentLine);
					currentLine = "";
				}

				// Find how many chars of 'word' fit in maxWidth
				let c = 1;
				while (
					c <= word.length &&
					ctx.measureText(word.substring(0, c)).width <= maxWidth
				) {
					c++;
				}
				c--;
				if (c === 0) c = 1; // force at least 1 char

				drawLine(word.substring(0, c));
				word = word.substring(c);
			}

			// Normal word fitting
			if (!word) continue;

			const testLine = currentLine ? `${currentLine} ${word}` : word;
			if (ctx.measureText(testLine).width > maxWidth) {
				drawLine(currentLine);
				currentLine = word;
			} else {
				currentLine = testLine;
			}
		}
		if (currentLine) {
			drawLine(currentLine);
		}
	}

	return currentY;
}

// Helper to draw image covering an area
function drawImageProp(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	w: number,
	h: number,
	offsetX = 0.5,
	offsetY = 0.5,
) {
	const imgRatio = img.width / img.height;
	const canvasRatio = w / h;
	let renderW = 0;
	let renderH = 0;
	let renderX = 0;
	let renderY = 0;

	if (imgRatio < canvasRatio) {
		renderW = w;
		renderH = w / imgRatio;
		renderX = x;
		renderY = y + (h - renderH) * offsetY;
	} else {
		renderW = h * imgRatio;
		renderH = h;
		renderX = x + (w - renderW) * offsetX;
		renderY = y;
	}
	ctx.drawImage(img, renderX, renderY, renderW, renderH);
}

// Helper for rounded rects
function roundRect(
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

export const CanvasRenderer = forwardRef<
	CanvasRendererRef,
	CanvasRendererProps
>(({ inputs }, ref) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const imageCache = useRef<Record<string, HTMLImageElement>>({});

	const { width: CANVAS_WIDTH, height: CANVAS_HEIGHT } = getDimensions(
		inputs.aspectRatio,
	);

	useImperativeHandle(ref, () => ({
		exportCanvas: () => {
			if (!canvasRef.current) return null;
			return canvasRef.current.toDataURL("image/png");
		},
	}));

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const render = async () => {
			// 1. PRELOAD IMAGES FIRST (Before clearing canvas to prevent flicker)
			let img: HTMLImageElement | null = null;
			let avatarImg: HTMLImageElement | null = null;

			const loadImg = (src: string): Promise<HTMLImageElement> => {
				if (imageCache.current[src])
					return Promise.resolve(imageCache.current[src]);
				return new Promise((resolve, reject) => {
					const i = new Image();
					i.crossOrigin = "anonymous";
					i.onload = () => {
						imageCache.current[src] = i;
						resolve(i);
					};
					i.onerror = reject;
					i.src = src;
				});
			};

			try {
				if (inputs.imageSource) {
					img = await loadImg(inputs.imageSource);
				}
				if (inputs.avatarSource) {
					avatarImg = await loadImg(inputs.avatarSource);
				}
			} catch (e) {
				console.error("Failed to load image on canvas", e);
			}

			// 2. Clear canvas ONLY AFTER images are loaded
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			ctx.fillStyle = "#ffffff";
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			const { title, description, template } = inputs;

			if (template === "hero-overlay") {
				// 1. Background Image
				if (img) {
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#0f172a";
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// 2. Classy Gradient Overlay
				const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
				grad.addColorStop(0, "rgba(3, 1, 100, 0.4)"); // #030164
				grad.addColorStop(0.4, "rgba(54, 49, 153, 0.7)"); // #363199
				grad.addColorStop(1, "rgba(3, 1, 100, 0.95)"); // #030164
				ctx.fillStyle = grad;
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				// 3. Text
				ctx.textAlign = "center";
				ctx.textBaseline = "top";

				ctx.fillStyle = "#ffffff";
				ctx.font = "900 84px Inter, sans-serif";
				const titleY = CANVAS_HEIGHT * 0.55;
				const endY = wrapText(
					ctx,
					title || "YOUR TITLE HERE",
					120,
					titleY,
					CANVAS_WIDTH - 240,
					100,
					"center",
				);

				// Accent Divider
				ctx.fillStyle = "#E8E085"; // soft yellow
				ctx.fillRect(CANVAS_WIDTH / 2 - 40, endY + 40, 80, 6);

				if (description) {
					ctx.fillStyle = "#cbd5e1"; // slate-300
					ctx.font = "400 38px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						150,
						endY + 80,
						CANVAS_WIDTH - 300,
						56,
						"center",
					);
				}
			} else if (template === "minimalist-split") {
				// Left 50%
				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH / 2,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();
				} else {
					ctx.fillStyle = "#e2e8f0"; // slate-200
					ctx.fillRect(0, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);
				}

				// Right 50%
				ctx.fillStyle = "#f8fafc"; // slate-50 (softer white)
				ctx.fillRect(CANVAS_WIDTH / 2, 0, CANVAS_WIDTH / 2, CANVAS_HEIGHT);

				// Text
				ctx.textAlign = "left";
				ctx.textBaseline = "top";

				const paddingX = CANVAS_WIDTH / 2 + 100;
				const maxW = CANVAS_WIDTH / 2 - 200;

				// Small Kicker Label
				ctx.fillStyle = "#2D7495"; // teal
				ctx.font = "800 24px Inter, sans-serif";
				ctx.fillText("INSIGHT", paddingX, CANVAS_HEIGHT / 2 - 200);

				ctx.fillStyle = "#030164"; // deep navy
				ctx.font = "800 72px Inter, sans-serif";
				const endY = wrapText(
					ctx,
					title || "Split Title",
					paddingX,
					CANVAS_HEIGHT / 2 - 140,
					maxW,
					86,
					"left",
				);

				if (description) {
					ctx.fillStyle = "#475569"; // slate-600
					ctx.font = "400 38px Inter, sans-serif";
					wrapText(ctx, description, paddingX, endY + 40, maxW, 56, "left");
				}
			} else if (template === "floating-card") {
				// Blurred background
				if (img) {
					ctx.filter = "blur(40px) saturate(1.5)";
					drawImageProp(
						ctx,
						img,
						-100,
						-100,
						CANVAS_WIDTH + 200,
						CANVAS_HEIGHT + 200,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.filter = "none";
					ctx.fillStyle = "rgba(3, 1, 100, 0.4)"; // Darker tint to make white card pop
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				} else {
					const grad = ctx.createLinearGradient(
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
					);
					grad.addColorStop(0, "#363199");
					grad.addColorStop(1, "#030164");
					ctx.fillStyle = grad;
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// Card
				const cardW = CANVAS_WIDTH - 240;
				const cardH = CANVAS_HEIGHT - 360;
				const cardX = 120;
				const cardY = 180;

				ctx.save();
				ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
				ctx.shadowBlur = 60;
				ctx.shadowOffsetY = 30;
				ctx.fillStyle = "#ffffff";
				roundRect(ctx, cardX, cardY, cardW, cardH, 48);
				ctx.fill();
				ctx.lineWidth = 2;
				ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
				ctx.stroke();
				ctx.restore();

				// Inner thumbnail
				let textStartY = cardY + 120;
				if (img) {
					const thumbSize = 200;
					ctx.save();
					roundRect(
						ctx,
						CANVAS_WIDTH / 2 - thumbSize / 2,
						cardY - thumbSize / 2,
						thumbSize,
						thumbSize,
						100,
					);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						CANVAS_WIDTH / 2 - thumbSize / 2,
						cardY - thumbSize / 2,
						thumbSize,
						thumbSize,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();

					// Thumb ring
					ctx.save();
					roundRect(
						ctx,
						CANVAS_WIDTH / 2 - thumbSize / 2,
						cardY - thumbSize / 2,
						thumbSize,
						thumbSize,
						100,
					);
					ctx.lineWidth = 12;
					ctx.strokeStyle = "#ffffff";
					ctx.stroke();
					ctx.restore();

					textStartY = cardY + 160;
				}

				// Text
				ctx.textAlign = "center";
				ctx.textBaseline = "top";

				ctx.fillStyle = "#030164"; // deep navy
				ctx.font = "800 64px Inter, sans-serif";
				const endY = wrapText(
					ctx,
					title || "Card Title",
					cardX + 60,
					textStartY,
					cardW - 120,
					80,
					"center",
				);

				if (description) {
					ctx.fillStyle = "#475569"; // slate-600
					ctx.font = "400 36px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						cardX + 80,
						endY + 40,
						cardW - 160,
						52,
						"center",
					);
				}
			} else if (template === "breaking-news") {
				// 1. Full-bleed background image
				if (img) {
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#e2e8f0"; // slate-200
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// Lower Third Dimensions
				const bottomBarH = 70;
				const titleBarH = 150;
				const breakingBarH = 70;
				const bottomBarY = CANVAS_HEIGHT - bottomBarH;
				const titleBarY = bottomBarY - titleBarH;
				const breakingBarY = titleBarY - breakingBarH;

				// Shadow for the whole lower third
				ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
				ctx.shadowBlur = 30;
				ctx.shadowOffsetY = 10;
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, titleBarY, CANVAS_WIDTH, titleBarH);
				ctx.shadowColor = "transparent"; // reset

				// "BREAKING NEWS" Ribbon
				// Dark red folded corner
				ctx.fillStyle = "#8b1818";
				ctx.beginPath();
				ctx.moveTo(0, breakingBarY);
				ctx.lineTo(40, breakingBarY);
				ctx.lineTo(20, breakingBarY + breakingBarH);
				ctx.lineTo(0, breakingBarY + breakingBarH);
				ctx.fill();

				// Main red ribbon
				const breakingRibbonWidth = 620;
				ctx.fillStyle = "#c82a2a";
				ctx.beginPath();
				ctx.moveTo(40, breakingBarY);
				ctx.lineTo(breakingRibbonWidth, breakingBarY);
				ctx.lineTo(breakingRibbonWidth, breakingBarY + breakingBarH);
				ctx.lineTo(20, breakingBarY + breakingBarH);
				ctx.fill();

				// "BREAKING NEWS" Text
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#ffffff";
				ctx.font = "900 48px Arial, Helvetica, sans-serif";
				ctx.fillText("BREAKING NEWS", 60, breakingBarY + breakingBarH / 2 + 4);

				// Title Bar (White background already drawn with shadow)
				ctx.fillStyle = "#000000";
				ctx.font = "900 100px Arial, Helvetica, sans-serif"; // Very bold, tight letters
				ctx.fillText(
					(title || "YOUR HEADLINE HERE").toUpperCase(),
					40,
					titleBarY + titleBarH / 2 + 8,
					CANVAS_WIDTH - 80,
				);

				// Bottom Bar (Ticker)
				// Left time block
				ctx.fillStyle = "#000000";
				ctx.fillRect(0, bottomBarY, 150, bottomBarH);
				ctx.fillStyle = "#ffffff";
				ctx.font = "700 38px Arial, Helvetica, sans-serif";
				ctx.textAlign = "center";
				ctx.fillText("5:16", 75, bottomBarY + bottomBarH / 2 + 4);

				// Right description block
				ctx.fillStyle = "#a82222";
				ctx.fillRect(150, bottomBarY, CANVAS_WIDTH - 150, bottomBarH);
				ctx.textAlign = "left";
				ctx.fillStyle = "#ffffff";
				ctx.font = "700 38px Arial, Helvetica, sans-serif";
				ctx.fillText(
					(description || "ADDITIONAL DETAILS...").toUpperCase(),
					175,
					bottomBarY + bottomBarH / 2 + 4,
					CANVAS_WIDTH - 200,
				);

				// LIVE Badge at top left
				const liveY = 40;
				const liveX = 40;
				const liveW = 150;
				const liveH = 50;

				ctx.fillStyle = "#c82a2a";
				ctx.fillRect(liveX, liveY, liveW, liveH);
				ctx.fillStyle = "#ffffff";
				ctx.textAlign = "left";
				ctx.font = "900 32px Arial, Helvetica, sans-serif";
				ctx.fillText("LIVE", liveX + 50, liveY + liveH / 2 + 3);

				// Two vertical bars icon for the LIVE badge
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(liveX + 20, liveY + 12, 6, 26);
				ctx.fillRect(liveX + 32, liveY + 12, 6, 26);
			} else if (template === "quote-minimal") {
				// Background
				if (img) {
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
					grad.addColorStop(0, "rgba(3, 1, 100, 0.75)"); // #030164
					grad.addColorStop(1, "rgba(45, 116, 149, 0.95)"); // #2D7495
					ctx.fillStyle = grad;
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				} else {
					ctx.fillStyle = "#030164"; // ultra dark navy
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// Giant Quote Mark Background
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
				ctx.font = "900 600px ui-serif, Georgia, serif";
				ctx.fillText('"', 60, -20);

				// Quote Text
				ctx.textAlign = "left";
				ctx.fillStyle = "#ffffff";
				ctx.font = "400 64px ui-serif, Georgia, serif";

				const startY = CANVAS_HEIGHT / 2 - 120;
				const endY = wrapText(
					ctx,
					title ? `"${title}"` : '"Simplicity is the ultimate sophistication."',
					140,
					startY,
					CANVAS_WIDTH - 280,
					96,
					"left",
				);

				if (description) {
					ctx.fillStyle = "#94a3b8"; // slate-400
					ctx.font = "600 28px Inter, sans-serif";
					wrapText(
						ctx,
						`— ${description.toUpperCase()}`,
						140,
						endY + 80,
						CANVAS_WIDTH - 280,
						44,
						"right",
					);
				}
			} else if (template === "classy-offset") {
				// 1. Full-bleed background image
				if (img) {
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#e2e8f0"; // slate-200
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				const isLight = inputs.theme === "light";
				const textColor = isLight ? "#ffffff" : "#000000";
				const shadowColor = isLight
					? "rgba(0, 0, 0, 0.4)"
					: "rgba(255, 255, 255, 0.4)";

				// Minimalist Classy Text Offset
				const textX = CANVAS_WIDTH * 0.15;
				const textY = CANVAS_HEIGHT * 0.35; // Upper-leftish placement

				ctx.textAlign = "left";
				ctx.textBaseline = "top";

				// Ultra-subtle glow for contrast
				ctx.shadowColor = shadowColor;
				ctx.shadowBlur = 40;
				ctx.shadowOffsetY = 0;
				ctx.shadowOffsetX = 0;

				let currentY = textY;

				if (description) {
					ctx.fillStyle = textColor;
					ctx.font = "700 42px Inter, sans-serif";
					currentY = wrapText(
						ctx,
						description.toLowerCase(),
						textX,
						currentY,
						CANVAS_WIDTH * 0.7, // Allow wide text
						60,
						"left",
					);
				}

				if (title) {
					ctx.fillStyle = textColor;
					ctx.font = "900 85px Inter, sans-serif";
					// Slightly indent the main title if there is a description
					const indent = description ? 50 : 0;
					wrapText(
						ctx,
						title.toLowerCase(),
						textX + indent,
						currentY + 10, // Small gap
						CANVAS_WIDTH * 0.7,
						100,
						"left",
					);
				}

				// Reset shadow
				ctx.shadowColor = "transparent";
			} else if (template === "duotone-overlay") {
				// Image Background
				if (img) {
					ctx.filter = "grayscale(100%) contrast(1.2)";
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.filter = "none";
				} else {
					ctx.fillStyle = "#1e293b";
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// Rich Duotone Gradient Overlay (Multiply blend mode)
				ctx.globalCompositeOperation = "multiply";
				const gradient = ctx.createLinearGradient(
					0,
					0,
					CANVAS_WIDTH,
					CANVAS_HEIGHT,
				);
				gradient.addColorStop(0, "#363199"); // purple
				gradient.addColorStop(1, "#2D7495"); // teal
				ctx.fillStyle = gradient;
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				ctx.globalCompositeOperation = "source-over"; // reset

				// Text
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillStyle = "#ffffff";
				ctx.font = "900 96px Inter, sans-serif";

				const midY = CANVAS_HEIGHT / 2 - 60;
				const endY = wrapText(
					ctx,
					(title || "BOLD STATEMENT").toUpperCase(),
					80,
					midY,
					CANVAS_WIDTH - 160,
					100,
					"center",
				);

				if (description) {
					ctx.textAlign = "center";
					ctx.textBaseline = "top";
					ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
					ctx.font = "500 36px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						120,
						endY + 40,
						CANVAS_WIDTH - 240,
						52,
						"center",
					);
				}
			} else if (template === "thread-starter") {
				// 1. Gorgeous mesh gradient background
				const bgGrad = ctx.createRadialGradient(
					CANVAS_WIDTH * 0.2,
					CANVAS_HEIGHT * 0.2,
					0,
					CANVAS_WIDTH / 2,
					CANVAS_HEIGHT / 2,
					CANVAS_WIDTH,
				);
				bgGrad.addColorStop(0, "#363199"); // purple top left
				bgGrad.addColorStop(0.5, "#030164"); // deep navy center
				bgGrad.addColorStop(1, "#2D7495"); // teal bottom right
				ctx.fillStyle = bgGrad;
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				// 2. Thread Card (Floating Glass / White)
				const cardPad = 80;
				const cardW = CANVAS_WIDTH - 160;
				const cardH = CANVAS_HEIGHT - 240;
				const cardX = 80;
				const cardY = 120;

				ctx.save();
				ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
				ctx.shadowBlur = 60;
				ctx.shadowOffsetY = 30;
				ctx.fillStyle = "#ffffff";
				roundRect(ctx, cardX, cardY, cardW, cardH, 48);
				ctx.fill();
				ctx.restore();

				// Inner Content Padding
				const contentX = cardX + cardPad;
				let currentY = cardY + cardPad;

				// Avatar (Circle)
				const avatarR = 64;
				if (avatarImg) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(
						contentX + avatarR,
						currentY + avatarR,
						avatarR,
						0,
						Math.PI * 2,
					);
					ctx.clip();
					drawImageProp(
						ctx,
						avatarImg,
						contentX,
						currentY,
						avatarR * 2,
						avatarR * 2,
						inputs.avatarOffsetX ?? 0.5,
						inputs.avatarOffsetY ?? 0.5,
					);
					ctx.restore();
				} else {
					ctx.fillStyle = "#e2e8f0";
					ctx.beginPath();
					ctx.arc(
						contentX + avatarR,
						currentY + avatarR,
						avatarR,
						0,
						Math.PI * 2,
					);
					ctx.fill();
				}

				// Username (Title)
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#030164"; // deep navy
				ctx.font = "800 44px Inter, sans-serif";
				ctx.fillText(
					title || "Polma Tambunan",
					contentX + avatarR * 2 + 40,
					currentY + avatarR - 14,
				);

				// Handle & Verified Style
				ctx.fillStyle = "#2D7495"; // teal
				ctx.font = "500 34px Inter, sans-serif";
				ctx.fillText(
					"@" +
						(title ? title.replace(/\s+/g, "").toLowerCase() : "polmatambunan"),
					contentX + avatarR * 2 + 40,
					currentY + avatarR + 26,
				);

				// Thread content
				currentY += avatarR * 2 + 60;
				ctx.textBaseline = "top";
				ctx.fillStyle = "#0f172a"; // slate-900
				ctx.font = "400 48px Inter, sans-serif";

				const textEndY = wrapText(
					ctx,
					description ||
						"Start your insightful thread right here. Share knowledge, build your audience.",
					contentX,
					currentY,
					cardW - cardPad * 2,
					74,
					"left",
				);

				// Thread Attachment Image
				if (img) {
					ctx.save();
					const attachY = textEndY + 60;
					const attachW = cardW - cardPad * 2;
					const maxAttachH = cardY + cardH - attachY - cardPad;
					if (maxAttachH > 100) {
						roundRect(ctx, contentX, attachY, attachW, maxAttachH, 32);
						ctx.clip();
						drawImageProp(
							ctx,
							img,
							contentX,
							attachY,
							attachW,
							maxAttachH,
							inputs.imageOffsetX ?? 0.5,
							inputs.imageOffsetY ?? 0.5,
						);
					}
					ctx.restore();
				}
			} else if (template === "flat-bento") {
				ctx.fillStyle = "#E8E085"; // yellow bg
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				const pad = 60;
				const bentoW = (CANVAS_WIDTH - pad * 3) / 2;
				const bentoH1 = (CANVAS_HEIGHT - pad * 3) * 0.4;
				const bentoH2 = (CANVAS_HEIGHT - pad * 3) * 0.6;

				// Left Top (Title)
				ctx.fillStyle = "#030164"; // Navy
				roundRect(ctx, pad, pad, bentoW, bentoH1, 32);
				ctx.fill();
				ctx.fillStyle = "#ffffff";
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.font = "900 64px Inter, sans-serif";
				wrapText(
					ctx,
					title || "BENTO HEADER",
					pad + 40,
					pad + bentoH1 / 2 - 20,
					bentoW - 80,
					72,
					"left",
				);

				// Left Bottom (Desc)
				ctx.fillStyle = "#ffffff";
				roundRect(ctx, pad, pad * 2 + bentoH1, bentoW, bentoH2, 32);
				ctx.fill();
				ctx.lineWidth = 4;
				ctx.strokeStyle = "#030164";
				ctx.stroke();
				ctx.fillStyle = "#030164";
				ctx.textBaseline = "top";
				ctx.font = "500 40px Inter, sans-serif";
				wrapText(
					ctx,
					description || "Detailed information goes here inside this module.",
					pad + 40,
					pad * 2 + bentoH1 + 60,
					bentoW - 80,
					56,
					"left",
				);

				// Right Side (Image)
				const rightX = pad * 2 + bentoW;
				const rightH = CANVAS_HEIGHT - pad * 2;

				ctx.save();
				roundRect(ctx, rightX, pad, bentoW, rightH, 32);
				if (img) {
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						rightX,
						pad,
						bentoW,
						rightH,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#2D7495"; // Teal default
					ctx.fill();
				}
				ctx.restore();
			} else if (template === "neo-brutalist") {
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				const pad = 80;
				const borderW = 8;

				// Brutalist Image Container
				const imgH = CANVAS_HEIGHT * 0.55;

				ctx.fillStyle = "#030164"; // offset shadow
				ctx.fillRect(pad + 20, pad + 20, CANVAS_WIDTH - pad * 2, imgH);

				ctx.save();
				ctx.beginPath();
				ctx.rect(pad, pad, CANVAS_WIDTH - pad * 2, imgH);
				if (img) {
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						pad,
						pad,
						CANVAS_WIDTH - pad * 2,
						imgH,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#E8E085"; // yellow
					ctx.fill();
				}
				ctx.restore();

				ctx.lineWidth = borderW;
				ctx.strokeStyle = "#030164";
				ctx.strokeRect(pad, pad, CANVAS_WIDTH - pad * 2, imgH);

				// Brutalist Typography
				ctx.fillStyle = "#030164";
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				ctx.font = "900 110px Inter, sans-serif";
				const titleY = pad + imgH + 80;
				const endY = wrapText(
					ctx,
					(title || "BRUTALIST").toUpperCase(),
					pad,
					titleY,
					CANVAS_WIDTH - pad * 2,
					110,
					"left",
				);

				if (description) {
					ctx.fillStyle = "#2D7495";
					ctx.font = "700 44px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						pad,
						endY + 40,
						CANVAS_WIDTH - pad * 2,
						60,
						"left",
					);
				}
			} else if (template === "swiss-grid") {
				ctx.fillStyle = "#f8fafc"; // offwhite
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				// Draw Grid Lines
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#030164";

				const cols = 4;
				const rows = 4;
				const colW = CANVAS_WIDTH / cols;
				const rowH = CANVAS_HEIGHT / rows;

				for (let i = 1; i < cols; i++) {
					ctx.beginPath();
					ctx.moveTo(i * colW, 0);
					ctx.lineTo(i * colW, CANVAS_HEIGHT);
					ctx.stroke();
				}
				for (let i = 1; i < rows; i++) {
					ctx.beginPath();
					ctx.moveTo(0, i * rowH);
					ctx.lineTo(CANVAS_WIDTH, i * rowH);
					ctx.stroke();
				}

				// Accent Block
				ctx.fillStyle = "#2D7495"; // Teal
				ctx.fillRect(0, 0, colW, rowH);

				// Image Window (spanning columns 2-4, rows 2-4)
				const imgX = colW;
				const imgY = rowH;
				const imgW = colW * 3;
				const imgH = rowH * 3;

				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(imgX, imgY, imgW, imgH);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						imgX,
						imgY,
						imgW,
						imgH,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();
				} else {
					ctx.fillStyle = "#E8E085"; // yellow
					ctx.fillRect(imgX, imgY, imgW, imgH);
				}

				// Text (Row 1, spanning cols 2-4)
				ctx.textAlign = "left";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#030164";
				ctx.font = "800 64px Inter, sans-serif";
				wrapText(
					ctx,
					title || "SWISS DESIGN",
					colW + 40,
					rowH / 2 - 20,
					imgW - 80,
					70,
					"left",
				);

				if (description) {
					ctx.fillStyle = "#363199";
					ctx.font = "500 32px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						colW + 40,
						rowH / 2 + 30,
						imgW - 80,
						40,
						"left",
					);
				}
			} else if (template === "polaroid-brutalist") {
				ctx.fillStyle = "#030164"; // Navy bg
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				const cardW = CANVAS_WIDTH * 0.8;
				const cardH = CANVAS_HEIGHT * 0.8;
				const cardX = (CANVAS_WIDTH - cardW) / 2;
				const cardY = (CANVAS_HEIGHT - cardH) / 2;

				// Flat shadow
				ctx.fillStyle = "#E8E085"; // Yellow shadow
				ctx.fillRect(cardX + 24, cardY + 24, cardW, cardH);

				// Main Card
				ctx.fillStyle = "#ffffff";
				ctx.fillRect(cardX, cardY, cardW, cardH);
				ctx.lineWidth = 6;
				ctx.strokeStyle = "#363199";
				ctx.strokeRect(cardX, cardY, cardW, cardH);

				// Image
				const imgPad = 40;
				const imgW = cardW - imgPad * 2;
				const imgH = cardH * 0.7; // 70% of card

				ctx.save();
				ctx.beginPath();
				ctx.rect(cardX + imgPad, cardY + imgPad, imgW, imgH);
				if (img) {
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						cardX + imgPad,
						cardY + imgPad,
						imgW,
						imgH,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
				} else {
					ctx.fillStyle = "#2D7495";
					ctx.fill();
				}
				ctx.restore();
				ctx.strokeRect(cardX + imgPad, cardY + imgPad, imgW, imgH);

				// Typography
				ctx.fillStyle = "#030164";
				ctx.textAlign = "left";
				ctx.textBaseline = "top";
				ctx.font = "900 64px Inter, sans-serif";
				wrapText(
					ctx,
					title || "BRUTALIST CARD",
					cardX + imgPad,
					cardY + imgPad + imgH + 40,
					imgW,
					70,
					"left",
				);

				if (description) {
					ctx.fillStyle = "#363199";
					ctx.font = "600 36px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						cardX + imgPad,
						cardY + imgPad + imgH + 120,
						imgW,
						44,
						"left",
					);
				}
			} else if (template === "typography-poster") {
				ctx.fillStyle = "#E8E085"; // Yellow bg
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				// Accent Stripe
				ctx.fillStyle = "#363199"; // Indigo
				ctx.fillRect(CANVAS_WIDTH - 120, 0, 40, CANVAS_HEIGHT);

				ctx.textAlign = "left";
				ctx.textBaseline = "top";

				// Massive Text
				ctx.fillStyle = "#030164"; // Navy
				ctx.font = "900 160px Inter, sans-serif";
				const endY = wrapText(
					ctx,
					(title || "MAKE\nIT\nMASSIVE").toUpperCase(),
					80,
					80,
					CANVAS_WIDTH - 240,
					150,
					"left",
				);

				// Small context
				if (description) {
					ctx.fillStyle = "#2D7495";
					ctx.font = "700 40px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						80,
						endY + 80,
						CANVAS_WIDTH - 240,
						50,
						"left",
					);
				}

				// Sticker image (if provided)
				if (img) {
					const stickerSize = 300;
					const stickerX = CANVAS_WIDTH - stickerSize - 160;
					const stickerY = CANVAS_HEIGHT - stickerSize - 80;

					ctx.save();
					ctx.beginPath();
					ctx.arc(
						stickerX + stickerSize / 2,
						stickerY + stickerSize / 2,
						stickerSize / 2,
						0,
						Math.PI * 2,
					);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						stickerX,
						stickerY,
						stickerSize,
						stickerSize,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();

					ctx.lineWidth = 12;
					ctx.strokeStyle = "#ffffff";
					ctx.beginPath();
					ctx.arc(
						stickerX + stickerSize / 2,
						stickerY + stickerSize / 2,
						stickerSize / 2,
						0,
						Math.PI * 2,
					);
					ctx.stroke();
				}
			} else if (template === "split-monochrome") {
				// Top Half
				ctx.fillStyle = "#030164"; // Navy
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT / 2);

				// Bottom Half
				ctx.fillStyle = "#ffffff"; // White
				ctx.fillRect(0, CANVAS_HEIGHT / 2, CANVAS_WIDTH, CANVAS_HEIGHT / 2);

				// Center Image Circle
				const radius = 250;
				const centerX = CANVAS_WIDTH / 2;
				const centerY = CANVAS_HEIGHT / 2;

				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						centerX - radius,
						centerY - radius,
						radius * 2,
						radius * 2,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();
				} else {
					ctx.fillStyle = "#2D7495"; // Teal
					ctx.beginPath();
					ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
					ctx.fill();
				}

				// Center Circle Border
				ctx.lineWidth = 16;
				ctx.strokeStyle = "#E8E085"; // Yellow ring
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
				ctx.stroke();

				// Text Top
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				ctx.fillStyle = "#ffffff";
				ctx.font = "900 72px Inter, sans-serif";
				ctx.fillText(
					(title || "TOP STATEMENT").toUpperCase(),
					centerX,
					centerY - radius - 60,
				);

				// Text Bottom
				if (description) {
					ctx.textBaseline = "top";
					ctx.fillStyle = "#030164";
					ctx.font = "600 40px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						100,
						centerY + radius + 60,
						CANVAS_WIDTH - 200,
						50,
						"center",
					);
				}
			} else if (template === "manifesto-block") {
				ctx.fillStyle = "#030164"; // Navy Background
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				// Very stark, blocky yellow text
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillStyle = "#E8E085"; // Yellow
				ctx.font = "900 120px Inter, sans-serif";
				const endY = wrapText(
					ctx,
					(title || "WRITE A\nSTRONG\nMANIFESTO").toUpperCase(),
					120,
					CANVAS_HEIGHT * 0.35,
					CANVAS_WIDTH - 240,
					130,
					"center",
				);

				if (description) {
					ctx.fillStyle = "#ffffff";
					ctx.font = "500 40px Inter, sans-serif";
					wrapText(
						ctx,
						description,
						120,
						endY + 80,
						CANVAS_WIDTH - 240,
						60,
						"center",
					);
				}

				// Small brand icon at bottom
				if (img) {
					const iconSize = 120;
					const iconX = (CANVAS_WIDTH - iconSize) / 2;
					const iconY = CANVAS_HEIGHT - iconSize - 80;

					ctx.save();
					ctx.beginPath();
					ctx.arc(
						iconX + iconSize / 2,
						iconY + iconSize / 2,
						iconSize / 2,
						0,
						Math.PI * 2,
					);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						iconX,
						iconY,
						iconSize,
						iconSize,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();
				}
			} else if (template === "narrative-focus") {
				// Background Image
				if (img) {
					drawImageProp(
						ctx,
						img,
						0,
						0,
						CANVAS_WIDTH,
						CANVAS_HEIGHT,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);

					// Dark cinematic multiply
					ctx.globalCompositeOperation = "multiply";
					ctx.fillStyle = "#363199"; // Indigo tint
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
					ctx.globalCompositeOperation = "source-over";
				} else {
					ctx.fillStyle = "#1e293b"; // Slate 800
					ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
				}

				// Center Text Box
				const boxW = CANVAS_WIDTH * 0.85;
				const boxX = (CANVAS_WIDTH - boxW) / 2;
				const boxH = CANVAS_HEIGHT * 0.45;
				const boxY = (CANVAS_HEIGHT - boxH) / 2;

				ctx.fillStyle = "#ffffff";
				ctx.fillRect(boxX, boxY, boxW, boxH);

				// Text
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				ctx.fillStyle = "#0f172a"; // Slate 900
				ctx.font = "600 56px ui-serif, Georgia, serif";
				const titleY = boxY + 120;
				const endY = wrapText(
					ctx,
					`“${title || "A strong narrative hooks the reader instantly."}”`,
					boxX + 80,
					titleY,
					boxW - 160,
					80,
					"center",
				);

				if (description) {
					ctx.fillStyle = "#64748b"; // Slate 500
					ctx.font = "400 32px Inter, sans-serif";
					wrapText(
						ctx,
						description.toUpperCase(),
						boxX + 80,
						endY + 80,
						boxW - 160,
						50,
						"center",
					);
				}
			} else if (template === "minimal-chapter") {
				ctx.fillStyle = "#f8fafc"; // Off-white
				ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

				const centerX = CANVAS_WIDTH / 2;
				const centerY = CANVAS_HEIGHT / 2;

				// Middle Square Image
				const imgSize = 400;
				const imgX = centerX - imgSize / 2;
				const imgY = centerY - imgSize / 2;

				if (img) {
					ctx.save();
					ctx.beginPath();
					ctx.rect(imgX, imgY, imgSize, imgSize);
					ctx.clip();
					drawImageProp(
						ctx,
						img,
						imgX,
						imgY,
						imgSize,
						imgSize,
						inputs.imageOffsetX ?? 0.5,
						inputs.imageOffsetY ?? 0.5,
					);
					ctx.restore();
				} else {
					ctx.fillStyle = "#e2e8f0";
					ctx.fillRect(imgX, imgY, imgSize, imgSize);
				}

				// Chapter Title (Top)
				ctx.textAlign = "center";
				ctx.textBaseline = "bottom";
				ctx.fillStyle = "#030164"; // Navy
				ctx.font = "400 64px ui-serif, Georgia, serif";
				wrapText(
					ctx,
					title || "Chapter One",
					100,
					imgY - 80,
					CANVAS_WIDTH - 200,
					80,
					"center",
				);

				// Small line above image
				ctx.fillStyle = "#030164";
				ctx.fillRect(centerX - 40, imgY - 40, 80, 2);

				// Core Message (Bottom)
				if (description) {
					ctx.textAlign = "center";
					ctx.textBaseline = "top";
					ctx.fillStyle = "#334155"; // Slate 700
					ctx.font = "300 40px ui-serif, Georgia, serif";
					wrapText(
						ctx,
						description,
						140,
						imgY + imgSize + 80,
						CANVAS_WIDTH - 280,
						60,
						"center",
					);
				}
			}
		};

		render();
	}, [inputs]);

	return (
		<canvas
			ref={canvasRef}
			width={CANVAS_WIDTH}
			height={CANVAS_HEIGHT}
			className="max-w-full max-h-[62dvh] sm:max-h-[75vh] w-auto h-auto bg-white rounded-2xl shadow-sm border border-slate-200/80 object-contain mx-auto block"
		/>
	);
});

CanvasRenderer.displayName = "CanvasRenderer";
