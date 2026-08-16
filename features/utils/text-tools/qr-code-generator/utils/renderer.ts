import QRCode from "qrcode";
import type {
	DotStyle,
	EyeBallStyle,
	EyeFrameStyle,
	QRStyleConfig,
} from "../types";
import { PRESET_LOGOS } from "../data/presets";

export interface QRMatrixInfo {
	size: number;
	getModule: (row: number, col: number) => boolean;
}

export function generateQRMatrix(
	text: string,
	errorCorrectionLevel: "L" | "M" | "Q" | "H",
): QRMatrixInfo | null {
	if (!text?.trim()) return null;
	try {
		const qr = QRCode.create(text, {
			errorCorrectionLevel,
		});
		return {
			size: qr.modules.size,
			getModule: (row: number, col: number) => {
				if (
					row < 0 ||
					row >= qr.modules.size ||
					col < 0 ||
					col >= qr.modules.size
				) {
					return false;
				}
				return Boolean(qr.modules.get(row, col));
			},
		};
	} catch (e) {
		console.error("Error generating QR matrix:", e);
		return null;
	}
}

export function isFinderPattern(
	row: number,
	col: number,
	size: number,
): {
	isFinder: boolean;
	isTopLeft: boolean;
	isTopRight: boolean;
	isBottomLeft: boolean;
} {
	const isTopLeft = row < 7 && col < 7;
	const isTopRight = row < 7 && col >= size - 7;
	const isBottomLeft = row >= size - 7 && col < 7;
	return {
		isFinder: isTopLeft || isTopRight || isBottomLeft,
		isTopLeft,
		isTopRight,
		isBottomLeft,
	};
}

export function isInsideLogo(
	row: number,
	col: number,
	size: number,
	config: QRStyleConfig,
): boolean {
	if (config.logo.type === "none") return false;
	const ratio = config.logo.sizeRatio || 0.22;
	const center = (size - 1) / 2;
	const halfLogo = (size * ratio) / 2 + (config.logo.bgPadding ?? 0.5);
	return (
		Math.abs(row - center) <= halfLogo && Math.abs(col - center) <= halfLogo
	);
}

// Canvas Drawer
export async function renderQRToCanvas(
	canvas: HTMLCanvasElement,
	text: string,
	config: QRStyleConfig,
	targetDimension = 512,
): Promise<boolean> {
	const matrix = generateQRMatrix(text, config.errorCorrectionLevel);
	if (!matrix) return false;

	const ctx = canvas.getContext("2d");
	if (!ctx) return false;

	const { size, getModule } = matrix;

	// Frame calculations
	const hasFrame =
		config.frame.style !== "none" && config.frame.text.trim().length > 0;
	const frameStyle = config.frame.style;

	const bannerHeight = hasFrame ? Math.round(targetDimension * 0.16) : 0;
	const totalWidth = targetDimension;
	const totalHeight = hasFrame
		? targetDimension + bannerHeight
		: targetDimension;

	canvas.width = totalWidth;
	canvas.height = totalHeight;

	ctx.clearRect(0, 0, totalWidth, totalHeight);

	// Background
	if (!config.transparentBg) {
		ctx.fillStyle = config.bgColor;
		ctx.fillRect(0, 0, totalWidth, totalHeight);
	}

	// Calculate QR drawing area
	const qrOffsetY = frameStyle === "top-badge" ? bannerHeight : 0;
	const marginModules = config.margin ?? 2;
	const effectiveModules = size + marginModules * 2;
	const modulePixelSize = targetDimension / effectiveModules;
	const qrOriginX = marginModules * modulePixelSize;
	const qrOriginY = qrOffsetY + marginModules * modulePixelSize;

	// Draw Body Modules (Dots)
	const fgColor = config.fgColor;
	const eyeFrameColor = config.customEyeColors
		? config.eyeFrameColor
		: config.fgColor;
	const eyeBallColor = config.customEyeColors
		? config.eyeBallColor
		: config.fgColor;

	ctx.fillStyle = fgColor;

	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			const { isFinder } = isFinderPattern(r, c, size);
			if (isFinder) continue; // Eyes handled separately for custom styling
			if (isInsideLogo(r, c, size, config)) continue; // Cleared for logo

			if (getModule(r, c)) {
				const x = qrOriginX + c * modulePixelSize;
				const y = qrOriginY + r * modulePixelSize;
				drawModuleDot(ctx, x, y, modulePixelSize, config.dotStyle);
			}
		}
	}

	// Draw Corner Eyes
	drawEyeOnCanvas(
		ctx,
		qrOriginX,
		qrOriginY,
		modulePixelSize,
		config.eyeFrameStyle,
		config.eyeBallStyle,
		eyeFrameColor,
		eyeBallColor,
		config.bgColor,
		"top-left",
	);

	drawEyeOnCanvas(
		ctx,
		qrOriginX + (size - 7) * modulePixelSize,
		qrOriginY,
		modulePixelSize,
		config.eyeFrameStyle,
		config.eyeBallStyle,
		eyeFrameColor,
		eyeBallColor,
		config.bgColor,
		"top-right",
	);

	drawEyeOnCanvas(
		ctx,
		qrOriginX,
		qrOriginY + (size - 7) * modulePixelSize,
		modulePixelSize,
		config.eyeFrameStyle,
		config.eyeBallStyle,
		eyeFrameColor,
		eyeBallColor,
		config.bgColor,
		"bottom-left",
	);

	// Draw Logo in Center
	if (config.logo.type !== "none") {
		await drawLogoOnCanvas(
			ctx,
			qrOriginX + (size * modulePixelSize) / 2,
			qrOriginY + (size * modulePixelSize) / 2,
			targetDimension * (config.logo.sizeRatio || 0.22),
			config,
		);
	}

	// Draw Frame Banner / Badge
	if (hasFrame) {
		drawFrameBanner(ctx, totalWidth, targetDimension, bannerHeight, config);
	}

	return true;
}

