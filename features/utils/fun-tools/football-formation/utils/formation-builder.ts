import type {
	FormationDefinition,
	PitchSlot,
	PlayerPositionRole,
} from "../types";

export interface FormationValidationResult {
	isValid: boolean;
	sum: number;
	min: number;
	max: number;
	error?: string;
}

/**
 * Parses user input string (e.g. "4-2-3-1", "4 3 3", "3-4-2-1") into an array of line numbers.
 */
export function parseFormationString(input: string): number[] {
	if (!input || typeof input !== "string") return [];
	return input
		.split(/[-,\s/]+/)
		.map((part) => parseInt(part.trim(), 10))
		.filter((num) => !Number.isNaN(num) && num > 0);
}

/**
 * Validates that the outfield player formation satisfies exact football rules:
 * - Must validate min 10 and max 10 outfield players (sum === 10).
 * - Minimum 2 lines (Defenders, Attackers), maximum 5 lines.
 * - Each line must contain between 1 and 6 players.
 */
export function validateFormationLines(
	lines: number[],
): FormationValidationResult {
	const min = 10;
	const max = 10;

	if (!lines || lines.length === 0) {
		return {
			isValid: false,
			sum: 0,
			min,
			max,
			error: "Please enter formation line numbers (e.g. 4-3-3 or 4-2-3-1).",
		};
	}

	const sum = lines.reduce((acc, curr) => acc + curr, 0);

	if (lines.length < 2) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: "Formation must declare at least 2 outfield lines (e.g. 5-5).",
		};
	}

	if (lines.length > 5) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: "Formation cannot have more than 5 outfield lines.",
		};
	}

	if (lines.some((count) => count < 1)) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: "Each line must have at least 1 player.",
		};
	}

	if (lines.some((count) => count > 6)) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: "A single line cannot have more than 6 players.",
		};
	}

	// ── Strict Min & Max 10 Validation ──
	if (sum < min) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: `Formation has only ${sum} outfield players. Minimum required is 10 (needs +${min - sum} more).`,
		};
	}

	if (sum > max) {
		return {
			isValid: false,
			sum,
			min,
			max,
			error: `Formation has ${sum} outfield players. Maximum allowed is 10 (exceeds by ${sum - max}).`,
		};
	}

	return {
		isValid: true,
		sum,
		min,
		max,
	};
}

/**
 * Builds a dynamic FormationDefinition with calibrated pitch coordinates (1 GK + 10 outfield = 11 total).
 */
export function buildCustomFormation(
	name: string,
	lines: number[],
	category: "Attacking" | "Balanced" | "Defensive" = "Balanced",
	description?: string,
): FormationDefinition {
	const validation = validateFormationLines(lines);
	if (!validation.isValid) {
		throw new Error(validation.error || "Invalid formation configuration");
	}

	const formationId = lines.join("-");
	const slots: PitchSlot[] = [];

	// 1. Goalkeeper slot (Always slot 0, centered near goal at bottom)
	slots.push({
		id: "slot-gk",
		role: "GK",
		label: "GK",
		x: 50,
		y: 90,
		defaultNumber: 1,
	});

	let squadNumberCounter = 2;
	const numLines = lines.length;

	// Outfield coordinate bounds
	const yStart = 74; // Defensive line
	const yEnd = 18; // Attacking line

	for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
		const count = lines[lineIndex] ?? 0;
		if (count <= 0) continue;

		// Calculate vertical Y percentage for this line
		const progress = numLines > 1 ? lineIndex / (numLines - 1) : 0.5;
		const lineBaseY = Math.round(yStart - progress * (yStart - yEnd));

		// Determine tactical role based on line position
		let role: PlayerPositionRole = "MF";
		if (lineIndex === 0) {
			role = "DF";
		} else if (lineIndex === numLines - 1) {
			role = "FW";
		}

		// Calculate horizontal X percentages for players in this line
		const minX = 16;
		const maxX = 84;

		for (let playerIndex = 0; playerIndex < count; playerIndex++) {
			let x = 50;
			if (count === 1) {
				x = 50;
			} else if (count === 2) {
				x = playerIndex === 0 ? 36 : 64;
			} else if (count === 3) {
				x = playerIndex === 0 ? 24 : playerIndex === 1 ? 50 : 76;
			} else if (count === 4) {
				x = [16, 38, 62, 84][playerIndex] ?? 50;
			} else if (count === 5) {
				x = [14, 32, 50, 68, 86][playerIndex] ?? 50;
			} else {
				// Interpolate 6 players
				x = Math.round(minX + (playerIndex / (count - 1)) * (maxX - minX));
			}

			// Slight vertical curving for natural aesthetic pitch geometry
			let y = lineBaseY;
			const isOuter = playerIndex === 0 || playerIndex === count - 1;
			if (role === "DF" && isOuter && count >= 4) {
				y = lineBaseY - 2; // Fullbacks push slightly higher
			} else if (role === "FW" && isOuter && count >= 3) {
				y = lineBaseY + 4; // Wingers slightly wider/deeper than center striker
			}

			// Position Label Generation
			let label: string = role;
			if (role === "DF") {
				if (count === 2) {
					label = playerIndex === 0 ? "LCB" : "RCB";
				} else if (count === 3) {
					label = playerIndex === 0 ? "LCB" : playerIndex === 1 ? "CB" : "RCB";
				} else if (count === 4) {
					label = ["LB", "CB", "CB", "RB"][playerIndex] ?? "DF";
				} else if (count === 5) {
					label = ["LWB", "LCB", "CB", "RCB", "RWB"][playerIndex] ?? "DF";
				}
			} else if (role === "FW") {
				if (count === 1) {
					label = "ST";
				} else if (count === 2) {
					label = playerIndex === 0 ? "LS" : "RS";
				} else if (count === 3) {
					label = playerIndex === 0 ? "LW" : playerIndex === 1 ? "ST" : "RW";
				} else if (count === 4) {
					label = ["LW", "ST", "ST", "RW"][playerIndex] ?? "FW";
				}
			} else {
				// Midfielders
				if (numLines >= 4 && lineIndex === 1) {
					label = count === 1 ? "CDM" : "DM";
				} else if (numLines >= 4 && lineIndex === numLines - 2) {
					label =
						count === 1
							? "CAM"
							: isOuter
								? playerIndex === 0
									? "LM"
									: "RM"
								: "AM";
				} else {
					if (count === 1) label = "CM";
					else if (count === 2) label = "CM";
					else if (count === 3)
						label =
							playerIndex === 0 ? "LCM" : playerIndex === 1 ? "CM" : "RCM";
					else if (count === 4)
						label = ["LM", "CM", "CM", "RM"][playerIndex] ?? "MF";
					else if (count === 5)
						label = ["LM", "LCM", "CM", "RCM", "RM"][playerIndex] ?? "MF";
				}
			}

			slots.push({
				id: `slot-line${lineIndex}-p${playerIndex}`,
				role,
				label,
				x,
				y,
				defaultNumber: squadNumberCounter++,
			});
		}
	}

	return {
		id: formationId,
		name: name.trim() || `${formationId} Custom`,
		description:
			description?.trim() ||
			`Custom ${formationId} tactical formation with ${numLines} outfield lines.`,
		category,
		slots,
		isCustom: true,
	};
}
