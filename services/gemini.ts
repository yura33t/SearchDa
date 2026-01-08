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
  // Check both for null/undefined and for the string "undefined" which Vite might inject
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    console.error("API_KEY is not configured in environment variables.");
    throw new Error("Missing API Key. Please configure API_KEY in your hosting provider's dashboard.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: query }] }],
      config: {
        tools: [{ googleSearch: {} }],
        // We set thinkingBudget to 0 to minimize latency for search tasks
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
          // Deduplicate sources by URI
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
    
    // Provide user-friendly explanations for common API failures
    const msg = error?.message || "";
    if (msg.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key. Check your credentials.");
    } else if (msg.includes("location is not supported")) {
      throw new Error("Gemini AI is not available in your server's region.");
    } else if (msg.includes("grounding") || msg.includes("search")) {
      throw new Error("Search service is temporarily limited for this API Key.");
    }
    
    throw new Error(error.message || "Search service unavailable.");
  }
};