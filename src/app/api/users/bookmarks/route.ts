import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Article } from "@/models/Article";
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

    const article = await Article.findById(articleId);
    if (!article) {
      return apiError("Article not found", 404);
    }

    const user = await User.findById(session!.user.id);
    if (!user) {
      return apiError("User not found", 404);
    }

    const index = user.bookmarks.findIndex(
      (id) => id.toString() === articleId
    );

    if (index > -1) {
      user.bookmarks.splice(index, 1);
      await user.save();
      return apiResponse({ bookmarked: false });
    }

    user.bookmarks.push(articleId);
    await user.save();
    return apiResponse({ bookmarked: true });
  } catch {
    return apiError("Failed to toggle bookmark", 500);
  }
}
