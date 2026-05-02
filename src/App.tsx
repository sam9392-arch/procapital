import React, { useState, useEffect } from "react";
import { MarketOverview } from "./components/MarketOverview";
import { TradingViewWidget } from "./components/TradingViewWidget";
import { NewsFeed } from "./components/NewsFeed";
import { HorizontalNewsFeed } from "./components/HorizontalNewsFeed";
import { AIAssistant } from "./components/AIAssistant";
import { StockSearch } from "./components/StockSearch";
import { AlertManager } from "./components/AlertManager";
import { StockData, NewsItem, StockAlert, Notification } from "./types";
import { analyzeNewsForAlerts } from "./services/aiNewsService";
import { MOCK_STOCKS, MOCK_CHART_DATA } from "./constants";
import { LayoutDashboard, Newspaper, LineChart, Wallet, Settings, Bell, User, ShieldCheck, X } from "lucide-react";
import { cn } from "./lib/utils";
import { motion, AnimatePresence } from "motion/react";

import { BackgroundDecoration } from "./components/BackgroundDecoration";

export default function App() {
  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("S&P 500");
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(() => {
    return localStorage.getItem("procapital_terms_agreed") === "true";
  });
  const [alerts, setAlerts] = useState<StockAlert[]>(() => {
    const saved = localStorage.getItem("stock_alerts");
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  const [marketStatus, setMarketStatus] = useState<{ nse: boolean; nyse: boolean; crypto: boolean }>({
    nse: false,
    nyse: false,
    crypto: true,
  });

  const handleAgreeTerms = () => {
    localStorage.setItem("procapital_terms_agreed", "true");
    setHasAgreedTerms(true);
  };

  const handleAddAlert = (newAlert: Omit<StockAlert, "id" | "createdAt" | "isActive">) => {
    const alert: StockAlert = {
      ...newAlert,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isActive: true
    };
    const updated = [...alerts, alert];
    setAlerts(updated);
    localStorage.setItem("stock_alerts", JSON.stringify(updated));
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("stock_alerts", JSON.stringify(updated));
  };

  const checkAlerts = (data: StockData[]) => {
    const triggered: StockAlert[] = [];
    const remainingAlerts: StockAlert[] = [];

    alerts.forEach(alert => {
      const stock = data.find(s => s.symbol === alert.symbol);
      if (!stock) {
        remainingAlerts.push(alert);
        return;
      }

      const isTriggered = alert.condition === 'above' 
        ? stock.price >= alert.targetPrice 
        : stock.price <= alert.targetPrice;

      if (isTriggered && alert.isActive) {
        triggered.push(alert);
        
        const newNotification: Notification = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Price Alert: ${alert.symbol}`,
          message: `${alert.symbol} has gone ${alert.condition} ${alert.targetPrice}! Current price: ${stock.price}`,
          time: new Date().toLocaleTimeString(),
          isRead: false,
          type: 'alert'
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        setActiveNotification(newNotification);
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          setActiveNotification(prev => prev?.id === newNotification.id ? null : prev);
        }, 8000);
      } else {
        remainingAlerts.push(alert);
      }
    });

    if (triggered.length > 0) {
      setAlerts(remainingAlerts);
      localStorage.setItem("stock_alerts", JSON.stringify(remainingAlerts));
    }
  };

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const utcDay = now.getUTCDay(); // 0 is Sunday, 6 is Saturday
      const utcHours = now.getUTCHours();
      const utcMinutes = now.getUTCMinutes();
      const utcTimeDecimal = utcHours + utcMinutes / 60;

      const isWeekend = utcDay === 0 || utcDay === 6;

      // Indian Market (NSE): 9:15 AM - 3:30 PM IST (UTC+5:30)
      // UTC translation: 3:45 AM - 10:00 AM UTC
      const nseOpen = !isWeekend && utcTimeDecimal >= 3.75 && utcTimeDecimal <= 10;

      // US Market (NYSE/NASDAQ): 9:30 AM - 4:00 PM ET (Approx UTC-4)
      // UTC translation: 1:30 PM - 8:00 PM UTC
      const nyseOpen = !isWeekend && utcTimeDecimal >= 13.5 && utcTimeDecimal <= 20;

      setMarketStatus({
        nse: nseOpen,
        nyse: nyseOpen,
        crypto: true, // 24/7
      });
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial fetch from our server
    const fetchData = async () => {
      try {
        const [marketRes, newsRes, globalNewsRes] = await Promise.all([
          fetch("/api/market-summary"),
          fetch(`/api/stock-news?symbol=${selectedSymbol}`),
          fetch("/api/news")
        ]);
        const marketJson = await marketRes.json();
        const newsJson = await newsRes.json();
        const globalJson = await globalNewsRes.json();
        
        setMarketData(marketJson);
        setNews(activeTab === "Global News" ? globalJson : newsJson);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
    // Simulate real-time updates for prices and news every 30 seconds
    const interval = setInterval(async () => {
       try {
         const [marketRes, newsRes, globalNewsRes] = await Promise.all([
           fetch("/api/market-summary"),
           fetch(`/api/stock-news?symbol=${selectedSymbol}`),
           fetch("/api/news")
         ]);
         const marketJson = await marketRes.json();
         const newsJson = await newsRes.json();
         const globalJson = await globalNewsRes.json();
         
         setMarketData(marketJson);
         setNews(activeTab === "Global News" ? globalJson : newsJson);
         checkAlerts(marketJson);
       } catch (e) {
         console.warn("Polling error:", e);
       }
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  useEffect(() => {
    if (news.length === 0 || isAiAnalyzing) return;

    const analyzeNews = async () => {
      setIsAiAnalyzing(true);
      try {
        const aiAlerts = await analyzeNewsForAlerts(news);
        if (aiAlerts.length > 0) {
          setNotifications(prev => [...aiAlerts, ...prev]);
          setActiveNotification(aiAlerts[0]);
          
          // Auto-dismiss after 10 seconds (AI insights might be longer)
          setTimeout(() => {
            setActiveNotification(prev => aiAlerts.some(a => a.id === prev?.id) ? null : prev);
          }, 10000);
        }
      } catch (err) {
        console.error("AI Analysis error:", err);
      } finally {
        setIsAiAnalyzing(false);
      }
    };

    // Analyze news every 1 minute to keep it fresh without overloading
    analyzeNews();
    const interval = setInterval(analyzeNews, 60000);
    return () => clearInterval(interval);
  }, [news.length]); // Re-run mainly when news count changes significantly or initially

  const filteredStocks = marketData.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStock = marketData.find(s => s.symbol === selectedSymbol) || 
                       MOCK_STOCKS.find(s => s.symbol === selectedSymbol) ||
                       marketData[0];

  return (
    <div className="flex min-h-screen bg-transparent relative">
      <AnimatePresence>
        {!hasAgreedTerms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#000814]/90 backdrop-blur-2xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl text-center border border-white/20"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20">
                <ShieldCheck className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Premium Access</h2>
              <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                To access real-time financial data, TradingView charts, and personalized AI insights, you must agree to our terms of service and market data usage policy.
              </p>
              <div className="space-y-4">
                <button 
                  onClick={handleAgreeTerms}
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-95"
                >
                  I Agree to Terms
                </button>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Powered by Moneycontrol & TradingView</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className={cn(
              "fixed top-24 right-8 z-[120] max-w-sm w-full p-6 rounded-3xl shadow-2xl border flex items-start gap-4",
              activeNotification.type === 'alert' ? "bg-slate-900 border-white/10 text-white" : "bg-blue-600 border-white/20 text-white"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
              activeNotification.type === 'alert' ? "bg-orange-500" : "bg-white text-blue-600"
            )}>
              {activeNotification.type === 'alert' ? <Bell size={24} /> : <Newspaper size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest opacity-50 mb-1 block">
                    {activeNotification.type === 'alert' ? 'Price Alert' : 'AI Market Insight'}
                  </span>
                  <h4 className="font-bold text-lg leading-tight">{activeNotification.title}</h4>
                </div>
                <button 
                  onClick={() => setActiveNotification(null)}
                  className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm opacity-80 leading-relaxed mb-3">
                {activeNotification.message}
              </p>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-30">{activeNotification.time}</span>
                 <button className="text-[10px] font-black uppercase tracking-widest hover:opacity-100 opacity-60 underline underline-offset-4">Learn More</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-[#001529]/95 backdrop-blur-xl hidden sm:flex flex-col sticky top-0 h-screen shadow-2xl z-40 border-r border-white/5 transition-all">
        <div className="p-4 md:p-8 flex flex-col items-center md:items-start h-full">
          <div className="flex items-center gap-3 mb-10 overflow-hidden">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
              <Wallet className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white italic hidden md:block uppercase">PROCAPITAL</h1>
          </div>
          
          <nav className="space-y-2 w-full">
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Markets", icon: LineChart },
              { name: "Global News", icon: Newspaper },
              { name: "Portfolio", icon: Wallet },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (item.name === "Dashboard") setSelectedSymbol("S&P 500");
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 md:px-4 md:py-3 rounded-xl font-bold transition-all group overflow-hidden whitespace-nowrap",
                  activeTab === item.name 
                    ? "bg-white/10 text-white shadow-inner scale-[1.02]" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon size={22} className={cn(activeTab === item.name ? "text-blue-400" : "group-hover:text-white")} />
                <span className="hidden md:block text-xs uppercase tracking-widest">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="mt-auto w-full space-y-4 pt-6 border-t border-white/5">
            <button className="w-full flex items-center justify-center md:justify-start gap-3 p-3 md:px-4 md:py-3 rounded-xl font-bold text-white/30 hover:text-white hover:bg-white/5 transition-all overflow-hidden">
              <Settings size={20} />
              <span className="hidden md:block text-[10px] uppercase tracking-widest">Settings</span>
            </button>
            
            {notifications.length > 0 && (
              <div className="hidden md:block p-4 bg-white/5 rounded-2xl border border-white/10 max-h-[300px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Alerts</p>
                  <span className="bg-orange-500 text-white text-[8px] px-1.5 py-0.5 rounded-full animate-pulse">{notifications.length}</span>
                </div>
                <div className="space-y-4">
                  {notifications.slice(0, 8).map(notif => (
                    <div key={notif.id} className="flex flex-col gap-1 border-l-2 border-orange-500/30 pl-3 py-1 group/item">
                      <p className="text-[10px] font-black text-white/90 leading-tight group-hover/item:text-orange-400 transition-colors">{notif.title}</p>
                      <p className="text-[9px] text-white/40 leading-tight line-clamp-2">{notif.message}</p>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Ticker Bar */}
        <div className="bg-[#001529] text-white py-2 overflow-hidden whitespace-nowrap border-b border-white/5 flex items-center shadow-lg">
          <div className="bg-red-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest mr-4 z-10 shadow-lg">Live</div>
          <div className="flex gap-10 animate-ticker">
            {marketData.concat(marketData).map((stock, i) => (
              <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2 text-xs font-medium">
                <img 
                  src={`https://s3-symbol-logo.tradingview.com/${stock.symbol.toLowerCase()}--big.svg`}
                  alt=""
                  className="w-4 h-4 rounded-full bg-white relative top-[0.5px]"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                  referrerPolicy="no-referrer"
                />
                <span className="text-white/60">{stock.symbol}</span>
                <span className="font-bold">
                  {stock.region === "Indian" ? "₹" : "$"}
                  {stock.price.toLocaleString(stock.region === "Indian" ? "en-IN" : "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={cn(stock.change >= 0 ? "text-green-400" : "text-red-400")}>
                  {stock.change >= 0 ? "▲" : "▼"} {Math.abs(stock.changePercent).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4 border-b border-white/20 flex items-center justify-between shadow-sm">
          <StockSearch 
            onSearch={setSearchQuery} 
            onSubmit={(symbol) => setSelectedSymbol(symbol.toUpperCase())}
          />
          <div className="flex items-center gap-4">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              onClick={() => {
                if (notifications.length > 0) {
                  setActiveNotification(notifications[0]);
                }
              }}
            >
              <Bell size={20} />
              {notifications.some(n => !n.isRead) && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              )}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">Trader Joe</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">Premium Plan</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-gray-200">
                <User size={20} className="text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-400 mb-1">
                {selectedSymbol !== "S&P 500" ? `Analysis for ${selectedSymbol}` : "Market Insights"}
              </p>
              <div className="flex items-center gap-4">
                {selectedSymbol !== "S&P 500" && (
                  <img 
                    src={`https://s3-symbol-logo.tradingview.com/${selectedSymbol.toLowerCase()}--big.svg`}
                    alt={selectedSymbol}
                    className="w-12 h-12 rounded-2xl bg-white shadow-xl p-2 border border-white/20"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${selectedSymbol}&background=random`;
                    }}
                    referrerPolicy="no-referrer"
                  />
                )}
                <h2 className="text-4xl font-black text-white tracking-tighter">
                  {selectedSymbol !== "S&P 500" ? `${selectedSymbol} Technical View` : "Market Dashboard"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
              <button 
                onClick={() => setSelectedSymbol("S&P 500")}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  selectedSymbol === "S&P 500" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Global
              </button>
              <button 
                onClick={() => setSelectedSymbol("Bitcoin")}
                className={cn(
                  "px-4 py-2 text-sm font-bold rounded-lg transition-all",
                  selectedSymbol === "Bitcoin" ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                )}
              >
                Crypto
              </button>
            </div>
          </div>

          {/* Market Overview Grid - Conditional based on focus */}
          {selectedSymbol === "S&P 500" ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
              <MarketOverview 
                title="Cryptocurrencies"
                data={marketData.filter(s => s.category === "Crypto")} 
                onSelect={setSelectedSymbol} 
                selectedSymbol={selectedSymbol}
                defaultCategory="Crypto"
              />
              <MarketOverview 
                title="Forex Markets"
                data={marketData.filter(s => s.category === "Forex")} 
                onSelect={setSelectedSymbol} 
                selectedSymbol={selectedSymbol}
                defaultCategory="Forex"
              />
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-sm mb-10 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-bottom-5">
               <div className="flex items-center gap-6">
                 <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                   <LineChart className="text-blue-600" size={32} />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{selectedSymbol}</h3>
                   <div className="flex items-baseline gap-3">
                     <p className="text-4xl font-bold text-slate-900 tracking-tight">
                       {selectedStock?.region === "Indian" ? "₹" : "$"}
                       {selectedStock?.price.toLocaleString(selectedStock?.region === "Indian" ? "en-IN" : "en-US")}
                     </p>
                     <p className={cn(
                       "text-lg font-bold",
                       (selectedStock?.change || 0) >= 0 ? "text-green-600" : "text-red-600"
                     )}>
                       {(selectedStock?.change || 0) >= 0 ? "+" : ""}{selectedStock?.changePercent}%
                     </p>
                   </div>
                 </div>
               </div>
               <button 
                 onClick={() => setSelectedSymbol("S&P 500")}
                 className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all flex items-center gap-2"
               >
                 <LayoutDashboard size={18} />
                 Back to Overview
               </button>
            </div>
          )}

          {/* New Horizontal News Section */}
          {selectedSymbol === "S&P 500" && (
            <HorizontalNewsFeed news={news} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Main Content Viewport */}
            <div className="lg:col-span-2 space-y-10">
              {activeTab === "Dashboard" && (
                <>
                  <TradingViewWidget symbol={selectedSymbol} />
                  
                  {selectedSymbol !== "S&P 500" && (
                    <>
                      <AlertManager 
                        symbol={selectedSymbol}
                        currentPrice={selectedStock?.price || 0}
                        alerts={alerts}
                        onAddAlert={handleAddAlert}
                        onDeleteAlert={handleDeleteAlert}
                      />
                      
                      <div className="bg-white/70 backdrop-blur-md p-8 rounded-[40px] border border-white/20 shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-2 h-8 bg-blue-600 rounded-full" />
                          <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Technical Insights</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                           {[
                             { label: "RSI (14)", value: "62.8", status: "Neutral", color: "text-blue-600" },
                             { label: "MACD", value: "Bullish", status: "Strong Buy", color: "text-green-600" },
                             { label: "EMA (200)", value: selectedStock?.price ? (selectedStock.price * 0.95).toFixed(2) : "0", status: "Support", color: "text-orange-600" },
                             { label: "Vol (24h)", value: selectedStock?.category === "Crypto" ? "2.4B" : "4.2M", status: "Active", color: "text-slate-600" }
                           ].map((stat, i) => (
                             <div key={i} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center text-center">
                               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                               <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{stat.value}</p>
                               <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white shadow-sm border border-gray-100", stat.color)}>{stat.status}</span>
                             </div>
                           ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === "Markets" && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-3 h-10 bg-green-500 rounded-full" />
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Market Explorer</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MarketOverview 
                      title="Cryptocurrencies" 
                      data={marketData.filter(s => s.category === "Crypto")} 
                      onSelect={setSelectedSymbol} 
                      selectedSymbol={selectedSymbol}
                    />
                    <MarketOverview 
                      title="Forex & Commodities" 
                      data={marketData.filter(s => s.category === "Forex")} 
                      onSelect={setSelectedSymbol} 
                      selectedSymbol={selectedSymbol}
                    />
                  </div>
                </div>
              )}

              {activeTab === "Global News" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-3 h-10 bg-red-600 rounded-full" />
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Global Intelligence</h2>
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 p-1">
                    <NewsFeed news={news} />
                  </div>
                </div>
              )}

              {activeTab === "Portfolio" && (
                <div className="text-center py-40 bg-white/5 rounded-[40px] border border-dashed border-white/20">
                  <Wallet size={64} className="mx-auto text-white/10 mb-6" />
                  <h3 className="text-2xl font-black text-white tracking-tighter mb-2">Portfolio Tracking Coming Soon</h3>
                  <p className="text-white/40">Connect your exchange or bank account to see your real-time performance.</p>
                </div>
              )}
            </div>

            {/* Right Side Column (Sticky) */}
            <div className="lg:col-span-1 space-y-8 sticky top-28 h-fit">
              <AIAssistant />
              
              {/* Hot Assets / Popular Assets Widget */}
              <div className="bg-[#001d3d] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full group-hover:bg-blue-600/30 transition-all" />
                
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h3 className="text-lg font-black text-white tracking-tighter uppercase">Market Pulse</h3>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredStocks.map(stock => (
                    <div 
                      key={stock.symbol} 
                      onClick={() => setSelectedSymbol(stock.symbol)}
                      className={cn(
                        "p-4 rounded-3xl transition-all cursor-pointer group flex items-center justify-between",
                        selectedSymbol === stock.symbol 
                          ? "bg-white/20 border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] scale-[1.03] -translate-y-1 z-10" 
                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://s3-symbol-logo.tradingview.com/${stock.symbol.toLowerCase()}--big.svg`}
                          alt=""
                          className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-[0_4px_10px_rgba(0,0,0,0.2)] group-hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] group-hover:-translate-y-0.5 group-hover:scale-110 transition-all duration-300"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${stock.symbol}&background=random`; }}
                        />
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tighter">{stock.symbol}</p>
                          <p className={cn("text-[9px] font-bold", stock.change >= 0 ? "text-green-400" : "text-red-400")}>
                            {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-white tracking-widest leading-none">
                        {stock.region === "Indian" ? "₹" : "$"}{stock.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setActiveTab("Markets")}
                  className="w-full mt-6 py-4 rounded-2xl bg-white text-[#001d3d] font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-xl shadow-black/20"
                >
                  Explore All
                </button>
              </div>

              <div className="bg-white/5 rounded-[40px] border border-white/5 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Global Hubs</p>
                   <div className="flex gap-1">
                     <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                     <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-75" />
                     <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse delay-150" />
                   </div>
                </div>
                {[
                  { name: "Crypto (24/7)", status: true }
                ].map((market, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5">
                    <p className="text-[10px] font-bold text-white/80">{market.name}</p>
                    <div className="flex items-center gap-2">
                       <span className={cn("text-[8px] font-black tracking-tighter", market.status ? "text-green-500" : "text-red-500")}>
                         {market.status ? "ALIVE" : "ZEN"}
                       </span>
                       <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", market.status ? "bg-green-500" : "bg-red-500")} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Credits */}
          <footer className="mt-20 pt-8 border-t border-gray-200 text-center pb-10">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <Wallet className="text-white" size={14} />
                </div>
                <span className="font-bold text-slate-900 italic">Procapital</span>
              </div>
              <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                Powered by <span className="font-semibold text-gray-700">Google Gemini AI</span>. 
                Inspired by the technical aesthetics of <span className="font-semibold text-gray-700">TradingView</span> 
                and the data depth of <span className="font-semibold text-gray-700">Moneycontrol</span>.
              </p>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Real-time Data</span>
                <span>•</span>
                <span>AI Insights</span>
                <span>•</span>
                <span>Global Markets</span>
              </div>
            </div>
          </footer>
        </div>
      </main>
      <BackgroundDecoration />
    </div>
  );
}
