import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateProfessionalHeadshot, type ModelType, type Gender, type ClothingOptions } from "./gemini-service";
import multer from "multer";
import * as fs from "fs";
import * as path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
});

const uploadMultiple = upload.array("images", 4);

function handleUpload(req: any, res: any, next: any) {
  uploadMultiple(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Each image must be 10MB or smaller" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ error: "Maximum 4 images allowed" });
        }
        return res.status(400).json({ error: err.message });
      }
      return res.status(400).json({ error: "Failed to process upload" });
    }
    next();
  });
}

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
  
  app.post("/api/transform", handleUpload, async (req, res) => {
    const startTime = Date.now();
    let analyticsLogId: string | null = null;
    let modelType: ModelType = "flash";
    let backgroundColor = "#562226";
    
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No image files provided" });
      }
      
      if (files.length > 4) {
        return res.status(400).json({ error: "Maximum 4 images allowed" });
      }

      const referenceImages = files.map(file => ({
        base64: file.buffer.toString("base64"),
        mimeType: file.mimetype || "image/jpeg",
      }));
      
      const requestedModel = req.body.model;
      modelType = (requestedModel === "flash" || requestedModel === "pro")
        ? requestedModel
        : "flash";
      
      const requestedBgColor = req.body.backgroundColor || "#562226";
      backgroundColor = VALID_BACKGROUND_COLORS.includes(requestedBgColor as any) 
        ? requestedBgColor 
        : "#562226";
      
      const requestedGender = req.body.gender || "men";
      const gender: Gender = (requestedGender === "men" || requestedGender === "women") 
        ? requestedGender 
        : "men";
      
      const requestedClothingId = req.body.clothingId || "blazer";
      const validClothingIds = VALID_CLOTHING_IDS[gender];
      const clothingId = validClothingIds.includes(requestedClothingId as any)
        ? requestedClothingId
        : "blazer";
      
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
      console.log(`   Reference images: ${files.length}`);
      console.log(`   Background: ${backgroundColor}`);
      console.log(`   Gender: ${gender}`);
      console.log(`   Clothing: ${clothingId} (${clothingColor})`);
      
      const resultBase64 = await generateProfessionalHeadshot(
        referenceImages,
        modelType, 
        backgroundColor,
        clothing
      );
      
      const processingTimeMs = Date.now() - startTime;
      const inputSizeBytes = files.reduce((sum, f) => sum + f.buffer.length, 0);
      const outputSizeBytes = resultBase64.length;
      
      const analyticsLog = await storage.logAnalytics({
        modelUsed: modelType,
        backgroundColor,
        success: true,
        processingTimeMs,
        inputSizeBytes,
        outputSizeBytes,
        errorMessage: null,
        referenceCount: files.length,
      });
      analyticsLogId = analyticsLog.id;
      
      await storage.logHeadshotCreation();
      
      const count = await storage.getHeadshotCount();
      console.log(`✨ Headshot #${count} created successfully in ${processingTimeMs}ms! (${files.length} reference images)`);
      
      res.json({
        image: `data:image/png;base64,${resultBase64}`,
        count,
        analyticsLogId,
      });
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const files = req.files as Express.Multer.File[] | undefined;
      
      try {
        await storage.logAnalytics({
          modelUsed: modelType,
          backgroundColor,
          success: false,
          processingTimeMs,
          inputSizeBytes: files?.reduce((sum, f) => sum + f.buffer.length, 0) || null,
          outputSizeBytes: null,
          errorMessage,
          referenceCount: files?.length || 1,
        });
      } catch (logError) {
        console.error("Failed to log analytics:", logError);
      }
      
      console.error("Error transforming image:", error);
      res.status(500).json({ 
        error: "Failed to transform image",
        details: errorMessage
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

  app.post("/api/analytics/log-download", async (req, res) => {
    try {
      const { analyticsLogId } = req.body;
      if (!analyticsLogId) {
        return res.status(400).json({ error: "analyticsLogId is required" });
      }
      
      const downloadLog = await storage.logDownload(analyticsLogId);
      res.json({ success: true, downloadLog });
    } catch (error) {
      console.error("Error logging download:", error);
      res.status(500).json({ error: "Failed to log download" });
    }
  });

  app.get("/api/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getAnalyticsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching analytics stats:", error);
      res.status(500).json({ error: "Failed to fetch analytics statistics" });
    }
  });

  app.get("/api/evals/results", async (req, res) => {
    try {
      const runId = req.query.runId as string | undefined;
      const results = await storage.getEvalResults(runId);
      const latestRunId = await storage.getLatestEvalRunId();
      res.json({ results, latestRunId });
    } catch (error) {
      console.error("Error fetching eval results:", error);
      res.status(500).json({ error: "Failed to fetch evaluation results" });
    }
  });

  app.get("/api/evals/input-image/:filename", async (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const baseDir = path.join(process.cwd(), "eval-images");
      const imagePath = path.join(baseDir, filename);
      
      if (path.dirname(imagePath) !== baseDir || !fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      const ext = path.extname(filename).toLowerCase();
      const mimeType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
      
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Cache-Control", "public, max-age=31536000");
      fs.createReadStream(imagePath).pipe(res);
    } catch (error) {
      console.error("Error serving input image:", error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  app.get("/api/evals/output-image/:filename", async (req, res) => {
    try {
      const filename = path.basename(req.params.filename);
      const baseDir = path.join(process.cwd(), "eval-outputs");
      const imagePath = path.join(baseDir, filename);
      
      if (path.dirname(imagePath) !== baseDir || !fs.existsSync(imagePath)) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000");
      fs.createReadStream(imagePath).pipe(res);
    } catch (error) {
      console.error("Error serving output image:", error);
      res.status(500).json({ error: "Failed to serve image" });
    }
  });

  return httpServer;
}
