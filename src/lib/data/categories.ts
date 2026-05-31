import { DEFAULT_CATEGORIES } from "@/config/categories";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export function getStaticCategory(slug: string) {
  return DEFAULT_CATEGORIES.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  const staticCategory = getStaticCategory(slug);
  if (!staticCategory) return null;

  try {
    await connectDB();
    const dbCategory = await Category.findOne({ slug }).lean();
    if (dbCategory) return dbCategory;

    return {
      _id: slug,
      name: staticCategory.name,
      slug: staticCategory.slug,
      description: staticCategory.description,
      icon: staticCategory.icon,
      color: staticCategory.color,
      articleCount: 0,
    };
  } catch {
    return {
      _id: slug,
      name: staticCategory.name,
      slug: staticCategory.slug,
      description: staticCategory.description,
      icon: staticCategory.icon,
      color: staticCategory.color,
      articleCount: 0,
    };
  }
}
