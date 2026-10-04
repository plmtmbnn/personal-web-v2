export type PlayerPositionRole = "GK" | "DF" | "MF" | "FW";

export interface PitchSlot {
	id: string; // e.g. "slot-1", "slot-gk"
	role: PlayerPositionRole;
	label: string; // e.g. "GK", "LB", "CB", "CM", "ST"
	x: number; // percentage from left (0 - 100)
	y: number; // percentage from top (0 - 100)
	defaultNumber: number;
}

export interface PlayerDraft {
	id: string;
	name: string;
	number: number;
	role: PlayerPositionRole;
	positionLabel?: string;
	club?: string;
	nationality?: string;
	rating?: number;
	avatarBg?: string;
}

export type StandardFormationKey =
	| "4-3-3"
	| "4-2-3-1"
	| "4-4-2"
	| "3-5-2"
	| "3-4-3"
	| "5-3-2"
	| "4-1-2-1-2";

export type FormationKey = StandardFormationKey | (string & {});

export interface FormationDefinition {
	id: FormationKey;
	name: string;
	description: string;
	category: "Attacking" | "Balanced" | "Defensive";
	slots: PitchSlot[];
	isCustom?: boolean;
}

export type PitchTheme =
	| "classic-emerald"
	| "night-floodlight"
	| "tactical-slate"
	| "chalkboard";

export interface PitchThemeConfig {
	id: PitchTheme;
	name: string;
	bgClass: string;
	borderLineColor: string;
	stripeColor: string;
	nodeGlow: string;
}

export interface TeamTactics {
	teamName: string;
	manager: string;
	formation: FormationKey;
	theme: PitchTheme;
	captainId?: string;
}
