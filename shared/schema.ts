import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const headshotLogs = pgTable("headshot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const analyticsLogs = pgTable("analytics_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  modelUsed: text("model_used").notNull(),
  backgroundColor: text("background_color").notNull(),
  success: boolean("success").notNull(),
  processingTimeMs: integer("processing_time_ms"),
  errorMessage: text("error_message"),
  inputSizeBytes: integer("input_size_bytes"),
  outputSizeBytes: integer("output_size_bytes"),
});

export const downloadLogs = pgTable("download_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analyticsLogId: varchar("analytics_log_id").references(() => analyticsLogs.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const evalResults = pgTable("eval_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  runId: varchar("run_id").notNull(),
  testImageName: text("test_image_name").notNull(),
  modelUsed: text("model_used").notNull(),
  backgroundColor: text("background_color").notNull(),
  professionalismScore: real("professionalism_score"),
  identityPreservationScore: real("identity_preservation_score"),
  backgroundAccuracy: boolean("background_accuracy"),
  technicalQualityScore: real("technical_quality_score"),
  overallScore: real("overall_score"),
  passed: boolean("passed"),
  judgeNotes: text("judge_notes"),
  processingTimeMs: integer("processing_time_ms"),
  errorMessage: text("error_message"),
  inputImagePath: text("input_image_path"),
  outputImagePath: text("output_image_path"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertHeadshotLogSchema = createInsertSchema(headshotLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsLogSchema = createInsertSchema(analyticsLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDownloadLogSchema = createInsertSchema(downloadLogs).omit({
  id: true,
  createdAt: true,
});

export const insertEvalResultSchema = createInsertSchema(evalResults).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertHeadshotLog = z.infer<typeof insertHeadshotLogSchema>;
export type HeadshotLog = typeof headshotLogs.$inferSelect;
export type InsertAnalyticsLog = z.infer<typeof insertAnalyticsLogSchema>;
export type AnalyticsLog = typeof analyticsLogs.$inferSelect;
export type InsertDownloadLog = z.infer<typeof insertDownloadLogSchema>;
export type DownloadLog = typeof downloadLogs.$inferSelect;
export type InsertEvalResult = z.infer<typeof insertEvalResultSchema>;
export type EvalResult = typeof evalResults.$inferSelect;
