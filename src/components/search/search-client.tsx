"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard, type ArticleCardData } from "@/components/articles/article-card";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { DEFAULT_CATEGORIES } from "@/config/categories";

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [articles, setArticles] = useState<ArticleCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      params.set("limit", "20");

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data.articles);
        setTotal(data.data.pagination.total);
      }
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    const q = searchParams.get("q");
    const cat = searchParams.get("category");
    if (q || cat) {
      setQuery(q || "");
      setCategory(cat || "");
    }
  }, [searchParams]);

  useEffect(() => {
    if (query || category) {
      const timer = setTimeout(performSearch, 300);
      return () => clearTimeout(timer);
    }
  }, [query, category, performSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    router.push(`/search?${params}`);
    performSearch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: "Search" }]} />
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Articles, tags, topics search karo..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Saari Categories</option>
          {DEFAULT_CATEGORIES.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={loading}>
          <Filter className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground text-center py-12">Search ho raha hai...</p>
      ) : articles.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-6">
            {total} result{total !== 1 ? "s" : ""} mile
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        </>
      ) : query || category ? (
        <p className="text-muted-foreground text-center py-12">
          Koi result nahi mila. Alag keywords try karo.
        </p>
      ) : (
        <p className="text-muted-foreground text-center py-12">
          Articles dhundhne ke liye kuch search karo.
        </p>
      )}
    </div>
  );
}
