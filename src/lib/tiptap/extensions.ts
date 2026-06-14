import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { createLowlight, common } from "lowlight";
import { McqBlock } from "@/components/editor/extensions/mcq-block";

const lowlight = createLowlight(common);

const HeadingWithId = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level as number;
    const id = node.textContent
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return [`h${level}`, { ...HTMLAttributes, id }, 0];
  },
}).configure({ levels: [1, 2, 3, 4] });

export function getEditorExtensions(options?: { placeholder?: string }) {
  return [
    StarterKit.configure({
      codeBlock: false,
      heading: false,
    }),
    HeadingWithId,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: "javascript",
    }),
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg max-w-full h-auto mx-auto my-4 border",
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary underline" },
    }),
    Underline,
    Highlight,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder:
        options?.placeholder ||
        "Article likhna shuru karo... headings, code, images, diagrams aur MCQ insert kar sakte ho.",
    }),
    McqBlock,
  ];
}

export { lowlight };
