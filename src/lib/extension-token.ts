import { createHmac, timingSafeEqual } from "crypto";

export function extensionSecret() {
  return process.env.EXTENSION_TOKEN_SECRET || (process.env.NODE_ENV === "production" ? "" : "job-agent-dev");
}

export function signExtensionToken(subject: string, secret: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ sub: subject, iat: now })).toString("base64url");
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return `ja1.${payload}.${sig}`;
}

export function readExtensionToken(token: string, secret: string): { sub: string; iat: number } | null {
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "ja1") return null;
  const expected = createHmac("sha256", secret).update(parts[1]).digest("base64url");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts[2]);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as { sub?: string; iat?: number };
    if (!body.sub || typeof body.iat !== "number") return null;
    return { sub: body.sub, iat: body.iat };
  } catch {
    return null;
  }
}
