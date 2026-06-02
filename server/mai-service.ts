import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

// Microsoft MAI-Image-2 via Azure AI Foundry image generations API.
// IMPORTANT: MAI-Image-2 is TEXT-TO-IMAGE ONLY. It cannot accept the input
// photo, so it does NOT preserve the subject's face — it generates a new
// professional-looking person from the text prompt alone.
//
// Requires AZURE_MAI_ENDPOINT, AZURE_MAI_API_KEY, AZURE_MAI_DEPLOYMENT.
// Optional AZURE_MAI_API_VERSION.

export function isMaiConfigured(): boolean {
  return !!(
    process.env.AZURE_MAI_ENDPOINT &&
    process.env.AZURE_MAI_API_KEY &&
    process.env.AZURE_MAI_DEPLOYMENT
  );
}

export async function generateHeadshotMai(
  _referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  if (!isMaiConfigured()) {
    throw new Error("MAI is not configured (Azure endpoint/key/deployment missing)");
  }

  const endpoint = (process.env.AZURE_MAI_ENDPOINT as string).replace(/\/$/, "");
  const apiKey = process.env.AZURE_MAI_API_KEY as string;
  const deployment = process.env.AZURE_MAI_DEPLOYMENT as string;
  const apiVersion = process.env.AZURE_MAI_API_VERSION || "2025-04-01-preview";

  // MAI cannot use the reference photo, so we describe a generic subject.
  const { prompt } = buildHeadshotPrompt(clothing, backgroundColor, 0);
  const fullPrompt = `A professional studio headshot of a person. ${prompt}`;

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 MAI-Image-2 REQUEST (text-to-image — ignores input photo)");

  const startTime = Date.now();

  const url = `${endpoint}/openai/deployments/${deployment}/images/generations?api-version=${apiVersion}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MAI request failed: ${res.status} ${text}`);
  }

  const data: any = await res.json();
  const item = data.data?.[0];
  let b64: string | undefined = item?.b64_json;

  if (!b64 && item?.url) {
    const imgRes = await fetch(item.url);
    if (!imgRes.ok) throw new Error(`Failed to download MAI image: ${imgRes.status}`);
    b64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
  }

  if (!b64) throw new Error("MAI returned no image data");

  console.log("✅ MAI image generated in", Date.now() - startTime, "ms");
  console.log("═══════════════════════════════════════════════════════════");
  return b64;
}
