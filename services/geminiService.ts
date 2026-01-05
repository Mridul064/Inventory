
import { GoogleGenAI, Type } from "@google/genai";
import { Product, Department } from "../types";

export const geminiService = {
  // Move AI initialization inside methods to ensure the latest API key is used
  async generateProductDescription(productName: string, category: string, department: Department): Promise<string> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, concise product description for "${productName}" in the "${category}" category belonging to the "${department}" department. Focus on professional usage and technical specs relevant to this department. Limit to 2 sentences.`,
        config: {
          temperature: 0.7,
        }
      });
      // response.text is a property, not a method.
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Error generating description:", error);
      return "Failed to generate description. Please try again.";
    }
  },

  async getInventoryInsights(products: Product[], department: Department): Promise<any> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const deptContext = department === 'All' ? 'global' : `the ${department} department`;
      
      // Use gemini-3-pro-preview for complex reasoning and JSON output
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze this inventory data for ${deptContext}: ${JSON.stringify(products)}. 
        Include:
        1. A summary of overall stock health for this specific area.
        2. Top 3 restock priorities considering the criticality of items in ${deptContext}.
        3. A brief operational risk assessment if stock levels fall further.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              priorities: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              trendPrediction: { type: Type.STRING, description: "Operational risk assessment" }
            },
            required: ["summary", "priorities", "trendPrediction"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating insights:", error);
      return null;
    }
  }
};
