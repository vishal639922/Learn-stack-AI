import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { adminArticleSearchSchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin", "subadmin", "editor", "author"]);
  if (error) return error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = adminArticleSearchSchema.safeParse(
      Object.fromEntries(searchParams)
    );

    if (!parsed.success) {
      return apiError("Invalid query parameters");
    }

    const { q, category, tags, page, limit, status } = parsed.data;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.status = status;

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    if (tags) {
      filter.tags = { $in: tags.split(",").map((t) => t.trim().toLowerCase()) };
    }

    if (q) {
      filter.$text = { $search: q };
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate("author", "name avatar email")
        .populate("category", "name slug")
        .sort(
          q
            ? { score: { $meta: "textScore" } }
            : { sortOrder: 1, updatedDate: -1 }
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    return apiResponse({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return apiError("Failed to fetch articles", 500);
  }
}
