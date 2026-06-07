"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState } from "react";
import { getEditorExtensions } from "@/lib/tiptap/extensions";

interface RichTextRendererProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractToc(doc: { content?: { type: string; attrs?: { level?: number }; content?: { text?: string }[] }[] }): TocItem[] {
  const items: TocItem[] = [];
  for (const node of doc.content || []) {
    if (node.type === "heading" && node.attrs?.level && node.attrs.level <= 3) {
      const text = node.content?.map((c) => c.text || "").join("") || "";
      if (text) {
        items.push({
          id: text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
          text,
          level: node.attrs.level,
        });
      }
    }
  }
  return items;
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  const [toc, setToc] = useState<TocItem[]>([]);

  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: getEditorExtensions(),
    content: (() => {
      try {
        return JSON.parse(content);
      } catch {
        return { type: "doc", content: [{ type: "paragraph" }] };
      }
    })(),
    editorProps: {
      attributes: {
        class: "tiptap-reader prose-custom min-w-0 max-w-none",
      },
    },
  });

  useEffect(() => {
    try {
      const doc = JSON.parse(content);
      setToc(extractToc(doc));
    } catch {
      setToc([]);
    }
  }, [content]);

  if (!editor) return null;

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
                  style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
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
      <div className="flex-1 min-w-0">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
