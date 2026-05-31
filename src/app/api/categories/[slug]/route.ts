import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { categorySchema } from "@/lib/validations";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50);
    const skip = (page - 1) * limit;

    await connectDB();

    const category = await Category.findOne({ slug }).lean();
    if (!category) {
      return apiError("Category not found", 404);
    }

    const [articles, total] = await Promise.all([
      Article.find({ category: category._id, status: "published" })
        .populate("author", "name avatar")
        .populate("category", "name slug")
        .sort({ publishedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments({ category: category._id, status: "published" }),
    ]);

    return apiResponse({
      category,
      articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch {
    return apiError("Failed to fetch category", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin"]);
  if (error) return error;

  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();
    const category = await Category.findOneAndUpdate({ slug }, parsed.data, {
      new: true,
    });

    if (!category) {
      return apiError("Category not found", 404);
    }

    return apiResponse(category);
  } catch {
    return apiError("Failed to update category", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin"]);
  if (error) return error;

  try {
    const { slug } = await params;
    await connectDB();

    const category = await Category.findOne({ slug });
    if (!category) {
      return apiError("Category not found", 404);
    }

    const articleCount = await Article.countDocuments({
      category: category._id,
    });
    if (articleCount > 0) {
      return apiError("Cannot delete category with articles", 400);
    }

    await Category.findByIdAndDelete(category._id);
    return apiResponse({ deleted: true });
  } catch {
    return apiError("Failed to delete category", 500);
  }
}
