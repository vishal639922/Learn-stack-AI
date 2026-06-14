import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

type RouteParams = { params: Promise<{ slug: string }> };

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  try {
    const { slug } = await params;
    const body = await request.json();
    const { action, reviewComment } = body;

    if (!["approve", "reject", "request_revision"].includes(action)) {
      return apiError("Invalid action", 400);
    }

    await connectDB();

    const article = await Article.findOne({ slug });
    if (!article) {
      return apiError("Article not found", 404);
    }

    const updates: Record<string, unknown> = {
      reviewedAt: new Date(),
      reviewedBy: session!.user.id,
      reviewComment,
    };

    if (action === "approve") {
      updates.status = "approved";
    } else if (action === "reject") {
      updates.status = "rejected";
    } else if (action === "request_revision") {
      updates.status = "draft";
    }

    Object.assign(article, updates);
    await article.save();

    return apiResponse(article);
  } catch {
    return apiError("Failed to review article", 500);
  }
}
