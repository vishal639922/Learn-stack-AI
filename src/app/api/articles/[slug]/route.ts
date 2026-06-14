import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import { articleSchema } from "@/lib/validations";
import { calculateReadingTime } from "@/lib/reading-time";
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
    await connectDB();

    const { session } = await withAuth(["admin", "subadmin", "editor", "author"]);
    const isStaff = !!session;

    const article = await Article.findOne(
      isStaff ? { slug } : { slug, status: "published" }
    )
      .populate("author", "name avatar email")
      .populate("category", "name slug")
      .lean();

    if (!article) {
      return apiError("Article not found", 404);
    }

    if (!isStaff) {
      await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });
    }

    const related = await Article.find({
      _id: { $ne: article._id },
      category: article.category,
      status: "published",
    })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ sortOrder: 1, publishedDate: -1 })
      .limit(4)
      .lean();

    return apiResponse({
      article: isStaff ? article : { ...article, views: article.views + 1 },
      related,
    });
  } catch {
    return apiError("Failed to fetch article", 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { session, error } = await withAuth(["admin", "subadmin", "editor"]);
  if (error) return error;

  try {
    const { slug } = await params;
    const body = await request.json();
    const parsed = articleSchema.partial().safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0].message);
    }

    await connectDB();

    const article = await Article.findOne({ slug });
    if (!article) {
      return apiError("Article not found", 404);
    }

    const wasPublished = article.status === "published";
    const willPublish = parsed.data.status === "published";

    const updates: Record<string, unknown> = { ...parsed.data, updatedDate: new Date() };

    if (parsed.data.content) {
      const { minutes } = calculateReadingTime(
        parsed.data.content,
        parsed.data.contentFormat
      );
      updates.readingTime = minutes;
    }

    if (willPublish && !wasPublished) {
      updates.publishedDate = new Date();
    }

    Object.assign(article, updates);
    await article.save();

    if (willPublish && !wasPublished) {
      await Category.findByIdAndUpdate(article.category, {
        $inc: { articleCount: 1 },
      });
    }

    return apiResponse(article);
  } catch {
    return apiError("Failed to update article", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin", "subadmin", "editor"]);
  if (error) return error;

  try {
    const { slug } = await params;
    await connectDB();

    const article = await Article.findOneAndDelete({ slug });
    if (!article) {
      return apiError("Article not found", 404);
    }

    if (article.status === "published") {
      await Category.findByIdAndUpdate(article.category, {
        $inc: { articleCount: -1 },
      });
    }

    return apiResponse({ deleted: true });
  } catch {
    return apiError("Failed to delete article", 500);
  }
}
