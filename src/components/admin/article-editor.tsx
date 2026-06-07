"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_CATEGORIES } from "@/config/categories";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { Save, Upload, FileText, Settings, ImageIcon } from "lucide-react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const EMPTY_DOC = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph" }],
});

export function ArticleEditor() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: EMPTY_DOC,
    category: "",
    tags: "",
    featuredImage: "",
    status: "draft" as "draft" | "published",
    isFeatured: false,
    isSponsored: false,
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setCategories(data.data);
          setForm((f) => ({ ...f, category: data.data[0]._id }));
        } else {
          setCategories(
            DEFAULT_CATEGORIES.map((c, i) => ({
              _id: String(i),
              name: c.name,
              slug: c.slug,
            }))
          );
        }
      });
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title" && typeof value === "string") {
        updated.slug = slugify(value, { lower: true, strict: true });
      }
      return updated;
    });
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "hinglearn/articles");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.success) {
      updateField("featuredImage", data.data.url);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          contentFormat: "richtext",
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/articles/${data.data.slug}`);
        router.refresh();
      } else {
        alert(data.error || "Article banane mein fail ho gaya");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* Main editor column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <FileText className="h-4 w-4" />
            Content Editor — GeeksforGeeks style formatting
          </div>

          <div className="space-y-2">
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Article title likho..."
              className="text-2xl font-bold h-14 border-0 border-b rounded-none px-0 focus-visible:ring-0"
              required
            />
          </div>

          <TiptapEditor
            content={form.content}
            onChange={(json) => updateField("content", json)}
          />
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Article Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => updateField("excerpt", e.target.value)}
                  rows={3}
                  required
                  placeholder="Short summary jo article card par dikhega..."
                  className="text-sm"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Tags (comma-separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value)}
                  placeholder="dsa, python, interview"
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Status</Label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Featured Image
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  className="text-sm"
                />
                {form.featuredImage && (
                  <div className="relative h-32 rounded-lg overflow-hidden border">
                    <Image
                      src={form.featuredImage}
                      alt="Featured"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">SEO Title</Label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  maxLength={70}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">SEO Description</Label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => updateField("metaDescription", e.target.value)}
                  maxLength={160}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => updateField("isFeatured", e.target.checked)}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isSponsored}
                    onChange={(e) => updateField("isSponsored", e.target.checked)}
                  />
                  Sponsored
                </label>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Save ho raha hai..." : "Article Publish Karo"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">Editor Tips:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Code Block</strong> — syntax highlighted code</li>
                <li><strong>Image</strong> — inline images upload</li>
                <li><strong>Diagram</strong> — flowcharts/diagrams as image</li>
                <li><strong>MCQ</strong> — practice questions with answers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
