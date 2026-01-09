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
  // Use the API key directly as per system instructions
  const apiKey = process.env.API_KEY;
  const userKey = localStorage.getItem('searchda_custom_key');
  const finalKey = userKey || apiKey;

  if (!finalKey || finalKey === "undefined" || finalKey === "null") {
    throw new Error("API Key is missing. Please set it in Settings.");
  }

  const ai = new GoogleGenAI({ apiKey: finalKey });
  
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: query }] }],
      config: {
        tools: [{ googleSearch: {} }],
        // Disable thinking for faster search results
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

    if (!fullText && !allSources.length) {
      throw new Error("No results found for this query.");
    }

  } catch (error: any) {
    console.error("Search error:", error);
    
    const message = error?.message || "";
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("Лимит запросов исчерпан. Попробуйте через 30-60 секунд.");
    } else if (message.includes("API_KEY_INVALID")) {
      throw new Error("Ошибка ключа доступа. Проверьте настройки.");
    } else if (message.includes("location not supported")) {
      throw new Error("Сервис недоступен в вашем регионе (VPN может помочь).");
    }
    
    throw new Error(message || "Произошла непредвиденная ошибка при поиске.");
  }
};