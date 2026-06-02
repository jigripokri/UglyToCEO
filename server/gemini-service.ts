import { GoogleGenAI } from "@google/genai";
import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type Gender,
  type ReferenceImage,
} from "./headshot-prompt";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY_HH || "",
});

export type ModelType = "flash" | "pro";
export type { Gender, ClothingOptions, ReferenceImage };

const MODELS = {
  flash: "gemini-2.5-flash-image",
  pro: "gemini-3-pro-image-preview",
};

export async function generateProfessionalHeadshot(
  referenceImages: ReferenceImage[],
  modelType: ModelType = "flash",
  backgroundColor: string = "#562226",
  clothing: ClothingOptions = { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" }
): Promise<string> {
  const { prompt, clothingPhrase } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

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
