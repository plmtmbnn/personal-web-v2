export interface ImageSize {
	url: string;
	webpUrl?: string;
	height?: number;
	width?: number;
}

export interface Sizes {
	xs?: ImageSize;
	sm?: ImageSize;
	md?: ImageSize;
	lg?: ImageSize;
	xl?: ImageSize;
}

export interface TeamLogo {
	sizes?: Sizes;
	alt?: string;
}

export interface CompetitionLogo {
	sizes?: Sizes;
	alt?: string;
}

export interface Competition {
	id: string;
	weight?: number;
	displayName: string;
	logo?: CompetitionLogo;
	optaID?: string;
	shortName?: string;
	slug?: string;
	abbreviation?: string;
}

export interface Season {
	id: string;
	weight?: number;
	displayName: string;
	year: number;
	isActiveSeasonForPlayers?: boolean;
}

export interface KitFontColors {
	light?: string;
	dark?: string;
}

export interface KitFont {
	kitFontId?: number;
	colors?: KitFontColors;
}

export interface Team {
	id: string;
	weight?: number;
	abbreviation?: string;
	contestantID?: string;
	displayName: string;
	shortName?: string;
	slug?: string;
	kitFont?: KitFont;
	academy?: boolean;
}

export interface Broadcaster {
	id: string;
	name: string;
	url?: string;
	logo?: string;
}

export interface LinkItem {
	label?: string;
	external?: boolean;
	href?: string;
}

export interface Score {
	home?: number;
	away?: number;
}

export interface Result {
	id?: string;
	score?: Score;
}

export interface MatchData {
	status: string; // 'Played' | 'Fixture' | 'TBC' | etc.
	competition: Competition;
	season?: Season;
	team?: Team;
	date: string; // ISO date string
	stadium: string;
	homeTeam: string;
	homeTeamLogo?: TeamLogo;
	awayTeam: string;
	awayTeamLogo?: TeamLogo;
	result?: Result;
}

export interface LfcFixtureResponse {
	id: number;
	createdAt?: string;
	updatedAt?: string;
	title: string;
	type?: string;
	link?: LinkItem;
	broadcasters?: Broadcaster[];
	highlight?: boolean;
	matchData: MatchData;
}

export type VenueFilter = "all" | "home" | "away";
