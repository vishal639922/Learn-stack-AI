import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { searchSchema } from "@/lib/validations";
import { apiResponse, apiError, withRateLimit } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request, "search");
  if (rateLimitError) return rateLimitError;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return apiError("Invalid search parameters");
    }

    const { q, category, tags, page, limit } = parsed.data;

    if (!q && !category && !tags) {
      return apiResponse({ articles: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    const filter: Record<string, unknown> = { status: "published" };
    const skip = (page - 1) * limit;

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
        .populate("author", "name avatar")
        .populate("category", "name slug")
        .sort(q ? { score: { $meta: "textScore" } } : { publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .select("title slug excerpt featuredImage tags readingTime views publishedDate author category")
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
    return apiError("Search failed", 500);
  }
}
