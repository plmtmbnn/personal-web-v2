import type { LucideIcon } from "lucide-react";

export interface PersonalBestItem {
	id: string;
	distance: string;
	shortLabel?: string;
	distanceKm: number;
	time: string;
	pace: string;
	elevation?: string;
	badge: string;
	icon: LucideIcon;
	color: string;
	badgeBg: string;
	solidAccent?: string;
	bgGlow?: string;
	borderAccent?: string;
	isHighest?: boolean;
}
