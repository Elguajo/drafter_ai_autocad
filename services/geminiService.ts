import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResponse, ModelTier } from "../types";
import { DRAUGHTSMAN_SYSTEM_PROMPT } from "../constants";

const getClient = () => {
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
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

export const analyzeImage = async (base64Image: string, mimeType: string, tier: ModelTier = 'standard'): Promise<AnalysisResponse> => {
  const ai = getClient();
  
  // Select model based on tier
  // Standard: gemini-2.5-flash (Fast, efficient)
  // Pro: gemini-3-pro-preview (Complex reasoning, better prompt adherence)
  const modelName = tier === 'pro' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
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

export const generateTechnicalView = async (prompt: string, referenceImage?: string, referenceMimeType?: string, tier: ModelTier = 'standard'): Promise<string> => {
  const ai = getClient();

  // Select generation model based on tier
  // Standard: gemini-2.5-flash-image (Good for general tasks)
  // Pro: gemini-3-pro-image-preview (High quality, better detail)
  const modelName = tier === 'pro' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  try {
    const parts: any[] = [];

    // If a reference image is provided, include it to guide the generation (Image-to-Image / Editing context)
    if (referenceImage && referenceMimeType) {
      parts.push({
        inlineData: {
          data: referenceImage,
          mimeType: referenceMimeType
        }
      });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts
      },
      config: {
        // Temperature 0.1 is crucial for both Flash and Pro models to ensure strict adherence 
        // to the technical structure and the provided reference image.
        temperature: 0.1, 
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