export type Gender = "men" | "women";

export interface ClothingOptions {
  gender: Gender;
  clothingId: string;
  clothingColor: string;
}

export interface ReferenceImage {
  base64: string;
  mimeType: string;
}

const CLOTHING_DESCRIPTIONS: Record<string, Record<string, string>> = {
  men: {
    blazer: "premium smart casual blazer",
    suit: "tailored formal business suit with matching tie",
    dress_shirt: "crisp professional dress shirt",
    knit: "textured premium knit sweater",
  },
  women: {
    blazer: "elegant tailored professional blazer",
    blouse: "elegant silk professional blouse",
    jewel_blouse: "luxurious jewel-toned silk blouse",
    sheath_dress: "sophisticated professional sheath dress",
  },
};

const COLOR_NAMES: Record<string, string> = {
  "#4a4a4a": "charcoal gray",
  "#1a2744": "navy",
  "#1a1a1a": "black",
  "#f5f5f5": "white",
  "#a8c5e2": "light blue",
  "#f0d4d4": "pale pink",
  "#562226": "burgundy",
  "#f5f5dc": "ivory",
  "#2e5a4c": "emerald",
  "#1a3a5c": "sapphire",
};

export function buildHeadshotPrompt(
  clothing: ClothingOptions,
  backgroundColor: string,
  referenceCount: number,
): { prompt: string; clothingPhrase: string } {
  const clothingDesc =
    CLOTHING_DESCRIPTIONS[clothing.gender]?.[clothing.clothingId] ||
    "premium smart casual blazer";

  const colorName = COLOR_NAMES[clothing.clothingColor] || "charcoal gray";

  const clothingPhrase = `${colorName} ${clothingDesc}`;

  const referenceNote =
    referenceCount > 1
      ? `Use all ${referenceCount} reference photos provided to accurately capture the subject's facial identity, features, and likeness. The reference photos show the same person from different angles/lighting - use them to understand the subject's face thoroughly.`
      : "";

  const prompt = `${referenceNote}

Transform this into a professional, high-resolution profile photo, maintaining the exact facial structure, identity, and key features of the person in the reference image(s). The subject is framed from the chest up, with ample headroom. The person looks directly at the camera. They are styled for a professional photo studio shoot, wearing a ${clothingPhrase}. The background is a solid '${backgroundColor}' neutral studio color. Shot from a high angle with bright and airy soft, diffused studio lighting, gently illuminating the face and creating a subtle catchlight in the eyes, conveying a sense of clarity. Captured on an 85mm f/1.8 lens with a shallow depth of field, exquisite focus on the eyes, and beautiful, soft bokeh. Observe crisp detail on the fabric texture of the clothing, individual strands of hair, and natural, realistic skin texture. The atmosphere exudes confidence, professionalism, and approachability. Clean and bright cinematic color grading with subtle warmth and balanced tones, ensuring a polished and contemporary feel.`;

  return { prompt, clothingPhrase };
}
