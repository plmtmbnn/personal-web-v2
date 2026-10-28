export function parseRawNum(val: unknown): number {
	if (typeof val === "number") return Number.isFinite(val) ? val : 0;
	if (typeof val === "string") {
		const trimmed = val.trim();
		if (!trimmed) return 0;

		// Direct numeric parse (covers standard numbers, decimals, and scientific notation e.g. "-2.151022e+06", "-1.27e+10")
		const direct = Number(trimmed);
		if (Number.isFinite(direct)) return direct;

		// Numbers formatted with commas, e.g. "1,500,000" or "-2,151,022.50"
		const withoutCommas = trimmed.replace(/,/g, "");
		const directWithoutCommas = Number(withoutCommas);
		if (Number.isFinite(directWithoutCommas)) return directWithoutCommas;

		// Unit-based strings, e.g. "2.5K", "10.5M", "1.2B", "3.4T", "-1.5B", "Rp 2.5B", "-Rp 2.5B"
		const unitMatch = trimmed.match(
			/^([+-]?(?:(?:Rp|IDR)\s*)?)?([\d,.]+)\s*([KkMmBbTt])?$/i,
		);
		if (unitMatch) {
			const signPrefix = unitMatch[1] || "";
			const isNegative = signPrefix.includes("-");
			const numPart = Number.parseFloat(unitMatch[2].replace(/,/g, ""));
			const unit = unitMatch[3]?.toUpperCase();
			if (Number.isFinite(numPart)) {
				let multiplier = 1;
				if (unit === "T") multiplier = 1e12;
				else if (unit === "B") multiplier = 1e9;
				else if (unit === "M") multiplier = 1e6;
				else if (unit === "K") multiplier = 1e3;
				const res = numPart * multiplier;
				return isNegative ? -res : res;
			}
		}

		// Strings with currency or symbols and scientific notation, e.g. "Rp -1.27e+10"
		const numMatch = trimmed.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
		if (numMatch) {
			const n = Number(numMatch[0]);
			if (Number.isFinite(n)) return n;
		}
	}
	return 0;
}

export function formatCompact(val: unknown, prefix = ""): string {
	const n = parseRawNum(val);
	if (n === 0) return `${prefix}0`.trim();

	const abs = Math.abs(n);
	const sign = n < 0 ? "-" : "";

	let formatted: string;
	if (abs >= 1e12) {
		const num = abs / 1e12;
		formatted = `${num >= 100 ? Math.round(num) : Number(num.toFixed(1))}T`;
	} else if (abs >= 1e9) {
		const num = abs / 1e9;
		formatted = `${num >= 100 ? Math.round(num) : Number(num.toFixed(1))}B`;
	} else if (abs >= 1e6) {
		const num = abs / 1e6;
		formatted = `${num >= 100 ? Math.round(num) : Number(num.toFixed(1))}M`;
	} else if (abs >= 1e3) {
		const num = abs / 1e3;
		formatted = `${num >= 100 ? Math.round(num) : Number(num.toFixed(1))}K`;
	} else {
		formatted = Math.round(abs).toLocaleString("id-ID");
	}

	return `${sign}${prefix}${formatted}`;
}
