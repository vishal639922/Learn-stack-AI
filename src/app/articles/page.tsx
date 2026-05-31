import { ArticleCard } from "@/components/articles/article-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import { generateSEO } from "@/lib/seo";
import type { ArticleCardData } from "@/components/articles/article-card";

export const revalidate = 3600;

export const metadata = generateSEO({
  title: "All Articles",
  description: "Browse all tutorials, notes, and research paper explanations.",
  slug: "/articles",
});

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const { page: pageStr } = await searchParams;
  const page = parseInt(pageStr || "1");
  const limit = 12;
  const skip = (page - 1) * limit;

  await connectDB();
  const [articles, total] = await Promise.all([
    Article.find({ status: "published" })
      .populate("author", "name avatar")
      .populate("category", "name slug")
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Article.countDocuments({ status: "published" }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Articles" }]} />
      <h1 className="text-3xl font-bold mb-2">All Articles</h1>
      <p className="text-muted-foreground mb-8">
        {total} articles published
      </p>

      {articles.length > 0 ? (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(articles as unknown as ArticleCardData[]).map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/articles?page=${p}`}
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
        <div className="text-center py-16 text-muted-foreground">
          <p>No articles published yet.</p>
          <p className="text-sm mt-2">
            Run the seed API to populate sample content.
          </p>
        </div>
      )}
    </div>
  );
}
