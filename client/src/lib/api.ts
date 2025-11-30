export type ModelType = "flash" | "pro";
export type Gender = "men" | "women";

export const BACKGROUND_COLORS = [
  { name: "Deep Burgundy", hex: "#562226" },
  { name: "Navy Blue", hex: "#1a2744" },
  { name: "Charcoal Gray", hex: "#2d2d2d" },
  { name: "Forest Green", hex: "#1e3a2f" },
  { name: "Warm Taupe", hex: "#8b7355" },
  { name: "Classic Black", hex: "#0a0a0a" },
] as const;

export type BackgroundColor = typeof BACKGROUND_COLORS[number]["hex"];

// Clothing options for men
export const MEN_CLOTHING = [
  {
    id: "blazer",
    name: "Classic Blazer",
    icon: "🧥",
    description: "premium smart casual blazer",
    colors: [
      { name: "Charcoal Gray", hex: "#4a4a4a" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Black", hex: "#1a1a1a" },
    ],
  },
  {
    id: "suit",
    name: "Formal Suit",
    icon: "🤵",
    description: "tailored formal business suit with matching tie",
    colors: [
      { name: "Navy", hex: "#1a2744" },
      { name: "Charcoal", hex: "#4a4a4a" },
      { name: "Black", hex: "#1a1a1a" },
    ],
  },
  {
    id: "dress_shirt",
    name: "Dress Shirt",
    icon: "👔",
    description: "crisp professional dress shirt",
    colors: [
      { name: "White", hex: "#f5f5f5" },
      { name: "Light Blue", hex: "#a8c5e2" },
      { name: "Pale Pink", hex: "#f0d4d4" },
    ],
  },
  {
    id: "knit",
    name: "Casual Knit",
    icon: "🧶",
    description: "textured premium knit sweater",
    colors: [
      { name: "Charcoal", hex: "#4a4a4a" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Burgundy", hex: "#562226" },
    ],
  },
] as const;

// Clothing options for women
export const WOMEN_CLOTHING = [
  {
    id: "blazer",
    name: "Tailored Blazer",
    icon: "🧥",
    description: "elegant tailored professional blazer",
    colors: [
      { name: "Charcoal Gray", hex: "#4a4a4a" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Black", hex: "#1a1a1a" },
    ],
  },
  {
    id: "blouse",
    name: "Professional Blouse",
    icon: "👚",
    description: "elegant silk professional blouse",
    colors: [
      { name: "Ivory", hex: "#f5f5dc" },
      { name: "Soft Blue", hex: "#a8c5e2" },
      { name: "Blush", hex: "#f0d4d4" },
    ],
  },
  {
    id: "jewel_blouse",
    name: "Jewel-Tone Blouse",
    icon: "✨",
    description: "luxurious jewel-toned silk blouse",
    colors: [
      { name: "Emerald", hex: "#2e5a4c" },
      { name: "Burgundy", hex: "#562226" },
      { name: "Sapphire", hex: "#1a3a5c" },
    ],
  },
  {
    id: "sheath_dress",
    name: "Sheath Dress",
    icon: "👗",
    description: "sophisticated professional sheath dress",
    colors: [
      { name: "Black", hex: "#1a1a1a" },
      { name: "Navy", hex: "#1a2744" },
      { name: "Burgundy", hex: "#562226" },
    ],
  },
] as const;

export type MenClothingId = typeof MEN_CLOTHING[number]["id"];
export type WomenClothingId = typeof WOMEN_CLOTHING[number]["id"];
export type ClothingId = MenClothingId | WomenClothingId;

export interface ClothingSelection {
  gender: Gender;
  clothingId: string;
  clothingColor: string;
}

// Default clothing selection
export const DEFAULT_CLOTHING: ClothingSelection = {
  gender: "men",
  clothingId: "blazer",
  clothingColor: "#4a4a4a", // Charcoal Gray
};

export async function transformImage(
  file: File, 
  model: ModelType = "flash",
  backgroundColor: BackgroundColor = "#562226",
  clothing: ClothingSelection = DEFAULT_CLOTHING
): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("model", model);
  formData.append("backgroundColor", backgroundColor);
  formData.append("gender", clothing.gender);
  formData.append("clothingId", clothing.clothingId);
  formData.append("clothingColor", clothing.clothingColor);

  const response = await fetch("/api/transform", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || "Failed to transform image");
  }

  const data = await response.json();
  return data.image;
}

export async function getStats(): Promise<{ totalHeadshots: number }> {
  const response = await fetch("/api/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}
