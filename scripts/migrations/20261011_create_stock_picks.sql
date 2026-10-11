-- Migration: 20261011_create_stock_picks.sql
-- Description: Create stock_picks table for IDX Stockpick Simulator & Paper Trading Ledger
-- Author: Polma Tambunan

CREATE TABLE IF NOT EXISTS public.stock_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Instrument Identity
  stock_code VARCHAR(10) NOT NULL,
  stock_name VARCHAR(255) NOT NULL,
  sector VARCHAR(100),
  
  -- Position State ('active', 'closed', 'cancelled')
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
  
  -- Entry Parameters
  buy_price NUMERIC(15, 2) NOT NULL,
  quantity_lots INTEGER NOT NULL DEFAULT 1 CHECK (quantity_lots > 0),
  shares INTEGER GENERATED ALWAYS AS (quantity_lots * 100) STORED,
  target_price NUMERIC(15, 2),
  stop_loss_price NUMERIC(15, 2),
  entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Continuous Watermark Tracing
  highest_price_traced NUMERIC(15, 2) NOT NULL,
  highest_price_date TIMESTAMPTZ,
  lowest_price_traced NUMERIC(15, 2) NOT NULL,
  lowest_price_date TIMESTAMPTZ,
  
  -- Research & Attribution Context
  thesis VARCHAR(100) NOT NULL DEFAULT 'Compass Core Tranche',
  notes TEXT,
  
  -- Closed Position Analytics Snapshot
  closed_price NUMERIC(15, 2),
  closed_date TIMESTAMPTZ,
  exit_reason VARCHAR(50),
  exit_notes TEXT,
  realized_pl_nominal NUMERIC(15, 2),
  realized_pl_pct NUMERIC(8, 4),
  peak_gain_pct NUMERIC(8, 4),
  max_drawdown_pct NUMERIC(8, 4),
  holding_days INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_stock_picks_status ON public.stock_picks(status);
CREATE INDEX IF NOT EXISTS idx_stock_picks_stock_code ON public.stock_picks(stock_code);
CREATE INDEX IF NOT EXISTS idx_stock_picks_thesis ON public.stock_picks(thesis);
CREATE INDEX IF NOT EXISTS idx_stock_picks_closed_date ON public.stock_picks(closed_date DESC);
CREATE INDEX IF NOT EXISTS idx_stock_picks_entry_date ON public.stock_picks(entry_date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.stock_picks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view, insert, update, delete their own picks
-- Or public read if user_id is null / demo mode
CREATE POLICY "Users can manage own stock picks"
  ON public.stock_picks
  FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
