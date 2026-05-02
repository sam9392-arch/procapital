import React from "react";
import { NewsItem } from "../types";
import { ExternalLink, Clock } from "lucide-react";

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/20 shadow-sm overflow-hidden">
      <div className="p-6 border-bottom border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Latest Financial News</h2>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">View all</button>
      </div>
      <div className="divide-y divide-gray-50">
        {news.map((item) => (
          <a 
            key={item.id} 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                {item.source}
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={12} />
                <span>{item.time}</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors mb-1">
              {item.title}
            </h3>
            {item.summary && (
              <p className="text-xs text-gray-500 line-clamp-2 mt-2 leading-relaxed">
                {item.summary}
              </p>
            )}
            <div className="mt-3 flex items-center text-xs text-gray-400 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Read article</span>
              <ExternalLink size={12} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
