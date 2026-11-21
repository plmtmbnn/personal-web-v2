export const SERIES = {
	GDPC1: {
		name: "Real GDP",
		publisher: "U.S. Bureau of Economic Analysis",
		frequency: "Quarterly",
		unit: "Billions of chained dollars",
		currency: "USD",
		maxAge: 150,
	},
	INDPRO: {
		name: "Industrial production",
		publisher: "Federal Reserve Board",
		frequency: "Monthly",
		unit: "Index",
		currency: null,
		maxAge: 75,
	},
	UNRATE: {
		name: "Unemployment",
		publisher: "U.S. Bureau of Labor Statistics",
		frequency: "Monthly",
		unit: "%",
		currency: null,
		maxAge: 75,
	},
	PCEPILFE: {
		name: "Core PCE",
		publisher: "U.S. Bureau of Economic Analysis",
		frequency: "Monthly",
		unit: "Price index",
		currency: null,
		maxAge: 75,
	},
	FEDFUNDS: {
		name: "Effective Fed Funds rate",
		publisher: "Federal Reserve Board",
		frequency: "Monthly",
		unit: "%",
		currency: null,
		maxAge: 75,
	},
	NFCI: {
		name: "Chicago Fed financial conditions",
		publisher: "Federal Reserve Bank of Chicago",
		frequency: "Weekly",
		unit: "Index",
		currency: null,
		maxAge: 21,
	},
} as const;

export type SeriesId = keyof typeof SERIES;
export const SERIES_IDS = Object.keys(SERIES) as SeriesId[];
export const HOSTED_SERIES = [
	"GDPC1",
	"INDPRO",
	"UNRATE",
	"PCEPILFE",
	"FEDFUNDS",
] as const;
export const DEFAULT_DB = ".macro-research/fred.sqlite";

export interface Observation {
	date: string;
	vintageStart: string;
	vintageEnd: string;
	value: number | null;
	fetchedAt: string;
}

export type Observations = Partial<Record<SeriesId, Observation[]>>;

export function fredDate(now = new Date()) {
	return new Intl.DateTimeFormat("sv-SE", {
		timeZone: "America/Chicago",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
}

export function seriesUrl(id: SeriesId) {
	return `https://fred.stlouisfed.org/series/${id}`;
}

export function dateOffset(
	date: string,
	{ months = 0, days = 0 }: { months?: number; days?: number },
) {
	const result = new Date(`${date}T00:00:00Z`);
	result.setUTCMonth(result.getUTCMonth() + months);
	result.setUTCDate(result.getUTCDate() + days);
	return result.toISOString().slice(0, 10);
}

export function periodEnd(id: SeriesId, date: string) {
	const { frequency } = SERIES[id];
	return frequency === "Weekly"
		? date
		: dateOffset(date, { months: frequency === "Quarterly" ? 3 : 1, days: -1 });
}
