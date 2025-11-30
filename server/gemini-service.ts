import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY_HH || "",
});

export async function generateProfessionalHeadshot(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<string> {
  const prompt = `Transform this photo into the following:

A professional, high-resolution profile photo, maintaining the exact facial structure, identity, and key features of the person in the input image. The subject is framed from the chest up, with ample headroom. The person looks directly at the camera. They are styled for a professional photo studio shoot, wearing a premium smart casual blazer in a subtle charcoal gray. The background is a solid '#562226' neutral studio color. Shot from a high angle with bright and airy soft, diffused studio lighting, gently illuminating the face and creating a subtle catchlight in the eyes, conveying a sense of clarity. Captured on an 85mm f/1.8 lens with a shallow depth of field, exquisite focus on the eyes, and beautiful, soft bokeh. Observe crisp detail on the fabric texture of the blazer, individual strands of hair, and natural, realistic skin texture. The atmosphere exudes confidence, professionalism, and approachability. Clean and bright cinematic color grading with subtle warmth and balanced tones, ensuring a polished and contemporary feel.`;

  const model = "gemini-2.5-flash-image";

  console.log("═══════════════════════════════════════════════════════════");
  console.log("🤖 GEMINI API REQUEST");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("📍 Model:", model);
  console.log("📷 Image MIME Type:", mimeType);
  console.log("📏 Image Size:", Math.round(imageBase64.length / 1024), "KB (base64)");
  console.log("📝 Prompt:");
  console.log("───────────────────────────────────────────────────────────");
  console.log(prompt);
  console.log("───────────────────────────────────────────────────────────");
  console.log("⏳ Sending request to Gemini...");

  const startTime = Date.now();

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const elapsed = Date.now() - startTime;

    console.log("═══════════════════════════════════════════════════════════");
    console.log("🤖 GEMINI API RESPONSE");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("⏱️  Response Time:", elapsed, "ms");
    console.log("📦 Candidates:", response.candidates?.length || 0);

    if (!response.candidates || response.candidates.length === 0) {
      console.log("❌ No candidates in response");
      console.log("📋 Full response:", JSON.stringify(response, null, 2));
      throw new Error("No response generated");
    }

    const candidate = response.candidates[0];
    console.log("📄 Parts in response:", candidate.content?.parts?.length || 0);

    if (!candidate.content || !candidate.content.parts) {
      console.log("❌ Invalid response format");
      throw new Error("Invalid response format");
    }

    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log("📝 Text response:", part.text);
      }
      if (part.inlineData && part.inlineData.data) {
        console.log("✅ Image generated successfully!");
        console.log("📏 Output image size:", Math.round(part.inlineData.data.length / 1024), "KB (base64)");
        console.log("═══════════════════════════════════════════════════════════");
        return part.inlineData.data;
      }
    }

    console.log("❌ No image data found in response parts");
    console.log("📋 Response parts:", JSON.stringify(candidate.content.parts, null, 2));
    throw new Error("No image data in response");
  } catch (error: any) {
    const elapsed = Date.now() - startTime;
    console.log("═══════════════════════════════════════════════════════════");
    console.log("❌ GEMINI API ERROR");
    console.log("═══════════════════════════════════════════════════════════");
    console.log("⏱️  Time before error:", elapsed, "ms");
    console.log("🔴 Error:", error.message || error);
    if (error.status) console.log("📊 Status:", error.status);
    if (error.response) console.log("📋 Response:", JSON.stringify(error.response, null, 2));
    throw error;
  }
}
