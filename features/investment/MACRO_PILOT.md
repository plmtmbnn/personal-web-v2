# U.S. macro conditions

## Product brief

Investment Compass readers can inspect the U.S. economic regime, its drivers, and the data available at the assessment date. Keep Compass v4 as the source of trading permissions, sizing, and playbooks. Local development uses native Node SQLite. Vercel uses the project's Supabase database and a protected scheduled refresh.

Design read: a financial research panel for Compass readers, using its white card, slate typography, and indigo accent. Energy 1, rhythm 2, motion 1. Give the regime the strongest type, then show inputs in comparable rows with tabular numbers. Stack the rows on phones. Reserve the accent for the assessment and use visible keyboard focus for sources and rule details. No new assets are needed.

## Source feasibility

The pilot uses `GET https://api.stlouisfed.org/fred/series/observations` with a personal API key, `units=lin`, and real-time intervals. A keyed request from this workspace returned HTTP 200 and vintage rows for all six series on 2026-11-21. The start dates below are the published observation range. The pilot requests observations from January 2000 and records actual vintage coverage separately. The first returned NFCI vintage for the requested history started in May 2011. The stored history is the outage fallback for every pilot series. [API and pagination](https://fred.stlouisfed.org/docs/api/fred/series_observations.html) · [Usage and attribution terms](https://fred.stlouisfed.org/docs/api/terms_of_use.html)

| Pilot input                  | Source                                                                           | Published start and cadence | Use                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| Real GDP                     | [BEA via FRED `GDPC1`](https://fred.stlouisfed.org/data/GDPC1)                   | 1947, quarterly             | Compute nonannualized quarter-over-quarter growth from the chain-dollar level.           |
| Industrial production        | [Federal Reserve via FRED `INDPRO`](https://fred.stlouisfed.org/data/INDPRO)     | 1919, monthly               | Compare three-month index growth with the preceding three months.                        |
| Unemployment                 | [BLS via FRED `UNRATE`](https://fred.stlouisfed.org/data/UNRATE)                 | 1948, monthly               | Compare three-month averages in percentage points.                                       |
| Core PCE                     | [BEA via FRED `PCEPILFE`](https://fred.stlouisfed.org/data/PCEPILFE)             | 1959, monthly               | Compute YoY inflation from the index and compare it with three months earlier.           |
| Effective federal funds rate | [Federal Reserve via FRED `FEDFUNDS`](https://fred.stlouisfed.org/data/FEDFUNDS) | July 1954, monthly          | Show the monthly effective rate and its three-month change.                              |
| Financial conditions         | [Chicago Fed via FRED `NFCI`](https://fred.stlouisfed.org/data/NFCI)             | 1971, weekly ending Friday  | Show the index level and four-week change. A rise indicates tightening over that window. |

Broader coverage is a candidate list. A future adapter needs a successful access check, usable history and dates, update cadence, currency, and terms recorded for each series before activation. Restricted or unresolved series stay unavailable. An import is a fallback only when the file and its use rights are established.

| Requested coverage                                                                                                | Candidate source or acquisition                                                                                             | Readiness and fallback                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PMI, new orders                                                                                                   | Original publisher release or licensed CSV/XLSX                                                                             | API and reuse rights unresolved. Leave unavailable.                                                                                                                                                                              |
| OECD CLI, global trade, international GDP, inflation, policy and credit                                           | OECD SDMX, World Bank Indicators, IMF SDMX, ECB Data Portal                                                                 | Select country/aggregate and versioned dataset keys in the next phase. Verify historical revisions and time of availability. Approved files can fill gaps.                                                                       |
| Retail sales, CPI/core CPI, headline PCE, Treasury 2Y/10Y, yield curve, real yields, breakevens, M2, broad dollar | FRED candidates `RSAFS`, `CPIAUCSL`, `CPILFESL`, `PCEPI`, `DGS2`, `DGS10`, `T10Y2Y`, `DFII10`, `T10YIE`, `M2SL`, `DTWEXBGS` | Quarterly/monthly or daily as published per series. Verify vintages and coverage before adding. Broad dollar has its own scale.                                                                                                  |
| High-yield spreads, VIX, S&P 500, Nasdaq Composite                                                                | FRED `BAMLH0A0HYM2`, `VIXCLS`, `SP500`, `NASDAQCOM`                                                                         | Daily close candidates. Review third-party terms first. ICE limits FRED history to three years and restricts redistribution. Leave restricted displays unavailable. [ICE notes](https://fred.stlouisfed.org/series/BAMLH0A0HYM2) |
| Gold, Brent, copper, coal, nickel, CPO                                                                            | World Bank Pink Sheet monthly historical workbook                                                                           | Verify current benchmark, units, currencies, release history, and workbook terms. IDR gold conversion requires aligned USD/IDR and a documented weight unit. Leave gaps visible.                                                 |
| BTC and ETH                                                                                                       | CoinGecko Demo or Binance public market data                                                                                | Verify free historical lookback, symbol type, request limits and access from the target region. Treat stablecoin-quoted and USD-quoted instruments separately.                                                                   |
| BI rate, JISDOR, CPI, GDP, sovereign bonds, IHSG, IDX sectors and foreign flows                                   | Bank Indonesia and SEKI, BPS, IDX/OJK reports, or permitted official files                                                  | Reuse the existing BI and CPI mappings where verified. Validate other datasets individually. No confirmed free, equivalent yield-spread replacement. Missing observations remain unavailable.                                    |

## Architecture and contracts

Both sync paths validate FRED rows and commit each completed series in a transaction. SQLite stores the local raw pages and observations. Supabase stores normalized observation vintages and sync checkpoints. Both readers use a publish-date cutoff, calculate the regime in TypeScript, and render a server-side panel inside `/investment`. The browser never receives database credentials, the FRED key, the filesystem path, or raw provider responses.

| Store           | Key and contents                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Series registry | Series ID, provider, official source URL, name, unit, currency if applicable, frequency, and freshness window.                                                              |
| Raw pages       | Series and request window/page identity, JSON payload, and retrieval timestamp. Request keys contain no credentials.                                                        |
| Observations    | Series ID, observation date, vintage start (availability date), vintage end, finite value or explicit missing, and fetch time. Identity is series, date, and vintage start. |
| Sync status     | Series ID, last attempt, last completed vintage cutoff, last success, and bounded error category.                                                                           |

The internal readers accept an evaluation date. They return empty when no sync exists, ready with a versioned assessment and per-series observations when storage is readable, and a storage-error state when the database cannot be read. Figure evidence includes the series, period, value, availability date, data status, and retrieval timestamp. A partial or failed sync retains usable observations and identifies affected sources.

## Analytical methodology

Use the vintage effective on the day before the assessment date because release times are not known. Retain original period labels and compute comparisons at exact period offsets. Freshness limits from period end are 150 days quarterly, 75 days monthly, and 21 days weekly. Missing or expired core evidence yields Insufficient data. The economic regime uses GDP, production, unemployment, and inflation. The Fed Funds rate and NFCI describe policy and financial conditions alongside it.

Weakness votes are falling GDP, falling industrial production, and unemployment up at least 0.5 percentage points. Stagflation risk takes priority when at least two votes coincide with core PCE of at least 3% and rising inflation. Otherwise two votes imply contraction or recession risk. Recovery requires two improving growth measures after a preceding weak assessment. Expansion requires two improving measures with zero weakness votes. Other combinations produce slowdown. Show the rule inputs and label the thresholds as research defaults.

## Local setup

1. Set your personal `FRED_API_KEY` in `.env.local` or the environment. Run `pnpm macro:sync` from the repository root. The first run downloads historical vintages. Subsequent runs fetch new or overlapping vintages and update the same ignored SQLite file. Set `MACRO_RESEARCH_DB` in both processes if you want a different persistent path.
2. Set `MACRO_RESEARCH_ENABLED=1` for the local Next.js process and run `pnpm dev --hostname 127.0.0.1`. Open `/investment` and find U.S. macro conditions below Market conditions. Reload after syncing. The panel is disabled by default.
3. To refresh daily, set a Windows Task Scheduler action to the full path to `pnpm.cmd`, with arguments `macro:sync` and the repository root as its working directory. Run it daily at 07:00 WIB. On a Linux host, use a crontab configured for `Asia/Jakarta` with `0 7 * * * cd /path/to/personal-web-v2 && /path/to/pnpm macro:sync`. Schedule one runner per database. Log nonzero exits and check the panel for per-series sync results. No service is required between syncs.
4. Run `pnpm test`, `pnpm typecheck`, and `pnpm check`. Verify source links, keyboard operation of the rule disclosure, and narrow/mobile wrapping. Check that a provider failure preserves prior data and that disabling the panel removes it from the route.

## Vercel setup

1. Run [the macro migration](../../scripts/migrations/20261121_macro_research.sql) in the existing Supabase project's SQL Editor. The tables and functions are restricted to server-side `service_role` access.
2. Run `pnpm macro:sync` to bring SQLite up to date. With the target project's `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` available in `.env.local` or the terminal environment, run `pnpm macro:seed:postgres`. It copies the five eligible series, preserves their dates and checkpoints, and leaves any previously imported series in place. The import is atomic per series and safe to rerun.
3. Set `MACRO_RESEARCH_ENABLED=1`, `FRED_API_KEY`, and `CRON_SECRET` in Vercel Production. Set `SUPABASE_SERVICE_ROLE_KEY` for the same Supabase project used by `NEXT_PUBLIC_SUPABASE_URL`. Keep credentials server-side. Deploy through the repository's normal release workflow, which deploys `chore(release):` commits on `master`.
4. Keep your existing external job for `GET https://polmatambunan.my.id/api/investment/cron/snapshot` on its current schedule. It also refreshes the hosted macro data using the existing `CRON_SECRET`. Run the job once after deployment and look for `macroSync.state: "synced"` and updated sync timestamps on `/investment`. Check `macroSync` for partial or failed refreshes even when the snapshot returns HTTP 200. Set `MACRO_RESEARCH_ENABLED=0` and redeploy to pause macro refreshes.

The hosted series are GDPC1, INDPRO, UNRATE, PCEPILFE, and FEDFUNDS. Their FRED pages mark them Public Domain: Citation Requested. The public panel links to [NFCI](https://fred.stlouisfed.org/series/NFCI) and keeps its values in SQLite pending redistribution permission from the Chicago Fed. See the [FRED API terms](https://fred.stlouisfed.org/docs/api/terms_of_use.html).

## Roadmap and limits

1. Deliver the local FRED sync, evidence and regime panel, and rerunnable checks.
2. Add vetted international and asset feeds, authorized CSV/XLSX import, source health, and separate stress and risk-appetite models. Review data rights before publishing each series.
3. Test growth against equities, copper, and Brent, inflation and rates against gold and bonds, and dollar/financial conditions against BTC, ETH, and IHSG. These are research hypotheses. Use source-aligned returns after publication, explicitly count observations, and show uncertainty for correlations and regime results. A date-only release takes effect no sooner than the next eligible trading session for an asset.
4. Add rolling/lead-lag studies, walk-forward evaluation, scenario outlooks, and regime stability checks. Keep observed facts, historical relationships, and interpretation visibly distinct.

Provider outages, benchmark definitions, revision coverage, and third-party redistribution rights limit conclusions. No local pilot classification should be used to relax live Compass risk controls.

## Verification record

- Data: live backfill and incremental refresh succeeded for all six series. The local database contained 428,316 observation versions after the incremental run. Each latest displayed observation and vintage matched a separate FRED request.
- Correctness: 786 tests passed. Typecheck and Biome passed. Fixtures cover the six regimes, rule boundaries, exact period offsets, release-day revision exclusion, page validation, retry after `429`, retention after failure, and empty versus unreadable storage.
- Responsive and contrast: Chrome at 320, 390, 768, and 1440px showed no panel overflow. Controls measured at least 44px high. The lowest measured panel text contrast was 7.58:1 on the white surface.
- Interaction: Enter opened and closed the regime explanation with visible focus at all four widths. Each of the six source links navigated to its corresponding FRED series URL. The disabled route returned 200 and retained Trading limits. The pilot follows the existing fixed light surface and adds no motion, images, placeholder data, or navigation destinations beyond those source links.
- Browser limitation: the shared page metadata still requests `/favicon-16x16.png`, which returns 404. Physical-device testing and a production build were outside this run.
