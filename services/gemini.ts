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
  // Use custom key from localStorage if it exists, otherwise use environment key
  const userKey = localStorage.getItem('searchda_custom_key');
  const systemKey = process.env.API_KEY;
  
  // Clean up values that might be set as strings by build tools
  const isInvalid = (val: string | undefined | null) => 
    !val || val === "undefined" || val === "null" || val.trim() === "";

  const apiKey = !isInvalid(userKey) ? userKey : systemKey;

  if (isInvalid(apiKey)) {
    throw new Error("API ключ не найден. Пожалуйста, добавьте свой Gemini API ключ в настройках (иконка шестеренки в углу).");
  }

  // Initialize AI client with the determined key
  const ai = new GoogleGenAI({ apiKey: apiKey! });
  
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: query }] }],
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    let fullText = "";
    let allSources: SearchSource[] = [];

    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
        callbacks.onText(fullText);
      }
      
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        const newSources: SearchSource[] = metadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title || "Untitled Source",
            uri: c.web.uri,
          }));
        
        // Merge and de-duplicate sources
        const merged = [...allSources, ...newSources];
        allSources = merged.filter((source, index, self) =>
          index === self.findIndex((t) => t.uri === source.uri)
        );
        
        if (allSources.length > 0) {
          callbacks.onSources(allSources);
        }
      }
    }

    if (!fullText && allSources.length === 0) {
      throw new Error("Модель вернула пустой ответ. Попробуйте переформулировать запрос.");
    }

  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    
    const message = error?.message || "";
    // Detailed error handling for common API issues
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Лимит запросов исчерпан (429). Подождите 1 минуту или используйте свой API ключ в настройках.");
    } else if (message.includes("API_KEY_INVALID") || message.includes("403") || message.includes("401")) {
      throw new Error("Ошибка API ключа. Убедитесь, что ваш ключ активен и имеет доступ к Google Search в Google AI Studio.");
    } else if (message.includes("location not supported")) {
      throw new Error("Gemini AI временно недоступен в вашем регионе. Используйте VPN или свой API ключ.");
    } else if (message.includes("SAFETY")) {
      throw new Error("Запрос заблокирован фильтрами безопасности. Попробуйте другой вопрос.");
    }
    
    throw new Error(message || "Произошла непредвиденная ошибка при поиске.");
  }
};