import Link from "next/link";
import { getCategories } from "@/lib/data/articles";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { generateSEO } from "@/lib/seo";
import { CategoryIcon } from "@/components/categories/category-icon";

export const revalidate = 3600;

export const metadata = generateSEO({
  title: "Categories",
  description: "Category ke hisaab se articles explore karo — AI, ML, Deep Learning, CS aur bahut kuch.",
  slug: "/categories",
});

export default async function CategoriesPage() {
  const dbCategories = await getCategories();
  const categories =
    dbCategories.length > 0
      ? dbCategories
      : DEFAULT_CATEGORIES.map((c) => ({ ...c, articleCount: 0 }));

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Categories" }]} />
      <h1 className="text-3xl font-bold mb-2">Categories</h1>
      <p className="text-muted-foreground mb-8">
        Topic ke hisaab se content browse karo
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group p-6 rounded-xl border bg-card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color || "from-primary to-primary/70"} flex items-center justify-center mb-4`}
              >
                <CategoryIcon name={cat.icon} className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold group-hover:text-primary transition-colors mb-2">
                {cat.name}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                {cat.description}
              </p>
              <span className="text-xs text-primary font-medium">
                {cat.articleCount || 0} articles →
              </span>
            </Link>
        ))}
      </div>
    </div>
  );
}
