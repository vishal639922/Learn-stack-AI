import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { ArticleCard } from "@/components/articles/article-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { generateSEO } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/data/categories";
import { ensureDevSeed } from "@/lib/dev-seed";
import type { ArticleCardData } from "@/components/articles/article-card";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return generateSEO({
    title: category.name,
    description: category.description,
    slug: `/categories/${slug}`,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  await ensureDevSeed();

  const { slug } = await params;
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  let articles: ArticleCardData[] = [];
  let total = 0;

  try {
    await connectDB();
    const dbCategory = await Category.findOne({ slug }).lean();

    if (dbCategory) {
      const [articleResults, articleTotal] = await Promise.all([
        Article.find({ category: dbCategory._id, status: "published" })
          .populate("author", "name avatar")
          .populate("category", "name slug")
          .sort({ publishedDate: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Article.countDocuments({
          category: dbCategory._id,
          status: "published",
        }),
      ]);
      articles = articleResults as unknown as ArticleCardData[];
      total = articleTotal;
    }
  } catch {
    articles = [];
    total = 0;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />
      <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
      <p className="text-muted-foreground mb-8">{category.description}</p>

      {articles.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/categories/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground text-center py-16">
          No articles in this category yet.
        </p>
      )}
    </div>
  );
}
