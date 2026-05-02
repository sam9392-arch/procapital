import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface TradingViewWidgetProps {
  symbol: string;
}

export const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (!container.current) return;

    // Map common names to TradingView symbols if needed
    let tvSymbol = symbol;
    if (symbol === "S&P 500") tvSymbol = "SPY";
    if (symbol === "Dow Jones") tvSymbol = "DJI";
    if (symbol === "NASDAQ") tvSymbol = "IXIC";
    if (symbol === "NIFTY 50") tvSymbol = "NSE:NIFTY";
    if (symbol === "SENSEX") tvSymbol = "BSE:SENSEX";
    if (symbol === "RELIANCE" || symbol === "RELIANCE INDUSTRIES") tvSymbol = "NSE:RELIANCE";
    if (symbol === "TCS" || symbol === "TATA CONSULTANCY") tvSymbol = "NSE:TCS";
    if (symbol === "HDFC" || symbol === "HDFCBANK") tvSymbol = "NSE:HDFCBANK";
    if (symbol === "INFY" || symbol === "INFOSYS") tvSymbol = "NSE:INFY";
    if (symbol === "ICICI" || symbol === "ICICIBANK") tvSymbol = "NSE:ICICIBANK";
    if (symbol === "WIPRO") tvSymbol = "NSE:WIPRO";
    if (symbol === "ADANI" || symbol === "ADANIENT") tvSymbol = "NSE:ADANIENT";
    if (symbol === "SBI" || symbol === "SBIN") tvSymbol = "NSE:SBIN";
    if (symbol === "Bitcoin" || symbol === "BTC") tvSymbol = "BINANCE:BTCUSDT";
    if (symbol === "Ethereum" || symbol === "ETH") tvSymbol = "BINANCE:ETHUSDT";
    if (symbol === "Solana" || symbol === "SOL") tvSymbol = "BINANCE:SOLUSDT";
    if (symbol === "Cardano" || symbol === "ADA") tvSymbol = "BINANCE:ADAUSDT";
    if (symbol === "Dogecoin" || symbol === "DOGE") tvSymbol = "BINANCE:DOGEUSDT";
    if (symbol === "EUR/USD" || symbol === "EURUSD") tvSymbol = "FX:EURUSD";
    if (symbol === "GBP/USD" || symbol === "GBPUSD") tvSymbol = "FX:GBPUSD";
    if (symbol === "USD/JPY" || symbol === "USDJPY") tvSymbol = "FX:USDJPY";
    if (symbol === "AUD/USD" || symbol === "AUDUSD") tvSymbol = "FX:AUDUSD";
    if (symbol === "USD/INR" || symbol === "USDINR") tvSymbol = "FX_IDC:USDINR";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      hide_legend: false,
      save_image: false
    });

    const currentContainer = container.current;
    currentContainer.innerHTML = "";
    currentContainer.appendChild(script);

    return () => {
      if (currentContainer) {
        currentContainer.innerHTML = "";
      }
    };
  }, [symbol, theme]);

  return (
    <div className="bg-white/80 backdrop-blur-md p-2 rounded-3xl border border-white/20 shadow-sm h-[500px] overflow-hidden flex flex-col transition-colors duration-300">
      <div className="p-4 flex justify-between items-center bg-white/50 backdrop-blur-sm border-b border-gray-100">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full" />
            {symbol} Markets
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Price (Candles)</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2 text-xs font-bold text-gray-600"
          >
            {theme === "light" ? (
              <>
                <Moon size={16} />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun size={16} />
                <span>Light Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
      <div className="flex-1 w-full relative" ref={container}>
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm italic">
          Loading Technical Chart...
        </div>
      </div>
    </div>
  );
};
