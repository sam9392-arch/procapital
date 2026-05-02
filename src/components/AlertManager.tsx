import React, { useState } from "react";
import { StockAlert, StockData } from "../types";
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, X } from "lucide-react";
import { cn } from "../lib/utils";

interface AlertManagerProps {
  symbol: string;
  currentPrice: number;
  alerts: StockAlert[];
  onAddAlert: (alert: Omit<StockAlert, "id" | "createdAt" | "isActive">) => void;
  onDeleteAlert: (id: string) => void;
}

export const AlertManager: React.FC<AlertManagerProps> = ({ 
  symbol, 
  currentPrice, 
  alerts, 
  onAddAlert, 
  onDeleteAlert 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(targetPrice);
    if (isNaN(price)) return;

    onAddAlert({
      symbol,
      targetPrice: price,
      condition,
      type: 'price'
    });
    setIsOpen(false);
  };

  const symbolAlerts = alerts.filter(a => a.symbol === symbol);

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/20 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <h3 className="text-xl font-bold text-slate-900">Price Alerts</h3>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 bg-slate-900 text-white rounded-xl hover:bg-orange-600 transition-all flex items-center gap-2 text-xs font-bold"
        >
          <Plus size={16} />
          SET ALERT
        </button>
      </div>

      <div className="p-6 space-y-4 max-h-[300px] overflow-y-auto">
        {symbolAlerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm font-medium text-gray-400">No alerts set for {symbol}</p>
          </div>
        ) : (
          symbolAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  alert.condition === 'above' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {alert.condition === 'above' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Notify when {alert.condition}
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {alert.symbol === "RELIANCE" ? "₹" : "$"}{alert.targetPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => onDeleteAlert(alert.id)}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-8 right-8 p-2 text-gray-400 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-8">
              <Bell className="text-orange-600" size={32} />
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Set Price Alert</h2>
            <p className="text-gray-500 mb-8 font-medium">Get notified when {symbol} reaches your target price.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setCondition('above')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                    condition === 'above' ? "bg-white shadow-sm text-slate-900" : "text-gray-500"
                  )}
                >
                  ABOVE
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('below')}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold transition-all",
                    condition === 'below' ? "bg-white shadow-sm text-slate-900" : "text-gray-500"
                  )}
                >
                  BELOW
                </button>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-5 px-14 text-2xl font-bold focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  placeholder="0.00"
                  autoFocus
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">
                  {symbol === "RELIANCE" ? "₹" : "$"}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                CREATE ALERT
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
