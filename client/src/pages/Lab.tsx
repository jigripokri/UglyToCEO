import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  BACKGROUND_COLORS,
  MEN_CLOTHING,
  WOMEN_CLOTHING,
  DEFAULT_CLOTHING,
  type ClothingSelection,
  type Gender,
} from "@/lib/api";
import {
  getLabSession,
  compareLabModels,
  type LabModelInfo,
} from "@/lib/labApi";
import { Loader2, Download, Upload, RefreshCw, AlertTriangle } from "lucide-react";

type CardStatus = "idle" | "loading" | "done" | "error";

interface ModelResult {
  status: CardStatus;
  image?: string;
  error?: string;
  elapsedMs?: number;
}

export default function Lab() {
  const { toast } = useToast();
  const [loadingSession, setLoadingSession] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [models, setModels] = useState<LabModelInfo[]>([]);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [gender, setGender] = useState<Gender>(DEFAULT_CLOTHING.gender);
  const [clothingId, setClothingId] = useState(DEFAULT_CLOTHING.clothingId);
  const [clothingColor, setClothingColor] = useState(DEFAULT_CLOTHING.clothingColor);
  const [backgroundColor, setBackgroundColor] = useState<string>(BACKGROUND_COLORS[0].hex);

  const [results, setResults] = useState<Record<string, ModelResult>>({});
  const [generating, setGenerating] = useState(false);

  const clothingOptions = gender === "men" ? MEN_CLOTHING : WOMEN_CLOTHING;
  const activeClothing = clothingOptions.find((c) => c.id === clothingId) ?? clothingOptions[0];

  async function refreshSession() {
    try {
      const session = await getLabSession();
      setConfigured(session.configured);
      setModels(session.models);
    } catch {
      // ignore
    } finally {
      setLoadingSession(false);
    }
  }

  useEffect(() => {
    refreshSession();
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleGenderChange(next: Gender) {
    setGender(next);
    const list = next === "men" ? MEN_CLOTHING : WOMEN_CLOTHING;
    setClothingId(list[0].id);
    setClothingColor(list[0].colors[0].hex);
  }

  function handleClothingChange(id: string) {
    setClothingId(id);
    const item = clothingOptions.find((c) => c.id === id);
    if (item) setClothingColor(item.colors[0].hex);
  }

  async function handleGenerate() {
    if (!file) {
      toast({ title: "Add a photo first", variant: "destructive" });
      return;
    }
    if (models.length === 0) {
      toast({ title: "No models available", variant: "destructive" });
      return;
    }

    setGenerating(true);
    const clothing: ClothingSelection = { gender, clothingId, clothingColor };
    setResults(
      Object.fromEntries(models.map((m) => [m.id, { status: "loading" as CardStatus }])),
    );

    try {
      const compareResults = await compareLabModels(
        file,
        models.map((m) => m.id),
        backgroundColor,
        clothing,
      );
      setResults(
        Object.fromEntries(
          compareResults.map((r) => [
            r.modelId,
            r.image
              ? { status: "done" as CardStatus, image: r.image, elapsedMs: r.elapsedMs }
              : { status: "error" as CardStatus, error: r.error || "Failed", elapsedMs: r.elapsedMs },
          ]),
        ),
      );
    } catch (err) {
      toast({
        title: "Comparison failed",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      setResults({});
    } finally {
      setGenerating(false);
    }
  }

  function downloadImage(modelId: string, image: string) {
    const a = document.createElement("a");
    a.href = image;
    a.download = `headshot-${modelId}.png`;
    a.click();
  }

  // ── Loading ──────────────────────────────────────────────
  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  // ── Lab tool ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold" data-testid="text-lab-header">Model Comparison Lab</h1>
          <p className="text-xs text-neutral-500">One photo, every model, side by side.</p>
        </div>
      </header>

      {!configured && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div
            className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700"
            data-testid="text-lab-not-configured"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              OpenRouter isn't configured yet. Set the <code className="font-mono">OPENROUTER_API_KEY</code> secret to enable generation.
            </span>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[320px_1fr] gap-6">
        {/* Controls */}
        <Card className="p-5 space-y-5 h-fit">
          <div>
            <Label className="text-sm font-medium">Input photo</Label>
            <label
              htmlFor="lab-file"
              className="mt-2 flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-lg p-4 cursor-pointer hover:border-neutral-300 transition-colors"
              data-testid="dropzone-lab-upload"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="input" className="max-h-40 rounded-md object-contain" data-testid="img-lab-input" />
              ) : (
                <div className="flex flex-col items-center text-neutral-400 py-6">
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              <input
                id="lab-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                data-testid="input-lab-file"
              />
            </label>
          </div>

          <div>
            <Label className="text-sm font-medium">Gender styling</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(["men", "women"] as Gender[]).map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={gender === g ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGenderChange(g)}
                  data-testid={`button-gender-${g}`}
                >
                  {g === "men" ? "Men" : "Women"}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="lab-clothing" className="text-sm font-medium">Clothing</Label>
            <select
              id="lab-clothing"
              className="mt-2 w-full border border-neutral-200 rounded-md px-3 py-2 text-sm bg-white"
              value={clothingId}
              onChange={(e) => handleClothingChange(e.target.value)}
              data-testid="select-lab-clothing"
            >
              {clothingOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium">Clothing color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {activeClothing.colors.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setClothingColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 ${clothingColor === c.hex ? "border-neutral-900" : "border-neutral-200"}`}
                  style={{ backgroundColor: c.hex }}
                  data-testid={`button-clothing-color-${c.hex.replace("#", "")}`}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Background</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {BACKGROUND_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  title={c.name}
                  onClick={() => setBackgroundColor(c.hex)}
                  className={`w-7 h-7 rounded-full border-2 ${backgroundColor === c.hex ? "border-neutral-900" : "border-neutral-200"}`}
                  style={{ backgroundColor: c.hex }}
                  data-testid={`button-bg-color-${c.hex.replace("#", "")}`}
                />
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generating || !file || !configured || models.length === 0}
            data-testid="button-lab-generate"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating…</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" /> Generate across {models.length} model{models.length === 1 ? "" : "s"}</>
            )}
          </Button>
        </Card>

        {/* Results grid */}
        <div className="grid sm:grid-cols-2 gap-4 content-start">
          {models.map((m) => {
            const r = results[m.id];
            return (
              <Card key={m.id} className="overflow-hidden flex flex-col" data-testid={`card-model-${m.id}`}>
                <div className="p-3 border-b flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm" data-testid={`text-model-name-${m.id}`}>{m.displayName}</p>
                    <p className="text-xs text-neutral-500">{m.provider}</p>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap">{m.slug}</span>
                </div>

                <div className="aspect-square bg-neutral-100 flex items-center justify-center relative">
                  {!r || r.status === "idle" ? (
                    <span className="text-xs text-neutral-400">Ready</span>
                  ) : r.status === "loading" ? (
                    <Loader2 className="w-6 h-6 animate-spin text-neutral-400" data-testid={`loader-${m.id}`} />
                  ) : r.status === "error" ? (
                    <span className="text-xs text-red-500 px-4 text-center" data-testid={`text-error-${m.id}`}>{r.error}</span>
                  ) : r.image ? (
                    <img src={r.image} alt={m.displayName} className="w-full h-full object-cover" data-testid={`img-result-${m.id}`} />
                  ) : null}
                </div>

                {r?.status === "done" && r.image && (
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">{r.elapsedMs ? `${(r.elapsedMs / 1000).toFixed(1)}s` : ""}</span>
                    <Button size="sm" variant="ghost" onClick={() => downloadImage(m.id, r.image!)} data-testid={`button-download-${m.id}`}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
