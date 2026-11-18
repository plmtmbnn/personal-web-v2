import { INSTRUMENTS } from "@/features/investment/data/instruments";
import type { MacroSeries, MarketQuote } from "./types";
import { marketEvidence } from "./provenance";

export const FRED_SERIES = [
	{ id: "FEDFUNDS", frequency: "Monthly", maxAgeDays: 75 },
	{ id: "CPIAUCSL", frequency: "Monthly", units: "pc1", maxAgeDays: 75 },
	{ id: "PCEPILFE", frequency: "Monthly", units: "pc1", maxAgeDays: 75 },
	{ id: "M2SL", frequency: "Monthly", units: "pc1", maxAgeDays: 75 },
	{ id: "UNRATE", frequency: "Monthly", maxAgeDays: 75 },
	{ id: "DGS10", maxAgeDays: 7 },
	{ id: "T10Y2Y", maxAgeDays: 7 },
	{ id: "BAMLH0A0HYM2", maxAgeDays: 7 },
	{ id: "DFII10", maxAgeDays: 7 },
];
export const DOMESTIC_SERIES = ["BI_POLICY_RATE", "ID_CPI_YOY"] as const;
export const RETIRED_SERIES = [
	"IRSTCB01IDM156N",
	"IRLTLT01IDM156N",
	"IDNCPIALLMINMEI",
];
export const HISTORY_SYMBOLS = [
	"^JKSE",
	"IDR=X",
	"BTC-USD",
	"BBCA.JK",
	"ADRO.JK",
	"ICBP.JK",
	"ANTM.JK",
	"TLKM.JK",
	"ASII.JK",
];

export function quoteIsCurrent(
	id: string,
	quote: MarketQuote | undefined,
	now = new Date().toISOString(),
) {
	return (
		!!quote &&
		Number.isFinite(quote.last) &&
		marketEvidence(
			quote.source,
			quote.origin ?? "live",
			quote.lastTime,
			now,
			id === "BTC" || id === "ETH" ? 0.25 : 4,
		).status === "current"
	);
}

export function registeredQuotes(quotes: Record<string, MarketQuote>) {
	return Object.fromEntries(
		INSTRUMENTS.flatMap(({ id }) =>
			quotes[id] && Number.isFinite(quotes[id].last) ? [[id, quotes[id]]] : [],
		),
	);
}

export function registeredMacro(series: Record<string, MacroSeries>) {
	const ids = [...FRED_SERIES.map((item) => item.id), ...DOMESTIC_SERIES];
	return Object.fromEntries(
		ids.flatMap((id) => {
			const item = series[id];
			if (!Array.isArray(item?.data)) return [];
			const data = [
				...new Map(
					item.data
						.filter(
							(row) =>
								Number.isFinite(row.value) &&
								/^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
								Number.isFinite(Date.parse(row.date)),
						)
						.map((row) => [row.date, row]),
				).values(),
			].sort((a, b) => a.date.localeCompare(b.date));
			return data.length ? [[id, { ...item, data }]] : [];
		}),
	);
}
