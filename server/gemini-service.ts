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

export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

export async function generateProfessionalHeadshot(
  referenceImages: ReferenceImage[],
  modelType: ModelType = "flash",
  backgroundColor: string = "#562226",
  clothing: ClothingOptions = { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" }
): Promise<string> {
  const clothingDesc = CLOTHING_DESCRIPTIONS[clothing.gender]?.[clothing.clothingId] 
    || "premium smart casual blazer";
  
  const colorName = COLOR_NAMES[clothing.clothingColor] || "charcoal gray";
  
  const clothingPhrase = `${colorName} ${clothingDesc}`;

  const referenceNote = referenceImages.length > 1 
    ? `Use all ${referenceImages.length} reference photos provided to accurately capture the subject's facial identity, features, and likeness. The reference photos show the same person from different angles/lighting - use them to understand the subject's face thoroughly.`
    : "";

  const prompt = `${referenceNote}

Transform this into a professional, high-resolution profile photo, maintaining the exact facial structure, identity, and key features of the person in the reference image(s). The subject is framed from the chest up, with ample headroom. The person looks directly at the camera. They are styled for a professional photo studio shoot, wearing a ${clothingPhrase}. The background is a solid '${backgroundColor}' neutral studio color. Shot from a high angle with bright and airy soft, diffused studio lighting, gently illuminating the face and creating a subtle catchlight in the eyes, conveying a sense of clarity. Captured on an 85mm f/1.8 lens with a shallow depth of field, exquisite focus on the eyes, and beautiful, soft bokeh. Observe crisp detail on the fabric texture of the clothing, individual strands of hair, and natural, realistic skin texture. The atmosphere exudes confidence, professionalism, and approachability. Clean and bright cinematic color grading with subtle warmth and balanced tones, ensuring a polished and contemporary feel.`;

  const model = MODELS[modelType];

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 GEMINI API REQUEST");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📍 Model:", model);
  console.log("📷 Reference Images:", referenceImages.length);
  referenceImages.forEach((img, i) => {
    console.log(`   Image ${i + 1}: ${img.mimeType}, ${Math.round(img.base64.length / 1024)} KB`);
  });
  console.log("🎨 Background Color:", backgroundColor);
  console.log("👔 Clothing:", clothingPhrase);
  console.log("📝 System Prompt:");
  console.log(prompt);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("⏳ Sending request to Gemini...");

  const startTime = Date.now();

  try {
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: prompt },
    ];
    
    for (const img of referenceImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        },
      });
    }

    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: parts,
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
      },
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
    console.log("📄 finishReason:", candidate.finishReason ?? "none");
    console.log("📄 Parts in response:", candidate.content?.parts?.length ?? "no content");

    if (!candidate.content || !candidate.content.parts) {
      console.log("❌ No content/parts — finishReason:", candidate.finishReason);
      console.log("❌ Full candidate:", JSON.stringify(candidate, null, 2));
      throw new Error(`No image content returned (finishReason: ${candidate.finishReason ?? "unknown"})`);
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
