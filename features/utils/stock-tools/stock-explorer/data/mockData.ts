import type { Sector } from "../types";

/**
 * Verified Static IDX Sector Dictionary (LQ45 / IDX80 / Kompas100 & Liquid Active Universe).
 * Eliminates arbitrary modulo string hashing so sector rotation and filtering reflect real industry groups.
 */
const VERIFIED_IDX_SECTORS: Record<string, Sector> = {
	// Banking & Financials
	BBCA: "Banking",
	BBRI: "Banking",
	BMRI: "Banking",
	BBNI: "Banking",
	BRIS: "Banking",
	ARTO: "Banking",
	MEGA: "Banking",
	BDMN: "Banking",
	BNGA: "Banking",
	NISP: "Banking",
	BBTN: "Banking",
	BJBR: "Banking",
	BJTM: "Banking",
	BNLI: "Banking",
	PNBN: "Banking",
	BTPS: "Banking",
	BBYB: "Banking",
	AGRO: "Banking",
	BBKP: "Banking",
	BMAS: "Banking",
	BSIM: "Banking",
	MAYA: "Banking",
	BFIN: "Banking",
	ADMF: "Banking",
	CFIN: "Banking",
	WOMF: "Banking",
	TUGU: "Banking",
	PNLF: "Banking",
	PNIN: "Banking",
	ASMI: "Banking",
	LIFE: "Banking",
	SRTG: "Banking",

	// Energy (Coal, Oil, Gas, Renewables)
	ADRO: "Energy",
	AADI: "Energy",
	ADMR: "Energy",
	PTBA: "Energy",
	ITMG: "Energy",
	PGAS: "Energy",
	MEDC: "Energy",
	AKRA: "Energy",
	BYAN: "Energy",
	DSSA: "Energy",
	BUMI: "Energy",
	HRUM: "Energy",
	INDY: "Energy",
	DOID: "Energy",
	ELSA: "Energy",
	ENRG: "Energy",
	RAJA: "Energy",
	TOBA: "Energy",
	GEMS: "Energy",
	MBAP: "Energy",
	BSSR: "Energy",
	MCOL: "Energy",
	PTRO: "Energy",
	DEWA: "Energy",
	CUAN: "Energy",
	BREN: "Energy",
	PGEO: "Energy",
	KEEN: "Energy",
	ARKO: "Energy",
	RMKE: "Energy",
	SGER: "Energy",
	APEX: "Energy",
	WINS: "Energy",
	LEAD: "Energy",
	MBMA: "Basic Materials",

	// Basic Materials (Metals, Mining, Chemicals, Pulp, Cement)
	AMMN: "Basic Materials",
	ANTM: "Basic Materials",
	INCO: "Basic Materials",
	MDKA: "Basic Materials",
	TINS: "Basic Materials",
	BRPT: "Basic Materials",
	TPIA: "Basic Materials",
	INKP: "Basic Materials",
	TKIM: "Basic Materials",
	SMGR: "Basic Materials",
	INTP: "Basic Materials",
	NCKL: "Basic Materials",
	BRMS: "Basic Materials",
	PSAB: "Basic Materials",
	ARCI: "Basic Materials",
	ESSA: "Basic Materials",
	AVIA: "Basic Materials",
	SMCB: "Basic Materials",
	CMNT: "Basic Materials",
	DKFT: "Basic Materials",
	NICL: "Basic Materials",
	ZINC: "Basic Materials",
	KRAS: "Basic Materials",
	ISSP: "Basic Materials",
	GDST: "Basic Materials",
	CLPI: "Basic Materials",
	SRSN: "Basic Materials",

	// Consumer (Staples, Retail, F&B, Poultry, CPO/Agri, Media)
	ICBP: "Consumer",
	INDF: "Consumer",
	AMRT: "Consumer",
	MYOR: "Consumer",
	UNVR: "Consumer",
	KLBF: "Healthcare",
	CPIN: "Consumer",
	JPFA: "Consumer",
	MAIN: "Consumer",
	ACES: "Consumer",
	MAPI: "Consumer",
	MAPA: "Consumer",
	ERAA: "Consumer",
	RALS: "Consumer",
	LPPF: "Consumer",
	MIDI: "Consumer",
	CMRY: "Consumer",
	ULTJ: "Consumer",
	SIDO: "Healthcare",
	ROTI: "Consumer",
	GOOD: "Consumer",
	CLEO: "Consumer",
	STTP: "Consumer",
	GGRM: "Consumer",
	HMSP: "Consumer",
	WIIM: "Consumer",
	TAPG: "Consumer",
	LSIP: "Consumer",
	AALI: "Consumer",
	SSMS: "Consumer",
	DSNG: "Consumer",
	SMAR: "Consumer",
	SIMP: "Consumer",
	SCMA: "Consumer",
	MNCN: "Consumer",
	FILM: "Consumer",
	MSIN: "Consumer",

	// Healthcare (Hospitals, Pharma, Labs)
	MIKA: "Healthcare",
	SILO: "Healthcare",
	HEAL: "Healthcare",
	SAME: "Healthcare",
	PRDA: "Healthcare",
	BMHS: "Healthcare",
	PRIM: "Healthcare",
	CARE: "Healthcare",
	KAEF: "Healthcare",
	INAF: "Healthcare",
	TSPC: "Healthcare",
	DVLA: "Healthcare",
	MERK: "Healthcare",
	PYFA: "Healthcare",
	IRRA: "Healthcare",
	OMED: "Healthcare",

	// Infrastructure (Telco, Towers, Toll Roads, Construction, Utilities)
	TLKM: "Infrastructure",
	ISAT: "Infrastructure",
	EXCL: "Infrastructure",
	MTEL: "Infrastructure",
	TOWR: "Infrastructure",
	TBIG: "Infrastructure",
	JSMR: "Infrastructure",
	META: "Infrastructure",
	CMNP: "Infrastructure",
	ADHI: "Infrastructure",
	PTPP: "Infrastructure",
	WIKA: "Infrastructure",
	WSKT: "Infrastructure",
	TOTL: "Infrastructure",
	NRCA: "Infrastructure",
	JKON: "Infrastructure",
	WEGE: "Infrastructure",
	ACST: "Infrastructure",
	INET: "Infrastructure",
	CENT: "Infrastructure",
	LINK: "Infrastructure",
	MORI: "Infrastructure",

	// Property & Real Estate
	BSDE: "Property",
	CTRA: "Property",
	SMRA: "Property",
	PWON: "Property",
	PANI: "Property",
	ASRI: "Property",
	LPKR: "Property",
	LPCK: "Property",
	DMAS: "Property",
	SSIA: "Property",
	BEST: "Property",
	KIJA: "Property",
	APLN: "Property",
	DILD: "Property",
	JRPT: "Property",
	MKPI: "Property",
	PLIN: "Property",
	BKSL: "Property",
	MDLN: "Property",
	KPIG: "Property",

	// Technology & Digital
	GOTO: "Technology",
	BUKA: "Technology",
	EMTK: "Technology",
	WIFI: "Technology",
	DCII: "Technology",
	MLPT: "Technology",
	MTDL: "Technology",
	ATIC: "Technology",
	EDGE: "Technology",
	MCAS: "Technology",
	DMMX: "Technology",
	WIRG: "Technology",
	BELI: "Technology",
	UVCR: "Technology",
	DIVA: "Technology",

	// Industrials & Conglomerates
	ASII: "Industrials",
	UNTR: "Industrials",
	AUTO: "Industrials",
	SMSM: "Industrials",
	GJTL: "Industrials",
	DRMA: "Industrials",
	MARK: "Industrials",
	ARNA: "Industrials",
	MLIA: "Industrials",
	IMPC: "Industrials",
	SPTO: "Industrials",
	BHIT: "Industrials",
	BNBR: "Industrials",
	ABMM: "Industrials",
	HEXA: "Industrials",
	INTR: "Industrials",
	KOBX: "Industrials",

	// Transportation & Logistics
	SMDR: "Transportation",
	TMAS: "Transportation",
	BIRD: "Transportation",
	ASSA: "Transportation",
	GIAA: "Transportation",
	BULL: "Transportation",
	SOCI: "Transportation",
	GTSI: "Transportation",
	HUMI: "Transportation",
	PSSI: "Transportation",
	TCPI: "Transportation",
	IPCM: "Transportation",
	TRJA: "Transportation",
	TNCA: "Transportation",
	SAPX: "Transportation",
};

