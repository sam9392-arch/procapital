import React from "react";
import { Search } from "lucide-react";

interface StockSearchProps {
  onSearch: (query: string) => void;
  onSubmit: (query: string) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onSearch, onSubmit }) => {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        placeholder="Search stocks (e.g. AAPL, TSLA)..."
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit((e.target as HTMLInputElement).value);
          }
        }}
        className="w-full bg-gray-50/50 backdrop-blur-sm border border-gray-200/50 rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    </div>
  );
};
