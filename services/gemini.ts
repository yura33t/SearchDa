
import { GoogleGenAI } from "@google/genai";
import { SearchResponse, SearchSource } from "../types";

export interface StreamCallbacks {
  onText: (text: string) => void;
  onSources: (sources: SearchSource[]) => void;
}

export const performSearchStreaming = async (
  query: string,
  callbacks: StreamCallbacks
): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for maximum speed
      },
    });

    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        fullText += text;
        callbacks.onText(fullText);
      }
      
      // Check for grounding metadata in the chunk to provide sources as soon as possible
      const metadata = chunk.candidates?.[0]?.groundingMetadata;
      if (metadata?.groundingChunks) {
        const sources: SearchSource[] = metadata.groundingChunks
          .filter((c: any) => c.web)
          .map((c: any) => ({
            title: c.web.title || "Untitled Source",
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
  } catch (error) {
    console.error("Search failed:", error);
    throw new Error("The search service is currently unavailable. Please try again later.");
  }
};
