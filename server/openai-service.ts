import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

// Uses a user-provided OpenAI API key (OPENAI_API_KEY).
// The `openai` package is imported dynamically so the server still boots if it
// is not installed / no key is present.

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function generateHeadshotOpenAI(
  model: "gpt-image-1" | "gpt-image-1.5",
  referenceImages: ReferenceImage[],
  backgroundColor: string = "#562226",
  clothing: ClothingOptions = { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" },
): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI is not configured (OPENAI_API_KEY missing)");
  }

  const { prompt, clothingPhrase } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

  console.log("═══════════════════════════════════════════════════════════");
  console.log(`🤖 OPENAI ${model} REQUEST`);
  console.log("📷 Reference Images:", referenceImages.length);
  console.log("🎨 Background Color:", backgroundColor);
  console.log("👔 Clothing:", clothingPhrase);

  const startTime = Date.now();

  try {
    const { default: OpenAI, toFile } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const files = await Promise.all(
      referenceImages.map((img, i) =>
        toFile(Buffer.from(img.base64, "base64"), `input-${i}.png`, {
          type: img.mimeType || "image/png",
        }),
      ),
    );

    const result = await client.images.edit({
      model,
      image: files.length === 1 ? files[0] : files,
      prompt,
      size: "1024x1024",
      quality: "high",
    });

    const elapsed = Date.now() - startTime;
    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("No image data returned from OpenAI");
    }

    console.log(`✅ OpenAI (${model}) image generated in`, elapsed, "ms");
    console.log("═══════════════════════════════════════════════════════════");
    return b64;
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.log(`❌ OPENAI (${model}) ERROR after`, elapsed, "ms:", error.message || error);
    throw error;
  }
}
