import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber } from "@/lib/utils";

export interface ArticleCardData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  tags?: string[];
  readingTime?: number;
  views?: number;
  publishedDate?: string;
  isSponsored?: boolean;
  author?: { name: string; avatar?: string };
  category?: { name: string; slug: string };
}

interface ArticleCardProps {
  article: ArticleCardData;
  variant?: "default" | "compact" | "featured";
}

export function ArticleCard({ article, variant = "default" }: ArticleCardProps) {
  if (variant === "compact") {
    return (
      <Link href={`/articles/${article.slug}`} className="group block">
        <div className="flex gap-3 py-3 border-b last:border-0">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {article.readingTime} min
                </span>
              )}
              {article.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatNumber(article.views)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {article.featuredImage && (
          <div className="relative h-48 overflow-hidden">
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
            {article.isSponsored && (
              <Badge className="absolute top-3 right-3" variant="secondary">
                Sponsored
              </Badge>
            )}
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {article.category && (
              <Badge variant="outline" className="text-xs">
                {article.category.name}
              </Badge>
            )}
            {article.publishedDate && (
              <span className="text-xs text-muted-foreground">
                {formatDate(article.publishedDate)}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {article.excerpt}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {article.author?.name || "Anonymous"}
            </div>
            <div className="flex items-center gap-3">
              {article.readingTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {article.readingTime} min
                </span>
              )}
              {article.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {formatNumber(article.views)}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
