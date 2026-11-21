import { resolve } from "node:path";
import { connection } from "next/server";
import { observationStatus } from "../macro/assessment";
import { readHostedMacroPanel, readMacroPanel } from "../macro/read";
import {
	DEFAULT_DB,
	fredDate,
	periodEnd,
	SERIES,
	SERIES_IDS,
	type SeriesId,
	seriesUrl,
} from "../macro/series";

const card =
	"rounded-3xl border border-slate-200/80 bg-white p-5 text-slate-900 shadow-xs sm:p-7";
const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const signed = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 2,
	signDisplay: "exceptZero",
});
const signedIndex = new Intl.NumberFormat("en-US", {
	maximumFractionDigits: 3,
	signDisplay: "exceptZero",
});
const day = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
	timeZone: "UTC",
});
const time = new Intl.DateTimeFormat("en-GB", {
	dateStyle: "medium",
	timeStyle: "short",
	timeZone: "Asia/Jakarta",
});

export function MacroResearchLoading() {
	return (
		<section
			className={`${card} min-h-56`}
			aria-busy="true"
			aria-label="U.S. macro conditions"
		>
			<p role="status" className="text-sm text-slate-700">
				Loading U.S. macro conditions
			</p>
		</section>
	);
}

export default async function MacroResearchPanel() {
	await connection();
	const hosted = process.env.VERCEL === "1";
	const asOf = fredDate();
	const panel = hosted
		? await readHostedMacroPanel(asOf)
		: readMacroPanel(
				resolve(process.env.MACRO_RESEARCH_DB || DEFAULT_DB),
				asOf,
			);
	const assessment = panel.state === "ready" ? panel.assessment : null;
	const changes =
		assessment &&
		({
			GDPC1: [assessment.gdp, "% quarter over quarter"],
			INDPRO: [assessment.industry, "% over 3 months"],
			UNRATE: [
				assessment.unemploymentChange,
				" percentage points between 3-month averages",
			],
			PCEPILFE: [assessment.inflation, "% year over year"],
			FEDFUNDS: [assessment.fedFundsChange, " percentage points over 3 months"],
			NFCI: [
				assessment.financialConditionsChange,
				" index points over 4 weeks",
			],
		} satisfies Record<SeriesId, [number | null, string]> | null);
	return (
		<section className={card} aria-labelledby="us-macro-heading">
			<h2 id="us-macro-heading" className="text-base font-semibold">
				U.S. macro conditions
			</h2>
			{assessment && changes && panel.state === "ready" ? (
				<>
					<div className="mt-3 border-b border-slate-200 pb-4">
						<h3 className="text-2xl font-semibold leading-tight text-indigo-800">
							{assessment.regime}
						</h3>
						<p className="mt-1 max-w-prose text-sm text-slate-700">
							{assessment.reason}
						</p>
						{assessment.improving != null && (
							<p className="mt-2 text-sm text-slate-700">
								{assessment.improving} of 3 growth signals improving.{" "}
								{assessment.weakness} of 3 signaling weakness.
							</p>
						)}
						<p className="mt-2 text-sm text-slate-600">
							Assessment date{" "}
							<time dateTime={assessment.asOf}>
								{day.format(new Date(assessment.asOf))}
							</time>
							. Uses vintages through the preceding U.S. Central calendar day.
						</p>
					</div>
					{panel.sync.some((source) => source.error) && (
						<p className="mt-3 text-sm text-amber-900">
							Some series failed to sync. Available observations are shown with
							their original dates.
						</p>
					)}
					<dl className="divide-y divide-slate-200">
						{SERIES_IDS.map((id) => {
							const spec = SERIES[id];
							const row = assessment.data[id]?.[0];
							const sync = panel.sync.find((record) => record.seriesId === id);
							const [change, changeUnit] = changes[id];
							const status = observationStatus(id, row, assessment.asOf);
							return (
								<div
									key={id}
									className="grid gap-1 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-6"
								>
									<dt>
										<a
											href={seriesUrl(id)}
											className="inline-flex min-h-11 items-center rounded-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-indigo-800 active:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800"
										>
											{spec.name}
										</a>
										<p className="text-slate-600">{spec.publisher} via FRED</p>
									</dt>
									<dd className="min-w-0 space-y-1 text-slate-700">
										<p className="font-medium tabular-nums text-slate-900">
											{row?.value != null
												? `${number.format(row.value)}${spec.unit === "%" ? "%" : ` ${spec.unit.toLowerCase()}`}`
												: "Unavailable"}
											{change != null &&
												` (${(id === "NFCI" ? signedIndex : signed).format(change)}${changeUnit})`}
										</p>
										{hosted && id === "NFCI" ? (
											<p>See the linked source for the index.</p>
										) : (
											<p>
												{spec.frequency}, {status}.
												{row && (
													<>
														{" "}
														Period ending{" "}
														<time dateTime={periodEnd(id, row.date)}>
															{day.format(new Date(periodEnd(id, row.date)))}
														</time>
														. Vintage{" "}
														<time dateTime={row.vintageStart}>
															{day.format(new Date(row.vintageStart))}
														</time>
														.
													</>
												)}
											</p>
										)}
										{status === "Current" && change == null && (
											<p>Comparison unavailable.</p>
										)}
										{id === "NFCI" && change != null && (
											<p>
												{change > 0
													? "Conditions tightened"
													: change < 0
														? "Conditions eased"
														: "Conditions held steady"}{" "}
												over four weeks.
											</p>
										)}
										{sync?.lastSuccess && (
											<p className="text-slate-600">
												Synced{" "}
												<time dateTime={sync.lastSuccess}>
													{time.format(new Date(sync.lastSuccess))} WIB
												</time>
											</p>
										)}
										{sync?.error && (
											<p className="text-amber-900">{sync.error}</p>
										)}
									</dd>
								</div>
							);
						})}
					</dl>
					<details className="border-t border-slate-200 pt-1 text-sm text-slate-700">
						<summary className="min-h-11 cursor-pointer rounded-sm py-3 font-semibold text-slate-900 hover:text-indigo-800 active:text-indigo-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800">
							How the regime is classified
						</summary>
						<div className="max-w-prose space-y-2 pb-3">
							<p>
								Falling GDP, falling industrial production, and a rise of at
								least 0.5 percentage points between three-month unemployment
								averages count as weakness votes.
							</p>
							<p>
								Two weakness votes signal contraction risk, or stagflation risk
								if core inflation is at least 3% and rising. Two improving
								growth inputs indicate recovery after a weak assessment, or
								expansion when there are zero weakness votes. Other complete
								readings indicate slowdown.
							</p>
							<p>
								Model {assessment.modelVersion}. Policy and financial conditions
								are shown alongside the regime. Thresholds are research
								defaults.
							</p>
						</div>
					</details>
				</>
			) : (
				<p className="mt-3 text-sm text-slate-700">
					{panel.state === "error"
						? "Macro data is temporarily unavailable."
						: "Macro data has not been synced yet."}
				</p>
			)}
			<p className="mt-4 text-xs text-slate-600">
				This product uses the FRED® API but is not endorsed or certified by the
				Federal Reserve Bank of St. Louis.
			</p>
			{hosted && (
				<p className="text-xs text-slate-600">
					By using this panel, you agree to the{" "}
					<a
						href="https://fred.stlouisfed.org/docs/api/terms_of_use.html"
						className="inline-flex min-h-11 items-center rounded-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-800"
					>
						FRED API Terms of Use
					</a>
					.
				</p>
			)}
		</section>
	);
}
