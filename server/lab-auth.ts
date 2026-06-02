import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

const COOKIE_NAME = "lab_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8; // 8 hours

export function isLabConfigured(): boolean {
  return !!process.env.LAB_PASSWORD;
}

function getSecret(): string {
  // The password doubles as the HMAC key, so changing it invalidates old sessions.
  return process.env.LAB_PASSWORD || "";
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyPassword(input: string): boolean {
  const password = process.env.LAB_PASSWORD || "";
  if (!password) return false;
  return timingSafeEqualStr(input, password);
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken(): string {
  const expiry = (Date.now() + SESSION_DURATION_MS).toString();
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionToken(token?: string): boolean {
  if (!token || !getSecret()) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expiry = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expiryMs = parseInt(expiry, 10);
  if (!expiryMs || Date.now() > expiryMs) return false;
  return timingSafeEqualStr(sig, sign(expiry));
}

function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val; // tolerate malformed encoding instead of throwing
    }
  }
  return out;
}

export function getSessionFromReq(req: Request): string | undefined {
  return parseCookies(req.headers.cookie)[COOKIE_NAME];
}

export function setSessionCookie(res: Response): void {
  res.cookie(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DURATION_MS,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function isAuthenticated(req: Request): boolean {
  return verifySessionToken(getSessionFromReq(req));
}

export function requireLabAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