function drawModuleDot(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	style: DotStyle,
) {
	ctx.beginPath();
	switch (style) {
		case "dots": {
			const radius = size * 0.44;
			ctx.arc(x + size / 2, y + size / 2, radius, 0, Math.PI * 2);
			ctx.fill();
			break;
		}
		case "rounded": {
			const r = size * 0.32;
			drawRoundedRect(ctx, x + 0.5, y + 0.5, size - 1, size - 1, r);
			ctx.fill();
			break;
		}
		case "classy": {
			const r = size * 0.42;
			drawRoundedRect(ctx, x + 0.8, y + 0.8, size - 1.6, size - 1.6, r);
			ctx.fill();
			break;
		}
		default: {
			ctx.fillRect(x, y, size + 0.2, size + 0.2); // slight overlap to avoid sub-pixel gaps
			break;
		}
	}
}

function drawEyeOnCanvas(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	moduleSize: number,
	frameStyle: EyeFrameStyle,
	ballStyle: EyeBallStyle,
	frameColor: string,
	ballColor: string,
	bgColor: string,
	position: "top-left" | "top-right" | "bottom-left",
) {
	const eyeWidth = moduleSize * 7;
	const innerWidth = moduleSize * 5;
	const ballWidth = moduleSize * 3;

	// 1. Draw Eye Outer Frame
	ctx.fillStyle = frameColor;
	ctx.beginPath();
	switch (frameStyle) {
		case "circle": {
			ctx.arc(x + eyeWidth / 2, y + eyeWidth / 2, eyeWidth / 2, 0, Math.PI * 2);
			ctx.fill();
			// Cut center
			ctx.fillStyle = bgColor;
			ctx.beginPath();
			ctx.arc(
				x + eyeWidth / 2,
				y + eyeWidth / 2,
				innerWidth / 2,
				0,
				Math.PI * 2,
			);
			ctx.fill();
			break;
		}
		case "rounded": {
			const radius = eyeWidth * 0.26;
			drawRoundedRect(ctx, x, y, eyeWidth, eyeWidth, radius);
			ctx.fill();
			// Cut center
			ctx.fillStyle = bgColor;
			ctx.beginPath();
			drawRoundedRect(
				ctx,
				x + moduleSize,
				y + moduleSize,
				innerWidth,
				innerWidth,
				radius * 0.7,
			);
			ctx.fill();
			break;
		}
		case "leaf": {
			// Specific corner radius depending on position
			let tl = 0;
			let tr = 0;
			let br = 0;
			let bl = 0;
			const r = eyeWidth * 0.45;
			if (position === "top-left") {
				tl = r;
				br = r;
			} else if (position === "top-right") {
				tr = r;
				bl = r;
			} else {
				bl = r;
				tr = r;
			}
			drawCustomCornersRect(ctx, x, y, eyeWidth, eyeWidth, tl, tr, br, bl);
			ctx.fill();
			// Cut center
			ctx.fillStyle = bgColor;
			ctx.beginPath();
			drawCustomCornersRect(
				ctx,
				x + moduleSize,
				y + moduleSize,
				innerWidth,
				innerWidth,
				tl * 0.6,
				tr * 0.6,
				br * 0.6,
				bl * 0.6,
			);
			ctx.fill();
			break;
		}
		default: {
			ctx.fillRect(x, y, eyeWidth, eyeWidth);
			ctx.fillStyle = bgColor;
			ctx.fillRect(x + moduleSize, y + moduleSize, innerWidth, innerWidth);
			break;
		}
	}

	// 2. Draw Eye Inner Ball
	ctx.fillStyle = ballColor;
	ctx.beginPath();
	const ballX = x + moduleSize * 2;
	const ballY = y + moduleSize * 2;

	switch (ballStyle) {
		case "circle": {
			ctx.arc(
				ballX + ballWidth / 2,
				ballY + ballWidth / 2,
				ballWidth / 2,
				0,
				Math.PI * 2,
			);
			ctx.fill();
			break;
		}
		case "rounded": {
			drawRoundedRect(ctx, ballX, ballY, ballWidth, ballWidth, ballWidth * 0.3);
			ctx.fill();
			break;
		}
		default: {
			ctx.fillRect(ballX, ballY, ballWidth, ballWidth);
			break;
		}
	}
}

function drawRoundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + w - radius, y);
	ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
	ctx.lineTo(x + w, y + h - radius);
	ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
	ctx.lineTo(x + radius, y + h);
	ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
}

function drawCustomCornersRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	tl: number,
	tr: number,
	br: number,
	bl: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + tl, y);
	ctx.lineTo(x + w - tr, y);
	if (tr > 0) ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
	else ctx.lineTo(x + w, y);

	ctx.lineTo(x + w, y + h - br);
	if (br > 0) ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
	else ctx.lineTo(x + w, y + h);

	ctx.lineTo(x + bl, y + h);
	if (bl > 0) ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
	else ctx.lineTo(x, y + h);

	ctx.lineTo(x, y + tl);
	if (tl > 0) ctx.quadraticCurveTo(x, y, x + tl, y);
	else ctx.lineTo(x, y);
	ctx.closePath();
}

async function drawLogoOnCanvas(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	logoSize: number,
	config: QRStyleConfig,
) {
	const badgePadding = logoSize * 0.18;
	const badgeSize = logoSize + badgePadding * 2;
	const badgeX = cx - badgeSize / 2;
	const badgeY = cy - badgeSize / 2;

	// Protective background badge
	ctx.fillStyle = config.bgColor || "#ffffff";
	ctx.beginPath();
	drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, badgeSize * 0.28);
	ctx.fill();

	// Subtle border
	ctx.strokeStyle = `${config.fgColor}20`;
	ctx.lineWidth = Math.max(1, logoSize * 0.04);
	ctx.stroke();

	if (config.logo.type === "preset") {
		const preset = PRESET_LOGOS.find((p) => p.id === config.logo.presetId);
		if (preset) {
			const path2d = new Path2D(preset.svgPath);
			ctx.save();
			ctx.translate(cx - logoSize / 2, cy - logoSize / 2);
			const scale = logoSize / 24; // standard 24x24 viewBox
			ctx.scale(scale, scale);
			ctx.fillStyle = config.fgColor;
			ctx.fill(path2d);
			ctx.restore();
		}
	} else if (config.logo.type === "custom" && config.logo.customDataUrl) {
		try {
			const img = await loadImage(config.logo.customDataUrl);
			ctx.save();
			// Clip to rounded rect
			drawRoundedRect(
				ctx,
				cx - logoSize / 2,
				cy - logoSize / 2,
				logoSize,
				logoSize,
				logoSize * 0.2,
			);
			ctx.clip();
			ctx.drawImage(
				img,
				cx - logoSize / 2,
				cy - logoSize / 2,
				logoSize,
				logoSize,
			);
			ctx.restore();
		} catch (e) {
			console.warn("Failed to load custom logo for canvas:", e);
		}
	}
}

