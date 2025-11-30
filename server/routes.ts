import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateProfessionalHeadshot, type ModelType, type Gender, type ClothingOptions } from "./gemini-service";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});

const VALID_BACKGROUND_COLORS = [
  "#562226", // Deep Burgundy
  "#1a2744", // Navy Blue
  "#2d2d2d", // Charcoal Gray
  "#1e3a2f", // Forest Green
  "#8b7355", // Warm Taupe
  "#0a0a0a", // Classic Black
] as const;

const VALID_CLOTHING_IDS = {
  men: ["blazer", "suit", "dress_shirt", "knit"],
  women: ["blazer", "blouse", "jewel_blouse", "sheath_dress"],
} as const;

const VALID_CLOTHING_COLORS = [
  "#4a4a4a", // Charcoal Gray
  "#1a2744", // Navy
  "#1a1a1a", // Black
  "#f5f5f5", // White
  "#a8c5e2", // Light Blue
  "#f0d4d4", // Pale Pink
  "#562226", // Burgundy
  "#f5f5dc", // Ivory
  "#2e5a4c", // Emerald
  "#1a3a5c", // Sapphire
] as const;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/transform", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageBase64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype || "image/jpeg";
      const modelType = (req.body.model as ModelType) || "flash";
      
      // Validate background color against approved palette
      const requestedBgColor = req.body.backgroundColor || "#562226";
      const backgroundColor = VALID_BACKGROUND_COLORS.includes(requestedBgColor as any) 
        ? requestedBgColor 
        : "#562226";
      
      // Validate gender
      const requestedGender = req.body.gender || "men";
      const gender: Gender = (requestedGender === "men" || requestedGender === "women") 
        ? requestedGender 
        : "men";
      
      // Validate clothing ID
      const requestedClothingId = req.body.clothingId || "blazer";
      const validClothingIds = VALID_CLOTHING_IDS[gender];
      const clothingId = validClothingIds.includes(requestedClothingId as any)
        ? requestedClothingId
        : "blazer";
      
      // Validate clothing color
      const requestedClothingColor = req.body.clothingColor || "#4a4a4a";
      const clothingColor = VALID_CLOTHING_COLORS.includes(requestedClothingColor as any)
        ? requestedClothingColor
        : "#4a4a4a";
      
      const clothing: ClothingOptions = {
        gender,
        clothingId,
        clothingColor,
      };
      
      console.log(`📸 Processing headshot transformation:`);
      console.log(`   Model: ${modelType}`);
      console.log(`   Background: ${backgroundColor}`);
      console.log(`   Gender: ${gender}`);
      console.log(`   Clothing: ${clothingId} (${clothingColor})`);
      
      const resultBase64 = await generateProfessionalHeadshot(
        imageBase64, 
        mimeType, 
        modelType, 
        backgroundColor,
        clothing
      );
      
      await storage.logHeadshotCreation();
      
      const count = await storage.getHeadshotCount();
      console.log(`✨ Headshot #${count} created successfully!`);
      
      res.json({
        image: `data:image/png;base64,${resultBase64}`,
        count,
      });
    } catch (error) {
      console.error("Error transforming image:", error);
      res.status(500).json({ 
        error: "Failed to transform image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const count = await storage.getHeadshotCount();
      res.json({ totalHeadshots: count });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  return httpServer;
}
