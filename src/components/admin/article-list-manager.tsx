"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { canDeleteArticles } from "@/lib/roles";

interface CategoryRef {
  _id: string;
  name: string;
  slug: string;
}

interface ArticleRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  sortOrder?: number;
  category?: CategoryRef;
  author?: { name: string };
}

interface ArticleListManagerProps {
  role: string;
  onEdit: (slug: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  in_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200",
  archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function ArticleListManager({ role, onEdit }: ArticleListManagerProps) {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<CategoryRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/articles?${params}`);
      const data = await res.json();
      if (data.success) setArticles(data.data.articles || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCategories(data.data || []);
      });
  }, []);

  useEffect(() => {
    loadArticles();
  }, [categoryFilter, statusFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, { category: CategoryRef | null; articles: ArticleRow[] }>();

    for (const article of articles) {
      const key = article.category?.slug || "uncategorized";
      if (!map.has(key)) {
        map.set(key, { category: article.category || null, articles: [] });
      }
      map.get(key)!.articles.push(article);
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.category?.name || "ZZZ").localeCompare(b.category?.name || "ZZZ")
    );
  }, [articles]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`"${title}" delete karna hai? Ye action undo nahi ho sakta.`)) return;

    setDeletingSlug(slug);
    try {
      const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        loadArticles();
      } else {
        alert(data.error || "Delete fail ho gaya");
      }
    } finally {
      setDeletingSlug(null);
    }
  };

  if (loading) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Articles load ho rahe hain...
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Saari categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Saare status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="in_review">In Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Koi article nahi mila. Pehle &quot;Article Banao&quot; tab se naya article add karo.
          </CardContent>
        </Card>
      ) : (
        grouped.map(({ category, articles: topicArticles }) => (
          <Card key={category?.slug || "uncategorized"}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  {category?.name || "Uncategorized"}
                  <Badge variant="outline">{topicArticles.length}</Badge>
                </CardTitle>
                {category && (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Topic page dekho <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              {category && (
                <p className="text-xs text-muted-foreground">
                  GFG-style topic list: /categories/{category.slug}
                </p>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {topicArticles
                  .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                  .map((article, index) => (
                    <div
                      key={article._id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{article.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge className={STATUS_COLORS[article.status] || ""}>
                            {article.status.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            /{article.slug}
                          </span>
                          {article.author?.name && (
                            <span className="text-xs text-muted-foreground">
                              · {article.author.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {article.status === "published" && (
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              href={`/articles/${article.slug}`}
                              target="_blank"
                              title="Public page"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(article.slug)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {canDeleteArticles(role) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingSlug === article.slug}
                            onClick={() => handleDelete(article.slug, article.title)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
