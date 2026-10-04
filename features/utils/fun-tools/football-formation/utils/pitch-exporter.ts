import type { FormationDefinition, PlayerDraft, TeamTactics } from "../types";

export interface PitchExportConfig {
	tactics: TeamTactics;
	formation: FormationDefinition;
	slots: Record<string, PlayerDraft | null>;
	bench: PlayerDraft[];
	scale?: number;
}

export async function renderTacticsToCanvas(
	config: PitchExportConfig,
): Promise<HTMLCanvasElement> {
	const scale = config.scale || 2;
	const width = 800;
	const height = 1100;

	const canvas = document.createElement("canvas");
	canvas.width = width * scale;
	canvas.height = height * scale;
	const ctx = canvas.getContext("2d");

	if (!ctx) throw new Error("Could not obtain 2D canvas context");
	ctx.scale(scale, scale);

	// 1. Outer Canvas Card Background (Modern Floating Card Aesthetic)
	ctx.fillStyle = "#0f172a"; // Deep slate card background
	ctx.fillRect(0, 0, width, height);

	// 2. Header: Team name, Manager & Formation
	const headerY = 32;
	ctx.textAlign = "left";

	// Domain Pill
	ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
	ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
	ctx.lineWidth = 1;
	roundRect(ctx, 40, headerY, 210, 24, 12, true, true);

	ctx.fillStyle = "#38bdf8";
	ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
	ctx.fillText("TACTICAL SQUAD SHEET", 54, headerY + 16);

	// Team Name
	ctx.fillStyle = "#ffffff";
	ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
	const teamName = config.tactics.teamName || "Tactical XI";
	ctx.fillText(teamName, 40, headerY + 58);

	// Subtitle (Manager & Formation)
	ctx.fillStyle = "#94a3b8";
	ctx.font = "500 13px system-ui, -apple-system, sans-serif";
	const manager = config.tactics.manager
		? `Manager: ${config.tactics.manager} • `
		: "";
	ctx.fillText(
		`${manager}Formation: ${config.formation.name}`,
		40,
		headerY + 80,
	);

	// Formation Badge Pill on Top Right
	ctx.textAlign = "right";
	ctx.fillStyle = "#1e293b";
	ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
	roundRect(ctx, width - 150, headerY + 12, 110, 36, 10, true, true);
	ctx.fillStyle = "#f8fafc";
	ctx.font = "bold 16px system-ui, -apple-system, sans-serif";
	ctx.fillText(config.formation.id, width - 60, headerY + 36);

	// 3. Pitch Stage
	const pitchX = 40;
	const pitchY = 135;
	const pitchWidth = width - 80;
	const pitchHeight = 780;
	const pitchRadius = 20;

	ctx.save();
	// Clip pitch rounded rect
	roundRect(
		ctx,
		pitchX,
		pitchY,
		pitchWidth,
		pitchHeight,
		pitchRadius,
		false,
		false,
	);
	ctx.clip();

	// Fill Pitch Base
	let pitchBg = "#064e3b"; // emerald-900
	let lineColor = "rgba(255, 255, 255, 0.7)";
	let stripeColor = "rgba(255, 255, 255, 0.04)";

	if (config.tactics.theme === "night-floodlight") {
		pitchBg = "#090d16";
		lineColor = "rgba(148, 163, 184, 0.5)";
		stripeColor = "rgba(255, 255, 255, 0.02)";
	} else if (config.tactics.theme === "tactical-slate") {
		pitchBg = "#082f49";
		lineColor = "rgba(56, 189, 248, 0.5)";
		stripeColor = "rgba(14, 116, 144, 0.15)";
	} else if (config.tactics.theme === "chalkboard") {
		pitchBg = "#1c1917";
		lineColor = "rgba(226, 232, 240, 0.5)";
		stripeColor = "rgba(255, 255, 255, 0.03)";
	}

	ctx.fillStyle = pitchBg;
	ctx.fillRect(pitchX, pitchY, pitchWidth, pitchHeight);

	// Lawn Stripes
	const stripeCount = 10;
	const stripeHeight = pitchHeight / stripeCount;
	ctx.fillStyle = stripeColor;
	for (let i = 0; i < stripeCount; i += 2) {
		ctx.fillRect(pitchX, pitchY + i * stripeHeight, pitchWidth, stripeHeight);
	}

	// Draw Pitch Lines
	const pad = 24;
	const bx = pitchX + pad;
	const by = pitchY + pad;
	const bw = pitchWidth - pad * 2;
	const bh = pitchHeight - pad * 2;

	ctx.strokeStyle = lineColor;
	ctx.lineWidth = 2;

	// Outer Boundary
	ctx.strokeRect(bx, by, bw, bh);

	// Halfway Line
	const midY = by + bh / 2;
	ctx.beginPath();
	ctx.moveTo(bx, midY);
	ctx.lineTo(bx + bw, midY);
	ctx.stroke();

	// Center Circle
	const centerX = bx + bw / 2;
	ctx.beginPath();
	ctx.arc(centerX, midY, 65, 0, Math.PI * 2);
	ctx.stroke();

	// Center Spot
	ctx.beginPath();
	ctx.arc(centerX, midY, 4, 0, Math.PI * 2);
	ctx.fillStyle = lineColor;
	ctx.fill();

	// Top Penalty Box (Opponent End)
	const penW = bw * 0.46;
	const penH = bh * 0.16;
	ctx.strokeRect(centerX - penW / 2, by, penW, penH);

	// Top Goal Box
	const goalW = bw * 0.22;
	const goalH = bh * 0.06;
	ctx.strokeRect(centerX - goalW / 2, by, goalW, goalH);

	// Top Penalty Spot
	const topSpotY = by + bh * 0.11;
	ctx.beginPath();
	ctx.arc(centerX, topSpotY, 3.5, 0, Math.PI * 2);
	ctx.fill();

	// Bottom Penalty Box (Home Defense / GK End)
	ctx.strokeRect(centerX - penW / 2, by + bh - penH, penW, penH);

	// Bottom Goal Box
	ctx.strokeRect(centerX - goalW / 2, by + bh - goalH, goalW, goalH);

	// Bottom Penalty Spot
	const botSpotY = by + bh - bh * 0.11;
	ctx.beginPath();
	ctx.arc(centerX, botSpotY, 3.5, 0, Math.PI * 2);
	ctx.fill();

	// Penalty Arc (D) at bottom
	ctx.beginPath();
	ctx.arc(centerX, botSpotY, 50, Math.PI * 1.25, Math.PI * 1.75);
	ctx.stroke();

	// Penalty Arc (D) at top
	ctx.beginPath();
	ctx.arc(centerX, topSpotY, 50, Math.PI * 0.25, Math.PI * 0.75);
	ctx.stroke();

	// Corner Arcs
	const arcR = 14;
	ctx.beginPath();
	ctx.arc(bx, by, arcR, 0, Math.PI * 0.5);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(bx + bw, by, arcR, Math.PI * 0.5, Math.PI);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(bx, by + bh, arcR, Math.PI * 1.5, Math.PI * 2);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(bx + bw, by + bh, arcR, Math.PI, Math.PI * 1.5);
	ctx.stroke();

	// 4. Render Formation Players onto Pitch
	for (const slot of config.formation.slots) {
		const player = config.slots[slot.id];
		const px = bx + (slot.x / 100) * bw;
		const py = by + (slot.y / 100) * bh;

		// Draw Player Node
		const radius = 22;

		// Node Shadow / Glow
		ctx.save();
		ctx.shadowColor = "rgba(0,0,0,0.6)";
		ctx.shadowBlur = 10;
		ctx.shadowOffsetY = 4;

		// Circle Avatar / Number Badge
		ctx.beginPath();
		ctx.arc(px, py, radius, 0, Math.PI * 2);

		if (player) {
			ctx.fillStyle =
				player.avatarBg || (slot.role === "GK" ? "#eab308" : "#2563eb");
			ctx.fill();
			ctx.lineWidth = 2.5;
			ctx.strokeStyle = "#ffffff";
			ctx.stroke();
		} else {
			ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
			ctx.fill();
			ctx.lineWidth = 1.5;
			ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
			ctx.stroke();
		}
		ctx.restore();

		// Number or Slot default
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "#ffffff";
		ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
		const displayNum = player
			? String(player.number)
			: String(slot.defaultNumber);
		ctx.fillText(displayNum, px, py);

		// Captain armband
		if (player && player.id === config.tactics.captainId) {
			ctx.fillStyle = "#facc15";
			ctx.strokeStyle = "#000000";
			ctx.lineWidth = 1;
			roundRect(ctx, px + 10, py - 20, 16, 14, 4, true, true);
			ctx.fillStyle = "#000000";
			ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
			ctx.fillText("C", px + 18, py - 13);
		}

		// Name Tag Badge Below
		const tagWidth = 90;
		const tagHeight = 22;
		const tagX = px - tagWidth / 2;
		const tagY = py + radius + 4;

		ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
		ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
		ctx.lineWidth = 1;
		roundRect(ctx, tagX, tagY, tagWidth, tagHeight, 6, true, true);

		// Name Text
		ctx.fillStyle = player ? "#ffffff" : "#94a3b8";
		ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
		const displayName = player
			? (player.name.split(" ").slice(-1)[0] ?? player.name)
			: slot.label;
		const truncated =
			displayName.length > 11 ? `${displayName.slice(0, 10)}.` : displayName;
		ctx.fillText(truncated, px, tagY + 11);
	}

	ctx.restore(); // Restore unclipped pitch

	// 5. Bench / Substitutes Strip
	const benchY = pitchY + pitchHeight + 16;
	ctx.textAlign = "left";
	ctx.fillStyle = "#94a3b8";
	ctx.font = "bold 11px system-ui, -apple-system, sans-serif";
	ctx.fillText("SUBSTITUTES / BENCH", 40, benchY + 12);

	if (config.bench.length > 0) {
		const benchNames = config.bench
			.map((p) => `#${p.number} ${p.name}`)
			.join("  •  ");
		ctx.fillStyle = "#cbd5e1";
		ctx.font = "500 12px system-ui, -apple-system, sans-serif";
		ctx.fillText(benchNames, 40, benchY + 32);
	} else {
		ctx.fillStyle = "#64748b";
		ctx.font = "italic 11px system-ui, -apple-system, sans-serif";
		ctx.fillText("No bench players assigned.", 40, benchY + 32);
	}

	// 6. Watermark Footer
	ctx.textAlign = "right";
	ctx.fillStyle = "#64748b";
	ctx.font = "bold 10px system-ui, -apple-system, sans-serif";
	ctx.fillText(
		"POLMA UTILITIES  •  FOOTBALL FORMATION STUDIO",
		width - 40,
		benchY + 32,
	);

	return canvas;
}

/**
 * Helper to draw rounded rectangle on 2D context
 */
function roundRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
	fill: boolean,
	stroke: boolean,
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
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}

/**
 * Exports tactical setup to PNG Blob
 */
export async function exportTacticsToBlob(
	config: PitchExportConfig,
): Promise<Blob> {
	const canvas = await renderTacticsToCanvas(config);
	return new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("Canvas export toBlob failed"));
		}, "image/png");
	});
}

/**
 * Downloads PNG image directly to user device
 */
export async function downloadTacticsImage(
	config: PitchExportConfig,
	filename = "football-formation.png",
) {
	const blob = await exportTacticsToBlob(config);
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

/**
 * Copies the tactical board image to clipboard
 */
export async function copyTacticsToClipboard(
	config: PitchExportConfig,
): Promise<boolean> {
	try {
		const blob = await exportTacticsToBlob(config);
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
