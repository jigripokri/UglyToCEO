import { generateProfessionalHeadshot } from "./gemini-service";
import { generateHeadshotOpenAI, isOpenAIConfigured } from "./openai-service";
import { generateHeadshotFlux, isFluxConfigured } from "./flux-service";
import { generateHeadshotSeedream, isSeedreamConfigured } from "./seedream-service";
import { generateHeadshotMai, isMaiConfigured } from "./mai-service";
import type { ClothingOptions, ReferenceImage } from "./headshot-prompt";

export interface LabModelInfo {
  id: string;
  displayName: string;
  provider: string;
  approxCost: string;
  note?: string;
  /** Whether the model uses the uploaded photo. MAI is text-only (false). */
  usesPhoto: boolean;
}

interface LabModelDef extends LabModelInfo {
  isAvailable: () => boolean;
  generate: (
    referenceImages: ReferenceImage[],
    backgroundColor: string,
    clothing: ClothingOptions,
  ) => Promise<string>;
}

const LAB_MODELS: LabModelDef[] = [
  {
    id: "gemini-flash",
    displayName: "Nano Banana",
    provider: "Google · Gemini 2.5 Flash Image",
    approxCost: "~$0.039 / image",
    usesPhoto: true,
    isAvailable: () => !!process.env.GOOGLE_API_KEY_HH,
    generate: (imgs, bg, clothing) =>
      generateProfessionalHeadshot(imgs, "flash", bg, clothing),
  },
  {
    id: "gemini-pro",
    displayName: "Nano Banana Pro",
    provider: "Google · Gemini 3 Pro Image",
    approxCost: "~$0.13 / image",
    usesPhoto: true,
    isAvailable: () => !!process.env.GOOGLE_API_KEY_HH,
    generate: (imgs, bg, clothing) =>
      generateProfessionalHeadshot(imgs, "pro", bg, clothing),
  },
  {
    id: "openai-gpt-image-1",
    displayName: "OpenAI GPT Image 1",
    provider: "OpenAI · gpt-image-1 (high)",
    approxCost: "~$0.167 / image (high)",
    usesPhoto: true,
    isAvailable: isOpenAIConfigured,
    generate: (imgs, bg, clothing) =>
      generateHeadshotOpenAI("gpt-image-1", imgs, bg, clothing),
  },
  {
    id: "openai-gpt-image-1.5",
    displayName: "OpenAI GPT Image 1.5",
    provider: "OpenAI · gpt-image-1.5 (high)",
    approxCost: "~$0.133 / image (high)",
    usesPhoto: true,
    isAvailable: isOpenAIConfigured,
    generate: (imgs, bg, clothing) =>
      generateHeadshotOpenAI("gpt-image-1.5", imgs, bg, clothing),
  },
  {
    id: "flux-kontext-pro",
    displayName: "FLUX.1 Kontext [pro]",
    provider: "Black Forest Labs",
    approxCost: "~$0.04 / image",
    usesPhoto: true,
    isAvailable: isFluxConfigured,
    generate: generateHeadshotFlux,
  },
  {
    id: "seedream-4",
    displayName: "Seedream 4.0",
    provider: "ByteDance · BytePlus ModelArk",
    approxCost: "~$0.03 / image",
    usesPhoto: true,
    isAvailable: isSeedreamConfigured,
    generate: generateHeadshotSeedream,
  },
  {
    id: "mai-image-2",
    displayName: "MAI-Image-2",
    provider: "Microsoft · Azure AI Foundry",
    approxCost: "~$0.04 / image",
    note: "Text-only — does not use your photo, so it won't preserve your face.",
    usesPhoto: false,
    isAvailable: isMaiConfigured,
    generate: generateHeadshotMai,
  },
];

export function listLabModels(): (LabModelInfo & { available: boolean })[] {
  return LAB_MODELS.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    provider: m.provider,
    approxCost: m.approxCost,
    note: m.note,
    usesPhoto: m.usesPhoto,
    available: m.isAvailable(),
  }));
}

export async function generateWithLabModel(
  modelId: string,
  referenceImages: ReferenceImage[],
  backgroundColor: string,
  clothing: ClothingOptions,
): Promise<string> {
  const model = LAB_MODELS.find((m) => m.id === modelId);
  if (!model) {
    throw new Error(`Unknown model: ${modelId}`);
  }
  if (!model.isAvailable()) {
    throw new Error(`${model.displayName} is not configured`);
  }
  return model.generate(referenceImages, backgroundColor, clothing);
}
