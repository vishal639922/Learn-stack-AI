import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface SEOProps {
  title: string;
  description: string;
  slug?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
  noIndex?: boolean;
}

export function generateSEO({
  title,
  description,
  slug = "",
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags = [],
  author,
  noIndex = false,
}: SEOProps): Metadata {
  const url = `${siteConfig.url}${slug}`;
  const ogImage = image || `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    authors: author ? [{ name: author }] : [{ name: siteConfig.creator }],
    keywords: tags,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: "en_US",
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@learnstackai",
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function articleJsonLd(article: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedDate: string;
  updatedDate?: string;
  author: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    image: article.image || `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate || article.publishedDate,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/articles/${article.slug}`,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
