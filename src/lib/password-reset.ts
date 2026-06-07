import crypto from "crypto";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export function generateResetToken(): { raw: string; hash: string; expires: Date } {
  const raw = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const hash = hashResetToken(raw);
  const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  return { raw, hash, expires };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
