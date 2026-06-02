import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

// Uses Replit's OpenAI AI integration (javascript_openai_ai_integrations).
// Credentials are auto-configured via AI_INTEGRATIONS_OPENAI_* env vars — no API key required.
// The `openai` package is installed when the integration is confirmed, so we import it
// dynamically to avoid crashing the server before that happens.

export function isOpenAIConfigured(): boolean {
  return !!process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
}

export async function generateHeadshotOpenAI(
  referenceImages: ReferenceImage[],
  backgroundColor: string = "#562226",
  clothing: ClothingOptions = { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" },
): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error("OpenAI integration is not configured");
  }

  const { prompt, clothingPhrase } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 OPENAI gpt-image-1 REQUEST");
  console.log("📷 Reference Images:", referenceImages.length);
  console.log("🎨 Background Color:", backgroundColor);
  console.log("👔 Clothing:", clothingPhrase);
  console.log("⏳ Sending request to OpenAI...");

  const startTime = Date.now();

  try {
    const { default: OpenAI, toFile } = await import("openai");
    const client = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });

    const files = await Promise.all(
      referenceImages.map((img, i) =>
        toFile(Buffer.from(img.base64, "base64"), `input-${i}.png`, {
          type: img.mimeType || "image/png",
        }),
      ),
    );

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: files.length === 1 ? files[0] : files,
      prompt,
      size: "1024x1024",
      quality: "high",
    });

    const elapsed = Date.now() - startTime;
    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      console.log("❌ OpenAI returned no image data");
      throw new Error("No image data returned from OpenAI");
    }

    console.log("✅ OpenAI image generated in", elapsed, "ms");
    console.log("📏 Output Image Size:", Math.round(b64.length / 1024), "KB");
    console.log("═══════════════════════════════════════════════════════════");
    return b64;
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.log("❌ OPENAI API ERROR after", elapsed, "ms:", error.message || error);
    throw error;
  }
}
