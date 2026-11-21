import {
	dateOffset,
	periodEnd,
	SERIES,
	type Observation,
	type Observations,
	type SeriesId,
} from "./series.ts";

export const MACRO_MODEL_VERSION = "us-macro-1.0.0";
const CORE = ["GDPC1", "INDPRO", "UNRATE", "PCEPILFE"] as const;
const DAY = 86_400_000;

export function observationStatus(
	id: SeriesId,
	row: Observation | undefined,
	asOf: string,
) {
	if (row?.value == null) return "Unavailable";
	return (Date.parse(asOf) - Date.parse(periodEnd(id, row.date))) / DAY >
		SERIES[id].maxAge
		? "Stale"
		: "Current";
}

function metrics(data: Observations, asOf: string) {
	const used: Observation[] = [];
	function series(id: SeriesId) {
		const rows = data[id];
		const latest = rows?.[0];
		return (months: number) => {
			if (!latest || observationStatus(id, latest, asOf) !== "Current")
				return null;
			const date = dateOffset(latest.date, { months: -months });
			const row = rows?.find((item) => item.date === date);
			if (row?.value == null) return null;
			used.push(row);
			return row.value;
		};
	}
	const growth = (next: number | null, before: number | null) =>
		next != null && before != null && before > 0
			? (next / before - 1) * 100
			: null;
	const gdp = series("GDPC1");
	const industry = series("INDPRO");
	const unrate = series("UNRATE");
	const prices = series("PCEPILFE");
	const labor = Array.from({ length: 6 }, (_, i) => unrate(i));
	const unemploymentChange = labor.every((value) => value != null)
		? (labor[0] + labor[1] + labor[2]) / 3 -
			(labor[3] + labor[4] + labor[5]) / 3
		: null;
	return {
		gdp: growth(gdp(0), gdp(3)),
		priorGdp: growth(gdp(3), gdp(6)),
		industry: growth(industry(0), industry(3)),
		priorIndustry: growth(industry(3), industry(6)),
		unemploymentChange,
		inflation: growth(prices(0), prices(12)),
		priorInflation: growth(prices(3), prices(15)),
		previousAsOf:
			used
				.map((row) => row.vintageStart)
				.sort()
				.at(-1) ?? "",
	};
}

function classify(values: ReturnType<typeof metrics>, wasWeak = false) {
	const {
		gdp,
		priorGdp,
		industry,
		priorIndustry,
		unemploymentChange,
		inflation,
		priorInflation,
	} = values;
	if (
		gdp == null ||
		priorGdp == null ||
		industry == null ||
		priorIndustry == null ||
		unemploymentChange == null ||
		inflation == null ||
		priorInflation == null
	) {
		return {
			regime: "Insufficient data",
			reason:
				"A growth or inflation input is stale, unavailable, or missing a required comparison period.",
			improving: null,
			weakness: null,
		};
	}
	const weakness =
		Number(gdp < 0) +
		Number(industry < 0) +
		Number(Math.round(unemploymentChange * 1e9) / 1e9 >= 0.5);
	const improving =
		Number(gdp > priorGdp) +
		Number(industry > priorIndustry) +
		Number(unemploymentChange < 0);
	if (
		weakness >= 2 &&
		Math.round(inflation * 1e9) / 1e9 >= 3 &&
		inflation > priorInflation
	)
		return {
			regime: "Stagflation risk",
			reason:
				"At least two growth inputs weakened while core inflation was at least 3% and rising.",
			improving,
			weakness,
		};
	if (weakness >= 2)
		return {
			regime: "Contraction / recession risk",
			reason:
				"At least two of GDP, industrial production, and unemployment signaled weakness.",
			improving,
			weakness,
		};
	if (improving >= 2 && wasWeak)
		return {
			regime: "Recovery",
			reason:
				"At least two growth inputs improved after a contraction or stagflation assessment.",
			improving,
			weakness,
		};
	if (improving >= 2 && weakness === 0)
		return {
			regime: "Expansion",
			reason: "At least two growth inputs improved and none signaled weakness.",
			improving,
			weakness,
		};
	return {
		regime: "Slowdown",
		reason:
			"Growth inputs showed mixed or slowing momentum under the model rules.",
		improving,
		weakness,
	};
}

export function assessMacro(
	asOf: string,
	readAt: (date: string) => Observations,
) {
	const { previousAsOf, finish } = prepareMacroAssessment(asOf, readAt(asOf));
	return finish(previousAsOf ? readAt(previousAsOf) : null);
}

export function prepareMacroAssessment(asOf: string, data: Observations) {
	const values = metrics(data, asOf);
	const initial = classify(values);
	const previousAsOf =
		initial.weakness != null &&
		initial.weakness < 2 &&
		(initial.improving ?? 0) >= 2
			? values.previousAsOf || null
			: null;
	const missing = CORE.filter(
		(id) => observationStatus(id, data[id]?.[0], asOf) !== "Current",
	);
	const change = (
		id: "NFCI" | "FEDFUNDS",
		offset: { days?: number; months?: number },
	) => {
		const row = data[id]?.[0];
		if (row?.value == null || observationStatus(id, row, asOf) !== "Current")
			return null;
		const earlier = dateOffset(row.date, offset);
		const prior = data[id]?.find((item) => item.date === earlier)?.value;
		return prior == null ? null : row.value - prior;
	};
	return {
		previousAsOf,
		finish(previousData: Observations | null) {
			const previous =
				previousAsOf && previousData
					? classify(metrics(previousData, previousAsOf)).regime
					: null;
			return {
				...classify(
					values,
					previous === "Stagflation risk" ||
						previous === "Contraction / recession risk",
				),
				...values,
				data,
				asOf,
				missing,
				modelVersion: MACRO_MODEL_VERSION,
				fedFundsChange: change("FEDFUNDS", { months: -3 }),
				financialConditionsChange: change("NFCI", { days: -28 }),
			};
		},
	};
}
