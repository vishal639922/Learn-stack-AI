import Link from "next/link";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TopicArticle {
  _id: string;
  title: string;
  slug: string;
  readingTime?: number;
}

interface TopicArticleListProps {
  articles: TopicArticle[];
  activeSlug?: string;
  startIndex?: number;
  className?: string;
}

export function TopicArticleList({
  articles,
  activeSlug,
  startIndex = 1,
  className,
}: TopicArticleListProps) {
  if (articles.length === 0) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        Is topic mein abhi koi article nahi hai.
      </p>
    );
  }

  return (
    <ol className={cn("space-y-1", className)}>
      {articles.map((article, index) => {
        const isActive = activeSlug === article.slug;
        return (
          <li key={article._id}>
            <Link
              href={`/articles/${article.slug}`}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "hover:bg-muted/70 text-foreground"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {startIndex + index}
              </span>
              <span className="flex-1 leading-snug">{article.title}</span>
              {article.readingTime ? (
                <span className="hidden sm:flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {article.readingTime} min
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
