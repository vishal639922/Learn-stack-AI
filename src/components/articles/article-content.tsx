"use client";

import { MarkdownRenderer } from "./markdown-renderer";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";

interface ArticleContentProps {
  content: string;
  contentFormat?: "markdown" | "richtext";
}

function detectFormat(content: string, contentFormat?: string): "markdown" | "richtext" {
  if (contentFormat === "richtext" || contentFormat === "markdown") {
    return contentFormat;
  }
  try {
    const parsed = JSON.parse(content);
    if (parsed?.type === "doc") return "richtext";
  } catch {
    // markdown
  }
  return "markdown";
}

export function ArticleContent({ content, contentFormat }: ArticleContentProps) {
  const format = detectFormat(content, contentFormat);

  if (format === "richtext") {
    return <RichTextRenderer content={content} />;
  }

  return <MarkdownRenderer content={content} />;
}
