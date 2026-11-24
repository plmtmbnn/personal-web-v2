const REQUIRED_NUMBERS = [
	"Close",
	"Volume",
	"Value",
	"ForeignBuy",
	"ForeignSell",
] as const;

export function validateStockImport(data: unknown): string | null {
	if (!Array.isArray(data) || data.length === 0)
		return "Provide a nonempty array of stock records.";

	let session: string | null = null;
	for (const [index, item] of data.entries()) {
		if (!item || typeof item !== "object" || Array.isArray(item))
			return `Record ${index + 1} is not a stock object.`;
		const stock = item as Record<string, unknown>;
		if (typeof stock.StockCode !== "string" || !stock.StockCode.trim())
			return `Record ${index + 1} needs a ticker symbol.`;
		const date = typeof stock.Date === "string" ? stock.Date.slice(0, 10) : "";
		const calendarDate = new Date(`${date}T00:00:00Z`);
		if (
			typeof stock.Date !== "string" ||
			!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(stock.Date) ||
			Number.isNaN(Date.parse(stock.Date)) ||
			Number.isNaN(calendarDate.getTime()) ||
			calendarDate.toISOString().slice(0, 10) !== date
		)
			return `Record ${index + 1} needs a valid trading date.`;
		if (session && session !== date)
			return "All records must belong to the same trading session.";
		session = date;
		for (const field of REQUIRED_NUMBERS) {
			if (typeof stock[field] !== "number" || !Number.isFinite(stock[field]))
				return `Record ${index + 1} needs a valid ${field} value.`;
		}
	}
	return null;
}
