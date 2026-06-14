"use client";

import { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { getEditorExtensions } from "@/lib/tiptap/extensions";
import { EditorToolbar } from "./editor-toolbar";

interface TiptapEditorProps {
  content?: string;
  onChange: (json: string) => void;
}

async function uploadFile(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "hinglearn/articles");

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();
  return data.success ? data.data.url : null;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const diagramInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<"image" | "diagram">("image");

  const parseContent = useCallback(() => {
    if (!content) return undefined;
    try {
      return JSON.parse(content);
    } catch {
      return undefined;
    }
  }, [content]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getEditorExtensions(),
    content: parseContent(),
    editorProps: {
      attributes: {
        class:
          "tiptap-editor-content prose-custom min-h-[500px] px-6 py-4 focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(JSON.stringify(ed.getJSON()));
    },
  });

  const insertImage = useCallback(
    (url: string, alt: string) => {
      editor?.chain().focus().setImage({ src: url, alt }).run();
    },
    [editor]
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const url = await uploadFile(file);
    if (url) {
      const alt =
        uploadTargetRef.current === "diagram"
          ? `Diagram: ${file.name}`
          : file.name;
      insertImage(url, alt);
    }
    e.target.value = "";
  };

  const triggerUpload = (type: "image" | "diagram") => {
    uploadTargetRef.current = type;
    if (type === "diagram") {
      diagramInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleImportSuccess = useCallback(() => {
    if (!editor) return;
    onChange(JSON.stringify(editor.getJSON()));
  }, [editor, onChange]);

  return (
    <div className="rounded-xl border bg-background shadow-sm">
      <div className="sticky top-16 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <EditorToolbar
          editor={editor}
          onImageUpload={() => triggerUpload("image")}
          onDiagramUpload={() => triggerUpload("diagram")}
          onImportSuccess={handleImportSuccess}
        />
      </div>
      <EditorContent editor={editor} />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={diagramInputRef}
        type="file"
        accept="image/*,.svg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
