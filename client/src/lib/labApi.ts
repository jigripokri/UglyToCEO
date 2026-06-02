import type { ClothingSelection } from "./api";

export interface LabModelInfo {
  id: string;
  displayName: string;
  provider: string;
  approxCost: string;
  note?: string;
  available: boolean;
}

export interface LabSession {
  configured: boolean;
  authenticated: boolean;
  models: LabModelInfo[];
}

export interface LabGenerateResult {
  modelId: string;
  image: string;
  elapsedMs: number;
}

export async function getLabSession(): Promise<LabSession> {
  const res = await fetch("/api/lab/session", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load lab session");
  return res.json();
}

export async function labLogin(password: string): Promise<void> {
  const res = await fetch("/api/lab/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Login failed");
  }
}

export async function labLogout(): Promise<void> {
  await fetch("/api/lab/logout", { method: "POST", credentials: "include" });
}

export async function generateLabImage(
  file: File,
  modelId: string,
  backgroundColor: string,
  clothing: ClothingSelection,
): Promise<LabGenerateResult> {
  const formData = new FormData();
  formData.append("images", file);
  formData.append("modelId", modelId);
  formData.append("backgroundColor", backgroundColor);
  formData.append("gender", clothing.gender);
  formData.append("clothingId", clothing.clothingId);
  formData.append("clothingColor", clothing.clothingColor);

  const res = await fetch("/api/lab/generate", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.details || data.error || "Generation failed");
  }
  return res.json();
}
