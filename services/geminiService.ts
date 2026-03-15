
import { GoogleGenAI, Type } from "@google/genai";
import { Category, AspectRatio, GeneratedContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateUGCImage = async (
  productImage: string,
  modelImage: string,
  productName: string,
  prompt: string,
  category: Category,
  ratio: AspectRatio
): Promise<string> => {
  const fullPrompt = `Task: Create a professional UGC (User Generated Content) photo for a product named "${productName}". 
  Style Category: ${category}.
  Instruction: ${prompt}.
  
  References provided:
  1. Product Image: Use this as the main product to feature.
  2. Model/Style Image: Use this as reference for the person, pose, or aesthetic background.
  
  Ensure the final image looks like an authentic, high-quality social media post from a creator. The product "${productName}" must be clearly visible and naturally integrated into the scene.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: productImage.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          inlineData: {
            data: modelImage.split(',')[1],
            mimeType: 'image/png',
          },
        },
        { text: fullPrompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: ratio,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from API");
};

export const generateMarketingContent = async (
  productName: string,
  category: Category,
  prompt: string
): Promise<GeneratedContent> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Buatkan konten marketing viral untuk produk bernama "${productName}".
    Kategori: ${category}.
    Tema/Brief: ${prompt}.
    
    Tulis dalam Bahasa Indonesia yang kasual, autentik ala influencer (UGC style).
    Output harus berupa:
    1. Hook: Kalimat pembuka yang sangat menarik perhatian dalam 3 detik.
    2. Narrative: Narasi cerita pendek atau poin-poin penjelasan produk yang relate dengan user.
    3. CTA: Ajakan bertindak yang kuat tapi tetap natural.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hook: { type: Type.STRING, description: "A catchy hook to grab attention in 3 seconds." },
          narrative: { type: Type.STRING, description: "A short engaging story/narrative about the product." },
          cta: { type: Type.STRING, description: "A compelling call to action." },
        },
        required: ["hook", "narrative", "cta"],
      },
    },
  });

  return JSON.parse(response.text);
};
