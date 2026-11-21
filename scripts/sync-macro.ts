import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { syncFred } from "../features/investment/macro/fred-sync.ts";
import { DEFAULT_DB } from "../features/investment/macro/series.ts";
import { openMacroStore, sqliteFredStore } from "../features/investment/macro/store.ts";

const key = process.env.FRED_API_KEY;
if (!key?.trim()) {
	console.error("FRED_API_KEY is required for the local macro sync.");
	process.exitCode = 1;
} else {
	const path = resolve(process.env.MACRO_RESEARCH_DB || DEFAULT_DB);
	mkdirSync(dirname(path), { recursive: true });
	const db = openMacroStore(path);
	try {
		const results = await syncFred(sqliteFredStore(db), key);
		for (const { id, synced, error } of results) {
			console.log(`${id} ${synced ? "synced" : error}`);
		}
		if (results.some((row) => !row.synced)) process.exitCode = 1;
	} finally {
		db.close();
	}
}
