import { GoogleGenAI } from "@google/genai";
import { SearchSource } from "../types";

export interface StreamCallbacks {
  onText: (text: string) => void;
  onSources: (sources: SearchSource[]) => void;
}

export const performSearchStreaming = async (
  query: string,
  callbacks: StreamCallbacks
): Promise<void> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    console.error("API_KEY is not configured.");
    throw new Error("Missing API Key. Please configure it in your dashboard.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: query }] }],
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    let fullText = "";
    for await (const chunk of result) {
      if (chunk.text) {
        fullText += chunk.text;
        callbacks.onText(fullText);
      }
      
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        const sources: SearchSource[] = metadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title || "Source",
            uri: c.web.uri,
          }))
          .filter((source: SearchSource, index: number, self: SearchSource[]) =>
            index === self.findIndex((t) => t.uri === source.uri)
          );
        
        if (sources.length > 0) {
          callbacks.onSources(sources);
        }
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    const msg = error?.message || "";
    const status = error?.status || "";

    // 429 Error specifically
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || status === "RESOURCE_EXHAUSTED") {
      throw new Error("Лимит запросов исчерпан. Подождите 1 минуту или смените API ключ (Quota exceeded).");
    } 
    
    if (msg.includes("API_KEY_INVALID")) {
      throw new Error("Неверный API ключ. Проверьте настройки.");
    } else if (msg.includes("location is not supported")) {
      throw new Error("Gemini AI недоступен в регионе вашего сервера.");
    }
    
    throw new Error("Сервис поиска временно недоступен. Попробуйте позже.");
  }
};