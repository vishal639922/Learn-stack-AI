import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { Article } from "@/models/Article";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { TopicArticleList } from "@/components/articles/topic-article-list";
import { CategoryIcon } from "@/components/categories/category-icon";
import { generateSEO } from "@/lib/seo";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCategoryArticles } from "@/lib/data/articles";
import { ensureDevSeed } from "@/lib/dev-seed";

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
  const limit = 50;

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  let articles: Awaited<ReturnType<typeof getCategoryArticles>>["articles"] = [];
  let totalPages = 0;

  try {
    await connectDB();
    const dbCategory = await Category.findOne({ slug }).lean();

    if (dbCategory) {
      const result = await getCategoryArticles(dbCategory._id.toString(), {
        page,
        limit,
        status: "published",
      });
      articles = result.articles;
      totalPages = result.totalPages;
    }
  } catch {
    articles = [];
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="flex items-start gap-4 mb-8">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color || "from-primary to-primary/70"} flex items-center justify-center shrink-0`}
        >
          <CategoryIcon name={category.icon} className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground max-w-2xl">{category.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {articles.length} topic articles · GFG-style ordered list
          </p>
        </div>
      </div>

      {articles.length > 0 ? (
        <>
          <div className="rounded-xl border bg-card p-4 md:p-6">
            <h2 className="text-lg font-semibold mb-4">
              {category.name} — Articles
            </h2>
            <TopicArticleList
              articles={articles}
              startIndex={(page - 1) * limit + 1}
            />
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/categories/${slug}?page=${p}`}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border bg-muted/20 p-12 text-center">
          <p className="text-muted-foreground">
            Is topic mein abhi koi published article nahi hai.
          </p>
          <Link href="/articles" className="text-primary hover:underline text-sm mt-2 inline-block">
            Saare articles dekho
          </Link>
        </div>
      )}
    </div>
  );
}
