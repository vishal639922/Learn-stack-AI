import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { articleSchema, searchSchema } from "@/lib/validations";
import { calculateReadingTime } from "@/lib/reading-time";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const parsed = searchSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return apiError("Invalid query parameters");
    }

    const { q, category, tags, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { status: "published" };

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

export async function POST(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "editor"]);
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = articleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const existing = await Article.findOne({ slug: parsed.data.slug });
    if (existing) {
      return apiError("Slug already exists", 409);
    }

    const category = await Category.findById(parsed.data.category);
    if (!category) {
      return apiError("Category not found", 404);
    }

    const { minutes } = calculateReadingTime(parsed.data.content);

    const article = await Article.create({
      ...parsed.data,
      author: session!.user.id,
      readingTime: minutes,
      publishedDate:
        parsed.data.status === "published" ? new Date() : undefined,
      updatedDate: new Date(),
    });

    if (parsed.data.status === "published") {
      await Category.findByIdAndUpdate(category._id, {
        $inc: { articleCount: 1 },
      });
    }

    return apiResponse(article, 201);
  } catch {
    return apiError("Failed to create article", 500);
  }
}
