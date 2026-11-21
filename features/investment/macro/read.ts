import "server-only";
import { statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { assessMacro, prepareMacroAssessment } from "./assessment";
import { createMacroPostgres, readMacroWindow } from "./postgres";
import { HOSTED_SERIES, SERIES_IDS } from "./series";
import { readObservations, type SyncStatus, syncStatus } from "./store";

type MacroPanelData =
	| {
			state: "ready";
			assessment: ReturnType<typeof assessMacro>;
			sync: SyncStatus[];
	  }
	| { state: "empty" | "error" };

export function readMacroPanel(path: string, asOf: string): MacroPanelData {
	try {
		statSync(path);
		const db = new DatabaseSync(path, { readOnly: true });
		try {
			db.exec("BEGIN");
			const sync = syncStatus(db);
			const assessment = assessMacro(asOf, (date) =>
				readObservations(db, date),
			);
			return SERIES_IDS.some((id) => assessment.data[id]?.length) ||
				sync.some((item) => item.error)
				? { state: "ready" as const, assessment, sync }
				: { state: "empty" as const };
		} finally {
			db.close();
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT")
			return { state: "empty" as const };
		return { state: "error" as const };
	}
}

export async function readHostedMacroPanel(
	asOf: string,
): Promise<MacroPanelData> {
	try {
		const db = createMacroPostgres(AbortSignal.timeout(4_000));
		const { observations, sync } = await readMacroWindow(db, asOf);
		if (
			!HOSTED_SERIES.some((id) => observations[id]?.length) &&
			!sync.some((row) => row.error)
		)
			return { state: "empty" };
		const { previousAsOf, finish } = prepareMacroAssessment(asOf, observations);
		const previous = previousAsOf
			? await readMacroWindow(db, previousAsOf)
			: null;
		return {
			state: "ready",
			assessment: finish(previous?.observations ?? null),
			sync,
		};
	} catch {
		console.error("Hosted macro observations are unavailable");
		return { state: "error" };
	}
}
