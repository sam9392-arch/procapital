import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Parser from "rss-parser";
import fetch from "node-fetch";

const app = express();
const PORT = 3000;
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
});

// RSS Feeds
const FEEDS = {
  moneycontrol: "https://www.moneycontrol.com/rss/latestnews.xml",
  mc_markets: "https://www.moneycontrol.com/rss/marketnews.xml",
  global_business: "https://search.cnbc.com/rs/search/view.xml?partnerId=2000&keywords=market&sort=date",
  reuters_world: "https://www.reuters.com/rssFeed/worldNews",
  yahoo_finance: "https://finance.yahoo.com/news/rssindex"
};

const fetchFeed = async (url: string, source: string, category: 'Market' | 'Global') => {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map(item => ({
      id: item.guid || Math.random().toString(36).substr(2, 9),
      title: item.title,
      summary: item.contentSnippet || item.content || "",
      time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      source: source,
      category: category,
      url: item.link,
      timestamp: item.pubDate ? new Date(item.pubDate).getTime() : Date.now()
    }));
  } catch (e) {
    console.error(`Failed to fetch ${source}:`, e);
    return [];
  }
};

async function startServer() {
  // API routes
  app.get("/api/news", async (req, res) => {
    try {
      const results = await Promise.all([
        fetchFeed(FEEDS.moneycontrol, "Moneycontrol", "Global"),
        fetchFeed(FEEDS.mc_markets, "Moneycontrol", "Market"),
        fetchFeed(FEEDS.global_business, "CNBC", "Global"),
        fetchFeed(FEEDS.reuters_world, "Reuters", "Global"),
        fetchFeed(FEEDS.yahoo_finance, "Yahoo Finance", "Global"),
      ]);

      const flatNews = results.flat().sort((a, b) => b.timestamp - a.timestamp);
      res.json(flatNews.slice(0, 30));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/stock-news", async (req, res) => {
    const { symbol } = req.query;
    try {
      // Fetch latest general news as fallback or filter if possible
      const results = await Promise.all([
        fetchFeed(FEEDS.moneycontrol, "Moneycontrol", "Global"),
        fetchFeed(FEEDS.mc_markets, "Moneycontrol", "Market"),
        fetchFeed(FEEDS.global_business, "CNBC", "Global"),
        fetchFeed(FEEDS.reuters_world, "Reuters", "Global"),
        fetchFeed(FEEDS.yahoo_finance, "Yahoo Finance", "Global"),
      ]);
      
      let flatNews = results.flat().sort((a, b) => b.timestamp - a.timestamp);
      
      // Basic simulation of symbol filtering if symbol is provided
      if (symbol && symbol !== "S&P 500") {
        const filtered = flatNews.filter(item => 
          item.title.toLowerCase().includes((symbol as string).toLowerCase()) || 
          item.summary.toLowerCase().includes((symbol as string).toLowerCase())
        );
        if (filtered.length > 0) flatNews = filtered;
      }
      
      res.json(flatNews.slice(0, 15));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stock news" });
    }
  });

  app.get("/api/market-summary", async (req, res) => {
    // For now, return mock data but we could fetch real prices if we had an API key
    // Returning MOCK_STOCKS structure
    const MOCK_STOCKS = [
      { symbol: "BTC", price: 64230.12, change: 1240.50, changePercent: 1.95, volume: "32.4B", category: "Crypto" },
      { symbol: "ETH", price: 3450.75, change: -85.20, changePercent: -2.41, volume: "15.8B", category: "Crypto" },
      { symbol: "SOL", price: 145.22, change: 12.10, changePercent: 9.12, volume: "4.2B", category: "Crypto" },
      { symbol: "EURUSD", price: 1.0854, change: 0.0012, changePercent: 0.11, category: "Forex" },
      { symbol: "GOLD", price: 2345.10, change: 12.40, changePercent: 0.53, category: "Forex" }
    ];
    
    // Add some random movement to make it look "live"
    const liveData = MOCK_STOCKS.map(stock => {
      const volatility = stock.category === "Crypto" ? 0.005 : 0.001;
      const movement = (Math.random() - 0.5) * stock.price * volatility;
      const newPrice = stock.price + movement;
      return {
        ...stock,
        price: Number(newPrice.toFixed(stock.category === "Forex" ? 4 : 2)),
        change: Number((stock.change + movement).toFixed(2)),
      };
    });

    res.json(liveData);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
