import mongoose from "mongoose";
import { connectDB, getDbMode, isDbConfigured } from "@/lib/mongodb";
import { apiError, apiResponse } from "@/lib/api-utils";

export async function GET() {
  if (!isDbConfigured()) {
    return apiError("Database not configured. Set MONGODB_URI in .env.local", 503);
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
