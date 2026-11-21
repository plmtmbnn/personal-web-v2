import { createClient } from "@supabase/supabase-js";
import {
	dateOffset,
	HOSTED_SERIES,
	type Observations,
	periodEnd,
} from "./series.ts";
import type { FredStore, SyncStatus } from "./store.ts";

export function createMacroPostgres(signal?: AbortSignal) {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new Error("Macro Supabase credentials are missing");
	return createClient(url, key, {
		auth: { autoRefreshToken: false, persistSession: false },
		global: {
			fetch: (input, init) =>
				fetch(input, {
					...init,
					cache: "no-store",
					signal: AbortSignal.any(
						[signal, init?.signal, AbortSignal.timeout(15_000)].filter(
							(item): item is AbortSignal => !!item,
						),
					),
				}),
		},
	});
}

type MacroPostgres = ReturnType<typeof createMacroPostgres>;

export async function readMacroWindow(db: MacroPostgres, asOf: string) {
	const through = dateOffset(asOf, { days: -1 });
	const { data, error } = await db.rpc("read_macro_window", {
		p_from: dateOffset(`${asOf.slice(0, 7)}-01`, { months: -24 }),
		p_through: through,
	});
	if (error || !data)
		throw new Error("Could not read hosted macro observations");
	const { observations, sync } = data as {
		observations: Observations;
		sync: SyncStatus[];
	};
	for (const id of HOSTED_SERIES) {
		observations[id] = observations[id]?.filter(
			(row) => periodEnd(id, row.date) <= through,
		);
	}
	return { observations, sync };
}

export function postgresFredStore(db: MacroPostgres): FredStore {
	async function commit(args: Record<string, unknown>) {
		const { error } = await db.rpc("commit_macro_sync", args);
		if (error) throw new Error("Could not store hosted macro sync");
	}
	return {
		async status() {
			const { data, error } = await db
				.from("macro_sync_status")
				.select(
					"seriesId:series_id, attemptedAt:attempted_at, lastSuccess:last_success, cutoff, error",
				);
			if (error) throw new Error("Could not read hosted macro sync status");
			const status = data as SyncStatus[];
			if (
				HOSTED_SERIES.some(
					(id) => !status.some((row) => row.seriesId === id && row.cutoff),
				)
			)
				throw new Error("Macro history has not been seeded");
			return status;
		},
		save: (id, start, cutoff, attemptedAt, pages) =>
			commit({
				p_series: id,
				p_start: start,
				p_cutoff: cutoff,
				p_attempted_at: attemptedAt,
				p_rows: pages.flatMap((page) => page.rows),
				p_error: null,
			}),
		fail: (id, attemptedAt, error) =>
			commit({
				p_series: id,
				p_start: null,
				p_cutoff: null,
				p_attempted_at: attemptedAt,
				p_rows: null,
				p_error: error,
			}),
	};
}
