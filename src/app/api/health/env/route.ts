import { getMongoUriFromEnv, isDbConfigured } from "@/lib/mongodb";
import { isAuthConfigured } from "@/auth.config";
import { apiResponse } from "@/lib/api-utils";

/** Safe diagnostics for deployment (no secret values). */
export async function GET() {
  const mongoUri = getMongoUriFromEnv();

  return apiResponse({
    vercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV ?? "unknown",
    authConfigured: isAuthConfigured(),
    mongoConfigured: isDbConfigured(),
    mongoUriPresent: Boolean(mongoUri),
    mongoUriLength: mongoUri?.length ?? 0,
    hint: !mongoUri
      ? "Set MONGODB_URI in Vercel (value = connection string only, no quotes). Redeploy after saving."
      : undefined,
  });
}
