"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { useEffect, useState } from "react";

interface MarkdownRendererProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [toc, setToc] = useState<TocItem[]>([]);

  useEffect(() => {
    const headings = content.match(/^#{2,3}\s+.+$/gm) || [];
    const items: TocItem[] = headings.map((heading) => {
      const level = heading.match(/^#+/)?.[0].length || 2;
      const text = heading.replace(/^#+\s+/, "");
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      return { id, text, level };
    });
    setToc(items);
  }, [content]);

  return (
    <div className="flex gap-8">
      {toc.length > 0 && (
        <aside className="hidden xl:block w-64 shrink-0">
          <nav className="sticky top-24">
            <h4 className="font-semibold text-sm mb-3">Table of Contents</h4>
            <ul className="space-y-2 text-sm">
              {toc.map((item) => (
                <li
                  key={item.id}
                  style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-muted-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      )}

      <article className="prose-custom flex-1 min-w-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight, rehypeSlug]}
        >
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
