/**
 * Raw event model returned by TheSportsDB API (eventsnext.php)
 */
export interface TheSportsDbEvent {
	idEvent: string;
	idAPIfootball?: string;
	strTimestamp?: string;
	strEvent: string;
	strEventAlternate?: string;
	strFilename?: string;
	strSport?: string;
	idLeague?: string;
	strLeague: string;
	strLeagueBadge?: string;
	strSeason?: string;
	strDescriptionEN?: string;
	strHomeTeam: string;
	strAwayTeam: string;
	intHomeScore?: string | number | null;
	intHomeScoreExtra?: string | number | null;
	intAwayScoreExtra?: string | number | null;
	intRound?: string | null;
	intAwayScore?: string | number | null;
	intSpectators?: string | number | null;
	strOfficial?: string;
	strWeather?: string;
	dateEvent: string;
	dateEventLocal?: string;
	strTime?: string;
	strTimeLocal?: string;
	strGroup?: string;
	idHomeTeam: string;
	strHomeTeamBadge?: string;
	idAwayTeam: string;
	strAwayTeamBadge?: string;
	intScore?: string | number | null;
	intScoreVotes?: string | number | null;
	strResult?: string;
	idVenue?: string;
	strVenue?: string;
	strCountry?: string;
	strCity?: string;
	strPoster?: string;
	strSquare?: string;
	strFanart?: string | null;
	strThumb?: string;
	strBanner?: string;
	strMap?: string | null;
	strTweet1?: string;
	strVideo?: string;
	strStatus?: string;
	strPostponed?: string;
	strLocked?: string;
}

export interface TheSportsDbResponse {
	events: TheSportsDbEvent[] | null;
}

/**
 * Normalized Liverpool FC Fixture domain model
 */
export interface LfcFixture {
	id: string;
	title: string;
	date: string; // ISO date string (e.g. "2026-09-12T14:00:00Z")
	stadium: string;
	homeTeam: string;
	awayTeam: string;
	homeTeamBadge?: string;
	awayTeamBadge?: string;
	competition: string;
	competitionBadge?: string;
	season?: string;
	round?: string;
	thumb?: string;
	banner?: string;
	poster?: string;
	isHome: boolean;
	status?: string;
}
