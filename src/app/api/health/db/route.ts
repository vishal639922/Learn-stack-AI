import mongoose from "mongoose";
import {
  connectDB,
  getDbMode,
  getMongoUriFromEnv,
  isDbConfigured,
} from "@/lib/mongodb";
import { apiError, apiResponse } from "@/lib/api-utils";

export async function GET() {
  if (!isDbConfigured()) {
    const hint = process.env.VERCEL
      ? "MONGODB_URI missing on Vercel. Settings → Environment Variables → Production → redeploy."
      : "Set MONGODB_URI in .env.local and restart npm run dev.";
    return apiError(`Database not configured. ${hint}`, 503);
  }

  const uri = getMongoUriFromEnv();
  if (!uri) {
    return apiError(
      "MONGODB_URI is empty or invalid. Use only the connection string (mongodb://...), not MONGODB_URI=...",
      503
    );
  }

  try {
    await connectDB();
    const ready = mongoose.connection.readyState === 1;

    return apiResponse({
      connected: ready,
      mode: getDbMode(),
      database: mongoose.connection.db?.databaseName ?? null,
      host: mongoose.connection.host ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to connect to database";
    return apiError(message, 503);
  }
}
