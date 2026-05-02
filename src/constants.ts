import { StockData, NewsItem, ChartDataPoint } from "./types";

export const MOCK_STOCKS: StockData[] = [
  { symbol: "AAPL", price: 178.45, change: 1.23, changePercent: 0.69, region: "Western", category: "Stock" },
  { symbol: "MSFT", price: 420.12, change: -2.34, changePercent: -0.55, region: "Western", category: "Stock" },
  { symbol: "NVDA", price: 890.45, change: 24.12, changePercent: 2.78, region: "Western", category: "Stock" },
  { symbol: "TSLA", price: 168.30, change: -5.67, changePercent: -3.26, region: "Western", category: "Stock" },
  { symbol: "RELIANCE", price: 2987.45, change: 12.30, changePercent: 0.41, region: "Indian", category: "Stock" },
  { symbol: "TCS", price: 3845.20, change: -15.40, changePercent: -0.40, region: "Indian", category: "Stock" },
  { symbol: "HDFCBANK", price: 1450.30, change: 5.60, changePercent: 0.39, region: "Indian", category: "Stock" },
  { symbol: "BTC/USD", price: 67452.12, change: 1243.56, changePercent: 1.88, category: "Crypto" },
  { symbol: "ETH/USD", price: 3452.12, change: 45.56, changePercent: 1.34, category: "Crypto" },
  { symbol: "USD/INR", price: 83.45, change: -0.12, changePercent: -0.14, category: "Forex" },
];

export const MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 20 }, (_, i) => ({
  time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
  price: 150 + Math.random() * 50,
}));
