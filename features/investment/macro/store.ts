import { DatabaseSync } from "node:sqlite";
import {
	dateOffset,
	periodEnd,
	SERIES,
	SERIES_IDS,
	seriesUrl,
	type Observation,
	type Observations,
	type SeriesId,
} from "./series.ts";

export interface SyncStatus {
	seriesId: SeriesId;
	attemptedAt: string;
	lastSuccess: string | null;
	cutoff: string | null;
	error: string | null;
}

export interface ObservationPage {
	offset: number;
	payload: string;
	rows: Observation[];
}

export interface FredStore {
	status(): SyncStatus[] | Promise<SyncStatus[]>;
	save(
		id: SeriesId,
		start: string,
		cutoff: string,
		attemptedAt: string,
		pages: ObservationPage[],
	): void | Promise<void>;
	fail(id: SeriesId, attemptedAt: string, error: string): void | Promise<void>;
}

export function sqliteFredStore(db: DatabaseSync): FredStore {
	return {
		status: () => syncStatus(db),
		save: (...args) => saveSeries(db, ...args),
		fail: (...args) => recordSyncFailure(db, ...args),
	};
}

export function openMacroStore(path: string) {
	const db = new DatabaseSync(path);
	try {
		db.exec(`
			PRAGMA busy_timeout = 5000;
			PRAGMA journal_mode = WAL;
			PRAGMA foreign_keys = ON;
			CREATE TABLE IF NOT EXISTS series (
				id TEXT PRIMARY KEY, provider TEXT NOT NULL, source_url TEXT NOT NULL,
				name TEXT NOT NULL, unit TEXT NOT NULL, currency TEXT, frequency TEXT NOT NULL,
				max_age_days INTEGER NOT NULL
			) STRICT;
			CREATE TABLE IF NOT EXISTS raw_pages (
				series_id TEXT REFERENCES series(id), start_date TEXT NOT NULL, cutoff TEXT NOT NULL,
				page_offset INTEGER NOT NULL, fetched_at TEXT NOT NULL, payload TEXT NOT NULL,
				PRIMARY KEY (series_id, start_date, cutoff, page_offset)
			) STRICT;
			CREATE TABLE IF NOT EXISTS observations (
				series_id TEXT REFERENCES series(id), date TEXT NOT NULL,
				vintage_start TEXT NOT NULL, vintage_end TEXT NOT NULL, value REAL, fetched_at TEXT NOT NULL,
				PRIMARY KEY (series_id, date, vintage_start)
			) STRICT;
			CREATE TABLE IF NOT EXISTS sync_status (
				series_id TEXT PRIMARY KEY REFERENCES series(id), attempted_at TEXT NOT NULL,
				last_success TEXT, cutoff TEXT, error TEXT
			) STRICT;
		`);
		const insert = db.prepare(
			"INSERT OR IGNORE INTO series VALUES (?, 'FRED', ?, ?, ?, ?, ?, ?)",
		);
		for (const id of SERIES_IDS) {
			const { name, unit, currency, frequency, maxAge } = SERIES[id];
			insert.run(id, seriesUrl(id), name, unit, currency, frequency, maxAge);
		}
		return db;
	} catch (error) {
		db.close();
		throw error;
	}
}

export function syncStatus(db: DatabaseSync) {
	return db
		.prepare(`SELECT series_id AS seriesId, attempted_at AS attemptedAt,
		last_success AS lastSuccess, cutoff, error FROM sync_status ORDER BY series_id`)
		.all() as unknown as SyncStatus[];
}

export function recordSyncFailure(
	db: DatabaseSync,
	id: SeriesId,
	attemptedAt: string,
	error: string,
) {
	db.prepare(`INSERT INTO sync_status VALUES (?, ?, NULL, NULL, ?)
		ON CONFLICT(series_id) DO UPDATE SET attempted_at = excluded.attempted_at, error = excluded.error
		WHERE excluded.attempted_at >= sync_status.attempted_at`).run(
		id,
		attemptedAt,
		error,
	);
}

export function saveSeries(
	db: DatabaseSync,
	id: SeriesId,
	start: string,
	cutoff: string,
	attemptedAt: string,
	pages: ObservationPage[],
) {
	const insertPage = db.prepare(
		"INSERT OR REPLACE INTO raw_pages VALUES (?, ?, ?, ?, ?, ?)",
	);
	const insertRow =
		db.prepare(`INSERT INTO observations VALUES (?, ?, ?, ?, ?, ?)
		ON CONFLICT(series_id, date, vintage_start) DO UPDATE SET
		vintage_end = excluded.vintage_end, value = excluded.value, fetched_at = excluded.fetched_at`);
	const updateBoundary = db.prepare(`UPDATE observations SET vintage_end = ?
		WHERE series_id = ? AND date = ? AND vintage_start < ? AND vintage_end >= ? AND value IS ?`);
	db.exec("BEGIN IMMEDIATE");
	try {
		const previous = db
			.prepare("SELECT attempted_at FROM sync_status WHERE series_id = ?")
			.get(id);
		if (previous && String(previous.attempted_at) > attemptedAt) {
			db.exec("ROLLBACK");
			return;
		}
		for (const page of pages) {
			insertPage.run(id, start, cutoff, page.offset, attemptedAt, page.payload);
			for (const row of page.rows) {
				// FRED can clip an older interval to the requested start. Keep its original vintage.
				if (
					row.vintageStart === start &&
					updateBoundary.run(
						row.vintageEnd,
						id,
						row.date,
						start,
						start,
						row.value,
					).changes
				)
					continue;
				insertRow.run(
					id,
					row.date,
					row.vintageStart,
					row.vintageEnd,
					row.value,
					row.fetchedAt,
				);
			}
		}
		db.prepare(
			"INSERT OR REPLACE INTO sync_status VALUES (?, ?, ?, ?, NULL)",
		).run(id, attemptedAt, new Date().toISOString(), cutoff);
		db.exec("COMMIT");
	} catch (error) {
		db.exec("ROLLBACK");
		throw error;
	}
}

export function readObservations(db: DatabaseSync, asOf: string): Observations {
	const latestDay = dateOffset(asOf, { days: -1 });
	const lookback = dateOffset(`${asOf.slice(0, 7)}-01`, { months: -24 });
	const query =
		db.prepare(`SELECT date, value, vintage_start AS vintageStart, vintage_end AS vintageEnd, fetched_at AS fetchedAt
		FROM observations WHERE series_id = ? AND date BETWEEN ? AND ?
		AND vintage_start <= ? AND vintage_end >= ?
		ORDER BY date DESC, vintage_start DESC`);
	return Object.fromEntries(
		SERIES_IDS.map((id) => {
			const rows = query.all(
				id,
				lookback,
				latestDay,
				latestDay,
				latestDay,
			) as unknown as Observation[];
			return [
				id,
				rows.filter(
					(row, i) =>
						row.date !== rows[i - 1]?.date &&
						periodEnd(id, row.date) <= latestDay,
				),
			];
		}),
	);
}
