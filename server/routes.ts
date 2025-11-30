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
      
      console.log(`📸 Processing headshot transformation with model: ${modelType}`);
      
      const resultBase64 = await generateProfessionalHeadshot(imageBase64, mimeType, modelType);
      
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
