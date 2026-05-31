import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth();
  if (error) return error;

  try {
    const { articleId } = await request.json();
    if (!articleId) {
      return apiError("articleId is required");
    }

    await connectDB();

    const user = await User.findById(session!.user.id);
    if (!user) {
      return apiError("User not found", 404);
    }

    const existingIndex = user.readingHistory.findIndex(
      (h) => h.articleId.toString() === articleId
    );

    if (existingIndex > -1) {
      user.readingHistory[existingIndex].readAt = new Date();
    } else {
      user.readingHistory.unshift({ articleId, readAt: new Date() });
      if (user.readingHistory.length > 50) {
        user.readingHistory = user.readingHistory.slice(0, 50);
      }
    }

    await user.save();
    return apiResponse({ recorded: true });
  } catch {
    return apiError("Failed to record reading history", 500);
  }
}
