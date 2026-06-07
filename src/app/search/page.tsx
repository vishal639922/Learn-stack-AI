import { Suspense } from "react";
import { SearchClient } from "@/components/search/search-client";
import { generateSEO } from "@/lib/seo";

export const metadata = generateSEO({
  title: "Search",
  description: "Tutorials, notes, research papers aur interview prep content search karo.",
  slug: "/search",
});

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Search load ho raha hai...</div>}>
      <SearchClient />
    </Suspense>
  );
}
