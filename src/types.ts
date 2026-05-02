export interface StockAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  type: 'price';
  isActive: boolean;
  createdAt: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: 'alert' | 'news' | 'system';
}

export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  region?: "Indian" | "Western";
  category?: "Stock" | "Forex" | "Crypto";
}

export interface NewsItem {
  id: string | number;
  title: string;
  source: string;
  time: string;
  summary?: string;
  category?: string;
  url?: string;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}
