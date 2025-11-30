export type ModelType = "flash" | "pro";

export const BACKGROUND_COLORS = [
  { name: "Deep Burgundy", hex: "#562226" },
  { name: "Navy Blue", hex: "#1a2744" },
  { name: "Charcoal Gray", hex: "#2d2d2d" },
  { name: "Forest Green", hex: "#1e3a2f" },
  { name: "Warm Taupe", hex: "#8b7355" },
  { name: "Classic Black", hex: "#0a0a0a" },
] as const;

export type BackgroundColor = typeof BACKGROUND_COLORS[number]["hex"];

export async function transformImage(
  file: File, 
  model: ModelType = "flash",
  backgroundColor: BackgroundColor = "#562226"
): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("model", model);
  formData.append("backgroundColor", backgroundColor);

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
