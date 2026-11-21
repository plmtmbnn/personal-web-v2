import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createMacroPostgres } from "../features/investment/macro/postgres.ts";
import { DEFAULT_DB, HOSTED_SERIES } from "../features/investment/macro/series.ts";
import { syncStatus } from "../features/investment/macro/store.ts";

async function seed() {
	const db = createMacroPostgres();
	const sqlite = new DatabaseSync(
		resolve(process.env.MACRO_RESEARCH_DB || DEFAULT_DB),
		{ readOnly: true },
	);
	try {
		sqlite.exec("BEGIN");
		const local = syncStatus(sqlite);
		const read = sqlite.prepare("SELECT date, vintage_start, vintage_end, value, fetched_at FROM observations WHERE series_id = ?");
		for (const id of HOSTED_SERIES) {
			const checkpoint = local.find((row) => row.seriesId === id);
			if (!checkpoint?.cutoff || !checkpoint.lastSuccess)
				throw new Error(`${id} has no completed local sync. Run pnpm macro:sync first.`);
			const rows = read.all(id);
			if (!rows.length) throw new Error(`${id} has no local history`);
			const { data: count, error } = await db.rpc("seed_macro_series", {
				p_status: {
					series_id: id,
					attempted_at: checkpoint.attemptedAt,
					last_success: checkpoint.lastSuccess,
					cutoff: checkpoint.cutoff,
					error: checkpoint.error,
				},
				p_rows: rows,
			});
			if (error) throw new Error(`${id} history upload failed (${error.code || "network"})`);
			if (count === 0) console.log(`${id} already seeded`);
			else if (count === rows.length)
				console.log(`${id} seeded ${count} vintages through ${checkpoint.cutoff}`);
			else throw new Error(`${id} hosted row count does not match SQLite`);
		}
	} finally {
		sqlite.close();
	}
}

try {
	await seed();
} catch (error) {
	console.error(error instanceof Error ? error.message : "Macro import failed");
	process.exitCode = 1;
}
