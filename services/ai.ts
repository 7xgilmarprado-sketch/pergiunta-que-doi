
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const aiService = {
  async generateDailyQuestion(date: string): Promise<Question> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Gere uma pergunta de reflexão cristã profunda para o dia ${date}. 
        A pergunta deve ser minimalista, desconfortável, focar em honestidade emocional e vulnerabilidade.
        Não use clichês evangélicos. Foque na psicologia da alma à luz das Escrituras.
        Retorne também a referência bíblica (Livro Capítulo:Versículo) que fundamenta o tema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING, description: "A pergunta reflexiva" },
              verseReference: { type: Type.STRING, description: "Referência bíblica" }
            },
            required: ["text", "verseReference"]
          },
          seed: parseInt(date.replace(/-/g, ""))
        },
      });

      const result = JSON.parse(response.text || "{}");
      
      return {
        id: `ai-${date}`,
        text: result.text || "O que você está escondendo de si mesmo hoje?",
        date: date,
        verseReference: result.verseReference || "Hebreus 4:13"
      };
    } catch (error) {
      console.error("Erro na geração de pergunta por IA:", error);
      return {
        id: `fallback-${date}`,
        text: "O que você anda fingindo que não sente?",
        date: date,
        verseReference: "Salmos 139:23"
      };
    }
  }
};

export { aiService };
