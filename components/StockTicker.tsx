"use client";

import { useEffect, useState } from "react";

interface StockData {
  symbol: string;
  shortName: string;
  exchange: string;
  change: string;
  change_pct: string;
  last: string;
}

export default function StockTicker() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = async () => {
    try {
      const response = await fetch(
        "https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=.HSI%7C.NSEI%7C.NZ50%7C.KLSE%7C.TWII%7C.N225%7C.AXJO%7C.SSEC%7C.SZI%7C.KS11%7C.SETI%7C.STI%7C.IECNCGP%7CSGD%3D%7CCNY%3D%7CAUD%3D%7CINR%3D%7CNZD%3D%7CJPY%3D%7CHKD%3D%7CEURJPY%3D%7C%40LCO.1%7C%40CL.1%7C%40NG.1%7C%40HG.1&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1"
      );
      const data = await response.json();
      const quotes = data.FormattedQuoteResult.FormattedQuote;
      if (Array.isArray(quotes)) {
        setStocks(quotes);
      }
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch stock data:", error);
    }
  };

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 15000); // 15s polling
    return () => clearInterval(interval);
  }, []);

  if (loading && stocks.length === 0) {
    return (
      <div className="w-full bg-slate-50 border-b border-slate-200 py-2 overflow-hidden">
        <div className="animate-pulse flex justify-center gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-32 bg-slate-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm overflow-hidden group">
      <div className="flex whitespace-nowrap animate-scroll hover:pause-scroll py-3">
        {/* Render twice for seamless loop */}
        {[...stocks, ...stocks].map((stock, idx) => {
          const isPositive = !stock.change.startsWith("-");
          return (
            <div
              key={`${stock.symbol}-${idx}`}
              className="inline-flex items-center gap-3 px-6 border-r border-slate-100 last:border-0"
            >
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                  {stock.shortName || stock.symbol}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {stock.exchange}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                  {isPositive ? "+" : ""}{stock.change}
                </span>
                <span className={`text-[10px] font-semibold px-1 rounded ${isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  {stock.change_pct}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Live Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 pl-4 py-1 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Updates</span>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: inline-flex;
          animation: scroll 60s linear infinite;
        }
        .group:hover .animate-scroll {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
