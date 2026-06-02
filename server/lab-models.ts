import { generateProfessionalHeadshot } from "./gemini-service";
import { generateHeadshotOpenAI, isOpenAIConfigured } from "./openai-service";
import type { ClothingOptions, ReferenceImage } from "./headshot-prompt";

export interface LabModelInfo {
  id: string;
  displayName: string;
  provider: string;
  approxCost: string;
  note?: string;
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
    isAvailable: () => !!process.env.GOOGLE_API_KEY_HH,
    generate: (imgs, bg, clothing) =>
      generateProfessionalHeadshot(imgs, "flash", bg, clothing),
  },
  {
    id: "gemini-pro",
    displayName: "Nano Banana Pro",
    provider: "Google · Gemini 3 Pro Image",
    approxCost: "~$0.13 / image",
    isAvailable: () => !!process.env.GOOGLE_API_KEY_HH,
    generate: (imgs, bg, clothing) =>
      generateProfessionalHeadshot(imgs, "pro", bg, clothing),
  },
  {
    id: "openai-gpt-image-1",
    displayName: "OpenAI GPT Image 1",
    provider: "OpenAI · gpt-image-1 (high)",
    approxCost: "~$0.167 / image (high)",
    isAvailable: isOpenAIConfigured,
    generate: (imgs, bg, clothing) => generateHeadshotOpenAI(imgs, bg, clothing),
  },
];

export function listLabModels(): (LabModelInfo & { available: boolean })[] {
  return LAB_MODELS.map((m) => ({
    id: m.id,
    displayName: m.displayName,
    provider: m.provider,
    approxCost: m.approxCost,
    note: m.note,
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
