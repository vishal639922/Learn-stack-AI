import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "search");
  if (rateLimitError) return rateLimitError;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "latest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "6"), 20);

    const baseFilter = { status: "published" as const };
    let sort: Record<string, 1 | -1> = { publishedDate: -1 };

    switch (type) {
      case "featured":
        break;
      case "trending":
        sort = { views: -1 };
        break;
      case "latest":
      default:
        sort = { publishedDate: -1 };
    }

    const filter =
      type === "featured"
        ? { ...baseFilter, isFeatured: true }
        : baseFilter;

    const articles = await Article.find(filter)
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort(sort)
      .limit(limit)
      .lean();

    return apiResponse(articles);
  } catch {
    return apiError("Failed to fetch articles", 500);
  }
}
