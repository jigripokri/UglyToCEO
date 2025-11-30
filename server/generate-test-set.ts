import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const TEST_PORTRAITS = [
  { id: "young_man_casual_01", prompt: "A casual smartphone selfie of a young man in his early 20s with short dark hair, wearing a plain t-shirt, taken indoors with natural window lighting, neutral expression, looking directly at camera" },
  { id: "young_woman_outdoor_02", prompt: "A casual photo of a young woman in her mid 20s with long wavy brown hair, wearing a casual sweater, taken outdoors in a park with soft natural lighting, slight smile" },
  { id: "middle_aged_man_office_03", prompt: "A smartphone photo of a middle-aged man in his 40s with graying temples and short hair, wearing a button-up shirt, taken in an office setting with fluorescent lighting, professional but casual" },
  { id: "senior_woman_home_04", prompt: "A casual portrait of a woman in her 60s with short silver hair, wearing a cardigan, warm smile, taken at home with soft lighting from a nearby lamp" },
  { id: "young_man_glasses_05", prompt: "A selfie of a young man in his late 20s with glasses and a beard, wearing a polo shirt, taken indoors with mixed lighting, relaxed expression" },
  { id: "woman_30s_curly_06", prompt: "A casual photo of a woman in her early 30s with curly dark hair, wearing a blouse, taken in a coffee shop with ambient lighting, friendly smile" },
  { id: "man_50s_bald_07", prompt: "A smartphone photo of a bald man in his 50s with a neatly trimmed goatee, wearing a sweater, taken outdoors on a cloudy day, confident expression" },
  { id: "young_woman_asian_08", prompt: "A casual selfie of a young East Asian woman in her mid 20s with straight black hair, wearing a casual top, taken indoors with ring light, natural smile" },
  { id: "man_30s_beard_09", prompt: "A photo of a man in his 30s with a full beard and medium-length wavy hair, wearing a henley shirt, taken in natural daylight near a window" },
  { id: "woman_40s_professional_10", prompt: "A casual photo of a woman in her 40s with shoulder-length auburn hair, wearing a casual blazer over a top, taken in an office lobby with even lighting" },
  { id: "young_man_athletic_11", prompt: "A selfie of an athletic young man in his early 20s with a buzz cut, wearing a casual hoodie, taken at a gym with bright overhead lighting" },
  { id: "woman_20s_hijab_12", prompt: "A casual portrait of a young woman in her 20s wearing a hijab and a casual top, warm smile, taken indoors with soft natural lighting" },
  { id: "man_60s_distinguished_13", prompt: "A smartphone photo of a distinguished man in his 60s with white hair and reading glasses pushed up on his head, wearing a cardigan, taken in a home study with warm lighting" },
  { id: "woman_30s_short_hair_14", prompt: "A casual photo of a woman in her early 30s with a short pixie cut, wearing a denim jacket, taken outdoors on a sunny day with natural shadows" },
  { id: "man_40s_south_asian_15", prompt: "A selfie of a South Asian man in his 40s with black hair showing some gray, wearing a casual shirt, taken in a living room with afternoon light" },
  { id: "young_woman_freckles_16", prompt: "A casual photo of a young woman in her early 20s with red hair and freckles, wearing a simple top, taken outdoors with diffused overcast lighting" },
  { id: "man_30s_latino_17", prompt: "A smartphone photo of a Latino man in his 30s with dark wavy hair, wearing a casual button-down, taken in a restaurant with ambient warm lighting" },
  { id: "woman_50s_elegant_18", prompt: "A casual portrait of an elegant woman in her 50s with styled gray-streaked hair, wearing a nice blouse, taken at home with natural window light" },
  { id: "young_man_afro_19", prompt: "A selfie of a young Black man in his mid 20s with a natural afro hairstyle, wearing a casual t-shirt, taken with front-facing camera with good lighting" },
  { id: "woman_40s_natural_20", prompt: "A casual photo of a woman in her 40s with natural gray hair in a bob cut, wearing a turtleneck sweater, taken in a bright kitchen with morning light" },
  { id: "man_20s_messy_hair_21", prompt: "A casual selfie of a young man in his early 20s with messy brown hair, slight stubble, wearing a casual flannel shirt, taken in a bedroom with lamp lighting" },
  { id: "woman_60s_warm_22", prompt: "A smartphone photo of a warm friendly woman in her 60s with curly gray hair and glasses, wearing a cozy sweater, taken in a living room with soft lighting" },
  { id: "man_35_middle_eastern_23", prompt: "A casual photo of a Middle Eastern man in his mid 30s with a well-groomed beard and dark hair, wearing a casual polo, taken outdoors in shade" },
  { id: "young_woman_ponytail_24", prompt: "A selfie of a young woman in her late 20s with her hair in a high ponytail, wearing athleisure, taken after a workout with bright gym lighting" },
  { id: "man_45_professional_25", prompt: "A smartphone photo of a man in his mid 40s with salt-and-pepper hair, wearing a casual dress shirt, taken in an office with natural and artificial mixed lighting" },
  { id: "woman_25_creative_26", prompt: "A casual photo of a creative young woman in her mid 20s with dyed purple highlights in dark hair, multiple ear piercings, wearing a graphic tee, taken in an art studio" },
  { id: "senior_man_kind_27", prompt: "A casual portrait of a kind-looking man in his late 60s with thinning white hair and a gentle smile, wearing a polo shirt, taken on a porch with outdoor lighting" },
  { id: "woman_35_business_28", prompt: "A smartphone selfie of a woman in her mid 30s with sleek dark hair, minimal makeup, wearing a casual top, taken in an elevator with overhead lighting" },
  { id: "man_28_tech_29", prompt: "A casual photo of a young man in his late 20s with glasses and short hair, wearing a hoodie, taken at a desk with computer screen backlighting" },
  { id: "woman_45_outdoor_30", prompt: "A photo of an active woman in her mid 40s with windswept hair, wearing a lightweight jacket, taken on a hiking trail with natural mountain lighting" },
  { id: "man_55_executive_31", prompt: "A smartphone photo of a man in his mid 50s with graying hair and distinguished features, wearing a casual sweater, taken in a home office with desk lamp lighting" },
  { id: "young_woman_natural_32", prompt: "A casual selfie of a young Black woman in her early 20s with natural hair in twists, wearing a casual top, taken with natural lighting near a window" },
  { id: "man_32_casual_33", prompt: "A photo of an easygoing man in his early 30s with light brown hair and a friendly face, wearing a casual crew neck sweater, taken in a cafe with warm ambient light" },
  { id: "woman_28_elegant_34", prompt: "A casual portrait of a woman in her late 20s with long straight black hair, wearing a simple elegant top, taken indoors with soft studio-like lighting from a window" },
  { id: "man_42_rugged_35", prompt: "A smartphone photo of a rugged-looking man in his early 40s with short gray-flecked hair and stubble, wearing a casual jacket, taken outdoors on an overcast day" },
  { id: "woman_55_professional_36", prompt: "A casual photo of a professional woman in her mid 50s with styled brown hair, wearing a casual but put-together outfit, taken in a bright modern office" },
  { id: "young_man_artistic_37", prompt: "A selfie of an artistic young man in his mid 20s with longer hair swept to one side, wearing a vintage-style shirt, taken in a creative space with moody lighting" },
  { id: "woman_38_mom_38", prompt: "A casual smartphone photo of a friendly woman in her late 30s with hair in a casual updo, wearing a comfortable top, taken in a kitchen with natural morning light" },
  { id: "man_48_confident_39", prompt: "A photo of a confident man in his late 40s with close-cropped gray hair, wearing a quality casual shirt, taken in a modern living room with afternoon sun" },
  { id: "woman_22_student_40", prompt: "A casual selfie of a young college-aged woman in her early 20s with glasses and shoulder-length hair, wearing a university sweatshirt, taken in a library with fluorescent lighting" },
];

