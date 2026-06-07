import readingTime from "reading-time";

function extractTextFromRichText(content: string): string {
  try {
    const doc = JSON.parse(content);
    const parts: string[] = [];

    function walk(node: {
      type?: string;
      text?: string;
      content?: unknown[];
      attrs?: Record<string, unknown>;
    }) {
      if (node.text) parts.push(node.text);
      if (node.type === "mcqBlock" && node.attrs) {
        const attrs = node.attrs as {
          question?: string;
          options?: string[];
          explanation?: string;
        };
        if (attrs.question) parts.push(attrs.question);
        if (attrs.options) parts.push(...attrs.options);
        if (attrs.explanation) parts.push(attrs.explanation);
      }
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          walk(child as typeof node);
        }
      }
    }

    walk(doc);
    return parts.join(" ");
  } catch {
    return content;
  }
}

export function calculateReadingTime(
  content: string,
  contentFormat?: "markdown" | "richtext"
): {
  text: string;
  minutes: number;
} {
  const text =
    contentFormat === "richtext" || content.trim().startsWith("{")
      ? extractTextFromRichText(content)
      : content;

  const stats = readingTime(text);
  return {
    text: stats.text,
    minutes: Math.max(1, Math.ceil(stats.minutes)),
  };
}
