export type ModelType = "flash" | "pro";

export async function transformImage(file: File, model: ModelType = "flash"): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("model", model);

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
