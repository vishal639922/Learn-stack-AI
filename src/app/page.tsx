import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/articles/article-card";
import { NewsletterSection } from "@/components/home/newsletter-section";
import {
  getFeaturedArticles,
  getTrendingArticles,
  getLatestArticles,
  getCategories,
} from "@/lib/data/articles";
import { ensureDevSeed } from "@/lib/dev-seed";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import { CategoryIcon } from "@/components/categories/category-icon";

export const revalidate = 3600;

export default async function HomePage() {
  await ensureDevSeed();

  const [featured, trending, latest, dbCategories] = await Promise.all([
    getFeaturedArticles(3),
    getTrendingArticles(5),
    getLatestArticles(6),
    getCategories(),
  ]);

  const categories =
    dbCategories.length > 0
      ? dbCategories
      : DEFAULT_CATEGORIES.map((c) => ({ ...c, articleCount: 0 }));

  return (
    <>
      {/* Hero Section */}
      <section className="hero-pattern py-20 md:py-28 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            AI, ML, CS & Engineering seekho
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="gradient-text">Artificial Intelligence</span>
            <br />
            aur Computer Science master karo
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Expert tutorials, research paper explanations, interview prep aur
            engineering notes — learners aur professionals ke liye.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/articles">
              <Button size="lg" className="gap-2">
                Articles Explore Karo <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" /> Categories Browse Karo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Categories Explore Karo</h2>
          <Link href="/categories" className="text-primary text-sm font-medium hover:underline">
            Saare dekho →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group p-5 rounded-xl border bg-card hover:shadow-md transition-all hover:-translate-y-0.5"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color || "from-primary to-primary/70"} flex items-center justify-center mb-3`}
                >
                  <CategoryIcon name={cat.icon} className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {cat.description}
                </p>
              </Link>
          ))}
        </div>
      </section>

      {/* Featured Articles */}
      {featured.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">Featured Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending + Latest */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Ab Trending</h2>
            </div>
            <div className="space-y-1">
              {trending.length > 0 ? (
                trending.map((article) => (
                  <ArticleCard key={article._id} article={article} variant="compact" />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Abhi koi article nahi hai.</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Latest Articles</h2>
            </div>
            <div className="grid gap-4">
              {latest.length > 0 ? (
                latest.slice(0, 3).map((article) => (
                  <ArticleCard key={article._id} article={article} />
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Abhi koi article nahi hai.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </>
  );
}
