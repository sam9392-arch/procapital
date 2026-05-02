import React, { useState } from "react";
import { StockData } from "../types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

interface MarketOverviewProps {
  data: StockData[];
  onSelect: (symbol: string) => void;
  selectedSymbol?: string;
  title?: string;
  defaultCategory?: "Stock" | "Forex" | "Crypto" | "All";
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({ 
  data, 
  onSelect, 
  selectedSymbol,
  title,
  defaultCategory = "All"
}) => {
  const [activeFilter, setActiveFilter] = useState<"Stock" | "Forex" | "Crypto" | "All">(defaultCategory);

  const categories: ("All" | "Stock" | "Forex" | "Crypto")[] = ["All", "Stock", "Forex", "Crypto"];

  const filteredData = activeFilter === "All" 
    ? data 
    : data.filter(stock => stock.category === activeFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {title && (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        )}
        
        <div className="flex items-center gap-1 bg-white/50 p-1 rounded-xl border border-white/20 backdrop-blur-sm self-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                activeFilter === cat 
                  ? "bg-slate-900 text-white shadow-md scale-105" 
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredData.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              className={cn(
                "p-5 rounded-2xl border transition-all cursor-pointer group relative",
                selectedSymbol === stock.symbol 
                  ? "bg-white border-blue-500/30 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] -translate-y-2 scale-[1.02] z-10" 
                  : "bg-white/70 backdrop-blur-md border-white/20 shadow-sm hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <img 
                    src={`https://s3-symbol-logo.tradingview.com/${stock.symbol.toLowerCase()}--big.svg`}
                    alt=""
                    className="w-10 h-10 rounded-xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-1 border border-gray-100 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] group-hover:-translate-y-0.5 transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${stock.symbol}&background=random`;
                    }}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-500 text-xs tracking-wider uppercase">{stock.symbol}</h3>
                      {stock.category && (
                        <span className="text-[8px] font-black bg-gray-100 text-gray-400 px-1 rounded uppercase">{stock.category}</span>
                      )}
                    </div>
                    <p className="text-2xl font-semibold tracking-tight">
                      {stock.region === "Indian" ? "₹" : "$"}
                      {stock.price.toLocaleString(stock.region === "Indian" ? "en-IN" : "en-US")}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    stock.change >= 0 ? "bg-green-50 text-green-700 font-bold" : "bg-red-50 text-red-700 font-bold"
                  )}
                >
                  {stock.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-bold",
                    stock.change >= 0 ? "text-green-700" : "text-red-700"
                  )}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-tight">Today</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/50 border border-dashed border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-400 text-sm font-medium">No results found for this category</p>
        </div>
      )}
    </div>
  );
};
