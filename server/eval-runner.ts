import { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { evalResults } from "@shared/schema";
import { generateProfessionalHeadshot, type Gender, type ClothingOptions } from "./gemini-service";
import * as fs from "fs";
import * as path from "path";

const BACKGROUND_COLOR = "#562226";

const MALE_OUTFITS = [
  { clothingId: "blazer", clothingColor: "#4a4a4a" },
  { clothingId: "suit", clothingColor: "#1a2744" },
  { clothingId: "dress_shirt", clothingColor: "#f5f5f5" },
  { clothingId: "knit", clothingColor: "#2e5a4c" },
];

const FEMALE_OUTFITS = [
  { clothingId: "blazer", clothingColor: "#4a4a4a" },
  { clothingId: "blouse", clothingColor: "#f5f5f5" },
  { clothingId: "jewel_blouse", clothingColor: "#562226" },
  { clothingId: "sheath_dress", clothingColor: "#1a2744" },
];

interface TestImage {
  fileName: string;
  gender: Gender;
}

interface JudgeResponse {
  professionalismScore: number;
  identityPreservationScore: number;
  backgroundAccuracy: boolean;
  technicalQualityScore: number;
  overallScore: number;
  notes: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function judgeHeadshot(
  originalImageBase64: string,
  generatedImageBase64: string,
  genai: GoogleGenAI
): Promise<JudgeResponse> {
  const prompt = `You are an expert headshot quality evaluator. Analyze these two images:

1. ORIGINAL IMAGE: The input photo
2. GENERATED IMAGE: The professional headshot created from the original

Rate the generated headshot (1-5 scale, 5 is best):

1. **Professionalism Score**: Does this look like a professional headshot?
2. **Identity Preservation Score**: Does the person look like the same person?
3. **Background Accuracy**: Is the background a solid burgundy/maroon color? (true/false)
4. **Technical Quality Score**: Is the image free of artifacts and distortions?
5. **Overall Score**: Your holistic assessment.

Respond in JSON only (no markdown):
{"professionalismScore": 1-5, "identityPreservationScore": 1-5, "backgroundAccuracy": true/false, "technicalQualityScore": 1-5, "overallScore": 1-5, "notes": "brief note"}`;

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: originalImageBase64 }},
          { inlineData: { mimeType: "image/png", data: generatedImageBase64 }},
        ],
      }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanText = text.trim().replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleanText);
    
    return {
      professionalismScore: Math.min(5, Math.max(1, result.professionalismScore)),
      identityPreservationScore: Math.min(5, Math.max(1, result.identityPreservationScore)),
      backgroundAccuracy: !!result.backgroundAccuracy,
      technicalQualityScore: Math.min(5, Math.max(1, result.technicalQualityScore)),
      overallScore: Math.min(5, Math.max(1, result.overallScore)),
      notes: result.notes || "",
    };
  } catch (error) {
    console.error("Judge evaluation failed:", error);
    return {
      professionalismScore: 0,
      identityPreservationScore: 0,
      backgroundAccuracy: false,
      technicalQualityScore: 0,
      overallScore: 0,
      notes: `Evaluation error: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

async function runEvaluation() {
  const apiKey = process.env.GOOGLE_API_KEY_HH;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY_HH not found in environment");
    process.exit(1);
  }

  const genai = new GoogleGenAI({ apiKey });
  const runId = `eval_${Date.now()}`;
  const testImagesDir = path.join(process.cwd(), "eval-images");
  const outputImagesDir = path.join(process.cwd(), "eval-outputs");

  if (!fs.existsSync(outputImagesDir)) {
    fs.mkdirSync(outputImagesDir, { recursive: true });
  }

  if (!fs.existsSync(testImagesDir)) {
    console.log(`Creating eval-images directory at ${testImagesDir}`);
    fs.mkdirSync(testImagesDir, { recursive: true });
    console.log("\nPlease add test images to the eval-images directory and run again.");
    process.exit(0);
  }

  const allImages = fs.readdirSync(testImagesDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));

  if (allImages.length === 0) {
    console.log("No test images found. Add images to eval-images/ and run again.");
    process.exit(0);
  }

  const maleImages: TestImage[] = allImages
    .filter(f => f.toLowerCase().includes("man") || f.toLowerCase().includes("male"))
    .slice(0, 10)
    .map(f => ({ fileName: f, gender: "men" as Gender }));

  const femaleImages: TestImage[] = allImages
    .filter(f => f.toLowerCase().includes("woman") || f.toLowerCase().includes("female"))
    .slice(0, 10)
    .map(f => ({ fileName: f, gender: "women" as Gender }));

  const testImages = [...maleImages, ...femaleImages];

  console.log(`\n🧪 Starting Evaluation Run: ${runId}`);
  console.log(`📁 Found ${maleImages.length} male and ${femaleImages.length} female test images`);
  console.log(`🎨 Using background: ${BACKGROUND_COLOR}`);
  console.log(`👔 4 outfit variations per image (2 Flash + 2 Pro)`);
  console.log(`📊 Total tests: ${testImages.length * 4}\n`);

  let completed = 0;
  let passed = 0;
  let failed = 0;
  const totalTests = testImages.length * 4;

  for (const testImage of testImages) {
    const outfits = testImage.gender === "men" ? MALE_OUTFITS : FEMALE_OUTFITS;
    const shuffledOutfits = shuffleArray(outfits).slice(0, 4);
    const models: Array<"flash" | "pro"> = ["flash", "flash", "pro", "pro"];

    for (let i = 0; i < 4; i++) {
      completed++;
      const model = models[i];
      const outfit = shuffledOutfits[i];
      const progress = `[${completed}/${totalTests}]`;
      
      console.log(`${progress} ${testImage.fileName} | ${model.toUpperCase()} | ${outfit.clothingId}`);

      const startTime = Date.now();
      const imagePath = path.join(testImagesDir, testImage.fileName);

      try {
        const imageBuffer = fs.readFileSync(imagePath);
        const originalBase64 = imageBuffer.toString("base64");
        const ext = path.extname(imagePath).toLowerCase();
        const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

        const clothing: ClothingOptions = {
          gender: testImage.gender,
          clothingId: outfit.clothingId,
          clothingColor: outfit.clothingColor,
        };

        const generatedBase64 = await generateProfessionalHeadshot(
          originalBase64,
          mimeType,
          model,
          BACKGROUND_COLOR,
          clothing
        );

        const processingTime = Date.now() - startTime;

        const baseName = path.basename(testImage.fileName, path.extname(testImage.fileName));
        const outputFileName = `${baseName}_${model}_${outfit.clothingId}.png`;
        const outputPath = path.join(outputImagesDir, outputFileName);
        fs.writeFileSync(outputPath, Buffer.from(generatedBase64, "base64"));

        const judgeResult = await judgeHeadshot(originalBase64, generatedBase64, genai);
        const testPassed = judgeResult.overallScore >= 3;
        if (testPassed) passed++;
        else failed++;

        await db.insert(evalResults).values({
          runId,
          testImageName: `${testImage.fileName}_${model}_${outfit.clothingId}`,
          modelUsed: model,
          backgroundColor: BACKGROUND_COLOR,
          professionalismScore: judgeResult.professionalismScore,
          identityPreservationScore: judgeResult.identityPreservationScore,
          backgroundAccuracy: judgeResult.backgroundAccuracy,
          technicalQualityScore: judgeResult.technicalQualityScore,
          overallScore: judgeResult.overallScore,
          passed: testPassed,
          judgeNotes: judgeResult.notes,
          processingTimeMs: processingTime,
          errorMessage: null,
          inputImagePath: testImage.fileName,
          outputImagePath: outputFileName,
        });

        const status = testPassed ? "✅" : "❌";
        console.log(`   ${status} Score: ${judgeResult.overallScore}/5 (${processingTime}ms)`);

      } catch (error) {
        failed++;
        const processingTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        await db.insert(evalResults).values({
          runId,
          testImageName: `${testImage.fileName}_${model}_${outfit.clothingId}`,
          modelUsed: model,
          backgroundColor: BACKGROUND_COLOR,
          professionalismScore: null,
          identityPreservationScore: null,
          backgroundAccuracy: null,
          technicalQualityScore: null,
          overallScore: null,
          passed: false,
          judgeNotes: null,
          processingTimeMs: processingTime,
          errorMessage,
          inputImagePath: testImage.fileName,
          outputImagePath: null,
        });

        console.log(`   ❌ Error: ${errorMessage.substring(0, 50)}...`);
      }

      if (completed < totalTests) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 EVALUATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Run ID: ${runId}`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passed} (${((passed / totalTests) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed / totalTests) * 100).toFixed(1)}%)`);
  console.log("=".repeat(50));
  console.log("\nView results at: /evals");
}

runEvaluation().catch((error) => {
  console.error("Evaluation run failed:", error);
  process.exit(1);
});
