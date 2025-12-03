import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFridgeImage = async (base64Image: string): Promise<{ detectedIngredients: string[], recipes: Recipe[] }> => {
  const modelId = "gemini-3-pro-preview";

  const prompt = `
    Analyze this image of a fridge or food ingredients. 
    1. Identify the visible ingredients.
    2. Suggest 5 distinct culinary recipes that use these ingredients. 
       Ensure a mix of dietary types (Vegetarian, Keto, etc.) if possible.
    3. For each recipe, list all required ingredients. Mark ingredients as 'isMissing': true if they are NOT seen in the image but are required (like spices, oils, or secondary items not visible).
    4. Provide step-by-step cooking instructions.
    
    Return the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: modelId,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedIngredients: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of ingredients identified in the image"
          },
          recipes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                prepTime: { type: Type.STRING, description: "e.g. '30 mins'" },
                calories: { type: Type.INTEGER },
                tags: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Dietary tags like Vegetarian, Vegan, Keto, Gluten-Free"
                },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.STRING },
                      isMissing: { type: Type.BOOLEAN }
                    },
                    required: ["name", "quantity", "isMissing"]
                  }
                },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["name", "description", "difficulty", "prepTime", "calories", "tags", "ingredients", "steps"]
            }
          }
        },
        required: ["detectedIngredients", "recipes"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("No response from Gemini");
  }

  try {
    const data = JSON.parse(text);
    // Add IDs to recipes for React keys
    const recipesWithIds = data.recipes.map((r: any, index: number) => ({
      ...r,
      id: `recipe-${index}-${Date.now()}`
    }));
    
    return {
      detectedIngredients: data.detectedIngredients || [],
      recipes: recipesWithIds
    };
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse recipe data");
  }
};
