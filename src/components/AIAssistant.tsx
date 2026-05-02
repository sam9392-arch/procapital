import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const AIAssistant: React.FC = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; content: string }[]>([
    { role: "ai", content: "Hello! I'm your Procapital AI assistant. Ask me anything about the stock market, financial terms, or market trends." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMessage,
        config: {
          systemInstruction: "You are a highly professional financial assistant for an app called Procapital. Provide accurate, clear, and concise financial information and market insights. Use professional but accessible language. If asked for investment advice, always include a disclaimer that you provide information, not professional investment advice.",
        }
      });

      const aiResponse = response.text || "I couldn't generate a response at the moment.";
      setMessages((prev) => [...prev, { role: "ai", content: aiResponse }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#002147] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm tracking-tight">Procapital AI</h2>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Live Support</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                msg.role === "user" ? "bg-white/10" : "bg-blue-600"
              )}>
                {msg.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className={cn(
                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user" ? "bg-white/20 text-white" : "bg-white text-slate-900"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white p-3 rounded-2xl flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-black/20">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about markets..."
            className="w-full bg-white/10 text-white rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-white/10 placeholder:text-white/30"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[9px] text-white/40 mt-2 text-center flex items-center justify-center gap-1">
          <Sparkles size={10} />
          AI responses may contain inaccuracies. Verify before investing.
        </p>
      </div>
    </div>
  );
};
