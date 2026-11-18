# Investment Compass source reliability, model 4.0.0

The investment strategy and score thresholds remain unchanged. The 100-point
factor budget is established before data availability is checked. Missing macro
carry no longer increases the weights of surviving local factors. Carry coverage
also reflects the coverage of its upstream Global regime.

Coverage below 50% or missing core price/trend evidence pauses new entries,
including DCA. Between 50% and 70%, permissions cannot exceed Selective. Missing
BI policy rate, IDX flow, or crypto stablecoin liquidity also caps the affected
market at Selective. Existing stricter stress and defensive restrictions apply.

## Source mappings

- Quote health uses the current instrument registry. Retired backup entries are
  removed on the next quote cache write. CNBC observations with invalid or stale
  dates trigger Yahoo fallback. Yahoo retains full quote timestamps.
- FRED retains its nine US series. Empty observations are failed reads. The five
  monthly series use calendar period end for their 75-day freshness window while
  retaining FRED's original period-start labels. Daily series retain seven-day
  freshness windows. Cached frequency labels do not override the source registry.
- `BI_POLICY_RATE` uses Bank Indonesia's dated BI-rate chart or table. BIS daily
  policy rates are a fallback only within seven days of observation. The BIS
  comparison uses the prior month's last rate and the latest rate.
- `ID_CPI_YOY` uses Bank Indonesia's published YoY percentage without another
  transformation. Monthly dates remain period starts; freshness uses the period
  end with a 75-day limit.
- The FRED mappings `IRSTCB01IDM156N`, `IRLTLT01IDM156N`, and `IDNCPIALLMINMEI`
  are retired. The optional Indonesian sovereign yield-spread adjustment is
  disabled. The terminal displays BI policy rate and real BI policy rate instead.
- Stablecoin supply uses USD-valued USD-pegged circulation. Unix-second strings
  are parsed numerically. The 30-day baseline must be at or before the target
  date and no more than two days earlier.
- Stablecoin and derivatives refreshes preserve the other feed's last valid
  values, observation timestamps, provider, and retrieval timestamps.
- IDX refreshes summaries that trail the latest completed trading session.
  Completed summaries are stored separately from intraday summaries. In-flight
  refreshes are shared within a server instance; separate instances may fetch
  concurrently. Session dates and numeric fields are validated before caching.

## Deployment and verification

No database migration, paid subscription, or new credential is required. Macro
and crypto-flow caches use `:v4` keys and the aggregate Next cache uses a new
version. Historical snapshots are retained; score comparisons require matching
model versions.

Before production rollout, check BI, BIS, DefiLlama, and the IDX endpoint from
the hosting region. BI pages are public HTML and their markup can change; the
parser fails closed if neither chart nor dated table is usable. The panel shows
Current, Partial, Stale, or Unavailable with observation and retrieval metadata.
Do not extend freshness windows to conceal a provider outage.

Verification commands:

```powershell
pnpm test
pnpm typecheck
pnpm run check
```

Unit and component fixtures cover source parsing, provider fallbacks, retired
entries, missing evidence, partial refreshes, IDX session rollover, coverage
boundaries, and permission restrictions. Local live adapter checks on
2026-11-18 confirmed BI policy rate, CPI, and stablecoin observations.
