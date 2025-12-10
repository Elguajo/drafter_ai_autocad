import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse } from "../types";
import { DRAUGHTSMAN_SYSTEM_PROMPT } from "../constants";

const getClient = () => {
  // The API key must be obtained exclusively from the environment variable import.meta.env.VITE_API_KEY.
  return new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY as string });
};

// Schema for the JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    detected_orientation: { type: Type.STRING, description: "The orientation detected in the source image (front, side, top, or back)." },
    missing_orientations: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "The list of remaining canonical orientations."
    },
    prompts: {
      type: Type.OBJECT,
      description: "A map where keys are the orientation names (front, side, top, back) and values are the generated 3-paragraph prompts.",
      properties: {
        front: { type: Type.STRING },
        side: { type: Type.STRING },
        top: { type: Type.STRING },
        back: { type: Type.STRING },
      },
      required: ["front", "side", "top", "back"]
    }
  },
  required: ["detected_orientation", "missing_orientations", "prompts"]
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResponse> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          },
          {
            text: DRAUGHTSMAN_SYSTEM_PROMPT
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2 // Low temperature for consistent, technical output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from model");
    return JSON.parse(text) as AnalysisResponse;

  } catch (error) {
    console.error("Error analyzing image:", error);
    throw error;
  }
};

export const generateTechnicalView = async (prompt: string): Promise<string> => {
  const ai = getClient();

  try {
    // We use gemini-2.5-flash-image for image generation based on text prompts
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Ensuring aspect ratio fits standard technical drawing paper formats roughly
        imageConfig: {
            aspectRatio: "4:3", 
        }
      }
    });

    // Iterate to find the image part
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Error generating view:", error);
    throw error;
  }
};