import type { ClothingSelection } from "./api";

export interface LabModelInfo {
  id: string;
  displayName: string;
  provider: string;
  slug: string;
}

export interface LabSession {
  configured: boolean;
  models: LabModelInfo[];
}

export interface LabCompareResult {
  modelId: string;
  image?: string;
  error?: string;
  elapsedMs: number;
}

export async function getLabSession(): Promise<LabSession> {
  const res = await fetch("/api/lab/session");
  if (!res.ok) throw new Error("Failed to load lab session");
  return res.json();
}

export async function compareLabModels(
  file: File,
  modelIds: string[],
  backgroundColor: string,
  clothing: ClothingSelection,
): Promise<LabCompareResult[]> {
  const formData = new FormData();
  formData.append("images", file);
  formData.append("modelIds", JSON.stringify(modelIds));
  formData.append("backgroundColor", backgroundColor);
  formData.append("gender", clothing.gender);
  formData.append("clothingId", clothing.clothingId);
  formData.append("clothingColor", clothing.clothingColor);

  const res = await fetch("/api/lab/compare", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || data.details || "Comparison failed");
  }
  const data = (await res.json()) as { results: LabCompareResult[] };
  return data.results;
}
