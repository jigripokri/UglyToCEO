import {
  generateHeadshotOpenRouter,
  isOpenRouterConfigured,
} from "./openrouter-service";
import type { ClothingOptions, ReferenceImage } from "./headshot-prompt";

export interface LabModelInfo {
  id: string;
  displayName: string;
  provider: string;
  /** The OpenRouter model slug used for the request. */
  slug: string;
  /** Rough per-image cost, for display only. */
  approxCost: string;
}

interface LabModelDef extends LabModelInfo {}

const LAB_MODELS: LabModelDef[] = [
  {
    id: "gemini-flash",
    displayName: "Nano Banana",
    provider: "Google · Gemini 2.5 Flash Image",
    slug: "google/gemini-2.5-flash-image",
    approxCost: "~$0.04 / image",
  },
  {
    id: "gemini-flash-2",
    displayName: "Nano Banana 2",
    provider: "Google · Gemini 3.1 Flash Image (preview)",
    slug: "google/gemini-3.1-flash-image-preview",
    approxCost: "~$0.04 / image",
  },
  {
    id: "gemini-pro",
    displayName: "Nano Banana Pro",
    provider: "Google · Gemini 3 Pro Image (preview)",
    slug: "google/gemini-3-pro-image-preview",
    approxCost: "~$0.13 / image",
  },
  {
    id: "gpt-image",
    displayName: "GPT-5 Image",
    provider: "OpenAI · gpt-5-image",
    slug: "openai/gpt-5-image",
    approxCost: "~$0.17 / image",
  },
  {
    id: "gpt-image-mini",
    displayName: "GPT-5 Image Mini",
    provider: "OpenAI · gpt-5-image-mini",
    slug: "openai/gpt-5-image-mini",
    approxCost: "~$0.04 / image",
  },
  {
    id: "gpt-image-2",
    displayName: "GPT-5.4 Image 2",
    provider: "OpenAI · gpt-5.4-image-2",
    slug: "openai/gpt-5.4-image-2",
    approxCost: "~$0.12 / image",
  },
];

export function isLabConfigured(): boolean {
  return isOpenRouterConfigured();
}

export function listLabModels(): LabModelInfo[] {
  return LAB_MODELS.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    provider: m.provider,
    slug: m.slug,
    approxCost: m.approxCost,
  }));
}

export function getLabModel(modelId: string): LabModelDef | undefined {
  return LAB_MODELS.find((m) => m.id === modelId);
}

export async function generateWithLabModel(
  modelId: string,
  referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  const model = getLabModel(modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  if (!isOpenRouterConfigured()) {
    throw new Error("OpenRouter is not configured");
  }
  return generateHeadshotOpenRouter(
    model.slug,
    referenceImages,
    backgroundColor,
    clothing,
  );
}
