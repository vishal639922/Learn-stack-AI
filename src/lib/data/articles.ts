import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { Category } from "@/models/Category";
import type { ArticleCardData } from "@/components/articles/article-card";

export async function getFeaturedArticles(limit = 6) {
  try {
    await connectDB();
    return (await Article.find({ status: "published", isFeatured: true })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ publishedDate: -1 })
      .limit(limit)
      .lean()) as unknown as ArticleCardData[];
  } catch {
    return [];
  }
}

export async function getTrendingArticles(limit = 6) {
  try {
    await connectDB();
    return (await Article.find({ status: "published" })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ views: -1 })
      .limit(limit)
      .lean()) as unknown as ArticleCardData[];
  } catch {
    return [];
  }
}

export async function getLatestArticles(limit = 6) {
  try {
    await connectDB();
    return (await Article.find({ status: "published" })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ publishedDate: -1 })
      .limit(limit)
      .lean()) as unknown as ArticleCardData[];
  } catch {
    return [];
  }
}

export async function getCategories() {
  try {
    await connectDB();
    return await Category.find().sort({ name: 1 }).lean();
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string) {
  try {
    await connectDB();
    return await Article.findOne({ slug, status: "published" })
      .populate("author", "name avatar email")
      .populate("category", "name slug")
      .lean();
  } catch {
    return null;
  }
}

export async function getRelatedArticles(
  categoryId: string,
  excludeId: string,
  limit = 4
) {
  try {
    await connectDB();
    return (await Article.find({
      category: categoryId,
      _id: { $ne: excludeId },
      status: "published",
    })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ views: -1 })
      .limit(limit)
      .lean()) as unknown as ArticleCardData[];
  } catch {
    return [];
  }
}
