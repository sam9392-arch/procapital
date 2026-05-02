import React from "react";
import { NewsItem } from "../types";
import { Newspaper, Clock, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface HorizontalNewsFeedProps {
  news: NewsItem[];
}

export const HorizontalNewsFeed: React.FC<HorizontalNewsFeedProps> = ({ news }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
        <h3 className="text-xl font-bold text-white">Latest Financial News</h3>
        <span className="ml-auto flex items-center gap-1 text-xs font-bold text-red-600 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          LIVE UPDATES
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.slice(0, 3).map((item, index) => (
          <a 
            key={item.id} 
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-6 rounded-3xl border border-white/20 shadow-sm bg-white/70 backdrop-blur-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full",
              index === 0 && "lg:col-span-1",
              index === 1 && "lg:col-span-1"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <Newspaper className="text-red-600" size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                  {item.source}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                <Clock size={12} />
                <span>{item.time}</span>
              </div>
            </div>
            
            <h4 className="text-lg font-bold text-slate-900 leading-tight mb-2 group-hover:text-red-600 transition-colors">
              {item.title}
            </h4>

            {item.summary && (
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 flex-grow">
                {item.summary}
              </p>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
              <span className="text-xs font-bold text-gray-400 group-hover:text-red-500 transition-colors">Read Full Article</span>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