/**
 * Resolves the verified IDX sector for a stock ticker and optional company name.
 * Never uses random string hashing. Unmapped micro-caps resolve to "Unclassified".
 */
export const getIdxSector = (stockCode: string, stockName = ""): Sector => {
	const code = (stockCode || "").toUpperCase().trim();
	if (VERIFIED_IDX_SECTORS[code]) {
		return VERIFIED_IDX_SECTORS[code];
	}

	const upperName = (stockName || "").toUpperCase();
	if (
		upperName.includes("BANK ") ||
		upperName.startsWith("BANK") ||
		upperName.includes("FINANCE") ||
		upperName.includes("MULTIFINANCE") ||
		upperName.includes("ASURANSI") ||
		upperName.includes("INSURANCE") ||
		upperName.includes("SEKURITAS") ||
		upperName.includes("CAPITAL")
	) {
		return "Banking";
	}
	if (
		upperName.includes("ENERGI") ||
		upperName.includes("ENERGY") ||
		upperName.includes("COAL") ||
		upperName.includes("BATUBARA") ||
		upperName.includes("PETROLEUM") ||
		upperName.includes("OIL") ||
		upperName.includes("MINYAK")
	) {
		return "Energy";
	}
	if (
		upperName.includes("MINERAL") ||
		upperName.includes("MINING") ||
		upperName.includes("TAMBANG") ||
		upperName.includes("METAL") ||
		upperName.includes("STEEL") ||
		upperName.includes("SEMEN") ||
		upperName.includes("CEMENT") ||
		upperName.includes("CHEMICAL") ||
		upperName.includes("KIMIA") ||
		upperName.includes("PACKAGING") ||
		upperName.includes("PULP")
	) {
		return "Basic Materials";
	}
	if (
		upperName.includes("MEDIKA") ||
		upperName.includes("HEALTH") ||
		upperName.includes("FARMA") ||
		upperName.includes("PHARMA") ||
		upperName.includes("HOSPITAL") ||
		upperName.includes("RUMAH SAKIT") ||
		upperName.includes("SARANA MEDITAMA")
	) {
		return "Healthcare";
	}
	if (
		upperName.includes("PROPERT") ||
		upperName.includes("REALTY") ||
		upperName.includes("ESTATE") ||
		upperName.includes("LAND") ||
		upperName.includes("PERSADA") ||
		upperName.includes("DEVELOPMENT")
	) {
		return "Property";
	}
	if (
		upperName.includes("TELEKOM") ||
		upperName.includes("TOWER") ||
		upperName.includes("INFRASTRUKTUR") ||
		upperName.includes("KONSTRUKSI") ||
		upperName.includes("KARYA") ||
		upperName.includes("MARGA")
	) {
		return "Infrastructure";
	}
	if (
		upperName.includes("TEKNOLOGI") ||
		upperName.includes("TECHNOLOGY") ||
		upperName.includes("DIGITAL") ||
		upperName.includes("COMPUT") ||
		upperName.includes("DATA")
	) {
		return "Technology";
	}
	if (
		upperName.includes("PELAYARAN") ||
		upperName.includes("SHIPPING") ||
		upperName.includes("MARINE") ||
		upperName.includes("TRANS") ||
		upperName.includes("LOGIST") ||
		upperName.includes("AIRLINES")
	) {
		return "Transportation";
	}
	if (
		upperName.includes("FOOD") ||
		upperName.includes("MAKANAN") ||
		upperName.includes("RETAIL") ||
		upperName.includes("RITEL") ||
		upperName.includes("CONSUMER") ||
		upperName.includes("AGRO") ||
		upperName.includes("PLANTATION") ||
		upperName.includes("SAWIT") ||
		upperName.includes("HOTEL") ||
		upperName.includes("MEDIA")
	) {
		return "Consumer";
	}
	if (
		upperName.includes("INDUSTRI") ||
		upperName.includes("MANUFACTUR") ||
		upperName.includes("OTOMOTIF") ||
		upperName.includes("AUTO")
	) {
		return "Industrials";
	}

	return "Unclassified";
};

/** @deprecated Kept as alias for getIdxSector during migration */
export const getMockSector = getIdxSector;
