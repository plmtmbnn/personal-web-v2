create table if not exists public.idx_daily_bars (
  symbol text not null,
  session date not null,
  provider text not null check (provider in ('idx', 'yahoo')),
  adjustment text not null check (adjustment in ('observed', 'split_adjusted')),
  open double precision not null,
  high double precision not null,
  low double precision not null,
  close double precision not null,
  volume double precision not null,
  turnover double precision,
  foreign_net double precision,
  discontinuity boolean not null default false,
  retrieved_at timestamptz not null,
  primary key (symbol, provider, session),
  check (open > 0 and close > 0 and low > 0 and
         high >= greatest(open, close, low) and low <= least(open, close) and volume >= 0)
);

create table if not exists public.market_research_snapshots (
  session date not null,
  version text not null,
  created_at timestamptz not null default now(),
  evidence jsonb not null,
  outcomes jsonb,
  primary key (session, version)
);

alter table public.idx_daily_bars enable row level security;
alter table public.market_research_snapshots enable row level security;
revoke all on public.idx_daily_bars, public.market_research_snapshots from anon, authenticated;
grant select, insert, update, delete on public.idx_daily_bars, public.market_research_snapshots to service_role;
alter table public.stock_picks add column if not exists trade_decision jsonb;
alter table public.stock_picks add column if not exists trade_review jsonb;
revoke all on public.stock_picks from public, anon, authenticated;
grant select, insert, update, delete on public.stock_picks to service_role;

create or replace function public.idx_research_bars(symbols text[], through_session date)
returns setof jsonb language sql stable set search_path = '' as $$
  select jsonb_build_object('symbol', s.symbol, 'bars',
    coalesce((select jsonb_agg(to_jsonb(b) order by b.session)
      from (
        (select * from public.idx_daily_bars
         where symbol = s.symbol and provider = 'idx' and session <= through_session
         order by session desc limit 520)
        union all
        (select * from public.idx_daily_bars
         where symbol = s.symbol and provider = 'yahoo' and session <= through_session
         order by session desc limit 520)
      ) b), '[]'::jsonb))
  from unnest(symbols) as s(symbol)
$$;
revoke all on function public.idx_research_bars(text[], date) from public, anon, authenticated;
grant execute on function public.idx_research_bars(text[], date) to service_role;

create or replace function public.prune_idx_research_bars(symbols text[])
returns void language sql set search_path = '' as $$
  delete from public.idx_daily_bars as b
  using (
    select symbol, provider, session,
      row_number() over (partition by symbol, provider order by session desc) as ordinal
    from public.idx_daily_bars where symbol = any(symbols)
  ) older
  where b.symbol = older.symbol and b.provider = older.provider
    and b.session = older.session and older.ordinal > 520
$$;
revoke all on function public.prune_idx_research_bars(text[]) from public, anon, authenticated;
grant execute on function public.prune_idx_research_bars(text[]) to service_role;

notify pgrst, 'reload schema';
