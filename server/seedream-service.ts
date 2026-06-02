import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

// ByteDance Seedream 4.0 via BytePlus ModelArk image generation API.
// Image-to-image editing: accepts the input photo + prompt.
// Requires ARK_API_KEY. Optional ARK_BASE_URL and SEEDREAM_MODEL_ID overrides.

const DEFAULT_BASE = "https://ark.ap-southeast.bytepluses.com/api/v3";
const DEFAULT_MODEL = "seedream-4-0-250828";

export function isSeedreamConfigured(): boolean {
  return !!process.env.ARK_API_KEY;
}

export async function generateHeadshotSeedream(
  referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  if (!isSeedreamConfigured()) {
    throw new Error("Seedream is not configured (ARK_API_KEY missing)");
  }
  const apiKey = process.env.ARK_API_KEY as string;
  const baseUrl = process.env.ARK_BASE_URL || DEFAULT_BASE;
  const model = process.env.SEEDREAM_MODEL_ID || DEFAULT_MODEL;

  const { prompt, clothingPhrase } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 SEEDREAM 4.0 REQUEST");
  console.log("👔 Clothing:", clothingPhrase);

  const startTime = Date.now();

  const ref = referenceImages[0];
  const dataUri = `data:${ref?.mimeType || "image/png"};base64,${ref?.base64}`;

  const res = await fetch(`${baseUrl}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt,
      image: dataUri,
      size: "1024x1024",
      response_format: "b64_json",
      watermark: false,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Seedream request failed: ${res.status} ${text}`);
  }

  const data: any = await res.json();
  const item = data.data?.[0];
  let b64: string | undefined = item?.b64_json;

  if (!b64 && item?.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to download Seedream image: ${imgRes.status}`);
    b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
  }

  if (!b64) throw new Error("Seedream returned no image data");

  console.log("✅ Seedream image generated in", Date.now() - startTime, "ms");
  console.log("═══════════════════════════════════════════════════════════");
  return b64;
}
