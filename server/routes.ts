import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateProfessionalHeadshot, type ModelType } from "./gemini-service";
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
      const requestedColor = req.body.backgroundColor || "#562226";
      const backgroundColor = VALID_BACKGROUND_COLORS.includes(requestedColor) 
        ? requestedColor 
        : "#562226";
      
      console.log(`📸 Processing headshot transformation with model: ${modelType}, background: ${backgroundColor}`);
      
      const resultBase64 = await generateProfessionalHeadshot(imageBase64, mimeType, modelType, backgroundColor);
      
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
