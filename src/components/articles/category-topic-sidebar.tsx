import Link from "next/link";
import { BookOpen } from "lucide-react";
import { TopicArticleList, type TopicArticle } from "@/components/articles/topic-article-list";

interface CategoryTopicSidebarProps {
  categoryName: string;
  categorySlug: string;
  articles: TopicArticle[];
  activeSlug: string;
}

export function CategoryTopicSidebar({
  categoryName,
  categorySlug,
  articles,
  activeSlug,
}: CategoryTopicSidebarProps) {
  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-20 rounded-xl border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Topic</p>
            <Link
              href={`/categories/${categorySlug}`}
              className="font-semibold text-sm hover:text-primary transition-colors"
            >
              {categoryName}
            </Link>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {articles.length} articles is topic mein
        </p>
        <TopicArticleList
          articles={articles}
          activeSlug={activeSlug}
          className="max-h-[70vh] overflow-y-auto pr-1"
        />
      </div>
    </aside>
  );
}
