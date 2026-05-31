import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Article } from "@/models/Article";
import { commentSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
  sanitizeInput,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return apiError("articleId is required");
    }

    await connectDB();

    const comments = await Comment.find({ articleId, isApproved: true })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    return apiResponse(comments);
  } catch {
    return apiError("Failed to fetch comments", 500);
  }
}

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const article = await Article.findById(parsed.data.articleId);
    if (!article) {
      return apiError("Article not found", 404);
    }

    const comment = await Comment.create({
      articleId: parsed.data.articleId,
      userId: session!.user.id,
      content: sanitizeInput(parsed.data.content),
      parentId: parsed.data.parentId,
    });

    const populated = await Comment.findById(comment._id)
      .populate("userId", "name avatar")
      .lean();

    return apiResponse(populated, 201);
  } catch {
    return apiError("Failed to post comment", 500);
  }
}
