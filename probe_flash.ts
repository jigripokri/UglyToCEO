import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY_HH || "" });
const base64 = fs.readFileSync("eval-images/man_30s_beard_09.png").toString("base64");
const MODELS: Record<string, string> = {
  flash: "gemini-2.5-flash-image",
  pro:   "gemini-3-pro-image-preview",
};

async function probe(modelKey: string, extraConfig: Record<string, any> = {}) {
  console.log("\n════════════════════════════════════════");
  console.log(`PROBE: ${modelKey} → ${MODELS[modelKey]}`);
  console.log(`extra config: ${JSON.stringify(extraConfig)}`);
  console.log("════════════════════════════════════════");
  try {
    const callArgs: any = {
      model: MODELS[modelKey],
      contents: [{ role: "user", parts: [
        { text: "Transform this into a professional headshot. Background: dark navy." },
        { inlineData: { mimeType: "image/png", data: base64 } },
      ]}],
    };
    if (Object.keys(extraConfig).length) callArgs.config = extraConfig;

    const response = await genAI.models.generateContent(callArgs);

    const safe = JSON.parse(JSON.stringify(response, (k, v) =>
      (k === "data" && typeof v === "string" && v.length > 100)
        ? `[base64 ${Math.round(v.length/1024)}KB]` : v
    ));
    console.log("FULL RESPONSE:", JSON.stringify(safe, null, 2));

    const c = response.candidates?.[0];
    console.log("--- SUMMARY ---");
    console.log("candidates        :", response.candidates?.length);
    console.log("finishReason      :", c?.finishReason);
    console.log("safetyRatings     :", JSON.stringify(c?.safetyRatings));
    console.log("content exists    :", !!c?.content);
    console.log("parts is array    :", Array.isArray(c?.content?.parts));
    console.log("parts length      :", c?.content?.parts?.length);
    console.log("promptFeedback    :", JSON.stringify((response as any).promptFeedback));
    (c?.content?.parts ?? []).forEach((p: any, i: number) => {
      const keys = Object.keys(p);
      console.log(`  part[${i}] keys:`, keys);
      if (p.text) console.log(`    text: "${p.text.slice(0, 300)}"`);
      if (p.inlineData) console.log(`    inlineData: ${p.inlineData.mimeType} ${Math.round((p.inlineData.data||"").length/1024)}KB`);
    });
  } catch (e: any) {
    console.log("EXCEPTION:", e.message, "| status:", e.status);
    console.log("FULL ERROR:", JSON.stringify(e, null, 2));
  }
}

async function main() {
  // 1. Flash WITHOUT responseModalities — what production was doing before fix
  await probe("flash");
  // 2. Flash WITH responseModalities — what the fix adds
  await probe("flash", { responseModalities: ["TEXT", "IMAGE"] });
}
main();
