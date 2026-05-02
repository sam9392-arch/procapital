import { GoogleGenAI, Type } from "@google/genai";
import { NewsItem, Notification } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeNewsForAlerts(news: NewsItem[]): Promise<Notification[]> {
  if (!news || news.length === 0) return [];

  const newsContext = news.map(item => `- [${item.source}] ${item.title}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current News Headlines:\n${newsContext}\n\nTask: You are a high-level market intelligence analyst. 
      Analyze these headlines and identify:
      1. CRITICAL statements from world leaders (Prime Ministers, Presidents).
      2. Key policy changes or economic shifts from treasury officials or central bank chairs (Fed, RBI, ECB).
      3. Global event quotes from "high-valued" individuals (CEOs of multi-billion dollar companies, influential investors).
      
      Requirements:
      - If you find a relevant quote or action from a leader, create a "Global Leader Alert".
      - If you find a major market shift, create a "Market Impact Alert".
      - Be direct and stay professional. 
      - Generate maximum 2 notifications. If nothing matches the high-profile criteria, return an empty array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short catchy alert title (e.g., 'PM Statement', 'FED Alert')" },
              message: { type: Type.STRING, description: "Clear, impactful message summarizing the news or quote" },
              type: { type: Type.STRING, enum: ["alert", "news", "system"] }
            },
            required: ["title", "message", "type"]
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    if (!jsonStr || jsonStr === '[]') return [];
    
    const parsed = JSON.parse(jsonStr);
    if (parsed.length > 0) {
      console.log(`[AI News] Triggered ${parsed.length} important global alerts.`);
    }
    return parsed.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString(),
      isRead: false
    }));
  } catch (error) {
    console.warn("AI News analysis failed:", error);
    return [];
  }
}
