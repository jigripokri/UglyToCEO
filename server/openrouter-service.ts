import {
  buildHeadshotPrompt,
  type ClothingOptions,
  type ReferenceImage,
} from "./headshot-prompt";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function isOpenRouterConfigured(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

interface OpenRouterImage {
  type?: string;
  image_url?: { url?: string };
}

interface OpenRouterMessage {
  content?: string;
  images?: OpenRouterImage[];
}

interface OpenRouterResponse {
  choices?: { message?: OpenRouterMessage; finish_reason?: string }[];
  error?: { message?: string };
}

function extractBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
}

/**
 * Generate a professional headshot through OpenRouter for an arbitrary
 * image-capable model slug (e.g. "google/gemini-2.5-flash-image").
 * Returns the raw base64 of the generated PNG (no data: prefix).
 */
export async function generateHeadshotOpenRouter(
  modelSlug: string,
  referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const { prompt } = buildHeadshotPrompt(
    clothing,
    backgroundColor,
    referenceImages.length,
  );

  const content: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: prompt }];

  for (const img of referenceImages) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
    });
  }

  const startTime = Date.now();
  console.log(`🧪 [OpenRouter] → ${modelSlug} (${referenceImages.length} ref image(s))`);

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://uglytoceo.replit.app",
      "X-Title": "Ugly to CEO — Model Comparison Lab",
    },
    body: JSON.stringify({
      model: modelSlug,
      modalities: ["image", "text"],
      messages: [{ role: "user", content }],
    }),
  });

  const elapsed = Date.now() - startTime;

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = `OpenRouter request failed (${response.status})`;
    try {
      const parsed = JSON.parse(text) as OpenRouterResponse;
      if (parsed.error?.message) message = parsed.error.message;
    } catch {
      if (text) message = text.slice(0, 300);
    }
    console.log(`🧪 [OpenRouter] ✗ ${modelSlug} (${elapsed}ms): ${message}`);
    throw new Error(message);
  }

  const data = (await response.json()) as OpenRouterResponse;

  if (data.error?.message) {
    console.log(`🧪 [OpenRouter] ✗ ${modelSlug} (${elapsed}ms): ${data.error.message}`);
    throw new Error(data.error.message);
  }

  const message = data.choices?.[0]?.message;
  const imageUrl = message?.images?.find((i) => i.image_url?.url)?.image_url?.url;

  if (!imageUrl) {
    const textReply = message?.content?.trim();
    const detail = textReply
      ? `Model returned text instead of an image: ${textReply.slice(0, 200)}`
      : "No image returned by the model";
    console.log(`🧪 [OpenRouter] ✗ ${modelSlug} (${elapsed}ms): ${detail}`);
    throw new Error(detail);
  }

  console.log(`🧪 [OpenRouter] ✓ ${modelSlug} (${elapsed}ms)`);
  return extractBase64(imageUrl);
}
