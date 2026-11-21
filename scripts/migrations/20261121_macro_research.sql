begin;

create table if not exists public.macro_observations (
  series_id text not null check (series_id in ('GDPC1', 'INDPRO', 'UNRATE', 'PCEPILFE', 'FEDFUNDS')),
  date date not null,
  vintage_start date not null,
  vintage_end date not null check (vintage_end >= vintage_start),
  value double precision check (value > '-Infinity' and value < 'Infinity'),
  fetched_at timestamptz not null,
  primary key (series_id, date, vintage_start)
);

create table if not exists public.macro_sync_status (
  series_id text primary key check (series_id in ('GDPC1', 'INDPRO', 'UNRATE', 'PCEPILFE', 'FEDFUNDS')),
  attempted_at timestamptz not null,
  last_success timestamptz not null,
  cutoff date not null,
  error text
);

alter table public.macro_observations enable row level security;
alter table public.macro_sync_status enable row level security;
revoke all on public.macro_observations, public.macro_sync_status from public, anon, authenticated;
grant select, insert, update on public.macro_observations, public.macro_sync_status to service_role;

create or replace function public.seed_macro_series(p_status jsonb, p_rows jsonb)
returns integer language plpgsql set search_path = '' as $$
declare
  inserted integer;
begin
  insert into public.macro_sync_status
  select * from jsonb_populate_record(null::public.macro_sync_status, p_status)
  on conflict (series_id) do nothing;
  if not found then
    return 0;
  end if;

  insert into public.macro_observations (series_id, date, vintage_start, vintage_end, value, fetched_at)
  select p_status->>'series_id', date, vintage_start, vintage_end, value, fetched_at
  from jsonb_populate_recordset(null::public.macro_observations, p_rows);
  get diagnostics inserted = row_count;
  if inserted = 0 then
    raise exception 'Macro series must have observations';
  end if;
  return inserted;
end;
$$;

create or replace function public.read_macro_window(p_from date, p_through date)
returns jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object(
    'observations', coalesce((
      select jsonb_object_agg(series_id, rows)
      from (
        select series_id, jsonb_agg(jsonb_build_object(
          'date', date, 'vintageStart', vintage_start, 'vintageEnd', vintage_end,
          'value', value, 'fetchedAt', fetched_at
        ) order by date desc) as rows
        from (
          select distinct on (o.series_id, o.date) o.*
          from public.macro_observations o
          join public.macro_sync_status s using (series_id)
          where o.date between p_from and p_through
            and p_through between o.vintage_start and o.vintage_end
          order by o.series_id, o.date desc, o.vintage_start desc
        ) effective
        group by series_id
      ) by_series
    ), '{}'::jsonb),
    'sync', coalesce((
      select jsonb_agg(jsonb_build_object(
        'seriesId', series_id, 'attemptedAt', attempted_at,
        'lastSuccess', last_success, 'cutoff', cutoff, 'error', error
      ) order by series_id)
      from public.macro_sync_status
    ), '[]'::jsonb)
  );
$$;

create or replace function public.commit_macro_sync(
  p_series text, p_start date, p_cutoff date, p_attempted_at timestamptz,
  p_rows jsonb, p_error text
)
returns void language plpgsql set search_path = '' as $$
declare
  previous public.macro_sync_status%rowtype;
begin
  select * into strict previous from public.macro_sync_status
  where series_id = p_series for update;

  if previous.attempted_at > p_attempted_at
     or (p_cutoff is not null and previous.cutoff > p_cutoff) then
    return;
  end if;

  if p_error is not null then
    update public.macro_sync_status set attempted_at = p_attempted_at, error = p_error
    where series_id = p_series;
    return;
  end if;

  with incoming as materialized (
    select * from jsonb_to_recordset(p_rows) as r(
      date date, "vintageStart" date, "vintageEnd" date, value double precision, "fetchedAt" timestamptz
    )
  ), clipped as (
    -- FRED clips some intervals to the request boundary. Preserve the original start.
    update public.macro_observations o set vintage_end = r."vintageEnd"
    from incoming r
    where o.series_id = p_series and o.date = r.date and r."vintageStart" = p_start
      and o.vintage_start < p_start and o.vintage_end >= p_start
      and o.value is not distinct from r.value
    returning o.date
  )
  insert into public.macro_observations (series_id, date, vintage_start, vintage_end, value, fetched_at)
  select p_series, r.date, r."vintageStart", r."vintageEnd", r.value, r."fetchedAt"
  from incoming r
  where r."vintageStart" <> p_start or not exists (select 1 from clipped c where c.date = r.date)
  on conflict (series_id, date, vintage_start) do update
    set vintage_end = excluded.vintage_end, value = excluded.value, fetched_at = excluded.fetched_at;

  update public.macro_sync_status
    set attempted_at = p_attempted_at, last_success = statement_timestamp(), cutoff = p_cutoff, error = null
    where series_id = p_series;
end;
$$;

revoke all on function public.seed_macro_series(jsonb, jsonb), public.read_macro_window(date, date),
  public.commit_macro_sync(text, date, date, timestamptz, jsonb, text) from public, anon, authenticated;
grant execute on function public.seed_macro_series(jsonb, jsonb), public.read_macro_window(date, date),
  public.commit_macro_sync(text, date, date, timestamptz, jsonb, text) to service_role;

notify pgrst, 'reload schema';
commit;
