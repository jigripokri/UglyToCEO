import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
});

export async function generateProfessionalHeadshot(
  imageBase64: string
): Promise<string> {
  const prompt = `Transform this casual photo into a professional business headshot. 
The result should have:
- Professional studio lighting
- Clean, neutral gray background
- Business professional attire (suit or blazer)
- Sharp focus and high quality
- Natural, confident expression
- Professional photography composition
Generate a high-quality professional headshot suitable for LinkedIn, corporate profiles, or business cards.`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  const response = result.response;
  
  if (!response.candidates || response.candidates.length === 0) {
    throw new Error("No image generated");
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    throw new Error("Invalid response format");
  }

  const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
  if (!imagePart || !imagePart.inlineData) {
    throw new Error("No image data in response");
  }

  return imagePart.inlineData.data;
}
