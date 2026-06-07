import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Article } from "@/models/Article";
import { Comment } from "@/models/Comment";
import { Category } from "@/models/Category";
import { Newsletter } from "@/models/Newsletter";
import {
  apiResponse,
  apiError,
  withAuth,
  withRateLimit,
} from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const rateLimitError = await withRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const { error } = await withAuth(["admin", "subadmin"]);
  if (error) return error;

  try {
    await connectDB();

    const [
      totalUsers,
      totalArticles,
      publishedArticles,
      draftArticles,
      totalComments,
      totalCategories,
      newsletterSubscribers,
      topArticles,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Article.countDocuments(),
      Article.countDocuments({ status: "published" }),
      Article.countDocuments({ status: "draft" }),
      Comment.countDocuments(),
      Category.countDocuments(),
      Newsletter.countDocuments({ isActive: true }),
      Article.find({ status: "published" })
        .sort({ views: -1 })
        .limit(5)
        .select("title slug views")
        .lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email role createdAt")
        .lean(),
    ]);

    const totalViews = await Article.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);

    return apiResponse({
      overview: {
        totalUsers,
        totalArticles,
        publishedArticles,
        draftArticles,
        totalComments,
        totalCategories,
        newsletterSubscribers,
        totalViews: totalViews[0]?.total || 0,
      },
      topArticles,
      recentUsers,
    });
  } catch {
    return apiError("Failed to fetch analytics", 500);
  }
}
