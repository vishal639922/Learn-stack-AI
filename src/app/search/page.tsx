import { Suspense } from "react";
import { SearchClient } from "@/components/search/search-client";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Search",
  description: "Search tutorials, notes, research papers, and interview prep content.",
  slug: "/search",
});

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
