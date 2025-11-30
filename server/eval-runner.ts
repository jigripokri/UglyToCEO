import { GoogleGenAI } from "@google/genai";
import { db } from "./db";
import { evalResults } from "@shared/schema";
import { generateProfessionalHeadshot } from "./gemini-service";
import * as fs from "fs";
import * as path from "path";

const BACKGROUND_COLORS = [
  "#562226",
  "#1a2744",
  "#2d2d2d",
  "#1e3a2f",
  "#8b7355",
  "#0a0a0a",
];

const COLOR_NAMES: Record<string, string> = {
  "#562226": "Deep Burgundy",
  "#1a2744": "Navy Blue",
  "#2d2d2d": "Charcoal Gray",
  "#1e3a2f": "Forest Green",
  "#8b7355": "Warm Taupe",
  "#0a0a0a": "Classic Black",
};

interface EvalTestCase {
  imagePath: string;
  imageName: string;
  backgroundColor: string;
  model: "flash" | "pro";
}

interface JudgeResponse {
  professionalismScore: number;
  identityPreservationScore: number;
  backgroundAccuracy: boolean;
  technicalQualityScore: number;
  overallScore: number;
  notes: string;
}

async function judgeHeadshot(
  originalImageBase64: string,
  generatedImageBase64: string,
  expectedBackgroundColor: string,
  genai: GoogleGenAI
): Promise<JudgeResponse> {
  const prompt = `You are an expert headshot quality evaluator. Analyze the following two images:
  
1. ORIGINAL IMAGE: The input photo that was provided
2. GENERATED IMAGE: The professional headshot that was created from the original

Expected background color: ${COLOR_NAMES[expectedBackgroundColor] || expectedBackgroundColor} (${expectedBackgroundColor})

Rate the generated headshot on the following criteria using a 1-5 scale (5 is best):

1. **Professionalism Score (1-5)**: Does this look like a professional headshot? Consider lighting, composition, clothing appearance, and overall polish.

2. **Identity Preservation Score (1-5)**: Does the person in the generated image look like the same person in the original? Consider facial features, distinctive characteristics, and likeness.

3. **Background Accuracy (true/false)**: Is the background approximately the expected color (${COLOR_NAMES[expectedBackgroundColor] || expectedBackgroundColor})?

4. **Technical Quality Score (1-5)**: Is the image free of artifacts, distortions, blurriness, or AI-generated anomalies? Check for issues with hands, clothing edges, hair, and skin.

5. **Overall Score (1-5)**: Your holistic assessment of whether this is a successful professional headshot transformation.

Respond in this exact JSON format (no markdown):
{
  "professionalismScore": <1-5>,
  "identityPreservationScore": <1-5>,
  "backgroundAccuracy": <true or false>,
  "technicalQualityScore": <1-5>,
  "overallScore": <1-5>,
  "notes": "<brief explanation of major issues or strengths>"
}`;

  try {
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: originalImageBase64,
              },
            },
            {
              inlineData: {
                mimeType: "image/png",
                data: generatedImageBase64,
              },
            },
          ],
        },
      ],
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response generated from judge");
    }

    const candidate = response.candidates[0];
    if (!candidate.content?.parts) {
      throw new Error("Invalid response format from judge");
    }

    let text = "";
    for (const part of candidate.content.parts) {
      if (part.text) {
        text = part.text;
        break;
      }
    }

    if (!text) {
      throw new Error("No text in judge response");
    }

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

  if (!fs.existsSync(testImagesDir)) {
    console.log(`Creating eval-images directory at ${testImagesDir}`);
    fs.mkdirSync(testImagesDir, { recursive: true });
    console.log("\nPlease add test images to the eval-images directory and run again.");
    console.log("Supported formats: .jpg, .jpeg, .png, .webp");
    process.exit(0);
  }

  const imageFiles = fs.readdirSync(testImagesDir).filter((f) => 
    /\.(jpg|jpeg|png|webp)$/i.test(f)
  );

  if (imageFiles.length === 0) {
    console.log("No test images found in eval-images directory.");
    console.log("Add images (.jpg, .jpeg, .png, .webp) and run again.");
    process.exit(0);
  }

  console.log(`\n🧪 Starting Evaluation Run: ${runId}`);
  console.log(`📁 Found ${imageFiles.length} test images`);
  console.log(`🎨 Testing with ${BACKGROUND_COLORS.length} background colors each`);
  console.log(`⚡ Testing both Flash and Pro models\n`);

  const testCases: EvalTestCase[] = [];
  
  for (const imageFile of imageFiles) {
    for (const bgColor of BACKGROUND_COLORS) {
      for (const model of ["flash", "pro"] as const) {
        testCases.push({
          imagePath: path.join(testImagesDir, imageFile),
          imageName: imageFile,
          backgroundColor: bgColor,
          model,
        });
      }
    }
  }

  console.log(`📊 Total test cases: ${testCases.length}\n`);

  let completed = 0;
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    completed++;
    const progress = `[${completed}/${testCases.length}]`;
    
    console.log(`${progress} Testing ${testCase.imageName} | ${COLOR_NAMES[testCase.backgroundColor]} | ${testCase.model.toUpperCase()}`);

    const startTime = Date.now();
    
    try {
      const imageBuffer = fs.readFileSync(testCase.imagePath);
      const originalBase64 = imageBuffer.toString("base64");
      const ext = path.extname(testCase.imagePath).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

      const generatedBase64 = await generateProfessionalHeadshot(
        originalBase64,
        mimeType,
        testCase.model,
        testCase.backgroundColor,
        { gender: "men", clothingId: "blazer", clothingColor: "#4a4a4a" }
      );

      const processingTime = Date.now() - startTime;

      const judgeResult = await judgeHeadshot(
        originalBase64,
        generatedBase64,
        testCase.backgroundColor,
        genai
      );

      const testPassed = judgeResult.overallScore >= 3;
      if (testPassed) passed++;
      else failed++;

      await db.insert(evalResults).values({
        runId,
        testImageName: `${testCase.imageName}_${testCase.model}_${testCase.backgroundColor}`,
        modelUsed: testCase.model,
        backgroundColor: testCase.backgroundColor,
        professionalismScore: judgeResult.professionalismScore,
        identityPreservationScore: judgeResult.identityPreservationScore,
        backgroundAccuracy: judgeResult.backgroundAccuracy,
        technicalQualityScore: judgeResult.technicalQualityScore,
        overallScore: judgeResult.overallScore,
        passed: testPassed,
        judgeNotes: judgeResult.notes,
        processingTimeMs: processingTime,
        errorMessage: null,
      });

      const status = testPassed ? "✅" : "❌";
      console.log(`   ${status} Score: ${judgeResult.overallScore}/5 (${processingTime}ms)`);

    } catch (error) {
      failed++;
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await db.insert(evalResults).values({
        runId,
        testImageName: `${testCase.imageName}_${testCase.model}_${testCase.backgroundColor}`,
        modelUsed: testCase.model,
        backgroundColor: testCase.backgroundColor,
        professionalismScore: null,
        identityPreservationScore: null,
        backgroundAccuracy: null,
        technicalQualityScore: null,
        overallScore: null,
        passed: false,
        judgeNotes: null,
        processingTimeMs: processingTime,
        errorMessage,
      });

      console.log(`   ❌ Error: ${errorMessage.substring(0, 50)}...`);
    }

    if (completed < testCases.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 EVALUATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Run ID: ${runId}`);
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Passed: ${passed} (${((passed / testCases.length) * 100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} (${((failed / testCases.length) * 100).toFixed(1)}%)`);
  console.log("=".repeat(50));
  console.log("\nView results at: /evals");
}

runEvaluation().catch((error) => {
  console.error("Evaluation run failed:", error);
  process.exit(1);
});
