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

export async function GET() {
  const { session, error } = await withAuth();
  if (error) return error;

  try {
    await connectDB();
    const user = await User.findById(session!.user.id)
      .populate({
        path: "bookmarks",
        populate: { path: "category", select: "name slug" },
      })
      .populate({
        path: "readingHistory.articleId",
        populate: { path: "category", select: "name slug" },
      })
      .lean();

    if (!user) {
      return apiError("User not found", 404);
    }

    return apiResponse({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isPremium: user.isPremium,
      bookmarks: user.bookmarks,
      readingHistory: user.readingHistory,
      createdAt: user.createdAt,
    });
  } catch {
    return apiError("Failed to fetch profile", 500);
  }
}

export async function PATCH(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const { name, avatar } = body;

    await connectDB();
    const user = await User.findByIdAndUpdate(
      session!.user.id,
      { ...(name && { name }), ...(avatar && { avatar }) },
      { new: true }
    ).select("-password");

    return apiResponse(user);
  } catch {
    return apiError("Failed to update profile", 500);
  }
}