async function generateTestSet() {
  const apiKey = process.env.GOOGLE_API_KEY_HH;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY_HH not found in environment");
    process.exit(1);
  }

  const genai = new GoogleGenAI({ apiKey });
  const outputDir = path.join(process.cwd(), "eval-images");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("🎨 Test Set Generator");
  console.log("═".repeat(50));
  console.log(`📁 Output directory: ${outputDir}`);
  console.log(`📊 Total portraits to generate: ${TEST_PORTRAITS.length}`);
  console.log("═".repeat(50));
  console.log("");

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < TEST_PORTRAITS.length; i++) {
    const portrait = TEST_PORTRAITS[i];
    const progress = `[${i + 1}/${TEST_PORTRAITS.length}]`;
    
    console.log(`${progress} Generating: ${portrait.id}`);

    try {
      const response = await genai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate a realistic photograph matching this description exactly. This should look like an authentic smartphone photo or casual portrait, NOT a professional headshot. The image should be realistic and natural-looking.

Description: ${portrait.prompt}

Important: Generate only the image, no text or overlays. Make it look like a genuine candid photo that someone might use as a profile picture.`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No response generated");
      }

      const candidate = response.candidates[0];
      if (!candidate.content?.parts) {
        throw new Error("Invalid response format");
      }

      let imageData: string | null = null;
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          imageData = part.inlineData.data;
          break;
        }
      }

      if (!imageData) {
        throw new Error("No image in response");
      }

      const outputPath = path.join(outputDir, `${portrait.id}.png`);
      fs.writeFileSync(outputPath, Buffer.from(imageData, "base64"));
      
      generated++;
      console.log(`   ✅ Saved: ${portrait.id}.png`);

    } catch (error) {
      failed++;
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      console.log(`   ❌ Failed: ${errMsg.substring(0, 50)}`);
    }

    if (i < TEST_PORTRAITS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log("");
  console.log("═".repeat(50));
  console.log("📊 GENERATION COMPLETE");
  console.log("═".repeat(50));
  console.log(`✅ Generated: ${generated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Images saved to: ${outputDir}`);
  console.log("");
  console.log("Next step: Run evaluation with:");
  console.log("  npx tsx server/eval-runner.ts");
  console.log("═".repeat(50));
}

generateTestSet().catch((error) => {
  console.error("Test set generation failed:", error);
  process.exit(1);
});
