import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

// FLUX.1 Kontext [pro] via Black Forest Labs API (https://docs.bfl.ai).
// Image-to-image editing: accepts the input photo + prompt, polls until ready.
// Requires BFL_API_KEY.

const BFL_BASE = "https://api.bfl.ai/v1";

export function isFluxConfigured(): boolean {
  return !!process.env.BFL_API_KEY;
}

async function poll(pollingUrl: string, apiKey: string): Promise<string> {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 1500));
    const res = await fetch(pollingUrl, {
      headers: { "x-key": apiKey, accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`BFL polling failed: ${res.status}`);
    }
    const data: any = await res.json();
    const status = data.status;
    if (status === "Ready") {
      const sample = data.result?.sample;
      if (!sample) throw new Error("BFL returned no image sample");
      return sample as string;
    }
    if (status === "Error" || status === "Failed" || status === "Content Moderated" || status === "Request Moderated") {
      throw new Error(`BFL generation ${status}: ${JSON.stringify(data.result ?? {})}`);
    }
  }
  throw new Error("BFL generation timed out");
}

export async function generateHeadshotFlux(
  referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  if (!isFluxConfigured()) {
    throw new Error("FLUX is not configured (BFL_API_KEY missing)");
  }
  const apiKey = process.env.BFL_API_KEY as string;

  const { prompt, clothingPhrase } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 FLUX.1 Kontext [pro] REQUEST");
  console.log("👔 Clothing:", clothingPhrase);

  const startTime = Date.now();

  const createRes = await fetch(`${BFL_BASE}/flux-kontext-pro`, {
    method: "POST",
    headers: {
      "x-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      prompt,
      input_image: referenceImages[0]?.base64,
      output_format: "png",
      aspect_ratio: "1:1",
    }),
  });

  if (!createRes.ok) {
    const text = await createRes.text().catch(() => "");
    throw new Error(`BFL request failed: ${createRes.status} ${text}`);
  }

  const created: any = await createRes.json();
  const pollingUrl: string | undefined = created.polling_url;
  if (!pollingUrl) throw new Error("BFL did not return a polling_url");

  const imageUrl = await poll(pollingUrl, apiKey);

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Failed to download FLUX image: ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  console.log("✅ FLUX image generated in", Date.now() - startTime, "ms");
  console.log("═══════════════════════════════════════════════════════════");
  return buf.toString("base64");
}
