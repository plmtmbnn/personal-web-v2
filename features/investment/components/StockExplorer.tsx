"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Table as TableIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * IDX Stock Data Type Definition
 */
export interface IDXStock {
  StockCode: string;
  StockName: string;
  Previous: number;
  Open: number;
  High: number;
  Low: number;
  Close: number;
  Change: number;
  Volume: number;
  Value: number;
  Frequency: number;
  ForeignBuy: number;
  ForeignSell: number;
}

/**
 * Utility: Format Large Numbers (1.5M, 2.3B)
 */
const formatCompactNumber = (number: number) => {
  if (number === 0) return "0";
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
};

/**
 * Utility: Format Currency
 */
const formatCurrency = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(number);
};

type SortConfig = {
  key: keyof IDXStock | "ForeignNet" | "ChangePct";
  direction: "asc" | "desc" | null;
};

export default function StockExplorer() {
  const [stocks, setStocks] = useState<IDXStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "StockCode", direction: "asc" });
  const [visibleCount, setVisibleCount] = useState(20);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/idx/stock-summary");
      const result = await response.json();
      
      // If the API returned an error object, throw to trigger the catch block fallback
      if (result.error) {
        throw new Error(result.details || result.error);
      }
      
      // Handle different API response structures
      // MarketStatistics uses 'Data', older TradingSummary used 'data' or flat array
      const data = Array.isArray(result) ? result : (result.Data || result.data || []);
      setStocks(data);
    } catch (error) {
      console.error("Failed to fetch IDX summary:", error);
      // Fallback mock for development
      setStocks([
        { StockCode: "BBCA", StockName: "Bank Central Asia Tbk.", Previous: 10000, Close: 10250, Volume: 15000000, Value: 153000000000, ForeignBuy: 50000000, ForeignSell: 30000000, Change: 250, Open: 10000, High: 10300, Low: 9950, Frequency: 12000 },
        { StockCode: "BBRI", StockName: "Bank Rakyat Indonesia Tbk.", Previous: 4800, Close: 4750, Volume: 25000000, Value: 118000000000, ForeignBuy: 20000000, ForeignSell: 45000000, Change: -50, Open: 4800, High: 4850, Low: 4700, Frequency: 15000 },
        { StockCode: "TLKM", StockName: "Telkom Indonesia Tbk.", Previous: 3800, Close: 3950, Volume: 18000000, Value: 71000000000, ForeignBuy: 30000000, ForeignSell: 10000000, Change: 150, Open: 3800, High: 4000, Low: 3750, Frequency: 8000 },
        { StockCode: "GOTO", StockName: "GoTo Gojek Tokopedia Tbk.", Previous: 50, Close: 52, Volume: 500000000, Value: 26000000000, ForeignBuy: 10000000, ForeignSell: 15000000, Change: 2, Open: 50, High: 55, Low: 50, Frequency: 45000 },
        { StockCode: "ASII", StockName: "Astra International Tbk.", Previous: 5200, Close: 5200, Volume: 12000000, Value: 62400000000, ForeignBuy: 15000000, ForeignSell: 15000000, Change: 0, Open: 5200, High: 5300, Low: 5150, Frequency: 6000 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  /**
   * Performance Optimized Filtering & Sorting on the FULL dataset
   */
  const filteredAndSortedStocks = useMemo(() => {
    let result = stocks.map(stock => ({
      ...stock,
      ForeignNet: (stock.ForeignBuy || 0) - (stock.ForeignSell || 0),
      ChangePct: stock.Previous !== 0 ? ((stock.Close - stock.Previous) / stock.Previous) * 100 : 0
    }));

    // Local Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.StockCode.toLowerCase().includes(query) ||
          s.StockName.toLowerCase().includes(query)
      );
    }

    // Local Sort
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [stocks, searchQuery, sortConfig]);

  // Viewport-only slice for performance
  const visibleStocks = useMemo(() => {
    return filteredAndSortedStocks.slice(0, visibleCount);
  }, [filteredAndSortedStocks, visibleCount]);

  const hasMore = visibleCount < filteredAndSortedStocks.length;

  return (
    <section className="mt-12 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <TableIcon className="w-5 h-5 text-indigo-600" />
            IDX Stock Explorer
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Analyzing {stocks.length} instruments with foreign flow tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search Code or Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(20); // Reset pagination on search
              }}
              className="pl-11 pr-6 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all w-64"
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Financial Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <button onClick={() => handleSort("StockCode")} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    Stock <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <button onClick={() => handleSort("Close")} className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                    Price <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  <button onClick={() => handleSort("ChangePct")} className="flex items-center gap-2 ml-auto hover:text-indigo-600 transition-colors">
                    Change <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  <button onClick={() => handleSort("Volume")} className="flex items-center gap-2 ml-auto hover:text-indigo-600 transition-colors">
                    Volume <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                  <button onClick={() => handleSort("ForeignNet")} className="flex items-center gap-2 ml-auto hover:text-indigo-600 transition-colors">
                    Foreign Net <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading && stocks.length === 0 ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="h-10 w-32 bg-slate-100 rounded-xl" /></td>
                    <td className="px-6 py-6"><div className="h-4 w-16 bg-slate-100 rounded-lg" /></td>
                    <td className="px-6 py-6"><div className="h-4 w-20 bg-slate-100 rounded-lg ml-auto" /></td>
                    <td className="px-6 py-6"><div className="h-4 w-16 bg-slate-100 rounded-lg ml-auto" /></td>
                    <td className="px-8 py-6"><div className="h-4 w-24 bg-slate-100 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              ) : (
                <AnimatePresence mode="popLayout">
                  {visibleStocks.map((stock) => (
                    <motion.tr 
                      layout
                      key={stock.StockCode}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg shadow-lg">
                            {stock.StockCode}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{stock.StockName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-black text-slate-700">
                          {formatCurrency(stock.Close)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black ${
                          stock.Change > 0 ? "bg-emerald-50 text-emerald-600" : 
                          stock.Change < 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
                        }`}>
                          {stock.Change > 0 ? <TrendingUp className="w-3 h-3" /> : 
                           stock.Change < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                          {Math.abs(stock.ChangePct).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-xs font-bold text-slate-500">
                          {formatCompactNumber(stock.Volume)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`text-xs font-black ${
                          stock.ForeignNet > 0 ? "text-emerald-600" : 
                          stock.ForeignNet < 0 ? "text-rose-600" : "text-slate-400"
                        }`}>
                          {stock.ForeignNet > 0 ? "+" : ""}{formatCompactNumber(stock.ForeignNet)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!isLoading && filteredAndSortedStocks.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No stocks matched your search</p>
          </div>
        )}

        {/* Load More Pagination */}
        {hasMore && (
          <div className="p-12 flex justify-center bg-slate-50/30 border-t border-slate-100">
            <button
              onClick={() => setVisibleCount(prev => prev + 50)}
              className="px-8 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-slate-600 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all active:scale-95"
            >
              Load {filteredAndSortedStocks.length - visibleCount} more instruments
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
