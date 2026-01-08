import { GoogleGenAI } from "@google/genai";
import { SearchSource } from "../types";

export interface StreamCallbacks {
  onText: (text: string) => void;
  onSources: (sources: SearchSource[]) => void;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const performSearchStreaming = async (
  query: string,
  callbacks: StreamCallbacks,
  retryCount = 0
): Promise<void> => {
  // Priority: 1. LocalStorage (User Key) 2. Environment (Dev Key)
  const userKey = localStorage.getItem('searchda_custom_key');
  const envKey = process.env.API_KEY;
  const apiKey = userKey || envKey;

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    throw new Error("API Key not found. Please add your Gemini API Key in Settings.");
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
    console.error(`Gemini API Error (Attempt ${retryCount + 1}):`, error);
    
    const msg = error?.message || "";
    const isQuotaError = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");

    // Retry logic for Quota errors (max 2 retries)
    if (isQuotaError && retryCount < 2) {
      const delay = (retryCount + 1) * 2500; // 2.5s, 5s
      console.log(`Quota hit. Retrying in ${delay}ms...`);
      await sleep(delay);
      return performSearchStreaming(query, callbacks, retryCount + 1);
    }

    if (isQuotaError) {
      throw new Error("Лимит запросов исчерпан. Подождите минуту или используйте свой API ключ в настройках.");
    } 
    
    if (msg.includes("API_KEY_INVALID") || msg.includes("invalid")) {
      throw new Error("Неверный API ключ. Проверьте настройки или API_KEY в Render.");
    }
    
    throw new Error(msg.includes("location") ? "Регион не поддерживается" : "Ошибка сервиса. Попробуйте еще раз.");
  }
};