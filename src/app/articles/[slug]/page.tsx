import { notFound } from "next/navigation";
import Image from "next/image";
import { Clock, Eye, Calendar, Bookmark } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ArticleContent } from "@/components/articles/article-content";
import { ShareButtons } from "@/components/articles/share-buttons";
import { CommentSection } from "@/components/articles/comment-section";
import { ArticleCard } from "@/components/articles/article-card";
import { Badge } from "@/components/ui/badge";
import { AdSense } from "@/components/ads/adsense";
import { BookmarkButton } from "@/components/articles/bookmark-button";
import { ReadingHistoryTracker } from "@/components/articles/reading-history-tracker";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Article } from "@/models/Article";
import { auth } from "@/auth";
import { generateSEO, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { formatDate, formatNumber } from "@/lib/utils";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const author = article.author as unknown as { name: string };
  const category = article.category as unknown as { name: string };

  return generateSEO({
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    slug: `/articles/${slug}`,
    image: article.featuredImage,
    type: "article",
    publishedTime: article.publishedDate?.toString(),
    modifiedTime: article.updatedDate?.toString(),
    tags: article.tags,
    author: author?.name,
  });
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  await connectDB();
  await Article.findByIdAndUpdate(article._id, { $inc: { views: 1 } });

  const session = await auth();
  const author = article.author as unknown as { name: string; avatar?: string };
  const category = article.category as unknown as { name: string; slug: string; _id?: string };

  const categoryId =
    typeof article.category === "object" && article.category !== null && "_id" in article.category
      ? String((article.category as { _id: unknown })._id)
      : String(article.category);

  const [related, comments] = await Promise.all([
    getRelatedArticles(categoryId, article._id.toString()),
    Comment.find({ articleId: article._id, isApproved: true })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const jsonLd = articleJsonLd({
    title: article.title,
    description: article.excerpt,
    slug,
    image: article.featuredImage,
    publishedDate: article.publishedDate?.toString() || "",
    updatedDate: article.updatedDate?.toString(),
    author: author?.name || "Anonymous",
  });

  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", url: siteConfig.url },
    { name: category?.name || "Category", url: `${siteConfig.url}/categories/${category?.slug}` },
    { name: article.title, url: `${siteConfig.url}/articles/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <ReadingHistoryTracker articleId={article._id.toString()} />

      <article className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs
          items={[
            { label: "Articles", href: "/articles" },
            { label: category?.name || "Category", href: `/categories/${category?.slug}` },
            { label: article.title },
          ]}
        />

        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {category && (
              <Badge variant="outline">{category.name}</Badge>
            )}
            {article.isSponsored && <Badge variant="secondary">Sponsored</Badge>}
            {article.isPremium && <Badge>Premium</Badge>}
            {article.tags?.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            {article.title}
          </h1>

          <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{author?.name}</span>
              {article.publishedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.publishedDate.toString())}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {article.readingTime} min padhne ka time
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {formatNumber(article.views + 1)} views
              </span>
            </div>

            <div className="flex items-center gap-2">
              {session && (
                <BookmarkButton articleId={article._id.toString()} />
              )}
              <ShareButtons title={article.title} slug={slug} />
            </div>
          </div>
        </header>

        {article.featuredImage && (
          <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        <AdSense slot="article-top" className="my-6" />

        <ArticleContent
          content={article.content}
          contentFormat={article.contentFormat as "markdown" | "richtext" | undefined}
        />

        <AdSense slot="article-bottom" className="my-8" />

        <CommentSection
          articleId={article._id.toString()}
          initialComments={comments as never[]}
          isLoggedIn={!!session}
        />

        {related.length > 0 && (
          <section className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel._id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