function drawFrameBanner(
	ctx: CanvasRenderingContext2D,
	width: number,
	qrHeight: number,
	bannerHeight: number,
	config: QRStyleConfig,
) {
	const { text, textColor, bgColor, style } = config.frame;
	const isTop = style === "top-badge";
	const bannerY = isTop ? 0 : qrHeight;

	ctx.fillStyle = bgColor || config.fgColor;
	const radius = 12;

	if (style === "card") {
		// subtle card border or accent
		ctx.fillStyle = bgColor || "#0f172a";
		drawRoundedRect(ctx, 16, bannerY + 4, width - 32, bannerHeight - 8, radius);
		ctx.fill();
	} else {
		// Full bottom/top banner
		ctx.fillRect(0, bannerY, width, bannerHeight);
	}

	// Text
	ctx.fillStyle = textColor || "#ffffff";
	ctx.font = `bold ${Math.round(bannerHeight * 0.38)}px system-ui, -apple-system, sans-serif`;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(text.toUpperCase(), width / 2, bannerY + bannerHeight / 2);
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = src;
	});
}

// Standalone SVG Generator
export function generateQRSVG(
	text: string,
	config: QRStyleConfig,
	dimension = 512,
): string {
	const matrix = generateQRMatrix(text, config.errorCorrectionLevel);
	if (!matrix) return "";

	const { size, getModule } = matrix;
	const marginModules = config.margin ?? 2;
	const effectiveModules = size + marginModules * 2;
	const moduleSize = dimension / effectiveModules;

	const fgColor = config.fgColor;
	const bgColor = config.transparentBg ? "none" : config.bgColor;
	const eyeFrameColor = config.customEyeColors
		? config.eyeFrameColor
		: config.fgColor;
	const eyeBallColor = config.customEyeColors
		? config.eyeBallColor
		: config.fgColor;

	const paths: string[] = [];

	// Draw body dots
	for (let r = 0; r < size; r++) {
		for (let c = 0; c < size; c++) {
			const { isFinder } = isFinderPattern(r, c, size);
			if (isFinder) continue;
			if (isInsideLogo(r, c, size, config)) continue;

			if (getModule(r, c)) {
				const x = (marginModules + c) * moduleSize;
				const y = (marginModules + r) * moduleSize;

				if (config.dotStyle === "dots") {
					const cx = x + moduleSize / 2;
					const cy = y + moduleSize / 2;
					const radius = moduleSize * 0.44;
					paths.push(
						`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="${fgColor}" />`,
					);
				} else if (
					config.dotStyle === "rounded" ||
					config.dotStyle === "classy"
				) {
					const rx = moduleSize * (config.dotStyle === "classy" ? 0.42 : 0.3);
					paths.push(
						`<rect x="${(x + 0.5).toFixed(2)}" y="${(y + 0.5).toFixed(2)}" width="${(moduleSize - 1).toFixed(2)}" height="${(moduleSize - 1).toFixed(2)}" rx="${rx.toFixed(2)}" fill="${fgColor}" />`,
					);
				} else {
					paths.push(
						`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize + 0.1).toFixed(2)}" height="${(moduleSize + 0.1).toFixed(2)}" fill="${fgColor}" />`,
					);
				}
			}
		}
	}

	// Helper to draw SVG eye
	const makeSVGEye = (
		originX: number,
		originY: number,
		_position: "top-left" | "top-right" | "bottom-left",
	) => {
		const eyeWidth = moduleSize * 7;
		const innerWidth = moduleSize * 5;
		const ballWidth = moduleSize * 3;
		const ballX = originX + moduleSize * 2;
		const ballY = originY + moduleSize * 2;

		let frameSVG = "";
		let ballSVG = "";

		if (config.eyeFrameStyle === "circle") {
			const cx = originX + eyeWidth / 2;
			const cy = originY + eyeWidth / 2;
			frameSVG = `
				<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(eyeWidth / 2).toFixed(2)}" fill="${eyeFrameColor}" />
				<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(innerWidth / 2).toFixed(2)}" fill="${config.bgColor}" />
			`;
		} else if (config.eyeFrameStyle === "rounded") {
			const r = eyeWidth * 0.26;
			frameSVG = `
				<rect x="${originX.toFixed(2)}" y="${originY.toFixed(2)}" width="${eyeWidth.toFixed(2)}" height="${eyeWidth.toFixed(2)}" rx="${r.toFixed(2)}" fill="${eyeFrameColor}" />
				<rect x="${(originX + moduleSize).toFixed(2)}" y="${(originY + moduleSize).toFixed(2)}" width="${innerWidth.toFixed(2)}" height="${innerWidth.toFixed(2)}" rx="${(r * 0.7).toFixed(2)}" fill="${config.bgColor}" />
			`;
		} else {
			frameSVG = `
				<rect x="${originX.toFixed(2)}" y="${originY.toFixed(2)}" width="${eyeWidth.toFixed(2)}" height="${eyeWidth.toFixed(2)}" fill="${eyeFrameColor}" />
				<rect x="${(originX + moduleSize).toFixed(2)}" y="${(originY + moduleSize).toFixed(2)}" width="${innerWidth.toFixed(2)}" height="${innerWidth.toFixed(2)}" fill="${config.bgColor}" />
			`;
		}

		if (config.eyeBallStyle === "circle") {
			const cx = ballX + ballWidth / 2;
			const cy = ballY + ballWidth / 2;
			ballSVG = `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(ballWidth / 2).toFixed(2)}" fill="${eyeBallColor}" />`;
		} else if (config.eyeBallStyle === "rounded") {
			const r = ballWidth * 0.3;
			ballSVG = `<rect x="${ballX.toFixed(2)}" y="${ballY.toFixed(2)}" width="${ballWidth.toFixed(2)}" height="${ballWidth.toFixed(2)}" rx="${r.toFixed(2)}" fill="${eyeBallColor}" />`;
		} else {
			ballSVG = `<rect x="${ballX.toFixed(2)}" y="${ballY.toFixed(2)}" width="${ballWidth.toFixed(2)}" height="${ballWidth.toFixed(2)}" fill="${eyeBallColor}" />`;
		}

		return frameSVG + ballSVG;
	};

	const eyeTL = makeSVGEye(
		marginModules * moduleSize,
		marginModules * moduleSize,
		"top-left",
	);
	const eyeTR = makeSVGEye(
		(marginModules + size - 7) * moduleSize,
		marginModules * moduleSize,
		"top-right",
	);
	const eyeBL = makeSVGEye(
		marginModules * moduleSize,
		(marginModules + size - 7) * moduleSize,
		"bottom-left",
	);

	// Center Logo in SVG
	let logoSVG = "";
	if (config.logo.type !== "none") {
		const logoSize = dimension * (config.logo.sizeRatio || 0.22);
		const badgePadding = logoSize * 0.18;
		const badgeSize = logoSize + badgePadding * 2;
		const cx = dimension / 2;
		const cy = dimension / 2;
		const badgeX = cx - badgeSize / 2;
		const badgeY = cy - badgeSize / 2;

		let innerLogo = "";
		if (config.logo.type === "preset") {
			const preset = PRESET_LOGOS.find((p) => p.id === config.logo.presetId);
			if (preset) {
				const scale = logoSize / 24;
				const tx = cx - logoSize / 2;
				const ty = cy - logoSize / 2;
				innerLogo = `<g transform="translate(${tx.toFixed(2)}, ${ty.toFixed(2)}) scale(${scale.toFixed(4)})" fill="${fgColor}">
					<path d="${preset.svgPath}" />
				</g>`;
			}
		} else if (config.logo.type === "custom" && config.logo.customDataUrl) {
			innerLogo = `<image href="${config.logo.customDataUrl}" x="${(cx - logoSize / 2).toFixed(2)}" y="${(cy - logoSize / 2).toFixed(2)}" width="${logoSize.toFixed(2)}" height="${logoSize.toFixed(2)}" preserveAspectRatio="xMidYMid slice" />`;
		}

		logoSVG = `
			<rect x="${badgeX.toFixed(2)}" y="${badgeY.toFixed(2)}" width="${badgeSize.toFixed(2)}" height="${badgeSize.toFixed(2)}" rx="${(badgeSize * 0.28).toFixed(2)}" fill="${config.bgColor}" stroke="${fgColor}20" stroke-width="2" />
			${innerLogo}
		`;
	}

	return `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${dimension}" height="${dimension}" viewBox="0 0 ${dimension} ${dimension}">
	${bgColor !== "none" ? `<rect width="100%" height="100%" fill="${bgColor}"/>` : ""}
	<g id="body-dots">
		${paths.join("\n\t\t")}
	</g>
	<g id="eyes">
		${eyeTL}
		${eyeTR}
		${eyeBL}
	</g>
	${logoSVG}
</svg>`;
}
