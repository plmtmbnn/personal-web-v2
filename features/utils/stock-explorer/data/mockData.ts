import type { Sector, FundamentalData } from "../types";

// A pseudo-random hash function to generate deterministic mock data based on StockCode
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return Math.abs(hash);
}

export const getMockSector = (stockCode: string): Sector => {
	const sectors: Sector[] = [
		"Banking",
		"Technology",
		"Energy",
		"Healthcare",
		"Infrastructure",
		"Consumer",
		"Property",
		"Transportation",
		"Basic Materials",
		"Industrials",
	];

	// Hardcode some famous ones
	if (["BBCA", "BBRI", "BMRI", "BBNI", "ARTO", "BRIS"].includes(stockCode))
		return "Banking";
	if (["GOTO", "BUKA", "WIFI", "EMTK"].includes(stockCode)) return "Technology";
	if (["ADRO", "PTBA", "ITMG", "PGAS", "MEDC"].includes(stockCode))
		return "Energy";
	if (["KLBF", "MIKA", "SILO", "HEAL"].includes(stockCode)) return "Healthcare";
	if (["TLKM", "EXCL", "ISAT", "JSMR", "WIKA"].includes(stockCode))
		return "Infrastructure";
	if (["UNVR", "ICBP", "INDF", "MYOR", "AMRT"].includes(stockCode))
		return "Consumer";
	if (["BSDE", "CTRA", "SMRA", "PWON", "ASRI"].includes(stockCode))
		return "Property";
	if (["ASII", "UNTR", "GIAA", "BIRD"].includes(stockCode))
		return "Transportation";
	if (["ANTM", "INCO", "MDKA", "TINS", "BRPT"].includes(stockCode))
		return "Basic Materials";

	return sectors[hashString(stockCode) % sectors.length];
};

export const getMockFundamentals = (
	stockCode: string,
	closePrice: number,
): FundamentalData => {
	const hash = hashString(stockCode);

	// Deterministic random generation based on hash
	const PE = (hash % 400) / 10 + 5; // 5.0 to 45.0
	const PBV = (hash % 100) / 10 + 0.5; // 0.5 to 10.5
	const EPS = Math.round(closePrice / PE);
	const ROE = (hash % 30) + 5; // 5% to 35%
	const ROA = ROE / ((hash % 3) + 1.5);
	const DER = (hash % 200) / 100 + 0.2; // 0.2 to 2.2

	// Large caps have bigger revenue
	const multiplier = ["BBCA", "BBRI", "BMRI", "TLKM", "ASII"].includes(
		stockCode,
	)
		? 100
		: (hash % 10) + 1;
	const Revenue = multiplier * 1_000_000_000_000 + hash * 1000000;
	const NetIncome = Revenue * (ROE / 100) * 0.4;

	return {
		Revenue,
		NetIncome,
		EPS,
		ROE,
		ROA,
		DER,
		PE,
		PBV,
	};
};
