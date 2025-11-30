import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY_HH || "",
});

export type ModelType = "flash" | "pro";
export type Gender = "men" | "women";

const MODELS = {
  flash: "gemini-2.5-flash-image",
  pro: "gemini-3-pro-image-preview",
};

// Clothing descriptions for prompt generation
const CLOTHING_DESCRIPTIONS: Record<string, Record<string, string>> = {
  men: {
    blazer: "premium smart casual blazer",
    suit: "tailored formal business suit with matching tie",
    dress_shirt: "crisp professional dress shirt",
    knit: "textured premium knit sweater",
  },
  women: {
    blazer: "elegant tailored professional blazer",
    blouse: "elegant silk professional blouse",
    jewel_blouse: "luxurious jewel-toned silk blouse",
    sheath_dress: "sophisticated professional sheath dress",
  },
};

// Color name lookup
const COLOR_NAMES: Record<string, string> = {
  "#4a4a4a": "charcoal gray",
  "#1a2744": "navy",
  "#1a1a1a": "black",
  "#f5f5f5": "white",
  "#a8c5e2": "light blue",
  "#f0d4d4": "pale pink",
  "#562226": "burgundy",
  "#f5f5dc": "ivory",
  "#2e5a4c": "emerald",
  "#1a3a5c": "sapphire",
};

export interface ClothingOptions {
  gender: Gender;
  clothingId: string;
  clothingColor: string;
}

export async function generateProfessionalHeadshot(
  imageBase64: string,
  mimeType: string = "image/jpeg",
  modelType: ModelType = "flash",
  backgroundColor: string = "#562226",
  clothing: ClothingOptions = { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" }
): Promise<string> {
  // Get clothing description
  const clothingDesc = CLOTHING_DESCRIPTIONS[clothing.gender]?.[clothing.clothingId] 
    || "premium smart casual blazer";
  
  // Get color name
  const colorName = COLOR_NAMES[clothing.clothingColor] || "charcoal gray";
  
  // Build the clothing phrase
  const clothingPhrase = `${colorName} ${clothingDesc}`;

  const prompt = `Transform this photo into the following:

A professional, high-resolution profile photo, maintaining the exact facial structure, identity, and key features of the person in the input image. The subject is framed from the chest up, with ample headroom. The person looks directly at the camera. They are styled for a professional photo studio shoot, wearing a ${clothingPhrase}. The background is a solid '${backgroundColor}' neutral studio color. Shot from a high angle with bright and airy soft, diffused studio lighting, gently illuminating the face and creating a subtle catchlight in the eyes, conveying a sense of clarity. Captured on an 85mm f/1.8 lens with a shallow depth of field, exquisite focus on the eyes, and beautiful, soft bokeh. Observe crisp detail on the fabric texture of the clothing, individual strands of hair, and natural, realistic skin texture. The atmosphere exudes confidence, professionalism, and approachability. Clean and bright cinematic color grading with subtle warmth and balanced tones, ensuring a polished and contemporary feel.`;

  const model = MODELS[modelType];

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 GEMINI API REQUEST");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📍 Model:", model);
  console.log("📷 Image MIME Type:", mimeType);
  console.log("📏 Input Image Size:", Math.round(imageBase64.length / 1024), "KB");
  console.log("🎨 Background Color:", backgroundColor);
  console.log("👔 Clothing:", clothingPhrase);
  console.log("📝 System Prompt:");
  console.log(prompt);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("⏳ Sending request to Gemini...");

  const startTime = Date.now();

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🤖 GEMINI API RESPONSE");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("⏱️  Response Time:", elapsed, "ms");
    console.log("📦 Candidates:", response.candidates?.length || 0);

    if (!response.candidates || response.candidates.length === 0) {
      console.log("❌ No candidates in response");
      throw new Error("No response generated");
    }

    const candidate = response.candidates[0];
    console.log("📄 Parts in response:", candidate.content?.parts?.length || 0);

    if (!candidate.content || !candidate.content.parts) {
      console.log("❌ Invalid response format");
      throw new Error("Invalid response format");
    }

    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log("📝 Text included in response (length:", part.text.length, "chars)");
      }
      if (part.inlineData && part.inlineData.data) {
        console.log("✅ Image generated successfully!");
        console.log("📏 Output Image Size:", Math.round(part.inlineData.data.length / 1024), "KB");
        console.log("═══════════════════════════════════════════════════════════");
        return part.inlineData.data;
      }
    }

    console.log("❌ No image data found in response parts");
    throw new Error("No image data in response");
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.log("═══════════════════════════════════════════════════════════");
    console.log("❌ GEMINI API ERROR");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("⏱️  Time before error:", elapsed, "ms");
    console.log("🔴 Error:", error.message || error);
    if (error.status) console.log("📊 Status:", error.status);
    throw error;
  }
}
